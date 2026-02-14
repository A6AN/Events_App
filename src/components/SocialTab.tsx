import { useState } from 'react';
import { MapPin, Clock, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Event } from '../types';
import './SocialTab.css';

interface SocialTabProps {
  events: Event[];
  tickets: any[];
  onEventSelect: (event: Event) => void;
}

// Static friends feed data (matches the UI design reference)
const FRIEND_EVENTS = [
  { id: 'f1', title: "Riya's Birthday", image: 'https://images.unsplash.com/photo-1530103862676-de3c9da59af7?auto=format&fit=crop&q=80&w=400&h=500', location: 'Juhu', friend: 'Riya', friendImg: 'https://i.pravatar.cc/100?img=5', height: 260 },
  { id: 'f2', title: 'Sunday Brunch', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400&h=350', location: 'Colaba', friend: 'Aman', friendImg: 'https://i.pravatar.cc/100?img=12', height: 200 },
  { id: 'f3', title: 'Cricket Watch Party', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=400&h=450', location: 'BKC', friend: 'Raj', friendImg: 'https://i.pravatar.cc/100?img=8', height: 240 },
  { id: 'f4', title: 'Yoga Sunrise', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400&h=300', location: 'Marine Drive', friend: 'Neha', friendImg: 'https://i.pravatar.cc/100?img=25', height: 180 },
  { id: 'f5', title: 'Art Gallery Night', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400&h=400', location: 'Kala Ghoda', friend: 'Priya', friendImg: 'https://i.pravatar.cc/100?img=32', height: 220 },
  { id: 'f6', title: 'Chai & Code', image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=400&h=350', location: 'Powai', friend: 'Dev', friendImg: 'https://i.pravatar.cc/100?img=15', height: 200 },
];

export function SocialTab({ events, onEventSelect }: SocialTabProps) {
  const [tab, setTab] = useState<'live' | 'friends'>('live');

  // Helper to get category label
  const getCategory = (event: Event) => {
    return event.category?.toUpperCase() || 'EVENT';
  };

  // Format price
  const getPrice = (event: Event) => {
    if (!event.price || event.price === 0) return 'Free';
    return `₹${event.price}`;
  };

  // Format time 
  const getTime = (event: Event) => {
    if (!event.date) return 'Upcoming';
    try {
      const d = new Date(event.date);
      return d.toLocaleDateString('en-IN', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
    } catch {
      return event.date;
    }
  };

  return (
    <div className="feed">
      {/* Top Bar */}
      <div className="feed-topbar">
        <div className="feed-topbar-inner">
          <div className="feed-location">
            <img src="https://i.pravatar.cc/100?img=47" alt="avatar" className="feed-avatar" />
            <div>
              <div className="feed-city">Mumbai <ChevronDown size={13} style={{ opacity: 0.5 }} /></div>
              <div className="feed-city-sub">Bandra West</div>
            </div>
          </div>

          <div className="feed-tab-toggle">
            <button className={`feed-tab-btn ${tab === 'friends' ? 'active' : ''}`} onClick={() => setTab('friends')}>Friends</button>
            <button className={`feed-tab-btn ${tab === 'live' ? 'active' : ''}`} onClick={() => setTab('live')}>Happening</button>
          </div>

          <button className="feed-filter-btn">
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="feed-content">
        {tab === 'live' ? (
          <>
            <h2 className="feed-section-title">🔥 Happening Now</h2>
            {events.map((event, i) => (
              <div
                key={event.id}
                className="poster-card"
                onClick={() => onEventSelect(event)}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <img
                  src={event.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'}
                  alt={event.title}
                  className="poster-img"
                />
                <div className="poster-overlay" />

                {i === 0 && (
                  <div className="poster-live-badge">
                    <span className="poster-live-dot" /> LIVE
                  </div>
                )}

                <div className="poster-price">{getPrice(event)}</div>

                <div className="poster-info">
                  <div className="poster-category">{getCategory(event)}</div>
                  <h3 className="poster-title">{event.title}</h3>
                  <div className="poster-meta">
                    <span className="poster-meta-item"><MapPin size={13} /> {event.location || 'Mumbai'}</span>
                    <span className="poster-meta-item"><Clock size={13} /> {getTime(event)}</span>
                  </div>
                  <div className="poster-bottom">
                    <div className="poster-avatars">
                      {[11, 12, 13, 14].map(n => (
                        <img key={n} src={`https://i.pravatar.cc/100?img=${n}`} alt="" className="poster-avatar" />
                      ))}
                      <span className="poster-going">+{event.attendees || Math.floor(Math.random() * 100 + 20)} going</span>
                    </div>
                    <div className="poster-fire">🔥 {Math.floor(Math.random() * 30 + 5)}</div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <h2 className="feed-section-title">👋 Friends Activity</h2>
            <div className="masonry-grid">
              {FRIEND_EVENTS.map(event => (
                <div key={event.id} className="masonry-card">
                  <img src={event.image} alt={event.title} style={{ height: event.height }} />
                  <div className="masonry-overlay">
                    <div className="masonry-title">{event.title}</div>
                    <div className="masonry-sub"><MapPin size={10} /> {event.location}</div>
                  </div>
                  <div className="masonry-friend-badge">
                    <img src={event.friendImg} alt="" />
                    {event.friend}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
