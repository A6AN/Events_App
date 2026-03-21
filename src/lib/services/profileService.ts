/**
 * profileService.ts
 * All database operations related to User Profiles.
 * Import from here, NOT directly from supabase.ts.
 */

import { supabase } from '../supabase';
import { DbProfile } from '../../types';

export async function ensureProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('id').eq('id', userId).single();
    if (!data) {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('profiles').upsert({
            id: userId,
            display_name: user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || null,
            avatar_url: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null,
            username: user?.email?.split('@')[0] || null,
        }, { onConflict: 'id' });
    }
}

export async function getProfile(userId: string) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) return null;
    return data as DbProfile;
}

export const updateProfile = async (userId: string, profileData: {
    display_name?: string;
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
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
};

export const uploadBanner = async (userId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}-banner.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
};

export const getProfileStats = async (userId: string) => {
    const { count: followersCount } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId);
    const { count: followingCount } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId);
    const { count: eventsCount } = await supabase.from('events').select('*', { count: 'exact', head: true }).eq('host_id', userId);
    return {
        followers: followersCount || 0,
        following: followingCount || 0,
        eventsHosted: eventsCount || 0,
    };
};

export interface SearchedUser {
    id: string;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
    isFollowing: boolean;
}

export const searchUsers = async (query: string, currentUserId: string): Promise<SearchedUser[]> => {
    if (!query.trim()) return [];
    const { data: users, error } = await supabase
        .from('profiles')
        .select('id, display_name, username, avatar_url')
        .or(`display_name.ilike.%${query}%,username.ilike.%${query}%`)
        .neq('id', currentUserId)
        .limit(20);
    if (error || !users) return [];
    const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId)
        .in('following_id', users.map(u => u.id));
    const followingSet = new Set((followingData || []).map((f: any) => f.following_id));
    return users.map(u => ({
        id: u.id,
        display_name: u.display_name,
        username: u.username,
        avatar_url: u.avatar_url,
        isFollowing: followingSet.has(u.id),
    }));
};
