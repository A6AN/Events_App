// src/lib/services/profileService.ts
import { supabase } from '../supabase'
import { DbProfile } from '../../types'

export async function ensureProfile(userId: string) {
  const { data } = await supabase.from('profiles').select('id').eq('id', userId).single()
  if (!data) {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').upsert({
      id: userId,
      display_name: user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || null,
      avatar_url: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null,
      username: user?.email?.split('@')[0] || null,
    }, { onConflict: 'id' })
  }
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) return null
  return data as DbProfile
}

export const updateProfile = async (userId: string, profileData: {
  display_name?: string
  username?: string
  avatar_url?: string
  banner_url?: string
  bio?: string
  location?: string
  languages?: string[]
  interests?: string[]
  website?: string
  is_private?: boolean
  notification_prefs?: Record<string, boolean>
}) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...profileData, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export const uploadAvatar = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop()
  const filePath = `${userId}.${fileExt}`
  const { error } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true })
  if (error) throw error
  return supabase.storage.from('avatars').getPublicUrl(filePath).data.publicUrl
}

export const uploadBanner = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop()
  const filePath = `${userId}-banner.${fileExt}`
  const { error } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true })
  if (error) throw error
  return supabase.storage.from('avatars').getPublicUrl(filePath).data.publicUrl
}

export const getProfileStats = async (userId: string) => {
  const [{ count: friendsCount }, { count: eventsCount }] = await Promise.all([
    supabase.from('friendships')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'accepted')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`),
    supabase.from('events')
      .select('*', { count: 'exact', head: true })
      .eq('host_id', userId),
  ])
  return {
    friends: friendsCount || 0,
    eventsHosted: eventsCount || 0,
  }
}

export interface SearchedUser {
  id: string
  display_name: string | null
  username: string | null
  avatar_url: string | null
  friendshipStatus: 'none' | 'pending' | 'accepted' | 'blocked'
}

export const searchUsers = async (query: string, currentUserId: string): Promise<SearchedUser[]> => {
  if (!query.trim()) return []
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, display_name, username, avatar_url')
    .or(`display_name.ilike.%${query}%,username.ilike.%${query}%`)
    .neq('id', currentUserId)
    .limit(20)
  if (error || !users) return []

  const { data: friendships } = await supabase
    .from('friendships')
    .select('requester_id, addressee_id, status')
    .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`)
    .in('requester_id', users.map(u => u.id).concat(currentUserId))

  const statusMap = new Map<string, 'pending' | 'accepted' | 'blocked'>()
  for (const f of (friendships || [])) {
    const otherId = f.requester_id === currentUserId ? f.addressee_id : f.requester_id
    statusMap.set(otherId, f.status)
  }

  return users.map(u => ({
    id: u.id,
    display_name: u.display_name,
    username: u.username,
    avatar_url: u.avatar_url,
    friendshipStatus: statusMap.get(u.id) ?? 'none',
  }))
}
