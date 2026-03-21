// src/hooks/useEvents.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelEvent,
  createEventDraft,
  getEventById,
  getEventsByHost,
  getHappeningNow,
  getPublishedEvents,
  getTicketTypes,
  getVenueById,
  getVenues,
  publishEvent,
  searchEvents,
  searchVenues,
} from '../lib/services/eventService'
import type { CreateEventParams } from '../types'

// ─── QUERY KEYS ───────────────────────────────────

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (city?: string) => [...eventKeys.lists(), { city }] as const,
  detail: (id: string) => [...eventKeys.all, 'detail', id] as const,
  byHost: (hostId: string) => [...eventKeys.all, 'host', hostId] as const,
  happeningNow: (lat: number, lng: number) => [...eventKeys.all, 'now', lat, lng] as const,
  search: (query: string) => [...eventKeys.all, 'search', query] as const,
  ticketTypes: (eventId: string) => [...eventKeys.all, 'ticketTypes', eventId] as const,
}

export const venueKeys = {
  all: ['venues'] as const,
  list: (city?: string) => [...venueKeys.all, 'list', { city }] as const,
  detail: (id: string) => [...venueKeys.all, 'detail', id] as const,
  search: (query: string) => [...venueKeys.all, 'search', query] as const,
}

// ─── EVENT QUERIES ────────────────────────────────

export function usePublishedEvents(city?: string) {
  return useQuery({
    queryKey: eventKeys.list(city),
    queryFn: () => getPublishedEvents(city),
    staleTime: 1000 * 60 * 2,
  })
}

export function useEventDetail(id: string | null) {
  return useQuery({
    queryKey: eventKeys.detail(id ?? ''),
    queryFn: () => getEventById(id!),
    enabled: !!id,
    staleTime: 1000 * 60,
  })
}

export function useEventsByHost(hostId: string | null) {
  return useQuery({
    queryKey: eventKeys.byHost(hostId ?? ''),
    queryFn: () => getEventsByHost(hostId!),
    enabled: !!hostId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useHappeningNow(
  lat: number | null,
  lng: number | null,
  radiusKm = 10
) {
  return useQuery({
    queryKey: eventKeys.happeningNow(lat ?? 0, lng ?? 0),
    queryFn: () => getHappeningNow(lat!, lng!, radiusKm),
    enabled: !!lat && !!lng,
    staleTime: 1000 * 60,             // 1 min — live events change fast
    refetchInterval: 1000 * 60 * 2,   // background refetch every 2 min
  })
}

export function useEventSearch(query: string) {
  return useQuery({
    queryKey: eventKeys.search(query),
    queryFn: () => searchEvents(query),
    enabled: query.length >= 2,       // don't fire on single character
    staleTime: 1000 * 30,
  })
}

export function useTicketTypes(eventId: string | null) {
  return useQuery({
    queryKey: eventKeys.ticketTypes(eventId ?? ''),
    queryFn: () => getTicketTypes(eventId!),
    enabled: !!eventId,
    staleTime: 1000 * 60,
  })
}

// ─── VENUE QUERIES ────────────────────────────────

export function useVenues(city?: string) {
  return useQuery({
    queryKey: venueKeys.list(city),
    queryFn: () => getVenues(city),
    staleTime: 1000 * 60 * 5,         // venues change rarely
  })
}

export function useVenueDetail(id: string | null) {
  return useQuery({
    queryKey: venueKeys.detail(id ?? ''),
    queryFn: () => getVenueById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useVenueSearch(query: string) {
  return useQuery({
    queryKey: venueKeys.search(query),
    queryFn: () => searchVenues(query),
    enabled: query.length >= 2,
    staleTime: 1000 * 30,
  })
}

// ─── EVENT MUTATIONS ──────────────────────────────

export function useCreateEventDraft() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ params, hostId }: { params: CreateEventParams; hostId: string }) =>
      createEventDraft(params, hostId),
    onSuccess: (_, { hostId }) => {
      qc.invalidateQueries({ queryKey: eventKeys.byHost(hostId) })
    },
  })
}

export function usePublishEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: publishEvent,
    onSuccess: (_, eventId) => {
      qc.invalidateQueries({ queryKey: eventKeys.detail(eventId) })
      qc.invalidateQueries({ queryKey: eventKeys.lists() })
    },
  })
}

export function useCancelEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: cancelEvent,
    onSuccess: (_, eventId) => {
      qc.invalidateQueries({ queryKey: eventKeys.detail(eventId) })
      qc.invalidateQueries({ queryKey: eventKeys.lists() })
    },
  })
}
