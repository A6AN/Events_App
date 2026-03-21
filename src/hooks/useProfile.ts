// src/hooks/useProfile.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { DbProfile } from '../types'

// ─── QUERY KEYS ───────────────────────────────────

export const profileKeys = {
  all: ['profiles'] as const,
  me: () => [...profileKeys.all, 'me'] as const,
  detail: (id: string) => [...profileKeys.all, 'detail', id] as const,
  search: (query: string) => [...profileKeys.all, 'search', query] as const,
}

// ─── QUERIES ──────────────────────────────────────

export function useMyProfile() {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: async (): Promise<DbProfile | null> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useProfile(userId: string | null) {
  return useQuery({
    queryKey: profileKeys.detail(userId ?? ''),
    queryFn: async (): Promise<DbProfile | null> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId!)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useProfileSearch(query: string) {
  return useQuery({
    queryKey: profileKeys.search(query),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, rep_tier, university, is_verified')
        .eq('account_status', 'active')
        .eq('is_private', false)
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(20)

      if (error) throw error
      return data ?? []
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 30,
  })
}

// ─── MUTATIONS ────────────────────────────────────

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (updates: Partial<Pick<DbProfile,
      | 'display_name'
      | 'username'
      | 'bio'
      | 'avatar_url'
      | 'university'
      | 'city'
      | 'date_of_birth'
      | 'is_private'
      | 'attendance_visibility'
      | 'notification_prefs'
      | 'fcm_token'
    >>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      return data as DbProfile
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.me() })
    },
  })
}

export function useUploadAvatar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const ext = file.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      // Save URL to profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError
      return publicUrl
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.me() })
    },
  })
}

export function useCompleteOnboarding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      display_name: string
      username: string
      university: string
      city: string
      date_of_birth: string
      avatar_url?: string
      referral_code?: string
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { referral_code, ...profileData } = data

      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)

      if (error) throw error

      // Handle referral if provided
      if (referral_code) {
        const { data: referrer } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', referral_code)
          .single()

        if (referrer) {
          await supabase
            .from('referrals')
            .insert({
              referrer_id: referrer.id,
              referred_id: user.id,
              status: 'pending',
            })
            .throwOnError()
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.me() })
    },
  })
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // DPDP compliant — nullify PII, keep financial records
      const { error } = await supabase
        .from('profiles')
        .update({
          account_status: 'deleted',
          display_name: null,
          username: `deleted_${user.id.slice(0, 8)}`,
          avatar_url: null,
          date_of_birth: null,
          phone: null,
          bio: null,
          university: null,
        })
        .eq('id', user.id)

      if (error) throw error
      await supabase.auth.signOut()
    },
  })
}
