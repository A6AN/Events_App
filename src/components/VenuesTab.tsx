import { useState } from 'react';
import { Search, SlidersHorizontal, MapPin, Star, Users, Zap } from 'lucide-react';
import { Venue } from '../types';
import { VenueBookingDialog } from './VenueBookingDialog';
import './VenuesTab.css';

interface VenuesTabProps {
  venues: Venue[];
}

const CATEGORIES = ['All', 'Banquet Hall', 'Rooftop', 'Restaurant', 'Garden', 'Conference Room'];

export function VenuesTab({ venues }: VenuesTabProps) {
  const [activeCat, setActiveCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  // Filter venues
  const filteredVenues = venues.filter(v => {
    const matchesCat = activeCat === 'All' || v.category === activeCat;
    const matchesSearch = !searchQuery || v.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Featured venue (first venue or fallback)
  const featured = venues[0];

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
        {venues.length > 1 && (
          <>
            <h3 className="venues-section-title">🔥 Trending Now</h3>
            <div className="venues-trending-scroll">
              {venues.slice(0, 4).map((v, i) => (
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
