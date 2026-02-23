import { createClient } from '@supabase/supabase-js';
import { DbTicket, DbEvent, DbProfile, Event, Venue } from '../types';

export const mapDbEventToEvent = (dbEvent: any): Event => {
    return {
        id: dbEvent.id,
        title: dbEvent.title,
        startTime: new Date(dbEvent.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: dbEvent.date,
        location: {
            lat: dbEvent.latitude || 0,
            lng: dbEvent.longitude || 0,
            name: dbEvent.location_name,
            address: dbEvent.location_name
        },
        imageUrl: dbEvent.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
        host: {
            id: dbEvent.host?.id,
            name: dbEvent.host?.full_name || 'Unknown Host',
            avatar: dbEvent.host?.avatar_url || 'https://github.com/shadcn.png',
            instagram: dbEvent.host?.username ? `@${dbEvent.host.username}` : undefined
        },
        attendees: Math.floor(Math.random() * 100) + 10, // Mock attendees count for now
        mood: (dbEvent.mood as any) || 'Chill',
        description: dbEvent.description || '',
        price: dbEvent.price || 0,
        capacity: dbEvent.capacity || 100,
        category: dbEvent.category || 'Event',
        friendsAttending: 0,
        friendsRsvped: 0
    };
};

export const mapDbVenueToVenue = (dbVenue: any): Venue => {
    return {
        id: dbVenue.id,
        name: dbVenue.name,
        location: dbVenue.location,
        rating: dbVenue.rating || 4.5,
        imageUrl: dbVenue.image_url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3',
        capacity: dbVenue.capacity || '100',
        pricePerHour: dbVenue.price_per_hour || 5000,
        amenities: dbVenue.amenities || [],
        category: dbVenue.category || 'Banquet Hall'
    };
};

import { Capacitor } from '@capacitor/core';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});

export const getURL = () => {
    let url = 'http://localhost:3000/';

    // Debug logging removed

    if (typeof window !== 'undefined' && window.location.origin) {
        url = window.location.origin;
    } else {
        url = import.meta.env.VITE_SITE_URL ??
            import.meta.env.VITE_VERCEL_URL ??
            'http://localhost:3000/';
    }
    // Make sure to include `https://` when not localhost.
    url = url.includes('http') ? url : `https://${url}`;
    // Make sure to include a trailing `/`.
    url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;

    if (Capacitor.isNativePlatform()) {
        return 'com.events.app://login-callback/';
    }

    return url;
};

export async function fetchEvents(): Promise<Event[]> {
    const { data, error } = await supabase
        .from('events')
        .select(`
      *,
      profiles:host_id (
        full_name,
        avatar_url,
        username
      )
    `)
        .order('date', { ascending: true });

    if (error) {
        return [];
    }

    return data.map((dbEvent: any) => ({
        id: dbEvent.id,
        title: dbEvent.title,
        startTime: dbEvent.date,
        location: {
            lat: dbEvent.latitude,
            lng: dbEvent.longitude,
            name: dbEvent.location_name,
        },
        imageUrl: dbEvent.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
        host: {
            id: dbEvent.host_id,
            name: dbEvent.profiles?.full_name || dbEvent.profiles?.username || 'Unknown Host',
            avatar: dbEvent.profiles?.avatar_url || 'https://github.com/shadcn.png',
            instagram: dbEvent.profiles?.username,
        },
        attendees: Math.floor(Math.random() * 50) + 10, // Mock for now
        mood: (dbEvent.mood as any) || 'Chill',
        description: dbEvent.description || '',
        price: dbEvent.price,
        capacity: dbEvent.capacity,
        category: dbEvent.category,
    }));
}

export async function createEvent(eventData: Omit<DbEvent, 'id' | 'created_at'>) {
    // Ensure the host has a profile row (foreign key requirement)
    await ensureProfile(eventData.host_id);

    const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Ensures a profile row exists for the given user.
 * The events table requires host_id to reference profiles(id).
 */
export async function ensureProfile(userId: string) {
    const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

    if (!data) {
        // Get user metadata from auth to populate basics
        const { data: { user } } = await supabase.auth.getUser();
        await supabase
            .from('profiles')
            .upsert({
                id: userId,
                full_name: user?.user_metadata?.full_name || user?.user_metadata?.name || null,
                avatar_url: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null,
                username: user?.email?.split('@')[0] || null,
            }, { onConflict: 'id' });
    }
}

export async function getProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) return null;
    return data as DbProfile;
}

