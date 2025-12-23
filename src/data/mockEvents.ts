import { Event } from '../types';

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Boho Fest Lucknow',
    startTime: '4:00 PM',
    date: '28th December',
    location: { lat: 26.8467, lng: 80.9462, name: 'Ambedkar Memorial Park' },
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
    host: {
      name: 'Lucknow Events Co',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      instagram: '@lucknoweventsco'
    },
    attendees: 250,
    mood: 'Energetic',
    description: '🔥 DIVINE is coming to Lucknow! The biggest bohemian music and art festival featuring live performances, art installations, street food, and the legendary rapper DIVINE headlining the night. Get ready for Gully Boy vibes!',
    friendsAttending: 8,
    friendsRsvped: 4
  },
  {
    id: '2',
    title: 'Lucknow Literature Festival',
    startTime: '10:00 AM',
    location: { lat: 26.8500, lng: 80.9500, name: 'Bara Imambara' },
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
    host: {
      name: 'Nawabi Books',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      instagram: '@nawabibooks'
    },
    attendees: 180,
    mood: 'Creative',
    description: 'Annual literary festival featuring renowned authors, poetry sessions, and book launches at the historic Bara Imambara.'
  },
  {
    id: '3',
    title: 'Hazratganj Food Crawl',
    startTime: '6:00 PM',
    location: { lat: 26.8530, lng: 80.9450, name: 'Hazratganj' },
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    host: {
      name: 'Foodies of Lucknow',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      instagram: '@foodiesofLKO'
    },
    attendees: 45,
    mood: 'Chill',
    description: 'Explore the iconic street food of Hazratganj - from Tunday Kebabi to Royal Cafe basket chaat!'
  },
  {
    id: '4',
    title: 'Sunset Yoga at Gomti Riverfront',
    startTime: '5:30 PM',
    location: { lat: 26.8600, lng: 80.9300, name: 'Gomti Riverfront' },
    imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
    host: {
      name: 'Wellness Lucknow',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      instagram: '@wellnesslko'
    },
    attendees: 60,
    mood: 'Chill',
    description: 'Rejuvenate your mind and body with a sunset yoga session at the scenic Gomti Riverfront.'
  },
  {
    id: '5',
    title: 'EDM Night at Phoenix Palassio',
    startTime: '9:00 PM',
    location: { lat: 26.8100, lng: 80.9800, name: 'Phoenix Palassio Mall' },
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    host: {
      name: 'Club Nights LKO',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      instagram: '@clubnightslko'
    },
    attendees: 320,
    mood: 'Energetic',
    description: 'Get ready for the biggest EDM night in Lucknow! International DJs, laser shows, and premium vibes.'
  },
  {
    id: '6',
    title: 'Kathak Classical Evening',
    startTime: '7:00 PM',
    location: { lat: 26.8700, lng: 80.9100, name: 'Bhawan Bharati' },
    imageUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800',
    host: {
      name: 'Lucknow Gharana',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      instagram: '@lucknowgharana'
    },
    attendees: 120,
    mood: 'Creative',
    description: 'An evening of classical Kathak dance by artists from the legendary Lucknow Gharana tradition.'
  }
];
