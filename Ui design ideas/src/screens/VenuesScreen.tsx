import { useState } from 'react';
import { Search, SlidersHorizontal, MapPin, Star, Users, Zap } from 'lucide-react';
import './VenuesScreen.css';

const CATEGORIES = ['All', 'Clubs', 'Rooftops', 'Lounges', 'Cafés', 'Galleries', 'Outdoor'];

const FEATURED = {
    name: 'Skybar Lounge',
    image: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&q=80&w=800',
    location: 'Bandra West',
    rating: 4.8,
    capacity: 250,
    eventsTonight: 3,
};

const TRENDING = [
    { id: 't1', name: 'Blue Frog', img: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=400', events: 5 },
    { id: 't2', name: 'Tryst Café', img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400', events: 2 },
    { id: 't3', name: 'The Dome', img: 'https://images.unsplash.com/photo-1519214605650-76a613ee3245?auto=format&fit=crop&q=80&w=400', events: 8 },
    { id: 't4', name: 'Canvas Club', img: 'https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?auto=format&fit=crop&q=80&w=400', events: 3 },
];

const VENUES = [
    { id: 'v1', name: 'Skybar Lounge', type: 'Rooftop Bar', img: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&q=80&w=300', location: 'Bandra West', rating: 4.8, events: 3, capacity: 250 },
    { id: 'v2', name: 'Comedy Store Mumbai', type: 'Comedy Club', img: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&q=80&w=300', location: 'Lower Parel', rating: 4.6, events: 2, capacity: 120 },
    { id: 'v3', name: 'Canvas & Co.', type: 'Art Gallery', img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=300', location: 'Kala Ghoda', rating: 4.5, events: 1, capacity: 80 },
    { id: 'v4', name: 'Juhu Beach Club', type: 'Outdoor Venue', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=300', location: 'Juhu', rating: 4.3, events: 5, capacity: 500 },
    { id: 'v5', name: 'Masala Library', type: 'Fine Dining', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=300', location: 'BKC', rating: 4.9, events: 1, capacity: 60 },
];

export const VenuesScreen = () => {
    const [activeCat, setActiveCat] = useState('All');

    return (
        <div className="venues">
            {/* Header */}
            <div className="venues-header">
                <h1 className="venues-title">Venues</h1>
                <p className="venues-subtitle">Discover the best spots in your city</p>

                <div className="venues-search-row">
                    <div className="venues-search">
                        <Search size={16} color="rgba(255,255,255,0.3)" />
                        <input placeholder="Search venues, clubs, cafés..." />
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
                <div className="venue-featured">
                    <img src={FEATURED.image} alt={FEATURED.name} />
                    <div className="venue-featured-overlay" />
                    <span className="venue-featured-badge">⭐ Featured</span>
                    <div className="venue-featured-info">
                        <h2 className="venue-featured-name">{FEATURED.name}</h2>
                        <div className="venue-featured-meta">
                            <span className="venue-featured-meta-item"><MapPin size={12} /> {FEATURED.location}</span>
                            <span className="venue-featured-rating"><Star size={12} fill="currentColor" /> {FEATURED.rating}</span>
                            <span className="venue-featured-meta-item"><Users size={12} /> {FEATURED.capacity}</span>
                            <span className="venue-featured-meta-item"><Zap size={12} color="var(--saffron)" /> {FEATURED.eventsTonight} tonight</span>
                        </div>
                    </div>
                </div>

                {/* Trending */}
                <h3 className="venues-section-title">🔥 Trending Now</h3>
                <div className="venues-trending-scroll">
                    {TRENDING.map(v => (
                        <div key={v.id} className="venue-trending-card">
                            <img src={v.img} alt={v.name} className="venue-trending-img" />
                            <div className="venue-trending-info">
                                <div className="venue-trending-name">{v.name}</div>
                                <div className="venue-trending-meta"><Zap size={10} /> {v.events} events today</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* All Venues */}
                <h3 className="venues-section-title">📍 Near You</h3>
                <div className="venue-list">
                    {VENUES.map(v => (
                        <div key={v.id} className="venue-card">
                            <img src={v.img} alt={v.name} className="venue-card-img" />
                            <div className="venue-card-body">
                                <span className="venue-card-type">{v.type}</span>
                                <div className="venue-card-name">{v.name}</div>
                                <div className="venue-card-meta">
                                    <span className="venue-card-meta-item"><MapPin size={11} /> {v.location}</span>
                                    <span className="venue-card-rating"><Star size={11} fill="currentColor" /> {v.rating}</span>
                                </div>
                            </div>
                            <span className="venue-card-events">{v.events} live</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
