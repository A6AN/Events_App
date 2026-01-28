import { useState, useRef, useEffect } from 'react';
import { Users, Calendar, MapPin, TrendingUp } from 'lucide-react';
import { Event, TicketEvent } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { CommentSection } from './social/CommentSection';
import { TicketBookingDialog } from './TicketBookingDialog';

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
      {/* Header - Shrinks on scroll */}
      <motion.div
        className="flex-shrink-0 px-4 pt-4 pb-3"
        animate={{
          paddingTop: isScrolled ? '8px' : '16px',
          paddingBottom: isScrolled ? '8px' : '12px'
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Title Section - Hides on scroll */}
        <AnimatePresence>
          {!isScrolled && (
            <motion.div
              initial={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="flex items-center justify-between mb-4 overflow-hidden"
            >
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Social</h1>
                <p className="text-white/40 text-sm mt-0.5">
                  {activeTab === 'friends' ? "See what friends are up to" : "Live events happening now"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium Glass Pill Toggle */}
        <motion.div
          className="relative rounded-full overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}
          animate={{
            width: isScrolled ? 'auto' : '100%',
          }}
          layout
        >
          <div className="relative p-1">
            {/* Animated Glass Sliding Indicator */}
            <motion.div
              className="absolute top-1 bottom-1 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}
              initial={false}
              animate={{
                left: activeTab === 'friends' ? '4px' : isScrolled ? '4px' : 'calc(50% + 2px)',
                right: activeTab === 'friends' ? (isScrolled ? '4px' : 'calc(50% + 2px)') : '4px',
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 35
              }}
            />

            {/* Tab Buttons */}
            <div className="relative flex">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab('friends')}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 z-10 ${activeTab === 'friends' ? 'text-white' : 'text-white/40'
                  }`}
                animate={{ flex: isScrolled && activeTab !== 'friends' ? 0 : 1, opacity: isScrolled && activeTab !== 'friends' ? 0 : 1, width: isScrolled && activeTab !== 'friends' ? 0 : 'auto', padding: isScrolled && activeTab !== 'friends' ? 0 : undefined }}
              >
                <Users className="h-4 w-4" />
                <span>Friends</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab('live')}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 z-10 ${activeTab === 'live' ? 'text-white' : 'text-white/40'
                  }`}
                animate={{ flex: isScrolled && activeTab !== 'live' ? 0 : 1, opacity: isScrolled && activeTab !== 'live' ? 0 : 1, width: isScrolled && activeTab !== 'live' ? 0 : 'auto', padding: isScrolled && activeTab !== 'live' ? 0 : undefined }}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Live</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Feed - Scrollable */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-24 px-4">
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
            <div className="space-y-4 pt-2">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, type: "spring", stiffness: 400, damping: 30 }}
                  onClick={() => onEventSelect(event)}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group bg-zinc-900/80 border border-white/5"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                >
                  {/* Hero Image - Fixed height */}
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />

                    {/* Top badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                      {/* Avatar + Mood */}
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 border-2 border-white/20">
                          <AvatarImage src={event.host.avatar} alt={event.host.name} />
                          <AvatarFallback className="bg-pink-500 text-white text-xs font-bold">{event.host.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="px-2.5 py-1 bg-black/50 backdrop-blur-sm text-white/90 text-xs font-medium rounded-full">
                          {event.mood}
                        </span>
                      </div>

                      {/* Date Badge */}
                      <div className="bg-white rounded-lg px-2.5 py-1.5 text-center min-w-[44px] shadow-lg">
                        <div className="text-base font-bold text-zinc-900 leading-none">
                          {event.date ? new Date(event.date).getDate() : new Date().getDate()}
                        </div>
                        <div className="text-[9px] font-semibold text-zinc-500 uppercase">
                          {event.date ? new Date(event.date).toLocaleString('en-US', { month: 'short' }) : new Date().toLocaleString('en-US', { month: 'short' })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Content */}
                  <div className="p-4">
                    <h3 className="text-white font-bold text-lg mb-1 group-hover:text-pink-200 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-white/50 text-sm">
                      Voted <span className="text-white/70 font-medium">{event.attendees}</span> Participants
                    </p>
                  </div>
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
            <div className="space-y-4 pt-2">
              {tickets.map((ticket, idx) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, type: "spring", stiffness: 400, damping: 30 }}
                  onClick={() => handleTicketClick(ticket)}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group bg-zinc-900/80 border border-white/5"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                >
                  {/* Hero Image */}
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src={ticket.imageUrl}
                      alt={ticket.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />

                    {/* Top badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-red-500 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          <span className="text-xs text-white font-bold uppercase">Live</span>
                        </div>
                        <span className="px-2.5 py-1 bg-black/50 backdrop-blur-sm text-white/90 text-xs font-medium rounded-full">
                          {ticket.category}
                        </span>
                      </div>

                      {/* Date Badge */}
                      <div className="bg-white rounded-lg px-2.5 py-1.5 text-center min-w-[44px] shadow-lg">
                        <div className="text-base font-bold text-zinc-900 leading-none">
                          {new Date().getDate()}
                        </div>
                        <div className="text-[9px] font-semibold text-zinc-500 uppercase">
                          {new Date().toLocaleString('en-US', { month: 'short' })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Content */}
                  <div className="p-4">
                    <h3 className="text-white font-bold text-lg mb-0.5 group-hover:text-pink-200 transition-colors">
                      {ticket.title}
                    </h3>
                    <p className="text-pink-400 text-sm font-medium mb-2">{ticket.artist}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white/50 text-sm">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{ticket.venue}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-bold">₹{ticket.price}</span>
                        <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-lg">
                          Book
                        </span>
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
