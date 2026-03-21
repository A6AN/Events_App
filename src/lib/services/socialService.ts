// src/lib/services/socialService.ts
import { supabase } from '../supabase'
import { createNotification } from './notificationService'

// ─── LIKES ────────────────────────────────────────

export const likeEvent = async (eventId: string, userId: string) => {
  const { data, error } = await supabase.from('event_likes').insert([{ event_id: eventId, user_id: userId }]).select().single()
  if (error) throw error
  return data
}

export const unlikeEvent = async (eventId: string, userId: string) => {
  const { error } = await supabase.from('event_likes').delete().eq('event_id', eventId).eq('user_id', userId)
  if (error) throw error
}

export const getEventLikeStatus = async (eventId: string, userId: string) => {
  const { data: liked } = await supabase.from('event_likes').select('id').eq('event_id', eventId).eq('user_id', userId).maybeSingle()
  const { count } = await supabase.from('event_likes').select('*', { count: 'exact', head: true }).eq('event_id', eventId)
  return { isLiked: !!liked, likeCount: count || 0 }
}

// ─── COMMENTS ─────────────────────────────────────

export const addComment = async (eventId: string, userId: string, content: string) => {
  const { data, error } = await supabase
    .from('event_comments')
    .insert([{ event_id: eventId, user_id: userId, content }])
    .select(`*, user:user_id (display_name, avatar_url, username)`)
    .single()
  if (error) throw error
  return data
}

export const getComments = async (eventId: string) => {
  const { data, error } = await supabase
    .from('event_comments')
    .select(`*, user:user_id (display_name, avatar_url, username)`)
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })
  if (error) return []
  return data
}

export const deleteComment = async (commentId: string) => {
  const { error } = await supabase.from('event_comments').delete().eq('id', commentId)
  if (error) throw error
}

// ─── FRIENDSHIPS ──────────────────────────────────

export const sendFriendRequest = async (requesterId: string, addresseeId: string) => {
  const { data, error } = await supabase
    .from('friendships')
    .insert([{ requester_id: requesterId, addressee_id: addresseeId, status: 'pending' }])
    .select()
    .single()
  if (error) throw error
  try {
    await createNotification(addresseeId, requesterId, 'friend_request', 'Friend Request', 'sent you a friend request')
  } catch (_) { /* non-critical */ }
  return data
}

export const acceptFriendRequest = async (requesterId: string, addresseeId: string) => {
  const { data, error } = await supabase
    .from('friendships')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('requester_id', requesterId)
    .eq('addressee_id', addresseeId)
    .select()
    .single()
  if (error) throw error
  try {
    await createNotification(requesterId, addresseeId, 'friend_accepted', 'Friend Request Accepted', 'accepted your friend request')
  } catch (_) { /* non-critical */ }
  return data
}

export const removeFriend = async (userId: string, otherId: string) => {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .or(
      `and(requester_id.eq.${userId},addressee_id.eq.${otherId}),and(requester_id.eq.${otherId},addressee_id.eq.${userId})`
    )
  if (error) throw error
}

export const getFriendshipStatus = async (userId: string, otherId: string) => {
  const { data } = await supabase
    .from('friendships')
    .select('status, requester_id')
    .or(
      `and(requester_id.eq.${userId},addressee_id.eq.${otherId}),and(requester_id.eq.${otherId},addressee_id.eq.${userId})`
    )
    .maybeSingle()
  if (!data) return { status: 'none' as const, isSender: false }
  return { status: data.status as 'pending' | 'accepted' | 'blocked', isSender: data.requester_id === userId }
}

export const getMutualFriendsCount = async (userId: string, otherId: string): Promise<number> => {
  const [{ data: userFriends }, { data: otherFriends }] = await Promise.all([
    supabase.from('friendships').select('requester_id, addressee_id').eq('status', 'accepted')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`),
    supabase.from('friendships').select('requester_id, addressee_id').eq('status', 'accepted')
      .or(`requester_id.eq.${otherId},addressee_id.eq.${otherId}`),
  ])
  const userSet = new Set((userFriends || []).map(f => f.requester_id === userId ? f.addressee_id : f.requester_id))
  const otherSet = new Set((otherFriends || []).map(f => f.requester_id === otherId ? f.addressee_id : f.requester_id))
  return [...userSet].filter(id => otherSet.has(id)).length
}

// ─── FRIEND ACTIVITY FEED ─────────────────────────

export interface FriendActivityItem {
  eventId: string
  title: string
  image: string
  location: string
  start_time: string
  friendName: string
  friendAvatar: string
  friendAction: 'rsvp' | 'hosting'
  category: string
}

export const getFriendActivity = async (userId: string): Promise<FriendActivityItem[]> => {
  const { data: friendships, error } = await supabase
    .from('friendships')
    .select('requester_id, addressee_id')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)

  if (error || !friendships || friendships.length === 0) return []

  const friendIds = friendships.map(f => f.requester_id === userId ? f.addressee_id : f.requester_id)

  const fallback = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400'

  const [{ data: friendTickets }, { data: friendEvents }] = await Promise.all([
    supabase.from('tickets')
      .select(`user_id, event:event_id (id, title, cover_url, address, start_time, category), user:user_id (display_name, avatar_url)`)
      .in('user_id', friendIds)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase.from('events')
      .select(`id, title, cover_url, address, start_time, category, host:host_id (id, display_name, avatar_url)`)
      .in('host_id', friendIds)
      .order('start_time', { ascending: false })
      .limit(20),
  ])

  const items: FriendActivityItem[] = []

  for (const ticket of (friendTickets || [])) {
    const event = (ticket as any).event
    const friend = (ticket as any).user
    if (!event) continue
    items.push({ eventId: event.id, title: event.title, image: event.cover_url || fallback, location: event.address || 'Unknown', start_time: event.start_time, friendName: friend?.display_name || 'A friend', friendAvatar: friend?.avatar_url || `https://ui-avatars.com/api/?name=U&background=1a1a1a&color=fff`, friendAction: 'rsvp', category: event.category || 'other' })
  }
  for (const event of (friendEvents || [])) {
    const host = (event as any).host
    if (!host) continue
    items.push({ eventId: event.id, title: event.title, image: event.cover_url || fallback, location: event.address || 'Unknown', start_time: event.start_time, friendName: host.display_name || 'A friend', friendAvatar: host.avatar_url || `https://ui-avatars.com/api/?name=U&background=1a1a1a&color=fff`, friendAction: 'hosting', category: event.category || 'other' })
  }

  const seen = new Set<string>()
  return items.filter(item => { if (seen.has(item.eventId)) return false; seen.add(item.eventId); return true })
}
