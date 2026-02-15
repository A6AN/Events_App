export interface Event {
  id: string;
  title: string;
  startTime: string;
  date?: string;
  location: {
    lat: number;
    lng: number;
    name: string;
    address?: string; // Added for compatibility
  };
  imageUrl: string;
  host: {
    id?: string;
    name: string;
    avatar: string;
    instagram?: string;
  };
  attendees: number;
  mood: 'Chill' | 'Energetic' | 'Creative' | 'Romantic';
  description?: string;
  price?: number;
  capacity?: number;
  category?: string;
  friendsAttending?: number;
  friendsRsvped?: number;
}

// Database types matching Supabase schema
export interface DbEvent {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  date: string;
  location_name: string;
  latitude: number;
  longitude: number;
  price: number;
  capacity: number | null;
  image_url: string | null;
  host_id: string;
  category: string | null;
  mood: string | null;
}

export interface DbProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
}

export interface TicketEvent {
  id: string;
  title: string;
  artist: string;
  date: string;
  time: string;
  venue: string;
  imageUrl: string;
  price: number;
  category: 'Concert' | 'Comedy' | 'DJ Night' | 'Festival';
  availableSeats: number;
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  rating: number;
  imageUrl: string;
  capacity: string;
  pricePerHour: number;
  amenities: string[];
  category: string;
  description?: string;
}

export type MoodFilter = 'All' | 'Chill' | 'Energetic' | 'Creative' | 'Romantic';

// ============================================
// DATABASE TYPES FOR NEW TABLES
// ============================================

export interface DbVenue {
  id: string;
  created_at: string;
  name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  rating: number;
  image_url: string | null;
  capacity: string | null;
  price_per_hour: number;
  amenities: string[];
  category: string;
  owner_id: string | null;
}

export interface DbTicket {
  id: string;
  created_at: string;
  event_id: string;
  user_id: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  qr_code: string | null;
}

export interface DbVenueBooking {
  id: string;
  created_at: string;
  venue_id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: number | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string | null;
}



export interface DbEventLike {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
}

export interface DbEventComment {
  id: string;
  event_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface DbFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface DbEventChat {
  id: string;
  event_id: string;
  created_at: string;
}

export interface DbChatMessage {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  message_type: 'text' | 'image' | 'system';
  created_at: string;
}

export interface DbChatMember {
  id: string;
  chat_id: string;
  user_id: string;
  joined_at: string;
  last_read_at: string | null;
}
