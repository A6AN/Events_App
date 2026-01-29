import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Users, Sparkles, Calendar, MapPin, Clock } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Event, TicketEvent } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { TicketBookingDialog } from './TicketBookingDialog';

interface FeedTabProps {
  events: Event[];
  tickets: TicketEvent[];
  onEventSelect: (event: Event) => void;
}

export function FeedTab({ events, tickets, onEventSelect }: FeedTabProps) {
  const [activeTab, setActiveTab] = useState<'friends' | 'live'>('friends');
  const [selectedTicket, setSelectedTicket] = useState<TicketEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll for header shrinking
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.scrollTop > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll as any);
      return () => scrollContainer.removeEventListener('scroll', handleScroll as any);
    }
  }, []);

  const handleTicketClick = (ticket: TicketEvent) => {
    setSelectedTicket(ticket);
    setDialogOpen(true);
  };

  // Format date for badge
  const getDateBadge = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    return { day, month };
  };

  return (
    <div className="h-full relative">
      <div className="relative h-full flex flex-col">
        {/* Shrinking Glass Header */}
        <motion.div 
          className="sticky top-0 z-20 glass backdrop-blur-3xl border-b border-white/10"
          animate={{
            paddingTop: isScrolled ? '12px' : '16px',
            paddingBottom: isScrolled ? '12px' : '0px',
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className="px-4">
            {/* Title - Hides on scroll */}
            <motion.div
              className="flex items-center justify-between overflow-hidden"
              animate={{
                height: isScrolled ? 0 : 'auto',
                opacity: isScrolled ? 0 : 1,
                marginBottom: isScrolled ? 0 : '16px',
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div>
                <h1 className="text-foreground mb-0.5">Events</h1>
                <p className="text-muted-foreground text-xs">
                  {activeTab === 'friends' ? "MONDAY, DEC 21" : "Live around you"}
                </p>
              </div>
              <Avatar className="h-10 w-10 border-2 border-white/10">
                <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop" alt="Profile" />
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
            </motion.div>

            {/* Pill-Shaped Segmented Control */}
            <motion.div 
              className="relative glass p-1.5 rounded-full flex gap-1.5"
              animate={{
                marginBottom: isScrolled ? '0px' : '16px',
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <motion.button
                onClick={() => setActiveTab('friends')}
                className={`flex-1 py-2 px-4 rounded-full text-sm transition-all duration-300 relative overflow-hidden ${
                  activeTab === 'friends' ? 'text-foreground' : 'text-muted-foreground'
                }`}
                whileTap={{ scale: 0.97 }}
              >
                {activeTab === 'friends' && (
                  <motion.div 
                    layoutId="activeFeedTab"
                    className="absolute inset-0 glass backdrop-blur-xl rounded-full border border-white/20"
                    style={{
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2 font-medium">
                  <Users className="h-4 w-4" />
                  Friends
                </span>
              </motion.button>
              <motion.button
                onClick={() => setActiveTab('live')}
                className={`flex-1 py-2 px-4 rounded-full text-sm transition-all duration-300 relative overflow-hidden ${
                  activeTab === 'live' ? 'text-foreground' : 'text-muted-foreground'
                }`}
                whileTap={{ scale: 0.97 }}
              >
                {activeTab === 'live' && (
                  <motion.div 
                    layoutId="activeFeedTab"
                    className="absolute inset-0 glass backdrop-blur-xl rounded-full border border-white/20"
                    style={{
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2 font-medium">
                  <Sparkles className="h-4 w-4" />
                  Live
                </span>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide bg-background">
          {activeTab === 'friends' ? (
            // Friends Feed - Card Grid Style
            <div className="p-4 space-y-4 pb-24">
              {events.map((event, idx) => {
                const dateBadge = getDateBadge(event.startTime);
                return (
                  <motion.div 
                    key={event.id}
                    onClick={() => onEventSelect(event)}
                    className="group cursor-pointer rounded-3xl overflow-hidden shadow-lg"
                    style={{
                      background: 'linear-gradient(180deg, rgba(26, 26, 36, 0.6) 0%, rgba(26, 26, 36, 0.9) 100%)',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Card Image */}
                    <div className="relative h-72 overflow-hidden">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                      >
                        <ImageWithFallback
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                      
                      {/* Gradient Overlay at bottom */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      {/* Avatar Group - Top Left */}
                      <div className="absolute top-4 left-4 flex -space-x-2">
                        <Avatar className="h-10 w-10 border-2 border-white ring-2 ring-black/20">
                          <AvatarImage src={event.host.avatar} alt={event.host.name} />
                          <AvatarFallback>{event.host.name[0]}</AvatarFallback>
                        </Avatar>
                        {/* Additional avatars for attendees */}
                        <Avatar className="h-10 w-10 border-2 border-white ring-2 ring-black/20">
                          <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop" />
                          <AvatarFallback>A</AvatarFallback>
                        </Avatar>
                      </div>

                      {/* Date Badge - Top Right */}
                      <motion.div
                        className="absolute top-4 right-4 bg-white rounded-2xl px-4 py-2.5 shadow-xl"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 + 0.2 }}
                      >
                        <div className="text-center">
                          <div className="text-2xl font-bold text-black leading-none mb-0.5">
                            {dateBadge.day}
                          </div>
                          <div className="text-[10px] font-semibold text-black/60 uppercase tracking-wider">
                            {dateBadge.month}
                          </div>
                        </div>
                      </motion.div>

                      {/* Info Overlay - Bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <div className="text-xs text-white/70 mb-1 uppercase tracking-wide">
                          {event.mood}
                        </div>
                        <h3 className="text-white text-2xl font-semibold mb-2 drop-shadow-lg">
                          {event.title}
                        </h3>
                        <div className="text-white/80 text-sm">
                          Voted {event.attendees} Participants
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            // Live Events - Same Card Style
            <div className="p-4 space-y-4 pb-24">
              {tickets.map((ticket, idx) => {
                const dateBadge = getDateBadge(ticket.date);
                return (
                  <motion.div 
                    key={ticket.id} 
                    onClick={() => handleTicketClick(ticket)}
                    className="group cursor-pointer rounded-3xl overflow-hidden shadow-lg"
                    style={{
                      background: 'linear-gradient(180deg, rgba(26, 26, 36, 0.6) 0%, rgba(26, 26, 36, 0.9) 100%)',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Card Image */}
                    <div className="relative h-72 overflow-hidden">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                      >
                        <ImageWithFallback
                          src={ticket.imageUrl}
                          alt={ticket.title}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      {/* Avatar Group - Top Left */}
                      <div className="absolute top-4 left-4 flex -space-x-2">
                        <Avatar className="h-10 w-10 border-2 border-white ring-2 ring-black/20">
                          <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop" />
                          <AvatarFallback>M</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-10 w-10 border-2 border-white ring-2 ring-black/20">
                          <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop" />
                          <AvatarFallback>A</AvatarFallback>
                        </Avatar>
                      </div>

                      {/* Date Badge - Top Right */}
                      <motion.div
                        className="absolute top-4 right-4 bg-white rounded-2xl px-4 py-2.5 shadow-xl"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 + 0.2 }}
                      >
                        <div className="text-center">
                          <div className="text-2xl font-bold text-black leading-none mb-0.5">
                            {dateBadge.day}
                          </div>
                          <div className="text-[10px] font-semibold text-black/60 uppercase tracking-wider">
                            {dateBadge.month}
                          </div>
                        </div>
                      </motion.div>

                      {/* Info Overlay - Bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <div className="text-xs text-white/70 mb-1 uppercase tracking-wide">
                          {ticket.category}
                        </div>
                        <h3 className="text-white text-2xl font-semibold mb-2 drop-shadow-lg">
                          {ticket.title}
                        </h3>
                        <div className="text-white/80 text-sm">
                          {ticket.venue} • {ticket.availableSeats} seats left
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Booking Dialog */}
      <TicketBookingDialog 
        ticket={selectedTicket}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
