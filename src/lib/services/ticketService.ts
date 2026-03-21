import { supabase } from '../supabase'
import type { TicketWithMeta } from '../../types'

export async function createTicket(params: {
  event_id: string
  user_id: string
  ticket_type_id: string
  quantity: number
}) {
  const tickets = Array.from({ length: params.quantity }, () => ({
    event_id: params.event_id,
    user_id: params.user_id,
    purchaser_id: params.user_id,
    ticket_type_id: params.ticket_type_id,
    status: 'active' as const,
  }))

  const { data, error } = await supabase
    .from('tickets')
    .insert(tickets)
    .select()
  if (error) throw error
  return data
}

export const getUserTickets = async (userId: string): Promise<TicketWithMeta[]> => {
  const { data, error } = await supabase
    .from('tickets')
    .select(`*, event:events (id, title, cover_url, start_time, end_time, address, city, category), ticket_type:ticket_types (id, name, price, perks)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as TicketWithMeta[]
}

export const checkRsvpStatus = async (eventId: string, userId: string) => {
  const { data, error } = await supabase
    .from('tickets')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) console.warn(error)
  return !!data
}
