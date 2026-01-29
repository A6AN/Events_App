import { Event } from '../types';

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Rooftop Sunset Party',
    startTime: '6:30 PM',
    location: { lat: 28.5355, lng: 77.3910, name: 'Hauz Khas Village' },
    imageUrl: 'https://images.unsplash.com/photo-1696863121919-cf7fa0331d31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXV6JTIwa2hhcyUyMGRlbGhpfGVufDF8fHx8MTc2MzQ2NDcxOXww&ixlib=rb-4.1.0&q=80&w=1080',
    host: {
      name: 'Arjun Malhotra',
      avatar: 'https://images.unsplash.com/photo-1667382136327-5f78dc5cf835?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjMzNzA5NzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      instagram: '@arjunmalhotra'
    },
    attendees: 24,
    mood: 'Energetic',
    description: 'Join us for an amazing rooftop party with live DJ and Delhi skyline views!'
  },
  {
    id: '2',
    title: 'Coffee & Conversations',
    startTime: '10:00 AM',
    location: { lat: 28.6315, lng: 77.2167, name: 'Khan Market' },
    imageUrl: 'https://images.unsplash.com/photo-1549407978-23788293b970?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBzaG9wJTIwY296eXxlbnwxfHx8fDE3NjMzNjcyNjF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    host: {
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1691966929688-72d734848bcd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21hbiUyMHByb2ZpbGV8ZW58MXx8fHwxNzYzNDY0NzE4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      instagram: '@priyasharma'
    },
    attendees: 8,
    mood: 'Chill',
    description: 'Casual coffee meetup for entrepreneurs and creatives at Khan Market'
  },
  {
    id: '3',
    title: 'Art Gallery Opening',
    startTime: '7:00 PM',
    location: { lat: 28.6289, lng: 77.2065, name: 'Connaught Place' },
    imageUrl: 'https://images.unsplash.com/photo-1722165923691-dc77d229a31a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25uYXVnaHQlMjBwbGFjZSUyMGRlbGhpfGVufDF8fHx8MTc2MzQ2NDcxOXww&ixlib=rb-4.1.0&q=80&w=1080',
    host: {
      name: 'Kavya Reddy',
      avatar: 'https://images.unsplash.com/photo-1691966929688-72d734848bcd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21hbiUyMHByb2ZpbGV8ZW58MXx8fHwxNzYzNDY0NzE4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      instagram: '@kavyareddy'
    },
    attendees: 32,
    mood: 'Creative',
    description: 'Contemporary art exhibition at CP with wine and light bites'
  },
  {
    id: '4',
    title: 'Candlelit Dinner Experience',
    startTime: '8:00 PM',
    location: { lat: 28.5244, lng: 77.1855, name: 'Garden of Five Senses' },
    imageUrl: 'https://images.unsplash.com/photo-1760669348865-75d0e9733604?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5zZXQlMjBkaW5uZXIlMjByb21hbnRpY3xlbnwxfHx8fDE3NjM0MTI5MTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    host: {
      name: 'Rohan Kapoor',
      avatar: 'https://images.unsplash.com/photo-1667382136327-5f78dc5cf835?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjMzNzA5NzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      instagram: '@rohankapoor'
    },
    attendees: 12,
    mood: 'Romantic',
    description: 'Intimate dinner gathering with sunset views at Garden of Five Senses'
  },
  {
    id: '5',
    title: 'India Gate Morning Yoga',
    startTime: '6:30 AM',
    location: { lat: 28.6129, lng: 77.2295, name: 'India Gate' },
    imageUrl: 'https://images.unsplash.com/photo-1688781298681-ae1f2d470b31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYSUyMGdhdGUlMjBkZWxoaXxlbnwxfHx8fDE3NjM0NDY0MDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    host: {
      name: 'Ananya Singh',
      avatar: 'https://images.unsplash.com/photo-1691966929688-72d734848bcd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21hbiUyMHByb2ZpbGV8ZW58MXx8fHwxNzYzNDY0NzE4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      instagram: '@ananyasingh'
    },
    attendees: 28,
    mood: 'Chill',
    description: 'Start your day with meditation and yoga at India Gate lawns'
  },
  {
    id: '6',
    title: 'Qutub Minar Heritage Walk',
    startTime: '5:00 PM',
    location: { lat: 28.5244, lng: 77.1855, name: 'Qutub Minar' },
    imageUrl: 'https://images.unsplash.com/photo-1667849521212-e9843b89f322?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxxdXR1YiUyMG1pbmFyJTIwZGVsaGl8ZW58MXx8fHwxNzYzNDYzNjcxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    host: {
      name: 'Vikram Mehta',
      avatar: 'https://images.unsplash.com/photo-1667382136327-5f78dc5cf835?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjMzNzA5NzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      instagram: '@vikrammehta'
    },
    attendees: 16,
    mood: 'Creative',
    description: 'Explore Delhi\'s heritage with a guided walk around Qutub Minar complex'
  }
];