export async function uploadEventImage(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

    if (uploadError) {
        throw uploadError;
    }

    const { data } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

    return data.publicUrl;
}

export async function createTicket(ticketData: Omit<DbTicket, 'id' | 'created_at'>) {
    const { data, error } = await supabase
        .from('tickets')
        .insert([ticketData])
        .select()
        .single();

    return data;
}

export async function getUserHostedEvents(userId: string) {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('host_id', userId)
        .order('date', { ascending: true });

    if (error) {
        return [];
    }
    return data;
}



export async function getEvents() {
    const { data, error } = await supabase
        .from('events')
        .select(`
            *,
            host:profiles!host_id (id, full_name, avatar_url)
        `)
        .order('date', { ascending: true });

    if (error) {
        return [];
    }
    return data;
}

export const rsvpToEvent = async (eventId: string, userId: string) => {
    const { data, error } = await supabase
        .from('tickets')
        .insert([
            { event_id: eventId, user_id: userId }
        ])
        .select()
        .single();

    if (error) {
        throw error;
    }
    return data;
};

export const getUserTickets = async (userId: string) => {
    const { data, error } = await supabase
        .from('tickets')
        .select(`
      *,
      event:events (*)
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        return [];
    }
    return data;
};

export const checkRsvpStatus = async (eventId: string, userId: string) => {
    const { data, error } = await supabase
        .from('tickets')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
        // Handle error silently
    }

    return !!data;
};

// ============================================
// VENUES API
// ============================================

export const fetchVenues = async () => {
    const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('rating', { ascending: false });

    if (error) {
        return [];
    }
    return data;
};

export const getVenueById = async (venueId: string) => {
    const { data, error } = await supabase
        .from('venues')
        .select(`
            *,
            owner:owner_id (full_name, avatar_url, username)
        `)
        .eq('id', venueId)
        .single();

    if (error) {
        return null;
    }
    return data;
};

export const createVenueBooking = async (bookingData: {
    venue_id: string;
    user_id: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    total_price: number;
    notes?: string;
}) => {
    const { data, error } = await supabase
        .from('venue_bookings')
        .insert([bookingData])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getUserVenueBookings = async (userId: string) => {
    const { data, error } = await supabase
        .from('venue_bookings')
        .select(`
            *,
            venue:venues (*)
        `)
        .eq('user_id', userId)
        .order('booking_date', { ascending: true });

    if (error) {
        return [];
    }
    return data;
};

// ============================================
// SOCIAL: LIKES API
// ============================================

export const likeEvent = async (eventId: string, userId: string) => {
    const { data, error } = await supabase
        .from('event_likes')
        .insert([{ event_id: eventId, user_id: userId }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const unlikeEvent = async (eventId: string, userId: string) => {
    const { error } = await supabase
        .from('event_likes')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

    if (error) throw error;
};

export const getEventLikeStatus = async (eventId: string, userId: string) => {
    const { data: liked } = await supabase
        .from('event_likes')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

    const { count } = await supabase
        .from('event_likes')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

    return { isLiked: !!liked, likeCount: count || 0 };
};

// ============================================
// SOCIAL: COMMENTS API
// ============================================

export const addComment = async (eventId: string, userId: string, content: string) => {
    const { data, error } = await supabase
        .from('event_comments')
        .insert([{ event_id: eventId, user_id: userId, content }])
        .select(`
            *,
            user:user_id (full_name, avatar_url, username)
        `)
        .single();

    if (error) throw error;
    return data;
};

export const getComments = async (eventId: string) => {
    const { data, error } = await supabase
        .from('event_comments')
        .select(`
            *,
            user:user_id (full_name, avatar_url, username)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

    if (error) {
        return [];
    }
    return data;
};

export const deleteComment = async (commentId: string) => {
    const { error } = await supabase
        .from('event_comments')
        .delete()
        .eq('id', commentId);

    if (error) throw error;
};

// ============================================
// SOCIAL: FOLLOWS API
// ============================================

export const followUser = async (followerId: string, followingId: string) => {
    const { data, error } = await supabase
        .from('follows')
        .insert([{ follower_id: followerId, following_id: followingId }])
        .select()
        .single();

    if (error) throw error;

    // Fire a notification to the followed user
    try {
        const { data: actorProfile } = await supabase
            .from('profiles')
            .select('full_name, username')
            .eq('id', followerId)
            .single();
        const name = actorProfile?.full_name || actorProfile?.username || 'Someone';
        await createNotification(
            followingId,
            followerId,
            'follow',
            'New Follower',
            'started following you'
        );
    } catch (_) { /* notifications are non-critical */ }

    return data;
};


export const unfollowUser = async (followerId: string, followingId: string) => {
    const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

    if (error) throw error;
};

export const getFollowStatus = async (followerId: string, followingId: string) => {
    const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();

    return !!data;
};

export const getProfileStats = async (userId: string) => {
    const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

    const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

    const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('host_id', userId);

    return {
        followers: followersCount || 0,
        following: followingCount || 0,
        eventsHosted: eventsCount || 0,
    };
};

// ============================================
// EVENT GROUP CHAT API
// ============================================

export const getEventChat = async (eventId: string) => {
    const { data, error } = await supabase
        .from('event_chats')
        .select('*')
        .eq('event_id', eventId)
        .single();

    if (error && error.code !== 'PGRST116') {
        // Handle error
    }
    return data;
};

export const getChatMessages = async (chatId: string, limit = 50, offset = 0) => {
    const { data, error } = await supabase
        .from('chat_messages')
        .select(`
            *,
            user:user_id (full_name, avatar_url, username)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        return [];
    }
    return data.reverse(); // Return in chronological order
};

export const sendMessage = async (chatId: string, userId: string, content: string, messageType: 'text' | 'image' | 'system' = 'text') => {
    const { data, error } = await supabase
        .from('chat_messages')
        .insert([{ chat_id: chatId, user_id: userId, content, message_type: messageType }])
        .select(`
            *,
            user:user_id (full_name, avatar_url, username)
        `)
        .single();

    if (error) throw error;
    return data;
};

export const getChatMembers = async (chatId: string) => {
    const { data, error } = await supabase
        .from('chat_members')
        .select(`
            *,
            user:user_id (full_name, avatar_url, username)
        `)
        .eq('chat_id', chatId);

    if (error) {
        return [];
    }
    return data;
};

export const getUserChats = async (userId: string) => {
    const { data, error } = await supabase
        .from('chat_members')
        .select(`
            *,
            chat:chat_id (
                id,
                event_id,
                event:event_id (title, image_url)
            )
        `)
        .eq('user_id', userId);

    if (error) {
        return [];
    }
    return data;
};

export const markChatAsRead = async (chatId: string, userId: string) => {
    const { error } = await supabase
        .from('chat_members')
        .update({ last_read_at: new Date().toISOString() })
        .eq('chat_id', chatId)
        .eq('user_id', userId);

    if (error) throw error;
};

// Real-time subscription for chat messages
export const subscribeToChatMessages = (chatId: string, callback: (message: any) => void) => {
    return supabase
        .channel(`chat:${chatId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `chat_id=eq.${chatId}`,
            },
            async (payload) => {
                // Fetch the full message with user info
                const { data } = await supabase
                    .from('chat_messages')
                    .select(`
                        *,
                        user:user_id (full_name, avatar_url, username)
                    `)
                    .eq('id', payload.new.id)
                    .single();

                if (data) callback(data);
            }
        )
        .subscribe();
};

// ============================================
// ENHANCED CHAT LIST API
// ============================================

export interface ChatWithLastMessage {
    id: string;
    eventId: string;
    title: string;
    image: string;
    lastMessage: {
        content: string;
        senderName: string;
        createdAt: string;
    } | null;
    unreadCount: number;
}

export const getChatsWithLastMessage = async (userId: string): Promise<ChatWithLastMessage[]> => {
    // 1. Get all chats the user is a member of
    const { data: memberships, error: memErr } = await supabase
        .from('chat_members')
        .select(`
            last_read_at,
            chat:chat_id (
                id,
                event_id,
                event:event_id (title, image_url)
            )
        `)
        .eq('user_id', userId);

    if (memErr || !memberships) return [];

    const chats: ChatWithLastMessage[] = [];

    for (const mem of memberships) {
        const chat = (mem as any).chat;
        if (!chat || !chat.event) continue;

        const chatId = chat.id;
        const lastReadAt = (mem as any).last_read_at;

        // 2. Get the last message for this chat
        const { data: lastMsgArr } = await supabase
            .from('chat_messages')
            .select(`
                content,
                created_at,
                user:user_id (full_name, username)
            `)
            .eq('chat_id', chatId)
            .order('created_at', { ascending: false })
            .limit(1);

        const lastMsg = lastMsgArr?.[0] as any;

        // 3. Get unread count (messages after last_read_at)
        let unreadCount = 0;
        if (lastReadAt) {
            const { count } = await supabase
                .from('chat_messages')
                .select('*', { count: 'exact', head: true })
                .eq('chat_id', chatId)
                .gt('created_at', lastReadAt)
                .neq('user_id', userId);
            unreadCount = count || 0;
        } else if (lastMsg) {
            // Never read → all messages from others are unread
            const { count } = await supabase
                .from('chat_messages')
                .select('*', { count: 'exact', head: true })
                .eq('chat_id', chatId)
                .neq('user_id', userId);
            unreadCount = count || 0;
        }

        chats.push({
            id: chatId,
            eventId: chat.event_id,
            title: chat.event.title,
            image: chat.event.image_url,
            lastMessage: lastMsg
                ? {
                    content: lastMsg.content,
                    senderName: lastMsg.user?.full_name || lastMsg.user?.username || 'Someone',
                    createdAt: lastMsg.created_at,
                }
                : null,
            unreadCount,
        });
    }

    // Sort: most recent message first
    chats.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt || '';
        const bTime = b.lastMessage?.createdAt || '';
        return bTime.localeCompare(aTime);
    });

    return chats;
};

