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
                <h1 className="text-foreground mb-0.5">Feed</h1>
                <p className="text-muted-foreground text-xs">
                  {activeTab === 'friends' ? "What's happening" : "Live around you"}
                </p>
              </div>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles className="h-5 w-5 text-foreground/60" />
              </motion.div>
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
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide">
          {activeTab === 'friends' ? (
            // Friends Feed - Full Bleed Hero Cards
            <div className="space-y-3 pb-24">
              {events.map((event, idx) => (
                <motion.div 
                  key={event.id}
                  onClick={() => onEventSelect(event)}
                  className="group cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* User Header */}
                  <div className="flex items-center gap-2.5 mb-2 px-4">
                    <Avatar className="h-9 w-9 border-2 border-white/10">
                      <AvatarImage src={event.host.avatar} alt={event.host.name} />
                      <AvatarFallback className="glass text-foreground">
                        {event.host.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-foreground text-sm font-medium">{event.host.name}</span>
                        <span className="text-muted-foreground text-xs">is hosting</span>
                      </div>
                      <span className="text-muted-foreground text-xs">{event.startTime}</span>
                    </div>
                    <Badge className="glass backdrop-blur-xl text-foreground border-white/10 text-xs px-2.5 py-1">
                      {event.mood}
                    </Badge>
                  </div>

                  {/* Full-Bleed Hero Card */}
                  <motion.div 
                    className="relative overflow-hidden"
                    whileHover={{ scale: 1.005 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Hero Image */}
                    <div className="relative h-80 overflow-hidden">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                      >
                        <ImageWithFallback
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                      
                      {/* Multi-layer Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                      <div className="absolute inset-0 grain opacity-30" />
                      
                      {/* Event Info Overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-6">
                        <h3 className="text-white text-2xl font-medium mb-3 line-clamp-2 drop-shadow-lg">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-2 text-white/90">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{event.location.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white/90">
                            <Users className="h-4 w-4" />
                            <span className="text-sm">{event.attendees} going</span>
                          </div>
                        </div>

                        {/* Interaction Bar */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <motion.button 
                              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Heart className="h-5 w-5" />
                              <span className="text-sm">{Math.floor(Math.random() * 50) + 10}</span>
                            </motion.button>
                            <motion.button 
                              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MessageCircle className="h-5 w-5" />
                              <span className="text-sm">{Math.floor(Math.random() * 20) + 5}</span>
                            </motion.button>
                          </div>
                          <motion.div 
                            className="glass backdrop-blur-xl px-4 py-2 rounded-full text-white text-sm border border-white/20"
                            whileHover={{ scale: 1.05 }}
                          >
                            View Details →
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          ) : (
            // Live Events - Full Bleed Hero Cards
            <div className="space-y-3 pb-24">
              {tickets.map((ticket, idx) => (
                <motion.div 
                  key={ticket.id} 
                  onClick={() => handleTicketClick(ticket)}
                  className="group cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Full-Bleed Hero Card */}
                  <div className="relative overflow-hidden">
                    {/* Hero Image */}
                    <div className="relative h-96 overflow-hidden">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                      >
                        <ImageWithFallback
                          src={ticket.imageUrl}
                          alt={ticket.title}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                      
                      {/* Multi-layer Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
                      <div className="absolute inset-0 grain opacity-30" />

                      {/* Category Badge */}
                      <motion.div 
                        className="absolute top-6 right-6 glass backdrop-blur-2xl px-4 py-2 rounded-full text-white text-sm border border-white/20 shadow-2xl"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 + 0.2 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        {ticket.category}
                      </motion.div>

                      {/* Event Info Overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-6">
                        <h3 className="text-white text-3xl font-medium mb-2 line-clamp-2 drop-shadow-lg">
                          {ticket.title}
                        </h3>
                        <p className="text-white/80 text-lg mb-4 drop-shadow-md">{ticket.artist}</p>
                        
                        <div className="flex items-center gap-4 mb-6">
                          <div className="flex items-center gap-2 text-white/90">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">{ticket.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white/90">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{ticket.venue}</span>
                          </div>
                        </div>

                        {/* Price Card - Glass Style */}
                        <motion.div 
                          className="glass backdrop-blur-2xl rounded-3xl p-5 flex items-center justify-between border border-white/20"
                          whileHover={{ scale: 1.02 }}
                        >
                          <div>
                            <div className="text-white/60 text-xs mb-1">Starting at</div>
                            <div className="text-white text-3xl font-medium">₹{ticket.price}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-white/80 text-xs mb-2">
                              {ticket.availableSeats} seats left
                            </div>
                            <motion.div 
                              className="glass backdrop-blur-xl px-5 py-2.5 rounded-2xl text-white text-sm border border-white/30 font-medium"
                              whileHover={{ scale: 1.05, borderColor: 'rgba(255, 255, 255, 0.5)' }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Book Now →
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
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
