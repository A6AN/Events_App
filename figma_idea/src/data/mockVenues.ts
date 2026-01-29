import { Venue } from '../types';

export const mockVenues: Venue[] = [
  {
    id: 'v1',
    name: 'The Grand Ballroom',
    location: 'Vasant Kunj',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1761110787206-2cc164e4913c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldmVudCUyMHZlbnVlJTIwbHV4dXJ5JTIwaGFsbHxlbnwxfHx8fDE3NjM0NjM2OTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    capacity: '300-500',
    pricePerHour: 15000,
    amenities: ['AC', 'Catering', 'Parking', 'AV Equipment'],
    category: 'Banquet Hall'
  },
  {
    id: 'v2',
    name: 'Crystal Palace',
    location: 'Chattarpur',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1625619080917-7d6ff39e0675?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwdmVudWUlMjBiYWxscm9vbXxlbnwxfHx8fDE3NjMzODkwMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    capacity: '400-600',
    pricePerHour: 20000,
    amenities: ['Decor', 'Catering', 'Valet', 'DJ Setup'],
    category: 'Banquet Hall'
  },
  {
    id: 'v3',
    name: 'Sky Lounge',
    location: 'Aerocity',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1738774801506-40bc473bda41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb29mdG9wJTIwdmVudWUlMjB0ZXJyYWNlfGVufDF8fHx8MTc2MzQ2MzY5MXww&ixlib=rb-4.1.0&q=80&w=1080',
    capacity: '100-200',
    pricePerHour: 12000,
    amenities: ['Open Air', 'Bar', 'City View', 'Music System'],
    category: 'Rooftop'
  },
  {
    id: 'v4',
    name: 'Heritage Restaurant',
    location: 'Hauz Khas',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1759769583908-7cd4e3310ce6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwdmVudWUlMjBkaW5pbmd8ZW58MXx8fHwxNzYzNDYzNjkyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    capacity: '50-100',
    pricePerHour: 8000,
    amenities: ['Private Dining', 'Chef', 'Wine Selection', 'Parking'],
    category: 'Restaurant'
  },
  {
    id: 'v5',
    name: 'Garden Vista',
    location: 'South Delhi',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1761110787206-2cc164e4913c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldmVudCUyMHZlbnVlJTIwbHV4dXJ5JTIwaGFsbHxlbnwxfHx8fDE3NjM0NjM2OTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    capacity: '200-300',
    pricePerHour: 10000,
    amenities: ['Garden', 'Lawn', 'Gazebo', 'Lighting'],
    category: 'Garden'
  },
  {
    id: 'v6',
    name: 'Business Hub',
    location: 'Connaught Place',
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1625619080917-7d6ff39e0675?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwdmVudWUlMjBiYWxscm9vbXxlbnwxfHx8fDE3NjMzODkwMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    capacity: '30-50',
    pricePerHour: 5000,
    amenities: ['Projector', 'WiFi', 'Coffee', 'Whiteboard'],
    category: 'Conference Room'
  }
];