// Real-time subscription for the chat list — fires when any of the user's chats gets a new message
export const subscribeToUserChatList = (userId: string, chatIds: string[], callback: () => void) => {
    if (chatIds.length === 0) return null;

    return supabase
        .channel(`chat-list:${userId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
            },
            (payload) => {
                // Only trigger for chats the user is a member of
                if (chatIds.includes(payload.new.chat_id)) {
                    callback();
                }
            }
        )
        .subscribe();
};

// ============================================
// SOCIAL: FRIEND ACTIVITY API
// ============================================

export interface FriendActivityItem {
    eventId: string;
    title: string;
    image: string;
    location: string;
    date: string;
    friendName: string;
    friendAvatar: string;
    friendAction: 'rsvp' | 'hosting';
    category: string;
}

export const getFriendActivity = async (userId: string): Promise<FriendActivityItem[]> => {
    // 1. Get people this user follows
    const { data: following, error: followErr } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

    if (followErr || !following || following.length === 0) return [];

    const followedIds = following.map(f => f.following_id);

    // 2. Get events those users have RSVP'd to (via tickets)
    const { data: friendTickets, error: ticketErr } = await supabase
        .from('tickets')
        .select(`
            user_id,
            event:event_id (
                id, title, image_url, location_name, date, category
            ),
            user:user_id (full_name, avatar_url)
        `)
        .in('user_id', followedIds)
        .order('created_at', { ascending: false })
        .limit(20);

    // 3. Get events those users are hosting
    const { data: friendEvents, error: eventErr } = await supabase
        .from('events')
        .select(`
            id, title, image_url, location_name, date, category,
            host:host_id (id, full_name, avatar_url)
        `)
        .in('host_id', followedIds)
        .order('date', { ascending: false })
        .limit(20);

    const activityItems: FriendActivityItem[] = [];

    // Map RSVP'd events
    if (friendTickets) {
        for (const ticket of friendTickets) {
            const event = (ticket as any).event;
            const friend = (ticket as any).user;
            if (!event) continue;
            activityItems.push({
                eventId: event.id,
                title: event.title,
                image: event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400',
                location: event.location_name || 'Unknown',
                date: event.date,
                friendName: friend?.full_name || 'A friend',
                friendAvatar: friend?.avatar_url || `https://ui-avatars.com/api/?name=U&background=D4AF37&color=000`,
                friendAction: 'rsvp',
                category: event.category || 'Event',
            });
        }
    }

    // Map hosted events
    if (friendEvents) {
        for (const event of friendEvents) {
            const host = (event as any).host;
            if (!host) continue;
            activityItems.push({
                eventId: event.id,
                title: event.title,
                image: event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400',
                location: event.location_name || 'Unknown',
                date: event.date,
                friendName: host.full_name || 'A friend',
                friendAvatar: host.avatar_url || `https://ui-avatars.com/api/?name=U&background=D4AF37&color=000`,
                friendAction: 'hosting',
                category: event.category || 'Event',
            });
        }
    }

    // Deduplicate by eventId (keep the first occurrence)
    const seen = new Set<string>();
    const unique = activityItems.filter(item => {
        if (seen.has(item.eventId)) return false;
        seen.add(item.eventId);
        return true;
    });

    return unique;
};

