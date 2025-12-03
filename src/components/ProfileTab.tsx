import { Grid3X3, Ticket } from 'lucide-react';
import { Button } from './ui/button';
import { Event } from '../types';
import { ScrollArea } from './ui/scroll-area';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserTickets } from '../lib/supabase';
import { TicketCard } from './tickets/TicketCard';
import { ProfileHeader } from './profile/ProfileHeader';
import { motion } from 'framer-motion';
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

          {/* Tab Selector - Sliding Pill */}
          <div className="px-4 mb-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-1 rounded-xl flex relative">
              {/* Sliding Background */}
              <motion.div
                className="absolute top-1 bottom-1 bg-primary rounded-lg z-0"
                initial={false}
                animate={{
                  left: activeTab === 'hosted' ? '4px' : '50%',
                  width: 'calc(50% - 4px)',
                  x: activeTab === 'attended' ? '0%' : '0%'
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />

              <button
                onClick={() => setActiveTab('hosted')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg relative z-10 transition-colors duration-200",
                  activeTab === 'hosted' ? "text-white" : "text-white/60 hover:text-white"
                )}
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="text-sm font-medium">Hosted</span>
              </button>

              <button
                onClick={() => setActiveTab('attended')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg relative z-10 transition-colors duration-200",
                  activeTab === 'attended' ? "text-white" : "text-white/60 hover:text-white"
                )}
              >
                <Ticket className="h-4 w-4" />
                <span className="text-sm font-medium">Attended</span>
              </button>
            </div>
          </div>

          {/* Content Grid */}
          <div className="px-1">
            {activeTab === 'hosted' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-1"
              >
                {hostedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="aspect-square relative group cursor-pointer overflow-hidden rounded-md"
                  >
                    <ImageWithFallback
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                      <div className="text-white text-center">
                        <div className="text-xs font-bold mb-1 line-clamp-1">{event.title}</div>
                        <div className="text-[10px] text-gray-300">{event.attendees} guests</div>
                      </div>
                    </div>
                  </div>
                ))}
                {hostedEvents.length === 0 && (
                  <div className="col-span-3 py-10 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
                      <Grid3X3 className="h-6 w-6 text-white/20" />
                    </div>
                    <p>No events hosted yet.</p>
                    <Button variant="link" className="text-primary text-xs">Create your first event</Button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'attended' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-3 space-y-4"
              >
                {tickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    event={ticket.event}
                    ticketId={ticket.id}
                  />
                ))}
                {tickets.length === 0 && (
                  <div className="py-10 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
                      <Ticket className="h-6 w-6 text-white/20" />
                    </div>
                    <p>No tickets yet.</p>
                    <Button variant="link" className="text-primary text-xs">Explore events</Button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
