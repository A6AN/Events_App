import { useState } from 'react';
import { Users, Heart, MessageCircle, Sparkles, Share2, Calendar, MapPin, TrendingUp } from 'lucide-react';
import { Event, TicketEvent } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { motion } from 'framer-motion';
import { CommentSection } from './social/CommentSection';
import { TicketBookingDialog } from './TicketBookingDialog';

interface SocialTabProps {
  events: Event[];
  tickets: TicketEvent[];
  onEventSelect: (event: Event) => void;
}

// Like storage helper
const getLikes = (): Record<string, boolean> => {
  try {
    return JSON.parse(localStorage.getItem('event_likes') || '{}');
  } catch {
    return {};
  }
};

const toggleLike = (eventId: string): boolean => {
  const likes = getLikes();
  likes[eventId] = !likes[eventId];
  localStorage.setItem('event_likes', JSON.stringify(likes));
  return likes[eventId];
};

export function SocialTab({ events, tickets, onEventSelect }: SocialTabProps) {
  const [activeTab, setActiveTab] = useState<'friends' | 'live'>('friends');
  const [likedEvents, setLikedEvents] = useState<Record<string, boolean>>(getLikes());
  const [commentEventId, setCommentEventId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleLike = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isLiked = toggleLike(eventId);
    setLikedEvents({ ...likedEvents, [eventId]: isLiked });
  };

  const handleComment = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCommentEventId(eventId);
  };

  const handleTicketClick = (ticket: TicketEvent) => {
    setSelectedTicket(ticket);
    setDialogOpen(true);
  };

  return (
    <div className="h-full bg-transparent overflow-hidden flex flex-col">
      {/* Header - Premium Design */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3">
        {/* Title Section */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Social</h1>
            <p className="text-white/40 text-sm mt-0.5">
              {activeTab === 'friends' ? "See what friends are up to" : "Live events happening now"}
            </p>
          </div>
        </div>

        {/* Premium Pill Toggle with Sliding Indicator */}
        <div className="relative p-1 bg-white/[0.08] backdrop-blur-2xl rounded-full border border-white/[0.1] shadow-lg">
          {/* Animated Sliding Background */}
          <motion.div
            className="absolute top-1 bottom-1 rounded-full bg-white/[0.12] backdrop-blur-sm"
            initial={false}
            animate={{
              left: activeTab === 'friends' ? '4px' : '50%',
              right: activeTab === 'friends' ? '50%' : '4px',
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30
            }}
          />

          {/* Tab Buttons */}
          <div className="relative flex">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('friends')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-colors duration-200 z-10 ${activeTab === 'friends'
                ? 'text-white'
                : 'text-white/50 hover:text-white/70'
                }`}
            >
              <Users className="h-4 w-4" />
              <span>Friends</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('live')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-colors duration-200 z-10 ${activeTab === 'live'
                ? 'text-white'
                : 'text-white/50 hover:text-white/70'
                }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Live</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Feed - Scrollable */}
      <div className="flex-1 overflow-y-auto pb-24 px-4">
        {activeTab === 'friends' ? (
          /* Friends Feed - Premium Card Design */
          <div className="space-y-5 pt-2">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 25 }}
                onClick={() => onEventSelect(event)}
                className="relative rounded-3xl overflow-hidden cursor-pointer group"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
              >
                {/* Large Hero Image */}
                <div className="relative h-72 overflow-hidden">
                  <ImageWithFallback
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                  {/* Top Row: Avatars + Date Badge */}
                  <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                    {/* Avatar Stack */}
                    <div className="flex items-center">
                      <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-white/20 shadow-lg">
                          <AvatarImage src={event.host.avatar} alt={event.host.name} />
                          <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white text-sm font-bold">{event.host.name[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                      {/* Stacked Friend Avatars */}
                      <div className="flex -ml-2">
                        {[1, 2].map((i) => (
                          <div key={i} className="-ml-2 first:ml-0">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-white/20 shadow-lg" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Date Badge */}
                    <div className="bg-white rounded-xl px-3 py-2 shadow-lg text-center min-w-[52px]">
                      <div className="text-lg font-bold text-zinc-900 leading-none">
                        {new Date().getDate()}
                      </div>
                      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">
                        {new Date().toLocaleString('en-US', { month: 'short' })}
                      </div>
                    </div>
                  </div>

                  {/* Category Badge - positioned on image */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 mt-14">
                    <span className="px-3 py-1 bg-black/40 backdrop-blur-md text-white/90 text-xs font-medium rounded-full border border-white/10">
                      {event.mood}
                    </span>
                  </div>

                  {/* Bottom Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white font-bold text-xl mb-1.5 group-hover:text-pink-100 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-white/60 text-sm">
                      Voted <span className="text-white font-medium">{event.attendees}</span> Participants
                    </p>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <motion.div
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    boxShadow: 'inset 0 0 0 2px rgba(236, 72, 153, 0.4), 0 0 40px rgba(236, 72, 153, 0.2)'
                  }}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          /* Live Events - Premium Card Design */
          <div className="space-y-5 pt-2">
            {tickets.map((ticket, idx) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, type: "spring", stiffness: 300, damping: 25 }}
                onClick={() => handleTicketClick(ticket)}
                className="relative rounded-3xl overflow-hidden cursor-pointer group"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
              >
                {/* Large Hero Image */}
                <div className="relative h-72 overflow-hidden">
                  <ImageWithFallback
                    src={ticket.imageUrl}
                    alt={ticket.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                  {/* Top Row: Live Badge + Date Badge */}
                  <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                    {/* Live Badge */}
                    <div className="flex items-center gap-2">
                      <div className="bg-red-500 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-red-500/40">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span className="text-xs text-white font-bold uppercase">Live</span>
                      </div>
                      <span className="px-3 py-1.5 bg-black/40 backdrop-blur-md text-white/90 text-xs font-medium rounded-full border border-white/10">
                        {ticket.category}
                      </span>
                    </div>

                    {/* Date Badge */}
                    <div className="bg-white rounded-xl px-3 py-2 shadow-lg text-center min-w-[52px]">
                      <div className="text-lg font-bold text-zinc-900 leading-none">
                        {new Date().getDate()}
                      </div>
                      <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">
                        {new Date().toLocaleString('en-US', { month: 'short' })}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white font-bold text-xl mb-1 group-hover:text-pink-100 transition-colors">
                      {ticket.title}
                    </h3>
                    <p className="text-pink-400 text-sm font-medium mb-2">{ticket.artist}</p>

                    {/* Info Row */}
                    <div className="flex items-center gap-3 text-white/60 text-sm">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-pink-400" />
                        <span className="truncate">{ticket.venue}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="bg-black/60 backdrop-blur-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-white/40 text-xs">From</span>
                    <span className="text-white font-bold text-xl ml-2">₹{ticket.price}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 text-xs font-medium">{ticket.availableSeats} seats left</span>
                    <motion.span
                      className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-pink-500/30"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Book Now
                    </motion.span>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <motion.div
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    boxShadow: 'inset 0 0 0 2px rgba(236, 72, 153, 0.4), 0 0 40px rgba(236, 72, 153, 0.2)'
                  }}
                />
              </motion.div>
            ))}
          </div>
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
