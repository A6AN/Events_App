import { Share2, Settings, Camera, Ticket, Sparkles, MapPin, Calendar, LogOut, Edit2, ChevronRight, Loader2, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfileStats, getUserHostedEvents, getUserTickets, uploadAvatar, updateProfile, getProfile, getUserVenueBookings } from '../lib/supabase';
import { TicketCard } from './tickets/TicketCard';
import { DbEvent, DbTicket } from '../types';
import { SettingsSheet } from './modals/SettingsSheet';
import { EditProfileSheet } from './modals/EditProfileSheet';
import './ProfileTab.css';

export function ProfileTab() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'hosted' | 'tickets' | 'venues' | 'about'>('hosted');
  const [stats, setStats] = useState({ followers: 0, following: 0, eventsHosted: 0 });
  const [hostedEvents, setHostedEvents] = useState<DbEvent[]>([]);
  const [tickets, setTickets] = useState<(DbTicket & { event: DbEvent })[]>([]);
  const [venueBookings, setVenueBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch real profile data
  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      Promise.all([
        getProfileStats(user.id),
        getUserHostedEvents(user.id),
        getUserTickets(user.id),
        getUserVenueBookings(user.id),
        getProfile(user.id)
      ]).then(([statsData, eventsData, ticketsData, bookingsData, profileData]) => {
        setStats(statsData);
        setHostedEvents(eventsData || []);
        setTickets(ticketsData || []);
        setVenueBookings(bookingsData || []);
        setProfile(profileData);
        setLoading(false);
      });
    }
  }, [user?.id]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    const file = e.target.files[0];
    setUploading(true);
    try {
      const publicUrl = await uploadAvatar(user.id, file);
      await updateProfile(user.id, { avatar_url: publicUrl });
      setProfile((prev: any) => ({ ...prev, avatar_url: publicUrl }));
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  // Safe display values
  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'User';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || undefined;

  const TABS = [
    { id: 'hosted', label: 'Hosted' },
    { id: 'tickets', label: 'Tickets' },
    { id: 'venues', label: 'Venues' },
    { id: 'about', label: 'About' },
  ];

  return (
    <div className="profile">
      {/* Hero Section */}
      <div className="profile-hero">
        <img
          src={profile?.banner_url || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=800'}
          alt="cover"
          className="profile-hero-img"
        />
        <div className="profile-hero-overlay" />
        <div className="profile-top-actions">
          <div>{/* left spacer */}</div>
          <div className="profile-actions-right">
            <button
              className="profile-action-btn"
              onClick={async () => {
                if (navigator.share) {
                  await navigator.share({ title: profile?.full_name || 'My Profile', text: 'Check out my profile on the app!' });
                }
              }}
            >
              <Share2 size={18} />
            </button>
            <button className="profile-action-btn" onClick={() => setSettingsOpen(true)}>
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="profile-body">
        {/* Avatar */}
        <div className="profile-avatar-wrap" onClick={handleAvatarClick} style={{ cursor: 'pointer' }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar-img" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.1)', fontSize: 28, fontWeight: 800, color: '#fff'
            }}>
              {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          )}
          {uploading && (
            <div style={{ position: 'absolute', top: 0, left: 0, width: 88, height: 88, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={24} style={{ animation: 'spin-slow 1s linear infinite' }} color="var(--gold-light)" />
            </div>
          )}
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
        </div>

        <h1 className="profile-name">{displayName}</h1>
        <div className="profile-location"><MapPin size={13} /> {profile?.location || 'No location set'}</div>

        {/* Rep Badge */}
        <div className="profile-rep">
          <Star size={16} fill="currentColor" className="profile-rep-star" />
          <span className="profile-rep-score">4.8</span>
          <span className="profile-rep-label">Reputation</span>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div>
            <div className="profile-stat-num">{stats.followers}</div>
            <div className="profile-stat-label">Followers</div>
          </div>
          <div>
            <div className="profile-stat-num">{stats.following}</div>
            <div className="profile-stat-label">Following</div>
          </div>
          <div>
            <div className="profile-stat-num">{stats.eventsHosted}</div>
            <div className="profile-stat-label">Events</div>
          </div>
        </div>

        {/* Language row */}
        <div className="profile-lang-row">
          {['English', 'Hindi', 'Marathi'].map(l => (
            <span key={l} className="profile-lang">{l}</span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="profile-actions">
          <button className="profile-btn" onClick={() => setEditProfileOpen(true)}>
            <Edit2 size={14} style={{ marginRight: 6, display: 'inline' }} /> Edit Profile
          </button>
          <button
            className="profile-btn"
            onClick={async () => {
              if (navigator.share) await navigator.share({ title: profile?.full_name || 'My Profile', text: 'Check out my profile!' });
            }}
          >
            <Share2 size={14} style={{ marginRight: 6, display: 'inline' }} /> Share
          </button>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'hosted' && (
            <motion.div key="hosted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                  <Loader2 size={24} style={{ animation: 'spin-slow 1s linear infinite' }} color="var(--gold-light)" />
                </div>
              ) : hostedEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Sparkles size={24} color="rgba(255,255,255,0.2)" />
                  </div>
                  <h3 style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>No events yet</h3>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Host your first event to get started!</p>
                </div>
              ) : (
                <div className="profile-grid">
                  {hostedEvents.map((event, i) => (
                    <div key={event.id} className="profile-grid-item" style={{ animationDelay: `${i * 0.05}s` }}>
                      <ImageWithFallback src={event.image_url || undefined} alt={event.title} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)', borderRadius: '0 0 12px 12px' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{event.title}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                          <Calendar size={9} /> {new Date(event.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'tickets' && (
            <motion.div key="tickets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                  <Loader2 size={24} style={{ animation: 'spin-slow 1s linear infinite' }} color="var(--gold-light)" />
                </div>
              ) : tickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Ticket size={24} color="rgba(255,255,255,0.2)" />
                  </div>
                  <h3 style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>No tickets</h3>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>You haven't booked any events yet.</p>
                </div>
              ) : (
                tickets.map(ticket => (
                  <div key={ticket.id} style={{ marginBottom: 16 }}>
                    <TicketCard event={ticket.event} ticketId={ticket.id} />
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 14 }}>
                <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: 8, fontSize: 15 }}>Bio</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.6 }}>
                  {user?.user_metadata?.bio || "No bio added yet. Edit your profile to add one."}
                </p>
              </div>
              <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 14 }}>
                <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: 8, fontSize: 15 }}>Interests</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(profile?.interests?.length ? profile.interests : ['Music', 'Art', 'Technology', 'Nightlife', 'Food']).map((tag: string) => (
                    <span key={tag} style={{ padding: '4px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.05)', fontSize: 12, color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button className="profile-logout-btn" onClick={() => signOut()}>
                <LogOut size={16} /> Sign Out
              </button>

              <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', paddingTop: 12, paddingBottom: 20 }}>
                Version 1.0.0
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <EditProfileSheet
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        currentProfile={profile}
        onSaved={(updated) => setProfile((prev: any) => ({ ...prev, ...updated }))}
      />
    </div>
  );
}
