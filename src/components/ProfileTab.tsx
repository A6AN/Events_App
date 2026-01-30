import { Share2, Settings, Camera, Ticket, Sparkles, MapPin, Calendar, LogOut, Edit2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Event } from '../types';
import { ScrollArea } from './ui/scroll-area';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfileStats, uploadAvatar, updateProfile, getUserTickets, getProfile } from '../lib/supabase';

interface ProfileTabProps {
  events?: Event[];
}

export function ProfileTab({ events = [] }: ProfileTabProps) {
  const [activeTab, setActiveTab] = useState<'events' | 'tickets' | 'about'>('events');
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState({ followers: 0, following: 0, eventsHosted: 0 });
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [displayName, setDisplayName] = useState('User');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile data from database (syncs across devices)
  useEffect(() => {
    if (user?.id) {
      // Fetch stats
      getProfileStats(user.id).then(setStats);
      getUserTickets(user.id).then(setUserTickets);

      // Fetch profile from database for synced avatar
      getProfile(user.id).then((profile) => {
        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        } else {
          // Fallback to Google avatar from auth metadata
          const metadata = user.user_metadata || {};
          setAvatarUrl(metadata.avatar_url || metadata.picture || '');
        }

        // Set display name
        if (profile?.full_name) {
          setDisplayName(profile.full_name);
        } else if (profile?.username) {
          setDisplayName(profile.username);
        } else {
          const metadata = user.user_metadata || {};
          setDisplayName(metadata.full_name || metadata.name || user.email?.split('@')[0] || 'User');
        }
      });
    }
  }, [user?.id]);

  const userEmail = user?.email || '';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  // Handle avatar upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploading(true);
    try {
      const newUrl = await uploadAvatar(user.id, file);
      if (newUrl) {
        setAvatarUrl(newUrl);
        await updateProfile(user.id, { avatar_url: newUrl });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      // Don't break the UI - just log the error
    } finally {
      setIsUploading(false);
      // Reset the file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Filter events hosted by this user
  const myEvents = events.filter(e => e.host?.id === user?.id);

  return (
    <div className="h-full relative bg-[#0a0a0f]">
      {/* Subtle grain overlay - very light */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <ScrollArea className="h-full relative z-10">
        <div className="pb-24">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Profile</h2>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="rounded-xl w-9 h-9 bg-white/5 hover:bg-white/10"
              >
                <Share2 className="h-4 w-4 text-white/70" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-xl w-9 h-9 bg-white/5 hover:bg-white/10"
              >
                <Settings className="h-4 w-4 text-white/70" />
              </Button>
            </div>
          </div>

          {/* Profile Section */}
          <div className="px-4 mb-6">
            {/* Avatar - Centered */}
            <div className="flex flex-col items-center mb-5">
              <motion.div
                className="relative cursor-pointer mb-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAvatarClick}
              >
                <Avatar className="h-24 w-24 border-2 border-white/10">
                  <AvatarImage src={avatarUrl} alt="Profile" />
                  <AvatarFallback className="text-lg bg-white/10 text-white">{initials}</AvatarFallback>
                </Avatar>
                <motion.div
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20"
                  whileHover={{ scale: 1.1 }}
                >
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4 text-white" />
                  )}
                </motion.div>
                {/* Hidden file input - properly hidden */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                  aria-hidden="true"
                />
              </motion.div>

              {/* Name and Email */}
              <h1 className="text-xl font-semibold text-white mb-1">{displayName}</h1>
              <p className="text-sm text-white/50 mb-2">{userEmail}</p>
              <div className="flex items-center gap-1.5 text-xs text-white/40">
                <MapPin className="h-3 w-3" />
                <span>Delhi, India</span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Events', value: stats.eventsHosted },
                { label: 'Followers', value: stats.followers },
                { label: 'Following', value: stats.following },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  className="text-center py-4 rounded-2xl bg-white/5 border border-white/5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                >
                  <div className="text-2xl font-semibold text-white">{stat.value}</div>
                  <div className="text-xs text-white/40">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Edit Profile Button */}
            <Button
              variant="outline"
              className="w-full rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          {/* Tab Section */}
          <div className="px-4 mb-4">
            <div className="p-1 rounded-2xl bg-white/5 grid grid-cols-3 gap-1">
              {[
                { id: 'events' as const, icon: Calendar, label: 'My Events' },
                { id: 'tickets' as const, icon: Ticket, label: 'Tickets' },
                { id: 'about' as const, icon: Sparkles, label: 'About' },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-all relative overflow-hidden ${isActive ? 'text-white' : 'text-white/40'
                      }`}
                    whileTap={{ scale: 0.97 }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeProfileTab"
                        className="absolute inset-0 rounded-xl bg-white/10"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon className="h-4 w-4 relative z-10" />
                    <span className="relative z-10 text-xs font-medium">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="px-4">
            <AnimatePresence mode="wait">
              {activeTab === 'events' && (
                <motion.div
                  key="events"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {myEvents.length > 0 ? (
                    <div className="space-y-3">
                      {myEvents.map((event, idx) => (
                        <EventCard key={event.id} event={event} index={idx} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Calendar}
                      title="No events yet"
                      description="Events you create will appear here"
                    />
                  )}
                </motion.div>
              )}

              {activeTab === 'tickets' && (
                <motion.div
                  key="tickets"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {userTickets.length > 0 ? (
                    <div className="space-y-3">
                      {userTickets.map((ticket, idx) => (
                        <TicketCard key={ticket.id} ticket={ticket} index={idx} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Ticket}
                      title="No tickets yet"
                      description="When you RSVP to events, your tickets appear here"
                    />
                  )}
                </motion.div>
              )}

              {activeTab === 'about' && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="rounded-2xl p-4 bg-white/5 border border-white/5">
                    <h3 className="text-sm font-medium text-white mb-2">Bio</h3>
                    <p className="text-sm text-white/50 leading-relaxed">
                      Event enthusiast exploring Delhi's vibrant scene. Always looking for the next great experience! 🎉
                    </p>
                  </div>

                  <div className="rounded-2xl p-4 bg-white/5 border border-white/5">
                    <h3 className="text-sm font-medium text-white mb-3">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Music', 'Art', 'Food', 'Nightlife', 'Culture'].map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 rounded-full text-xs bg-white/5 border border-white/10 text-white/70"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Sign Out Button */}
                  <Button
                    variant="ghost"
                    className="w-full rounded-2xl text-red-400 hover:text-red-300 hover:bg-red-500/10 bg-white/5"
                    onClick={signOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// Event Card Component
function EventCard({ event, index }: { event: Event; index: number }) {
  return (
    <motion.div
      className="rounded-2xl p-3 flex items-center gap-3 bg-white/5 border border-white/5"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
        <ImageWithFallback
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-white truncate">{event.title}</h4>
        <p className="text-xs text-white/40 truncate">{event.location?.name}</p>
        <p className="text-xs text-white/30">{event.attendees} going</p>
      </div>
      <ChevronRight className="h-4 w-4 text-white/30 flex-shrink-0" />
    </motion.div>
  );
}

// Ticket Card Component
function TicketCard({ ticket, index }: { ticket: any; index: number }) {
  const event = ticket.event;
  if (!event) return null;

  return (
    <motion.div
      className="rounded-2xl p-3 flex items-center gap-3 bg-white/5 border border-white/5"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 relative">
        <ImageWithFallback
          src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Ticket className="h-5 w-5 text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-white truncate">{event.title}</h4>
        <p className="text-xs text-white/40 truncate">{event.location_name}</p>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
            {ticket.status}
          </span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-white/30 flex-shrink-0" />
    </motion.div>
  );
}

// Empty State Component
function EmptyState({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Icon className="h-7 w-7 text-white/30" />
      </div>
      <h3 className="text-white font-medium mb-1">{title}</h3>
      <p className="text-sm text-white/40 max-w-[200px]">{description}</p>
    </motion.div>
  );
}
