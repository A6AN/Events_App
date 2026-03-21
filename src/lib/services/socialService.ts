/**
 * socialService.ts
 * All database ops related to the Social Graph (Likes, Comments, Follows, Friend Activity).
 * Import from here, NOT directly from supabase.ts.
 */

import { supabase } from '../supabase';
import { AppNotification, createNotification } from './notificationService';

// ─────────────────────────────────────────────
// LIKES
// ─────────────────────────────────────────────

export const likeEvent = async (eventId: string, userId: string) => {
    const { data, error } = await supabase.from('event_likes').insert([{ event_id: eventId, user_id: userId }]).select().single();
    if (error) throw error;
    return data;
};

export const unlikeEvent = async (eventId: string, userId: string) => {
    const { error } = await supabase.from('event_likes').delete().eq('event_id', eventId).eq('user_id', userId);
    if (error) throw error;
};

export const getEventLikeStatus = async (eventId: string, userId: string) => {
    const { data: liked } = await supabase.from('event_likes').select('id').eq('event_id', eventId).eq('user_id', userId).single();
    const { count } = await supabase.from('event_likes').select('*', { count: 'exact', head: true }).eq('event_id', eventId);
    return { isLiked: !!liked, likeCount: count || 0 };
};

// ─────────────────────────────────────────────
// COMMENTS
// ─────────────────────────────────────────────

export const addComment = async (eventId: string, userId: string, content: string) => {
    const { data, error } = await supabase
        .from('event_comments')
        .insert([{ event_id: eventId, user_id: userId, content }])
        .select(`*, user:user_id (display_name, avatar_url, username)`)
        .single();
    if (error) throw error;
    return data;
};

export const getComments = async (eventId: string) => {
    const { data, error } = await supabase
        .from('event_comments')
        .select(`*, user:user_id (display_name, avatar_url, username)`)
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });
    if (error) return [];
    return data;
};

export const deleteComment = async (commentId: string) => {
    const { error } = await supabase.from('event_comments').delete().eq('id', commentId);
    if (error) throw error;
};

// ─────────────────────────────────────────────
// FOLLOWS
// ─────────────────────────────────────────────

export const followUser = async (followerId: string, followingId: string) => {
    const { data, error } = await supabase.from('follows').insert([{ follower_id: followerId, following_id: followingId }]).select().single();
    if (error) throw error;
    try {
        await createNotification(followingId, followerId, 'follow', 'New Follower', 'started following you');
    } catch (_) { /* non-critical */ }
    return data;
};

export const unfollowUser = async (followerId: string, followingId: string) => {
    const { error } = await supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId);
    if (error) throw error;
};

export const getFollowStatus = async (followerId: string, followingId: string) => {
    const { data } = await supabase.from('follows').select('id').eq('follower_id', followerId).eq('following_id', followingId).single();
    return !!data;
};

// ─────────────────────────────────────────────
// FRIEND ACTIVITY FEED
// ─────────────────────────────────────────────

export interface FriendActivityItem {
    eventId: string;
    title: string;
    image: string;
    location: string;
    start_time: string;
    friendName: string;
    friendAvatar: string;
    friendAction: 'rsvp' | 'hosting';
    category: string;
}

export const getFriendActivity = async (userId: string): Promise<FriendActivityItem[]> => {
    const { data: following, error: followErr } = await supabase
        .from('follows').select('following_id').eq('follower_id', userId);
    if (followErr || !following || following.length === 0) return [];

    const followedIds = following.map((f: any) => f.following_id);

    const [{ data: friendTickets }, { data: friendEvents }] = await Promise.all([
        supabase.from('tickets')
            .select(`user_id, event:event_id (id, title, cover_url, address, start_time, category), user:user_id (display_name, avatar_url)`)
            .in('user_id', followedIds).order('created_at', { ascending: false }).limit(20),
        supabase.from('events')
            .select(`id, title, cover_url, address, start_time, category, host:host_id (id, display_name, avatar_url)`)
            .in('host_id', followedIds).order('start_time', { ascending: false }).limit(20),
    ]);

    const activityItems: FriendActivityItem[] = [];
    const fallback = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400';

    for (const ticket of (friendTickets || [])) {
        const event = (ticket as any).event;
        const friend = (ticket as any).user;
        if (!event) continue;
        activityItems.push({ eventId: event.id, title: event.title, image: event.cover_url || fallback, location: event.address || 'Unknown', start_time: event.start_time, friendName: friend?.display_name || 'A friend', friendAvatar: friend?.avatar_url || `https://ui-avatars.com/api/?name=U&background=D4AF37&color=000`, friendAction: 'rsvp', category: event.category || 'Event' });
    }
    for (const event of (friendEvents || [])) {
        const host = (event as any).host;
        if (!host) continue;
        activityItems.push({ eventId: event.id, title: event.title, image: event.cover_url || fallback, location: event.address || 'Unknown', start_time: event.start_time, friendName: host.display_name || 'A friend', friendAvatar: host.avatar_url || `https://ui-avatars.com/api/?name=U&background=D4AF37&color=000`, friendAction: 'hosting', category: event.category || 'Event' });
    }

    const seen = new Set<string>();
    return activityItems.filter(item => { if (seen.has(item.eventId)) return false; seen.add(item.eventId); return true; });
};