// ============================================
// USER SEARCH API
// ============================================

export interface SearchedUser {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    isFollowing: boolean;
}

export const searchUsers = async (query: string, currentUserId: string): Promise<SearchedUser[]> => {
    if (!query.trim()) return [];

    const { data: users, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
        .neq('id', currentUserId)
        .limit(20);

    if (error || !users) return [];

    // Check which ones the current user is already following
    const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId)
        .in('following_id', users.map(u => u.id));

    const followingSet = new Set((followingData || []).map(f => f.following_id));

    return users.map(u => ({
        id: u.id,
        full_name: u.full_name,
        username: u.username,
        avatar_url: u.avatar_url,
        isFollowing: followingSet.has(u.id),
    }));
};

// ============================================
// DIRECT MESSAGING API
// ============================================

export interface DMConversation {
    id: string;
    otherUser: {
        id: string;
        full_name: string | null;
        username: string | null;
        avatar_url: string | null;
    };
    lastMessage: {
        content: string;
        senderId: string;
        createdAt: string;
    } | null;
    unreadCount: number;
}

export interface DMMessage {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    created_at: string;
    read_at: string | null;
    sender?: {
        full_name: string | null;
        avatar_url: string | null;
        username: string | null;
    };
}

// Get or create a 1-on-1 conversation between two users
export const getOrCreateDMConversation = async (userId: string, otherUserId: string): Promise<string | null> => {
    // Sort IDs so user1_id is always the lesser UUID (ensures uniqueness)
    const [user1_id, user2_id] = [userId, otherUserId].sort();

    // Check if conversation already exists
    const { data: existing } = await supabase
        .from('direct_conversations')
        .select('id')
        .eq('user1_id', user1_id)
        .eq('user2_id', user2_id)
        .single();

    if (existing) return existing.id;

    // Create new conversation
    const { data, error } = await supabase
        .from('direct_conversations')
        .insert([{ user1_id, user2_id }])
        .select('id')
        .single();

    if (error) return null;
    return data.id;
};

