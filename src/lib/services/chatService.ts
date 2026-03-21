/**
 * chatService.ts
 * All database operations related to Event Group Chat and Direct Messaging.
 * Import from here, NOT directly from supabase.ts.
 */

import { supabase } from '../supabase';

// ─────────────────────────────────────────────
// EVENT GROUP CHAT
// ─────────────────────────────────────────────

export const getEventChat = async (eventId: string) => {
    const { data, error } = await supabase.from('event_chats').select('*').eq('event_id', eventId).single();
    if (error && error.code !== 'PGRST116') console.warn(error);
    return data;
};

export const getChatMessages = async (chatId: string, limit = 50, offset = 0) => {
    const { data, error } = await supabase
        .from('chat_messages')
        .select(`*, user:user_id (display_name, avatar_url, username)`)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    if (error) return [];
    return (data || []).reverse();
};

export const sendMessage = async (chatId: string, userId: string, content: string, messageType: 'text' | 'image' | 'system' = 'text') => {
    const { data, error } = await supabase
        .from('chat_messages')
        .insert([{ chat_id: chatId, user_id: userId, content, message_type: messageType }])
        .select(`*, user:user_id (display_name, avatar_url, username)`)
        .single();
    if (error) throw error;
    return data;
};

export const getChatMembers = async (chatId: string) => {
    const { data, error } = await supabase.from('chat_members').select(`*, user:user_id (display_name, avatar_url, username)`).eq('chat_id', chatId);
    if (error) return [];
    return data;
};

export const markChatAsRead = async (chatId: string, userId: string) => {
    const { error } = await supabase.from('chat_members').update({ last_read_at: new Date().toISOString() }).eq('chat_id', chatId).eq('user_id', userId);
    if (error) throw error;
};

export const subscribeToChatMessages = (chatId: string, callback: (message: any) => void) => {
    return supabase
        .channel(`chat:${chatId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `chat_id=eq.${chatId}` },
            async (payload) => {
                const { data } = await supabase.from('chat_messages').select(`*, user:user_id (display_name, avatar_url, username)`).eq('id', payload.new.id).single();
                if (data) callback(data);
            })
        .subscribe();
};

// ─────────────────────────────────────────────
// DIRECT MESSAGING (DMs)
// ─────────────────────────────────────────────

export interface DMConversation {
    id: string;
    otherUser: { id: string; display_name: string | null; username: string | null; avatar_url: string | null; };
    lastMessage: { content: string; senderId: string; createdAt: string; } | null;
    unreadCount: number;
}

export interface DMMessage {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    created_at: string;
    read_at: string | null;
    sender?: { display_name: string | null; avatar_url: string | null; username: string | null; };
}

export const getOrCreateDMConversation = async (userId: string, otherUserId: string): Promise<string | null> => {
    const [user1_id, user2_id] = [userId, otherUserId].sort();
    const { data: existing } = await supabase.from('direct_conversations').select('id').eq('user1_id', user1_id).eq('user2_id', user2_id).single();
    if (existing) return existing.id;
    const { data, error } = await supabase.from('direct_conversations').insert([{ user1_id, user2_id }]).select('id').single();
    if (error) return null;
    return data.id;
};

export const getUserDMConversations = async (userId: string): Promise<DMConversation[]> => {
    const { data: convs, error } = await supabase
        .from('direct_conversations')
        .select(`id, user1_id, user2_id, user1:user1_id (id, display_name, username, avatar_url), user2:user2_id (id, display_name, username, avatar_url)`)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('created_at', { ascending: false });
    if (error || !convs) return [];

    const result: DMConversation[] = [];
    for (const conv of convs) {
        const otherUser = (conv as any).user1_id === userId ? (conv as any).user2 : (conv as any).user1;
        const { data: lastMsgArr } = await supabase.from('direct_messages').select('id, content, sender_id, created_at, read_at').eq('conversation_id', conv.id).order('created_at', { ascending: false }).limit(1);
        const lastMsg = (lastMsgArr as any)?.[0];
        const { count: unread } = await supabase.from('direct_messages').select('*', { count: 'exact', head: true }).eq('conversation_id', conv.id).neq('sender_id', userId).is('read_at', null);
        result.push({ id: conv.id, otherUser: { id: otherUser?.id, display_name: otherUser?.display_name, username: otherUser?.username, avatar_url: otherUser?.avatar_url }, lastMessage: lastMsg ? { content: lastMsg.content, senderId: lastMsg.sender_id, createdAt: lastMsg.created_at } : null, unreadCount: unread || 0 });
    }
    return result.sort((a, b) => (b.lastMessage?.createdAt || '').localeCompare(a.lastMessage?.createdAt || ''));
};

export const getDMMessages = async (conversationId: string, limit = 50): Promise<DMMessage[]> => {
    const { data, error } = await supabase.from('direct_messages').select(`*, sender:sender_id (display_name, avatar_url, username)`).eq('conversation_id', conversationId).order('created_at', { ascending: false }).limit(limit);
    if (error) return [];
    return ((data || []).reverse()) as DMMessage[];
};

export const sendDMMessage = async (conversationId: string, senderId: string, content: string): Promise<DMMessage | null> => {
    const { data, error } = await supabase.from('direct_messages').insert([{ conversation_id: conversationId, sender_id: senderId, content }]).select(`*, sender:sender_id (display_name, avatar_url, username)`).single();
    if (error) return null;
    return data as DMMessage;
};

export const markDMsAsRead = async (conversationId: string, userId: string): Promise<void> => {
    await supabase.from('direct_messages').update({ read_at: new Date().toISOString() }).eq('conversation_id', conversationId).neq('sender_id', userId).is('read_at', null);
};

export const subscribeToDMMessages = (conversationId: string, callback: (msg: DMMessage) => void) => {
    return supabase
        .channel(`dm:${conversationId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `conversation_id=eq.${conversationId}` },
            async (payload) => {
                const { data } = await supabase.from('direct_messages').select(`*, sender:sender_id (display_name, avatar_url, username)`).eq('id', payload.new.id).single();
                if (data) callback(data as DMMessage);
            })
        .subscribe();
};

