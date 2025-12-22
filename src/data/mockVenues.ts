import { Venue } from '../types';

export const mockVenues: Venue[] = [
  {
    id: 'v1',
    name: 'Taj Mahal Lucknow',
    location: 'Gomti Nagar',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    capacity: '300-500',
    pricePerHour: 25000,
    amenities: ['5-Star Catering', 'Valet Parking', 'Decor', 'AV Equipment'],
    category: 'Banquet Hall'
  },
  {
    id: 'v2',
    name: 'The Renaissance',
    location: 'Hazratganj',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
    capacity: '400-700',
    pricePerHour: 20000,
    amenities: ['Grand Decor', 'In-house Catering', 'Bridal Suite', 'DJ Setup'],
    category: 'Banquet Hall'
  },
  {
    id: 'v3',
    name: 'Skybar Lucknow',
    location: 'Gomti Nagar',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800',
    capacity: '100-200',
    pricePerHour: 15000,
    amenities: ['Rooftop View', 'Premium Bar', 'City Skyline', 'Live DJ'],
    category: 'Rooftop'
  },
  {
    id: 'v4',
    name: 'Oudhyana Restaurant',
    location: 'Aminabad',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    capacity: '50-80',
    pricePerHour: 10000,
    amenities: ['Awadhi Cuisine', 'Private Dining', 'Heritage Decor', 'Parking'],
    category: 'Restaurant'
  },
  {
    id: 'v5',
    name: 'Janeshwar Mishra Park',
    location: 'Gomti Nagar',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
    capacity: '500-1000',
    pricePerHour: 8000,
    amenities: ['Open Air', 'Scenic Lake', 'Gazebo', 'Event Lighting'],
    category: 'Garden'
  },
  {
    id: 'v6',
    name: 'Phoenix Palassio Conference',
    location: 'Shaheed Path',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    capacity: '30-100',
    pricePerHour: 6000,
    amenities: ['Projector', 'High-Speed WiFi', 'Coffee Lounge', 'Whiteboard'],
    category: 'Conference Room'
  }
];