// Get all DM conversations for a user with last message + unread count
export const getUserDMConversations = async (userId: string): Promise<DMConversation[]> => {
    const { data: convs, error } = await supabase
        .from('direct_conversations')
        .select(`
            id,
            user1_id,
            user2_id,
            user1:user1_id (id, full_name, username, avatar_url),
            user2:user2_id (id, full_name, username, avatar_url)
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('created_at', { ascending: false });

    if (error || !convs) return [];

    const result: DMConversation[] = [];

    for (const conv of convs) {
        const otherUser = (conv as any).user1_id === userId
            ? (conv as any).user2
            : (conv as any).user1;

        const { data: lastMsgArr } = await supabase
            .from('direct_messages')
            .select('id, content, sender_id, created_at, read_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);

        const lastMsg = lastMsgArr?.[0] as any;

        // Count unread: messages from the other user that have no read_at
        const { count: unread } = await supabase
            .from('direct_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', userId)
            .is('read_at', null);

        result.push({
            id: conv.id,
            otherUser: {
                id: otherUser?.id,
                full_name: otherUser?.full_name,
                username: otherUser?.username,
                avatar_url: otherUser?.avatar_url,
            },
            lastMessage: lastMsg ? {
                content: lastMsg.content,
                senderId: lastMsg.sender_id,
                createdAt: lastMsg.created_at,
            } : null,
            unreadCount: unread || 0,
        });
    }

    // Sort by most recent message
    result.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt || '';
        const bTime = b.lastMessage?.createdAt || '';
        return bTime.localeCompare(aTime);
    });

    return result;
};

// Fetch messages for a conversation  
export const getDMMessages = async (conversationId: string, limit = 50): Promise<DMMessage[]> => {
    const { data, error } = await supabase
        .from('direct_messages')
        .select(`
            *,
            sender:sender_id (full_name, avatar_url, username)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) return [];
    return (data || []).reverse() as DMMessage[];
};

