/**
 * notificationService.ts
 * All database operations related to In-App Notifications.
 * Import from here, NOT directly from supabase.ts.
 */

import { supabase } from '../supabase';

export interface AppNotification {
  id: string
  user_id: string
  actor_id: string | null
  type: 'follow' | 'like' | 'comment' | 'booking' | 'dm' | 'event_reminder' | 'friend_request' | 'friend_accepted'
  title: string
  body: string
  data: Record<string, any> | null
  read: boolean
  created_at: string
  actor?: {
    id: string
    display_name: string | null
    username: string | null
    avatar_url: string | null
  }
}

export const getNotifications = async (userId: string): Promise<AppNotification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select(`*, actor:actor_id (id, display_name, username, avatar_url)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(40)
  if (error) return []
  return (data || []) as AppNotification[]
}

export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)
  return count || 0
}

export const markAllNotificationsRead = async (userId: string): Promise<void> => {
  await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
}

export const createNotification = async (
  userId: string,
  actorId: string,
  type: AppNotification['type'],
  title: string,
  body: string,
  data: Record<string, any> = {}
): Promise<void> => {
  if (userId === actorId) return // Never self-notify
  await supabase
    .from('notifications')
    .insert([{ user_id: userId, actor_id: actorId, type, title, body, data, read: false }])
}

export const subscribeToNotifications = (userId: string, callback: (notif: AppNotification) => void) => {
  return supabase
    .channel(`notifs:${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      async (payload) => {
        const { data } = await supabase
          .from('notifications')
          .select(`*, actor:actor_id (id, display_name, username, avatar_url)`)
          .eq('id', payload.new.id)
          .single()
        if (data) callback(data as AppNotification)
      }
    )
    .subscribe()
}