// ─────────────────────────────────────────────
// CHAT LIST (Groups with unread counts)
// ─────────────────────────────────────────────

export interface ChatWithLastMessage {
    id: string;
    eventId: string;
    title: string;
    image: string;
    lastMessage: { content: string; senderName: string; createdAt: string; } | null;
    unreadCount: number;
}

export const getChatsWithLastMessage = async (userId: string): Promise<ChatWithLastMessage[]> => {
    const { data: memberships, error: memErr } = await supabase
        .from('chat_members')
        .select(`last_read_at, chat:chat_id (id, event_id, event:event_id (title, image_url))`)
        .eq('user_id', userId);
    if (memErr || !memberships) return [];

    const chats: ChatWithLastMessage[] = [];
    for (const mem of memberships) {
        const chat = (mem as any).chat;
        if (!chat || !chat.event) continue;
        const chatId = chat.id;
        const lastReadAt = (mem as any).last_read_at;
        const { data: lastMsgArr } = await supabase.from('chat_messages').select(`content, created_at, user:user_id (display_name, username)`).eq('chat_id', chatId).order('created_at', { ascending: false }).limit(1);
        const lastMsg = lastMsgArr?.[0] as any;
        let unreadCount = 0;
        if (lastReadAt) {
            const { count } = await supabase.from('chat_messages').select('*', { count: 'exact', head: true }).eq('chat_id', chatId).gt('created_at', lastReadAt).neq('user_id', userId);
            unreadCount = count || 0;
        } else if (lastMsg) {
            const { count } = await supabase.from('chat_messages').select('*', { count: 'exact', head: true }).eq('chat_id', chatId).neq('user_id', userId);
            unreadCount = count || 0;
        }
        chats.push({ id: chatId, eventId: chat.event_id, title: chat.event.title, image: chat.event.cover_url, lastMessage: lastMsg ? { content: lastMsg.content, senderName: lastMsg.user?.display_name || lastMsg.user?.username || 'Someone', createdAt: lastMsg.created_at } : null, unreadCount });
    }
    return chats.sort((a, b) => (b.lastMessage?.createdAt || '').localeCompare(a.lastMessage?.createdAt || ''));
};

export const subscribeToUserChatList = (userId: string, chatIds: string[], callback: () => void) => {
    if (chatIds.length === 0) return null;
    return supabase
        .channel(`chat-list:${userId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' },
            (payload) => { if (chatIds.includes(payload.new.chat_id)) callback(); })
        .subscribe();
};

