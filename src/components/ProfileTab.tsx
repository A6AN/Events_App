import { Share2, Settings, Camera, Ticket, Sparkles, MapPin, Calendar, LogOut, Edit2, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfileStats, getUserHostedEvents, getUserTickets, uploadAvatar, updateProfile, getProfile } from '../lib/supabase';
import { TicketCard } from './tickets/TicketCard';
import { DbEvent, DbTicket } from '../types';

export function ProfileTab() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'hosted' | 'tickets' | 'about'>('hosted');
  const [stats, setStats] = useState({ followers: 0, following: 0, eventsHosted: 0 });
  const [hostedEvents, setHostedEvents] = useState<DbEvent[]>([]);
  const [tickets, setTickets] = useState<(DbTicket & { event: DbEvent })[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch real profile data
  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      Promise.all([
        getProfileStats(user.id),
        getUserHostedEvents(user.id),
        getUserTickets(user.id),
        getProfile(user.id)
      ]).then(([statsData, eventsData, ticketsData, profileData]) => {
        setStats(statsData);
        setHostedEvents(eventsData || []);
        setTickets(ticketsData || []);
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
      // Update profile in DB
      await updateProfile(user.id, { avatar_url: publicUrl });
      // Update local state
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
  const username = profile?.username || user?.email?.split('@')[0] || 'username';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || undefined;
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  // Helper to map DbEvent to card UI (simplified inline card for hosted events)
  const EventListItem = ({ event }: { event: DbEvent }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 mb-3"
    >
      <div className="h-20 w-20 rounded-xl overflow-hidden flex-shrink-0 relative">
        <ImageWithFallback src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/20" />
      </div>
      <div className="flex-1 min-w-0 py-1">
        <h3 className="text-white font-semibold truncate">{event.title}</h3>
        <div className="flex items-center gap-2 text-white/50 text-xs mt-1">
          <Calendar className="h-3 w-3" />
          <span>{new Date(event.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-white/50 text-xs mt-1">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{event.location_name}</span>
        </div>
      </div>
      <div className="flex flex-col justify-between items-end py-1">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${new Date(event.date) < new Date() ? 'bg-white/10 text-white/50' : 'bg-emerald-500/20 text-emerald-400'}`}>
          {new Date(event.date) < new Date() ? 'Past' : 'Upcoming'}
        </span>
        <ChevronRight className="h-4 w-4 text-white/30" />
      </div>
    </motion.div>
  );

  return (
    <div className="h-full relative bg-[#0a0a0f]">


      <ScrollArea className="h-full relative z-10">
        <div className="pb-24">
          {/* Profile Header */}
          <div className="pt-24 px-6 pb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="relative">
                <motion.div whileHover={{ scale: 1.05 }} className="relative group cursor-pointer" onClick={handleAvatarClick}>
                  <Avatar className="h-24 w-24 border-4 border-white/5 shadow-2xl">
                    <AvatarImage src={avatarUrl} className="object-cover" />
                    <AvatarFallback className="bg-white/10 text-white text-2xl">{initials}</AvatarFallback>
                  </Avatar>
                  {/* Camera Overlay */}
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center border-4 border-[#0a0a0f]">
                    <Edit2 className="h-3.5 w-3.5 text-white" />
                  </div>
                </motion.div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5">
                  <Share2 className="h-5 w-5 text-white" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5">
                  <Settings className="h-5 w-5 text-white" />
                </Button>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{displayName}</h1>
              <p className="text-white/50 text-sm mb-4">@{username}</p>

              {/* Stats */}
              <div className="flex gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{stats.eventsHosted}</div>
                  <div className="text-xs text-white/50">Events</div>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{stats.followers}</div>
                  <div className="text-xs text-white/50">Followers</div>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{stats.following}</div>
                  <div className="text-xs text-white/50">Following</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="sticky top-0 z-20 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/5 px-6">
            <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide">
              {[
                { id: 'hosted', label: 'My Events' },
                { id: 'tickets', label: 'My Tickets' },
                { id: 'about', label: 'About' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="relative py-4"
                >
                  <span className={`text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-white' : 'text-white/50'
                    }`}>
                    {tab.label}
                  </span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-px left-0 right-0 h-0.5 bg-emerald-500"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'hosted' && (
                <motion.div
                  key="hosted"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 text-emerald-500 animate-spin" /></div>
                  ) : hostedEvents.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="h-8 w-8 text-white/20" />
                      </div>
                      <h3 className="text-white font-medium mb-1">No events yet</h3>
                      <p className="text-white/40 text-sm">Host your first event to get started!</p>
                    </div>
                  ) : (
                    hostedEvents.map(event => (
                      <EventListItem key={event.id} event={event} />
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === 'tickets' && (
                <motion.div
                  key="tickets"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 text-emerald-500 animate-spin" /></div>
                  ) : tickets.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <Ticket className="h-8 w-8 text-white/20" />
                      </div>
                      <h3 className="text-white font-medium mb-1">No tickets</h3>
                      <p className="text-white/40 text-sm">You haven't booked any events yet.</p>
                    </div>
                  ) : (
                    tickets.map(ticket => (
                      <div key={ticket.id} className="relative">
                        {/* Use TicketCard but without QR functional? Or fully functional */}
                        <TicketCard event={ticket.event} ticketId={ticket.id} />
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === 'about' && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                    <h3 className="text-white font-semibold mb-3">Bio</h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {user?.user_metadata?.bio || "No bio added yet. Edit your profile to add one."}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                    <h3 className="text-white font-semibold mb-3">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Music', 'Art', 'Technology', 'Nightlife', 'Food'].map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-xs text-white/70 border border-white/10">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    onClick={() => signOut()}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>

                  <div className="text-center text-xs text-white/20 pt-4">
                    Version 1.0.0
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
