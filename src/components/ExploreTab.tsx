import { useState } from 'react';
import { Search, MapPin, Calendar, Clock, Star, Users } from 'lucide-react';
import { Event, Venue } from '../types';
import { VenuesTab } from './VenuesTab';
import { TicketsTab } from './TicketsTab';

interface ExploreTabProps {
  events: Event[];
  venues: Venue[];
  onEventSelect: (event: Event) => void;
}

export function ExploreTab({ events, venues, onEventSelect }: ExploreTabProps) {
  const [view, setView] = useState<'events' | 'venues'>('events');
  const [searchQuery, setSearchQuery] = useState('');

  // We map the standard Event to the TicketEvent format expected by TicketsTab
  // (In a real app, these types would be unified, but for now we map them)
  const mappedEvents = events.map(e => ({
    id: e.id,
    title: e.title,
    artist: e.host?.name || 'Various Artists',
    date: e.date ? new Date(e.date).toLocaleDateString() : 'Upcoming',
    time: e.startTime || '9:00 PM',
    venue: typeof e.location === 'object' ? e.location.name : (e.location || 'TBA'),
    price: e.price || 0,
    imageUrl: e.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
    category: (e.category || 'Concert') as any,
    availableSeats: e.capacity || 100
  }));

  // Filter mapped events by Search Query
  const filteredMappedEvents = mappedEvents.filter(e => 
    !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter venues by Search Query
  const filteredVenues = venues.filter(v => 
    !searchQuery || v.name.toLowerCase().includes(searchQuery.toLowerCase()) || (v.category && v.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="explore-tab" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Header */}
      <div className="pt-8 pb-4 px-4 bg-gradient-to-b from-[#0a1628] to-transparent sticky top-0 z-20">
        <h1 className="text-2xl font-bold text-white mb-4">Explore</h1>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-white/40" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-2xl bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent backdrop-blur-md"
            placeholder={`Search ${view === 'events' ? 'upcoming events' : 'local venues'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* View Toggle */}
        <div className="flex p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
          <button
            onClick={() => setView('events')}
            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
              view === 'events'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#FF9933] text-white shadow-lg'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setView('venues')}
            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
              view === 'venues'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#FF9933] text-white shadow-lg'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Venues
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {view === 'events' ? (
          <TicketsTab tickets={filteredMappedEvents} />
        ) : (
          <VenuesTab venues={filteredVenues} />
        )}
      </div>
    </div>
  );
}
