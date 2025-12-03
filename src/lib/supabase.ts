import { createClient } from '@supabase/supabase-js';
import { DbEvent, DbProfile, Event } from '../types';

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
    let url =
        import.meta.env.VITE_SITE_URL ?? // Set this to your site URL in production env.
        import.meta.env.VITE_VERCEL_URL ?? // Automatically set by Vercel.
        'http://localhost:3000/';
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