// Send a DM
export const sendDMMessage = async (conversationId: string, senderId: string, content: string): Promise<DMMessage | null> => {
    const { data, error } = await supabase
        .from('direct_messages')
        .insert([{ conversation_id: conversationId, sender_id: senderId, content }])
        .select(`
            *,
            sender:sender_id (full_name, avatar_url, username)
        `)
        .single();

    if (error) return null;
    return data as DMMessage;
};

// Mark DMs as read
export const markDMsAsRead = async (conversationId: string, userId: string): Promise<void> => {
    await supabase
        .from('direct_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .is('read_at', null);
};

// Real-time subscription for a DM conversation
export const subscribeToDMMessages = (conversationId: string, callback: (msg: DMMessage) => void) => {
    return supabase
        .channel(`dm:${conversationId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'direct_messages',
                filter: `conversation_id=eq.${conversationId}`,
            },
            async (payload) => {
                const { data } = await supabase
                    .from('direct_messages')
                    .select(`*, sender:sender_id (full_name, avatar_url, username)`)
                    .eq('id', payload.new.id)
                    .single();
                if (data) callback(data as DMMessage);
            }
        )
        .subscribe();
};

// ============================================
// PROFILE UPDATE API
// ============================================

export const updateProfile = async (userId: string, profileData: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
    banner_url?: string;
    bio?: string;
    location?: string;
    languages?: string[];
    interests?: string[];
    website?: string;
    is_private?: boolean;
    dm_privacy?: string;
    notification_prefs?: Record<string, boolean>;
}) => {
    const { data, error } = await supabase
        .from('profiles')
        .update({ ...profileData, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const uploadAvatar = async (userId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    return data.publicUrl;
};

export const uploadBanner = async (userId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}-banner.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    return data.publicUrl;
};

// ============================================
// NOTIFICATIONS API
// ============================================

export interface AppNotification {
    id: string;
    user_id: string;      // recipient
    actor_id: string | null; // who triggered it
    type: 'follow' | 'like' | 'comment' | 'booking' | 'dm' | 'event_reminder';
    title: string;
    body: string;
    data: Record<string, any> | null;
    read: boolean;
    created_at: string;
    actor?: {
        id: string;
        full_name: string | null;
        username: string | null;
        avatar_url: string | null;
    };
}

// Fetch notifications for current user (most recent 40)
export const getNotifications = async (userId: string): Promise<AppNotification[]> => {
    const { data, error } = await supabase
        .from('notifications')
        .select(`
            *,
            actor:actor_id (id, full_name, username, avatar_url)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(40);

    if (error) return [];
    return (data || []) as AppNotification[];
};

// Get unread count
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
    const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);
    return count || 0;
};

// Mark all as read
export const markAllNotificationsRead = async (userId: string): Promise<void> => {
    await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);
};

// Create a notification (used internally)
export const createNotification = async (
    userId: string,
    actorId: string,
    type: AppNotification['type'],
    title: string,
    body: string,
    data: Record<string, any> = {}
): Promise<void> => {
    // Don't notify yourself
    if (userId === actorId) return;
    await supabase
        .from('notifications')
        .insert([{ user_id: userId, actor_id: actorId, type, title, body, data, read: false }]);
};

// Real-time subscription
export const subscribeToNotifications = (
    userId: string,
    callback: (notif: AppNotification) => void
) => {
    return supabase
        .channel(`notifs:${userId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`,
            },
            async (payload) => {
                const { data } = await supabase
                    .from('notifications')
                    .select(`*, actor:actor_id (id, full_name, username, avatar_url)`)
                    .eq('id', payload.new.id)
                    .single();
                if (data) callback(data as AppNotification);
            }
        )
        .subscribe();
};

