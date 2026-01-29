import { useState, useRef, useEffect } from 'react';
import { Users, MapPin, TrendingUp, Heart, MessageCircle, Sparkles } from 'lucide-react';
import { Event, TicketEvent } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { CommentSection } from './social/CommentSection';
import { TicketBookingDialog } from './TicketBookingDialog';
import { Badge } from './ui/badge';

interface SocialTabProps {
  events: Event[];
  tickets: TicketEvent[];
  onEventSelect: (event: Event) => void;
}

export function SocialTab({ events, tickets, onEventSelect }: SocialTabProps) {
  const [activeTab, setActiveTab] = useState<'friends' | 'live'>('friends');
  const [commentEventId, setCommentEventId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Track scroll for header shrink
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        setIsScrolled(scrollRef.current.scrollTop > 50);
      }
    };
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', handleScroll);
    return () => { if (el) el.removeEventListener('scroll', handleScroll); };
  }, []);

  const handleTicketClick = (ticket: TicketEvent) => {
    setSelectedTicket(ticket);
    setDialogOpen(true);
  };

  return (
    <div className="h-full bg-transparent overflow-hidden flex flex-col">
      {/* Shrinking Glass Header */}
      <motion.div
        className="flex-shrink-0 px-4"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
        animate={{
          paddingTop: isScrolled ? '12px' : '16px',
          paddingBottom: isScrolled ? '12px' : '0px',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Title Section - Hides on scroll */}
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
            <h1 className="text-white text-2xl font-bold mb-0.5">Feed</h1>
            <p className="text-white/40 text-xs">
              {activeTab === 'friends' ? "What's happening" : "Live around you"}
            </p>
          </div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="h-5 w-5 text-white/60" />
          </motion.div>
        </motion.div>

        {/* Pill-Shaped Segmented Control */}
        <motion.div
          className="relative p-1.5 rounded-full flex gap-1.5"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          animate={{
            marginBottom: isScrolled ? '0px' : '16px',
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <motion.button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2 px-4 rounded-full text-sm transition-all duration-300 relative overflow-hidden ${activeTab === 'friends' ? 'text-white' : 'text-white/40'
              }`}
            whileTap={{ scale: 0.97 }}
          >
            {activeTab === 'friends' && (
              <motion.div
                layoutId="activeFeedTab"
                className="absolute inset-0 rounded-full border border-white/20"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
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
            className={`flex-1 py-2 px-4 rounded-full text-sm transition-all duration-300 relative overflow-hidden ${activeTab === 'live' ? 'text-white' : 'text-white/40'
              }`}
            whileTap={{ scale: 0.97 }}
          >
            {activeTab === 'live' && (
              <motion.div
                layoutId="activeFeedTab"
                className="absolute inset-0 rounded-full border border-white/20"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
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
      </motion.div>

      {/* Feed - Scrollable */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        {activeTab === 'friends' ? (
          events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-white/30" />
              </div>
              <h3 className="text-white/70 font-medium mb-1">No events yet</h3>
              <p className="text-white/40 text-sm">Events from your friends will appear here</p>
            </div>
          ) : (
            // Friends Feed - Full Bleed Hero Cards
            <div className="space-y-3 pt-2">
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
                      <AvatarFallback className="bg-pink-500/20 text-white">
                        {event.host.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white text-sm font-medium">{event.host.name}</span>
                        <span className="text-white/40 text-xs">is hosting</span>
                      </div>
                      <span className="text-white/40 text-xs">{event.startTime}</span>
                    </div>
                    <Badge className="bg-white/10 backdrop-blur-xl text-white border-white/10 text-xs px-2.5 py-1">
                      {event.mood}
                    </Badge>
                  </div>

                  {/* Full-Bleed Hero Card */}
                  <motion.div
                    className="relative overflow-hidden"
                    whileHover={{ scale: 1.005 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Hero Image - Taller height */}
                    <div className="relative h-80 overflow-hidden">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                        className="w-full h-full"
                      >
                        <ImageWithFallback
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </motion.div>

                      {/* Multi-layer Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

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
                              onClick={(e) => {
                                e.stopPropagation();
                                setCommentEventId(event.id);
                              }}
                            >
                              <MessageCircle className="h-5 w-5" />
                              <span className="text-sm">{Math.floor(Math.random() * 20) + 5}</span>
                            </motion.button>
                          </div>
                          <motion.div
                            className="px-4 py-2 rounded-full text-white text-sm border border-white/20"
                            style={{
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                              backdropFilter: 'blur(10px)',
                            }}
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
          )
        ) : (
          tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-white/30" />
              </div>
              <h3 className="text-white/70 font-medium mb-1">No live events</h3>
              <p className="text-white/40 text-sm">Live events will appear here</p>
            </div>
          ) : (
            // Live Events - Full Bleed Hero Cards
            <div className="space-y-3 pt-2">
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
                        className="w-full h-full"
                      >
                        <ImageWithFallback
                          src={ticket.imageUrl}
                          alt={ticket.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </motion.div>

                      {/* Multi-layer Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />

                      {/* Category Badge */}
                      <motion.div
                        className="absolute top-6 right-6 px-4 py-2 rounded-full text-white text-sm border border-white/20 shadow-2xl"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                          backdropFilter: 'blur(20px)',
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 + 0.2 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        {ticket.category}
                      </motion.div>

                      {/* Live Badge */}
                      <div className="absolute top-6 left-6">
                        <div className="bg-red-500 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          <span className="text-xs text-white font-bold uppercase">Live</span>
                        </div>
                      </div>

                      {/* Event Info Overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-6">
                        <h3 className="text-white text-3xl font-medium mb-2 line-clamp-2 drop-shadow-lg">
                          {ticket.title}
                        </h3>
                        <p className="text-white/80 text-lg mb-4 drop-shadow-md">{ticket.artist}</p>

                        <div className="flex items-center gap-4 mb-6">
                          <div className="flex items-center gap-2 text-white/90">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{ticket.venue}</span>
                          </div>
                        </div>

                        {/* Price Card - Glass Style */}
                        <motion.div
                          className="rounded-3xl p-5 flex items-center justify-between border border-white/20"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                            backdropFilter: 'blur(20px)',
                          }}
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
                              className="px-5 py-2.5 rounded-2xl text-white text-sm border border-white/30 font-medium"
                              style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                              }}
                              whileHover={{ scale: 1.05 }}
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
          )
        )}
      </div>

      {/* Comment Section Modal */}
      <CommentSection
        eventId={commentEventId || ''}
        isOpen={!!commentEventId}
        onClose={() => setCommentEventId(null)}
      />

      {/* Ticket Booking Dialog */}
      <TicketBookingDialog
        ticket={selectedTicket}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
