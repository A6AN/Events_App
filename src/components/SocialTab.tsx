import { useState, useEffect } from 'react';
import { MapPin, Clock, Search, ChevronDown, Loader2, Users, Bell } from 'lucide-react';
import { Event } from '../types';
import { useAuth } from '../context/AuthContext';
import { getFriendActivity, FriendActivityItem, getUnreadNotificationCount, subscribeToNotifications } from '../lib/supabase';
import { UserSearchSheet } from './modals/UserSearchSheet';
import { NotificationsSheet } from './modals/NotificationsSheet';
import './SocialTab.css';

interface SocialTabProps {
  events: Event[];
  tickets: any[];
  onEventSelect: (event: Event) => void;
}

export function SocialTab({ events, onEventSelect }: SocialTabProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<'live' | 'friends'>('live');
  const [city, setCity] = useState('Detecting...');
  const [suburb, setSuburb] = useState('');
  const [friendActivity, setFriendActivity] = useState<FriendActivityItem[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendsLoaded, setFriendsLoaded] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Geolocation: detect user's city/area
  useEffect(() => {
    if (!navigator.geolocation) {
      setCity('Your City');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&zoom=16`
          );
          const data = await res.json();
          const addr = data.address || {};
          setCity(addr.city || addr.town || addr.state_district || addr.state || 'Your City');
          setSuburb(addr.suburb || addr.neighbourhood || addr.county || '');
        } catch {
          setCity('Your City');
        }
      },
      () => setCity('Your City'),
      { timeout: 8000 }
    );
  }, []);

  // Load friend activity when the "Friends" tab is selected (lazy-load)
  useEffect(() => {
    if (tab === 'friends' && user?.id && !friendsLoaded) {
      setFriendsLoading(true);
      getFriendActivity(user.id).then((data) => {
        setFriendActivity(data);
        setFriendsLoading(false);
        setFriendsLoaded(true);
      }).catch(() => {
        setFriendsLoading(false);
        setFriendsLoaded(true);
      });
    }
  }, [tab, user?.id, friendsLoaded]);

  // Load initial unread count
  useEffect(() => {
    if (!user?.id) return;
    getUnreadNotificationCount(user.id).then(setUnreadCount);
  }, [user?.id]);

  // Real-time badge update
  useEffect(() => {
    if (!user?.id) return;
    const channel = subscribeToNotifications(user.id, () => {
      setUnreadCount(prev => prev + 1);
    });
    return () => { channel.unsubscribe(); };
  }, [user?.id]);

  // User avatar
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || user?.email || 'U')}&background=D4AF37&color=000&bold=true`;

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
    if (event.startTime) return event.startTime;
    if (!event.date) return 'Upcoming';
    try {
      const d = new Date(event.date);
      if (isNaN(d.getTime())) return event.date;
      return d.toLocaleDateString('en-IN', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
    } catch {
      return event.date;
    }
  };

  // Card heights based on index for masonry variety
  const getCardHeight = (index: number) => {
    const heights = [260, 200, 240, 180, 220, 200, 250, 190];
    return heights[index % heights.length];
  };

  return (
    <div className="feed">
      {/* Top Bar */}
      <div className="feed-topbar">
        <div className="feed-topbar-inner">
          <div className="feed-location">
            <img src={avatarUrl} alt="avatar" className="feed-avatar" />
            <div>
              <div className="feed-city">{city} <ChevronDown size={13} style={{ opacity: 0.5 }} /></div>
              <div className="feed-city-sub">{suburb || city}</div>
            </div>
          </div>

          <div className="feed-tab-toggle">
            <button className={`feed-tab-btn ${tab === 'friends' ? 'active' : ''}`} onClick={() => setTab('friends')}>Friends</button>
            <button className={`feed-tab-btn ${tab === 'live' ? 'active' : ''}`} onClick={() => setTab('live')}>Happening</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="feed-filter-btn"
              onClick={() => {
                setNotifsOpen(true);
                setUnreadCount(0); // clear badge immediately on open
              }}
              aria-label="Notifications"
              style={{ position: 'relative' }}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="feed-notif-badge">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button className="feed-filter-btn" onClick={() => setSearchOpen(true)} aria-label="Find people">
              <Search size={18} />
            </button>
          </div>
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
                  src={event.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'}
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
                    <span className="poster-meta-item"><MapPin size={13} /> {typeof event.location === 'object' ? event.location.name : (event.location || 'Mumbai')}</span>
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

            {friendsLoading ? (
              <div className="friends-loading">
                {/* Skeleton Cards */}
                <div className="masonry-grid">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="masonry-card skeleton-card" style={{ height: getCardHeight(i) }}>
                      <div className="skeleton-shimmer" />
                    </div>
                  ))}
                </div>
              </div>
            ) : friendActivity.length === 0 ? (
              <div className="friends-empty-state">
                <div className="friends-empty-icon">
                  <Users size={40} />
                </div>
                <h3 className="friends-empty-title">No friend activity yet</h3>
                <p className="friends-empty-text">
                  Follow people to see what events they're attending and hosting!
                </p>
              </div>
            ) : (
              <div className="masonry-grid">
                {friendActivity.map((item, i) => (
                  <div
                    key={item.eventId}
                    className="masonry-card"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ height: getCardHeight(i) }}
                    />
                    <div className="masonry-overlay">
                      <div className="masonry-title">{item.title}</div>
                      <div className="masonry-sub"><MapPin size={10} /> {item.location}</div>
                    </div>
                    <div className="masonry-friend-badge">
                      <img src={item.friendAvatar} alt="" />
                      {item.friendName}
                      <span className="masonry-friend-action">
                        {item.friendAction === 'hosting' ? '🎤' : '🎟️'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <UserSearchSheet open={searchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationsSheet open={notifsOpen} onClose={() => setNotifsOpen(false)} />
    </div>
  );
}
