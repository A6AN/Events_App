import { supabase } from '../supabase';
import { DbTicket, TicketWithMeta } from '../../types';

type TicketInsert = Pick<DbTicket, 'event_id' | 'user_id' | 'ticket_type_id' | 'status'> & Partial<DbTicket>

export async function createTicket(ticketData: TicketInsert) {
    const { data, error } = await supabase
        .from('tickets')
        .insert([ticketData])
        .select()
        .single();
    if (error) throw error;
    return data;
}

export const rsvpToEvent = async (eventId: string, userId: string) => {
    const { data, error } = await supabase
        .from('tickets')
        .insert([{ event_id: eventId, user_id: userId }])
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const getUserTickets = async (userId: string): Promise<TicketWithMeta[]> => {
    const { data, error } = await supabase
        .from('tickets')
        .select(`*, event:events (id, title, cover_url, start_time, end_time, address, city, category), ticket_type:ticket_types (id, name, price, perks)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) return [];
    return (data ?? []) as TicketWithMeta[];
};

export const checkRsvpStatus = async (eventId: string, userId: string) => {
    const { data, error } = await supabase
        .from('tickets')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();
    // PGRST116 = row not found, which is expected when not RSVPed
    if (error && error.code !== 'PGRST116') console.warn(error);
    return !!data;
};
