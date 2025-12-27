export interface Event {
  id: string;
  title: string;
  startTime: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  imageUrl: string;
  host: {
    name: string;
    avatar: string;
    instagram?: string;
  };
  attendees: number;
  mood: 'Chill' | 'Energetic' | 'Creative' | 'Romantic';
  description?: string;
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
