import { useState } from 'react';
import { Search, SlidersHorizontal, MapPin, Star, Users, Zap } from 'lucide-react';
import { Venue } from '../types';
import { VenueBookingDialog } from './VenueBookingDialog';
import './VenuesTab.css';

interface VenuesTabProps {
  venues: Venue[];
}

const CATEGORIES = ['All', 'Clubs', 'Rooftops', 'Lounges', 'Cafés', 'Galleries', 'Outdoor'];

const FALLBACK_VENUES: Venue[] = [
  { id: 'v1', name: 'Skybar Lounge', category: 'Rooftop Bar', imageUrl: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&q=80&w=800', location: 'Bandra West', rating: 4.8, capacity: '250', pricePerHour: 5000, amenities: ['DJ', 'Bar', 'Rooftop'], description: 'Premium rooftop lounge with city views' },
  { id: 'v2', name: 'Comedy Store Mumbai', category: 'Lounge', imageUrl: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&q=80&w=800', location: 'Lower Parel', rating: 4.6, capacity: '120', pricePerHour: 3000, amenities: ['Stage', 'Bar'], description: 'Stand-up comedy venue' },
  { id: 'v3', name: 'Canvas & Co.', category: 'Gallery', imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800', location: 'Kala Ghoda', rating: 4.5, capacity: '80', pricePerHour: 2000, amenities: ['Gallery', 'Café'], description: 'Art gallery and event space' },
  { id: 'v4', name: 'Juhu Beach Club', category: 'Outdoor', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800', location: 'Juhu', rating: 4.3, capacity: '500', pricePerHour: 8000, amenities: ['Beach', 'Bar', 'DJ'], description: 'Beachside outdoor venue' },
  { id: 'v5', name: 'Masala Library', category: 'Restaurant', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800', location: 'BKC', rating: 4.9, capacity: '60', pricePerHour: 10000, amenities: ['Fine Dining', 'Bar'], description: 'Premium fine dining venue' },
  { id: 'v6', name: 'Blue Frog', category: 'Club', imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800', location: 'Andheri', rating: 4.7, capacity: '300', pricePerHour: 6000, amenities: ['Live Music', 'Bar', 'Dance Floor'], description: 'Iconic music venue and nightclub' },
  { id: 'v7', name: 'Tryst Café', category: 'Café', imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800', location: 'Colaba', rating: 4.4, capacity: '40', pricePerHour: 1500, amenities: ['Café', 'Wi-Fi'], description: 'Cozy café for intimate events' },
  { id: 'v8', name: 'The Dome', category: 'Rooftop', imageUrl: 'https://images.unsplash.com/photo-1519214605650-76a613ee3245?auto=format&fit=crop&q=80&w=800', location: 'Marine Drive', rating: 4.8, capacity: '200', pricePerHour: 7000, amenities: ['Rooftop', 'Bar', 'Views'], description: 'Iconic dome rooftop venue' },
];

export function VenuesTab({ venues }: VenuesTabProps) {
  const allVenues = venues.length > 0 ? venues : FALLBACK_VENUES;
  const [activeCat, setActiveCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  // Filter venues
  const filteredVenues = allVenues.filter(v => {
    const matchesCat = activeCat === 'All' || v.category === activeCat;
    const matchesSearch = !searchQuery || v.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Featured venue (first venue or fallback)
  const featured = allVenues[0];

  // Get default image for venue
  const getVenueImage = (venue: Venue) => {
    return venue.imageUrl || 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&q=80&w=800';
  };

  const handleVenueClick = (venue: Venue) => {
    setSelectedVenue(venue);
    setBookingOpen(true);
  };

  return (
    <div className="venues" style={{ height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div className="venues-header">
        <h1 className="venues-title">Venues</h1>
        <p className="venues-subtitle">Discover the best spots in your city</p>

        <div className="venues-search-row">
          <div className="venues-search">
            <Search size={16} color="rgba(255,255,255,0.3)" />
            <input
              placeholder="Search venues, clubs, cafés..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="venues-filter-btn"><SlidersHorizontal size={18} /></button>
        </div>

        <div className="venues-categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`cat-pill ${activeCat === cat ? 'active' : ''}`}
              onClick={() => setActiveCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="venues-content">
        {/* Featured */}
        {featured && (
          <div className="venue-featured" onClick={() => handleVenueClick(featured)}>
            <img src={getVenueImage(featured)} alt={featured.name} />
            <div className="venue-featured-overlay" />
            <span className="venue-featured-badge">⭐ Featured</span>
            <div className="venue-featured-info">
              <h2 className="venue-featured-name">{featured.name}</h2>
              <div className="venue-featured-meta">
                <span className="venue-featured-meta-item"><MapPin size={12} /> {featured.location || 'Mumbai'}</span>
                <span className="venue-featured-rating"><Star size={12} fill="currentColor" /> {featured.rating || 4.5}</span>
                <span className="venue-featured-meta-item"><Users size={12} /> {featured.capacity || 200}</span>
              </div>
            </div>
          </div>
        )}

        {/* Trending */}
        {allVenues.length > 1 && (
          <>
            <h3 className="venues-section-title">🔥 Trending Now</h3>
            <div className="venues-trending-scroll">
              {allVenues.slice(0, 4).map((v, i) => (
                <div
                  key={v.id}
                  className="venue-trending-card"
                  style={{ animationDelay: `${0.2 + i * 0.05}s` }}
                  onClick={() => handleVenueClick(v)}
                >
                  <img src={getVenueImage(v)} alt={v.name} className="venue-trending-img" />
                  <div className="venue-trending-info">
                    <div className="venue-trending-name">{v.name}</div>
                    <div className="venue-trending-meta"><Zap size={10} /> Popular venue</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* All Venues */}
        <h3 className="venues-section-title">📍 Near You</h3>
        <div className="venue-list">
          {filteredVenues.map((v, i) => (
            <div
              key={v.id}
              className="venue-card"
              style={{ animationDelay: `${0.25 + i * 0.05}s` }}
              onClick={() => handleVenueClick(v)}
            >
              <img src={getVenueImage(v)} alt={v.name} className="venue-card-img" />
              <div className="venue-card-body">
                <span className="venue-card-type">{v.category || 'Venue'}</span>
                <div className="venue-card-name">{v.name}</div>
                <div className="venue-card-meta">
                  <span className="venue-card-meta-item"><MapPin size={11} /> {v.location || 'Mumbai'}</span>
                  <span className="venue-card-rating"><Star size={11} fill="currentColor" /> {v.rating || 4.5}</span>
                </div>
              </div>
              <span className="venue-card-events">{v.capacity ? `${v.capacity} cap` : 'Open'}</span>
            </div>
          ))}
          {filteredVenues.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted-new)', fontSize: 14 }}>
              No venues found
            </div>
          )}
        </div>
      </div>

      {/* Booking Dialog */}
      <VenueBookingDialog
        venue={selectedVenue}
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
    </div>
  );
}
