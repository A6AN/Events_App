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

    // Debug logging
    console.log('🔗 getURL Debug:');
    console.log('- window.origin:', typeof window !== 'undefined' ? window.location.origin : 'undefined');
    console.log('- VITE_SITE_URL:', import.meta.env.VITE_SITE_URL);
    console.log('- VITE_VERCEL_URL:', import.meta.env.VITE_VERCEL_URL);

    if (typeof window !== 'undefined' && window.location.origin) {
        url = window.location.origin;
        console.log('- Using window.origin:', url);
    } else {
        url = import.meta.env.VITE_SITE_URL ??
            import.meta.env.VITE_VERCEL_URL ??
            'http://localhost:3000/';
        console.log('- Using fallback env:', url);
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
        console.error('Error fetching events:', error);
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
    const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();

    if (error) throw error;
    return data;
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
        console.error('Error fetching hosted events:', error);
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
        console.error('Error fetching events:', error);
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
        console.error('Error RSVPing to event:', error);
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
        console.error('Error fetching user tickets:', error);
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
        console.error('Error checking RSVP status:', error);
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
        console.error('Error fetching venues:', error);
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
        console.error('Error fetching venue:', error);
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
        console.error('Error fetching venue bookings:', error);
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
        console.error('Error fetching comments:', error);
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
        console.error('Error fetching event chat:', error);
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
        console.error('Error fetching chat messages:', error);
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
        console.error('Error fetching chat members:', error);
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
        console.error('Error fetching user chats:', error);
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
// PROFILE UPDATE API
// ============================================

export const updateProfile = async (userId: string, profileData: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
    website?: string;
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


