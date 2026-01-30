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
  category: 'Banquet Hall' | 'Rooftop' | 'Restaurant' | 'Garden' | 'Conference Room';
}

export type MoodFilter = 'All' | 'Chill' | 'Energetic' | 'Creative' | 'Romantic';
