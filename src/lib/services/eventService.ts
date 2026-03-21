// src/lib/services/eventService.ts
import { supabase } from '../supabase'
import type {
  DbEvent,
  DbVenue,
  DbTicketType,
  EventWithMeta,
  CreateEventParams,
} from '../../types'

// ─── EVENTS ───────────────────────────────────────

export async function getPublishedEvents(
  city?: string
): Promise<EventWithMeta[]> {
  let query = supabase
    .from('events')
    .select(`
      *,
      host:profiles!events_host_id_fkey (
        id, username, display_name, avatar_url, rep_tier, is_verified
      )
    `)
    .eq('status', 'published')
    .eq('visibility', 'public')
    .order('start_time', { ascending: true })

  if (city) query = query.eq('city', city)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as EventWithMeta[]
}

export async function getEventById(id: string): Promise<EventWithMeta | null> {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      host:profiles!events_host_id_fkey (
        id, username, display_name, avatar_url, rep_tier, is_verified
      ),
      ticket_types (*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as EventWithMeta | null
}

export async function getEventsByHost(hostId: string): Promise<DbEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('host_id', hostId)
    .order('start_time', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function createEventDraft(
  params: CreateEventParams,
  hostId: string
): Promise<DbEvent> {
  const { ticket_types, ...eventData } = params

  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({ ...eventData, host_id: hostId, status: 'draft' })
    .select()
    .single()

  if (eventError) throw eventError

  if (ticket_types.length > 0) {
    const { error: ttError } = await supabase
      .from('ticket_types')
      .insert(ticket_types.map(tt => ({ ...tt, event_id: event.id })))

    if (ttError) throw ttError
  }

  return event
}

export async function publishEvent(eventId: string): Promise<void> {
  const { error } = await supabase
    .from('events')
    .update({ status: 'published' })
    .eq('id', eventId)

  if (error) throw error
}

export async function cancelEvent(eventId: string): Promise<void> {
  const { error } = await supabase
    .from('events')
    .update({ status: 'cancelled' })
    .eq('id', eventId)

  if (error) throw error
}

export async function searchEvents(query: string, city?: string): Promise<DbEvent[]> {
  if (!query.trim()) return []
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .textSearch('title', query, { type: 'websearch', config: 'english' })
    .order('start_time', { ascending: true })
    .limit(20)

  if (error) throw error
  return data ?? []
}

/**
 * Get Discover Feed — Ranked by FOMO score (base + per-user friend component)
 * per brain.md §12.2
 */
export async function getDiscoverFeed(userId: string, city?: string): Promise<EventWithMeta[]> {
  const { data, error } = await supabase
    .rpc('get_discover_feed', { 
      p_user_id: userId,
      p_city: city || 'Delhi'
    })
  console.log('[getDiscoverFeed]', { data, error })
  if (error) throw error
  return (data ?? []) as EventWithMeta[]
}

export async function getHappeningNow(
  lat: number,
  lng: number,
  radiusKm = 10
): Promise<DbEvent[]> {
  const { data, error } = await supabase
    .rpc('get_happening_now', {
      user_lat: lat,
      user_lng: lng,
      radius_km: radiusKm,
    })

  if (error) throw error
  return data ?? []
}

// ─── TICKET TYPES ─────────────────────────────────

export async function getTicketTypes(eventId: string): Promise<DbTicketType[]> {
  const { data, error } = await supabase
    .from('ticket_types')
    .select('*')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data ?? []
}

// ─── VENUES ───────────────────────────────────────

export async function getVenues(city?: string): Promise<DbVenue[]> {
  let query = supabase
    .from('venues')
    .select('*')
    .eq('is_active', true)

  if (city) query = query.eq('city', city)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getVenueById(id: string): Promise<DbVenue | null> {
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function searchVenues(query: string): Promise<DbVenue[]> {
  if (!query.trim()) return []
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('is_active', true)
    .textSearch('name', query, { type: 'websearch', config: 'english' })
    .limit(20)

  if (error) throw error
  return data ?? []
}

export async function uploadEventImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `event-images/${fileName}`

  const { error: uploadError } = await (supabase.storage as any).from('events').upload(filePath, file)
  if (uploadError) throw uploadError

  const { data } = (supabase.storage as any).from('events').getPublicUrl(filePath)
  return data.publicUrl
}

export async function createEvent(eventData: any): Promise<DbEvent> {
  const { data, error } = await supabase.from('events').insert([eventData]).select().single()
  if (error) throw error
  return data
}

export async function createVenueBooking(bookingData: any): Promise<any> {
    const { data, error } = await supabase.from('venue_bookings').insert([bookingData]).select().single()
    if (error) throw error
    return data
}
