// src/hooks/useTickets.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { DbTicket, TicketWithMeta } from '../types'

// ─── QUERY KEYS ───────────────────────────────────

export const ticketKeys = {
  all: ['tickets'] as const,
  mine: () => [...ticketKeys.all, 'mine'] as const,
  forEvent: (eventId: string) => [...ticketKeys.all, 'event', eventId] as const,
  detail: (ticketId: string) => [...ticketKeys.all, 'detail', ticketId] as const,
}

// ─── QUERIES ──────────────────────────────────────

export function useMyTickets() {
  return useQuery({
    queryKey: ticketKeys.mine(),
    queryFn: async (): Promise<TicketWithMeta[]> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          event:events!tickets_event_id_fkey (
            id, title, cover_url, start_time, end_time, address, city
          ),
          ticket_type:ticket_types!tickets_ticket_type_id_fkey (
            id, name, price, perks
          )
        `)
        .eq('user_id', user.id)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data ?? []) as TicketWithMeta[]
    },
    staleTime: 1000 * 60,
  })
}

export function useEventGuestList(eventId: string | null) {
  return useQuery({
    queryKey: ticketKeys.forEvent(eventId ?? ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          profile:profiles!tickets_user_id_fkey (
            id, username, display_name, avatar_url
          ),
          ticket_type:ticket_types!tickets_ticket_type_id_fkey (
            name
          )
        `)
        .eq('event_id', eventId!)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: true })

      if (error) throw error
      return data ?? []
    },
    enabled: !!eventId,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,       // host scanner needs live updates
  })
}

// ─── MUTATIONS ────────────────────────────────────

export function useCreateTicketHold() {
  return useMutation({
    mutationFn: async ({
      ticketTypeId,
      quantity,
    }: {
      ticketTypeId: string
      quantity: number
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('ticket_holds')
        .insert({
          ticket_type_id: ticketTypeId,
          user_id: user.id,
          quantity,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
  })
}

export function useReleaseTicketHold() {
  return useMutation({
    mutationFn: async (holdId: string) => {
      const { error } = await supabase
        .from('ticket_holds')
        .delete()
        .eq('id', holdId)

      if (error) throw error
    },
  })
}

export function useScanTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      ticketId,
      eventId,
    }: {
      ticketId: string
      eventId: string
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('tickets')
        .update({
          status: 'scanned',
          scanned_at: new Date().toISOString(),
          scanned_by: user.id,
        })
        .eq('id', ticketId)
        .eq('event_id', eventId)
        .eq('status', 'active')       // only scan active tickets
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('already_scanned')

      // Increment escrow scan_count
      await supabase.rpc('increment_scan_count', { p_event_id: eventId })

      return data as DbTicket
    },
    onSuccess: (_, { eventId }) => {
      qc.invalidateQueries({ queryKey: ticketKeys.forEvent(eventId) })
    },
  })
}

export function useCancelTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (ticketId: string) => {
      const { error } = await supabase
        .from('tickets')
        .update({ status: 'cancelled' })
        .eq('id', ticketId)

      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ticketKeys.mine() })
    },
  })
}
