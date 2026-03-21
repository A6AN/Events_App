// src/lib/services/friendService.ts
import { supabase } from '../supabase'
import type {
  DbFriendship,
  FriendshipWithProfile,
  FriendActivity,
} from '../../types'

// ─── FRIEND REQUESTS ──────────────────────────────

export async function sendFriendRequest(addresseeId: string): Promise<DbFriendship> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('friendships')
    .insert({
      requester_id: user.id,
      addressee_id: addresseeId,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    // Already exists — return existing row instead of throwing
    if (error.code === '23505') {
      return getExistingFriendship(user.id, addresseeId)
    }
    throw error
  }
  return data
}

export async function acceptFriendRequest(friendshipId: string): Promise<void> {
  const { error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', friendshipId)

  if (error) throw error
}

export async function declineFriendRequest(friendshipId: string): Promise<void> {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId)

  if (error) throw error
}

export async function cancelFriendRequest(friendshipId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId)
    .eq('requester_id', user.id)     // only requester can cancel

  if (error) throw error
}

export async function removeFriend(friendshipId: string): Promise<void> {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId)

  if (error) throw error
}

// ─── BLOCKING ─────────────────────────────────────

export async function blockUser(targetUserId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if friendship row already exists
  const existing = await getExistingFriendship(user.id, targetUserId).catch(() => null)

  if (existing) {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'blocked', blocker_id: user.id })
      .eq('id', existing.id)

    if (error) throw error
  } else {
    // No existing friendship — create a blocked row directly
    const { error } = await supabase
      .from('friendships')
      .insert({
        requester_id: user.id,
        addressee_id: targetUserId,
        status: 'blocked',
        blocker_id: user.id,
      })

    if (error) throw error
  }
}

export async function unblockUser(friendshipId: string): Promise<void> {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId)

  if (error) throw error
}

// ─── QUERIES ──────────────────────────────────────

export async function getMyFriends(): Promise<FriendshipWithProfile[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('friendships')
    .select(`
      *,
      requester:profiles!friendships_requester_id_fkey (
        id, username, display_name, avatar_url, rep_tier, university
      ),
      addressee:profiles!friendships_addressee_id_fkey (
        id, username, display_name, avatar_url, rep_tier, university
      )
    `)
    .eq('status', 'accepted')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

  if (error) throw error

  // Normalize — always return the OTHER person as .profile
  return (data ?? []).map((f: any) => ({
    ...f,
    profile: f.requester_id === user.id ? f.addressee : f.requester,
  })) as FriendshipWithProfile[]
}

export async function getPendingRequests(): Promise<FriendshipWithProfile[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('friendships')
    .select(`
      *,
      requester:profiles!friendships_requester_id_fkey (
        id, username, display_name, avatar_url, rep_tier, university
      )
    `)
    .eq('status', 'pending')
    .eq('addressee_id', user.id)     // only inbound requests

  if (error) throw error

  return (data ?? []).map((f: any) => ({
    ...f,
    profile: f.requester,
  })) as FriendshipWithProfile[]
}

export async function getSentRequests(): Promise<FriendshipWithProfile[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('friendships')
    .select(`
      *,
      addressee:profiles!friendships_addressee_id_fkey (
        id, username, display_name, avatar_url, rep_tier, university
      )
    `)
    .eq('status', 'pending')
    .eq('requester_id', user.id)

  if (error) throw error

  return (data ?? []).map((f: any) => ({
    ...f,
    profile: f.addressee,
  })) as FriendshipWithProfile[]
}

export async function getBlockedUsers(): Promise<FriendshipWithProfile[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('friendships')
    .select(`
      *,
      requester:profiles!friendships_requester_id_fkey (
        id, username, display_name, avatar_url, rep_tier, university
      ),
      addressee:profiles!friendships_addressee_id_fkey (
        id, username, display_name, avatar_url, rep_tier, university
      )
    `)
    .eq('status', 'blocked')
    .eq('blocker_id', user.id)

  if (error) throw error

  return (data ?? []).map((f: any) => ({
    ...f,
    profile: f.requester_id === user.id ? f.addressee : f.requester,
  })) as FriendshipWithProfile[]
}

export async function getFriendshipStatus(
  otherUserId: string
): Promise<DbFriendship | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  return getExistingFriendship(user.id, otherUserId).catch(() => null)
}

// ─── FRIEND SUGGESTIONS ───────────────────────────
// Returns users from the same university who aren't friends yet
// Used in onboarding step 4 and empty Friends feed

export async function getFriendSuggestions(
  university: string | null,
  city: string,
  limit = 10
): Promise<FriendshipWithProfile['profile'][]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get all user IDs already in a friendship with current user
  const { data: existing } = await supabase
    .from('friendships')
    .select('requester_id, addressee_id')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

  const excludeIds = new Set<string>([user.id])
  ;(existing ?? []).forEach((f: any) => {
    excludeIds.add(f.requester_id)
    excludeIds.add(f.addressee_id)
  })

  const isStudent = university && university !== 'independent'

  let query = supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, rep_tier, university')
    .eq('account_status', 'active')
    .not('id', 'in', `(${Array.from(excludeIds).join(',')})`)
    .limit(limit)

  // Students: match by university first, fall back to city
  // Non-students: match by city only
  if (isStudent) {
    query = query.eq('university', university)
  } else {
    query = query.eq('city', city)
  }

  const { data, error } = await query
  if (error) throw error

  // If university match returned nothing, fall back to city
  if (isStudent && (!data || data.length === 0)) {
    const { data: cityData } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, rep_tier, university')
      .eq('account_status', 'active')
      .eq('city', city)
      .not('id', 'in', `(${Array.from(excludeIds).join(',')})`)
      .limit(limit)

    return cityData ?? []
  }

  return data ?? []
}

// ─── FRIENDS LEDGER ───────────────────────────────
// Powers the Friends tab in SocialTab

export async function getFriendsActivity(limit = 30): Promise<FriendActivity[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('user_activity')
    .select(`
      *,
      profile:profiles!user_activity_user_id_fkey (
        id, username, display_name, avatar_url
      ),
      event:events!user_activity_entity_id_fkey (
        id, title, cover_url, start_time, city
      )
    `)
    .in('user_id', await getFriendIds(user.id))
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as FriendActivity[]
}

// ─── HELPERS ──────────────────────────────────────

async function getFriendIds(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('friendships')
    .select('requester_id, addressee_id')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)

  if (!data || data.length === 0) return ['00000000-0000-0000-0000-000000000000']
  // ^ dummy UUID prevents empty IN clause crashing Supabase

  return data.map((f: any) =>
    f.requester_id === userId ? f.addressee_id : f.requester_id
  )
}

async function getExistingFriendship(
  userA: string,
  userB: string
): Promise<DbFriendship> {
  const { data, error } = await supabase
    .from('friendships')
    .select('*')
    .or(
      `and(requester_id.eq.${userA},addressee_id.eq.${userB}),` +
      `and(requester_id.eq.${userB},addressee_id.eq.${userA})`
    )
    .single()

  if (error) throw error
  return data
}
