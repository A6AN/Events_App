import { Grid3X3, Ticket, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Event } from '../types';
import { ScrollArea } from './ui/scroll-area';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserTickets } from '../lib/supabase';
import { TicketCard } from './tickets/TicketCard';
import { ProfileHeader } from './profile/ProfileHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './ui/utils';

interface ProfileTabProps {
  events: Event[];
}

export function ProfileTab({ events }: ProfileTabProps) {
  const [activeTab, setActiveTab] = useState<'hosted' | 'attended'>('hosted');
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);

  // Fetch tickets when tab is active
  useEffect(() => {
    if (user && activeTab === 'attended') {
      getUserTickets(user.id).then(setTickets);
    }
  }, [user, activeTab]);

  // Filter hosted events (mock logic for now, ideally fetch from DB)
  const hostedEvents = events.filter(e => e.host.id === user?.id);

  return (
    <div className="h-full bg-background">
      <ScrollArea className="h-full relative">
        <div className="pb-24">
          {/* New Profile Header */}
          <ProfileHeader
            hostedCount={hostedEvents.length}
            attendedCount={tickets.length}
            followersCount={128} // Mocked for now
          />

          {/* Tab Selector - Premium Sliding Pill */}
          <div className="px-4 mb-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl flex relative shadow-lg">
              {/* Sliding Background */}
              <motion.div
                className="absolute top-1.5 bottom-1.5 bg-gradient-to-r from-primary to-pink-600 rounded-xl z-0 shadow-lg shadow-primary/30"
                initial={false}
                animate={{
                  left: activeTab === 'hosted' ? '6px' : 'calc(50% + 2px)',
                  width: 'calc(50% - 8px)',
                }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />

              <button
                onClick={() => setActiveTab('hosted')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl relative z-10 transition-all duration-200",
                  activeTab === 'hosted' ? "text-white font-semibold" : "text-white/50 hover:text-white/80"
                )}
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="text-sm">Hosted</span>
              </button>

              <button
                onClick={() => setActiveTab('attended')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl relative z-10 transition-all duration-200",
                  activeTab === 'attended' ? "text-white font-semibold" : "text-white/50 hover:text-white/80"
                )}
              >
                <Ticket className="h-4 w-4" />
                <span className="text-sm">Attended</span>
              </button>
            </div>
          </div>

          {/* Content Grid */}
          <div className="px-2">
            <AnimatePresence mode="wait">
              {activeTab === 'hosted' && (
                <motion.div
                  key="hosted"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-3 gap-1"
                >
                  {hostedEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="aspect-square relative group cursor-pointer overflow-hidden rounded-xl"
                    >
                      <ImageWithFallback
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Hover Info */}
                      <div className="absolute inset-0 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="text-white w-full">
                          <div className="text-xs font-bold line-clamp-1">{event.title}</div>
                          <div className="text-[10px] text-white/70">{event.attendees} guests</div>
                        </div>
                      </div>

                      {/* Top-right badge */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-primary/90 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
                          {event.mood}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {hostedEvents.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-3 py-16 text-center"
                    >
                      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 mx-4">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
                          <Plus className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-white/70 mb-4">No events hosted yet</p>
                        <Button className="bg-gradient-to-r from-primary to-pink-600 hover:opacity-90 text-white rounded-full px-6">
                          Host Your First Event
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {activeTab === 'attended' && (
                <motion.div
                  key="attended"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="px-2 space-y-4"
                >
                  {tickets.map((ticket, index) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <TicketCard
                        event={ticket.event}
                        ticketId={ticket.id}
                      />
                    </motion.div>
                  ))}
                  {tickets.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-16 text-center"
                    >
                      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
                          <Ticket className="h-8 w-8 text-pink-500" />
                        </div>
                        <p className="text-white/70 mb-4">No tickets yet</p>
                        <Button className="bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90 text-white rounded-full px-6">
                          Explore Events
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
