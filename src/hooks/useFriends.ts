// src/hooks/useFriends.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  acceptFriendRequest,
  blockUser,
  cancelFriendRequest,
  declineFriendRequest,
  getFriendSuggestions,
  getFriendshipStatus,
  getFriendsActivity,
  getBlockedUsers,
  getMyFriends,
  getPendingRequests,
  getSentRequests,
  removeFriend,
  sendFriendRequest,
  unblockUser,
} from '../lib/services/friendService'
import { useAuth } from '../context/AuthContext'

// ─── QUERY KEYS ───────────────────────────────────
// Centralised so invalidations are consistent everywhere

export const friendKeys = {
  all: ['friends'] as const,
  list: () => [...friendKeys.all, 'list'] as const,
  pending: () => [...friendKeys.all, 'pending'] as const,
  sent: () => [...friendKeys.all, 'sent'] as const,
  blocked: () => [...friendKeys.all, 'blocked'] as const,
  activity: () => [...friendKeys.all, 'activity'] as const,
  suggestions: (university: string) => [...friendKeys.all, 'suggestions', university] as const,
  status: (userId: string) => [...friendKeys.all, 'status', userId] as const,
}

// ─── QUERIES ──────────────────────────────────────

export function useMyFriends() {
  return useQuery({
    queryKey: friendKeys.list(),
    queryFn: getMyFriends,
    staleTime: 1000 * 60 * 2,        // 2 min — friends list doesn't change often
  })
}

export function usePendingRequests() {
  return useQuery({
    queryKey: friendKeys.pending(),
    queryFn: getPendingRequests,
    staleTime: 1000 * 30,             // 30s — check more often for new requests
    refetchOnWindowFocus: true,
  })
}

export function useSentRequests() {
  return useQuery({
    queryKey: friendKeys.sent(),
    queryFn: getSentRequests,
    staleTime: 1000 * 60,
  })
}

export function useBlockedUsers() {
  return useQuery({
    queryKey: friendKeys.blocked(),
    queryFn: getBlockedUsers,
    staleTime: 1000 * 60 * 5,
  })
}

export function useFriendSuggestions(university: string | null, city: string) {
  return useQuery({
    queryKey: friendKeys.suggestions(university ?? ''),
    queryFn: () => getFriendSuggestions(university, city),
    enabled: !!city,              // only requires city now, not university
    staleTime: 1000 * 60 * 10,        // 10 min — suggestions don't need to be fresh
  })
}

export function useFriendshipStatus(otherUserId: string | null) {
  return useQuery({
    queryKey: friendKeys.status(otherUserId ?? ''),
    queryFn: () => getFriendshipStatus(otherUserId!),
    enabled: !!otherUserId,
    staleTime: 1000 * 60,
  })
}

export function useFriendsActivity() {
  return useQuery({
    queryKey: friendKeys.activity(),
    queryFn: () => getFriendsActivity(30),
    staleTime: 1000 * 60,             // 1 min — activity feed should stay fresh
    refetchOnWindowFocus: true,
  })
}

// ─── MUTATIONS ────────────────────────────────────

export function useSendFriendRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: friendKeys.sent() })
      qc.invalidateQueries({ queryKey: friendKeys.suggestions('') })
    },
  })
}

export function useAcceptFriendRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      // Accepting moves a request from pending → friends list
      qc.invalidateQueries({ queryKey: friendKeys.pending() })
      qc.invalidateQueries({ queryKey: friendKeys.list() })
    },
  })
}

export function useDeclineFriendRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: declineFriendRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: friendKeys.pending() })
    },
  })
}

export function useCancelFriendRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: cancelFriendRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: friendKeys.sent() })
    },
  })
}

export function useRemoveFriend() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: removeFriend,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: friendKeys.list() })
      qc.invalidateQueries({ queryKey: friendKeys.activity() })
    },
  })
}

export function useBlockUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: blockUser,
    onSuccess: () => {
      // Block affects friends list, pending, sent — invalidate all friend queries
      qc.invalidateQueries({ queryKey: friendKeys.all })
    },
  })
}

export function useUnblockUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: unblockUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: friendKeys.blocked() })
    },
  })
}
