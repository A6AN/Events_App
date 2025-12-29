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
    <div className="h-full bg-background overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">Social</h1>
            <p className="text-white/50 text-xs">
              {activeTab === 'friends' ? "See what friends are up to" : "Live events near you"}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
            <Users className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Toggle - Enhanced visibility */}
        <div className="flex gap-2 p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('friends')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'friends'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/40'
                : 'text-white/50 hover:text-white/70 hover:bg-white/5'
              }`}
          >
            <Users className="h-4 w-4" />
            Friends
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('live')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'live'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/40'
                : 'text-white/50 hover:text-white/70 hover:bg-white/5'
              }`}
          >
            <TrendingUp className="h-4 w-4" />
            Live
            {activeTab === 'live' && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
            {activeTab !== 'live' && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
          </motion.button>
        </div>
      </div>

      {/* Feed - Scrollable */}
      <div className="flex-1 overflow-y-auto pb-24 px-4">
        {activeTab === 'friends' ? (
          /* Friends Feed */
          <div className="space-y-4 pt-2">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onEventSelect(event)}
                className="relative bg-gradient-to-br from-white/10 to-white/5 rounded-2xl overflow-hidden cursor-pointer group border border-white/10 hover:border-pink-500/50 transition-all duration-300"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-rose-500/0 group-hover:from-pink-500/10 group-hover:to-rose-500/10 transition-all duration-300 rounded-2xl" />

                {/* User Header */}
                <div className="relative flex items-center gap-3 p-3 border-b border-white/5">
                  <div className="relative">
                    <Avatar className="h-9 w-9 border-2 border-pink-500/30">
                      <AvatarImage src={event.host.avatar} alt={event.host.name} />
                      <AvatarFallback className="bg-pink-500/20 text-pink-300">{event.host.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                  </div>
                  <div className="flex-1">
                    <span className="text-white font-medium text-sm">{event.host.name}</span>
                    <div className="text-white/40 text-xs">is hosting an event</div>
                  </div>
                  <span className="text-xs text-white/30">2h ago</span>
                </div>

                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  {/* Mood Badge */}
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                    <span className="text-xs text-white font-medium">{event.mood}</span>
                  </div>

                  {/* Attendees */}
                  <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-pink-400" />
                    <span className="text-xs text-white font-medium">{event.attendees}</span>
                  </div>

                  {/* Event Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-lg group-hover:text-pink-200 transition-colors">{event.title}</h3>
                    <div className="flex items-center gap-2 text-white/60 text-sm mt-1">
                      <span className="text-pink-400 font-medium">{event.startTime}</span>
                      <span>•</span>
                      <span className="truncate">{event.location.name}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="relative p-3 flex items-center justify-between bg-gradient-to-r from-transparent to-pink-500/5 group-hover:to-pink-500/10">
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleLike(event.id, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <Heart
                        className={`h-5 w-5 transition-colors ${likedEvents[event.id] ? 'text-red-500 fill-red-500' : 'text-white/60'
                          }`}
                      />
                      <span className={`text-sm ${likedEvents[event.id] ? 'text-red-500' : 'text-white/60'}`}>
                        {Math.floor(Math.random() * 50) + 10}
                      </span>
                    </motion.button>

                    <button
                      onClick={(e) => handleComment(event.id, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors text-white/60"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-sm">{Math.floor(Math.random() * 20) + 5}</span>
                    </button>

                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors text-white/60"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>

                  <motion.span
                    className="flex items-center gap-1 text-pink-400 font-semibold text-sm"
                    whileHover={{ x: 3 }}
                  >
                    <Sparkles className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    View →
                  </motion.span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Live Events / Ticketed Events */
          <div className="space-y-4 pt-2">
            {tickets.map((ticket, idx) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleTicketClick(ticket)}
                className="relative bg-gradient-to-br from-white/10 to-white/5 rounded-2xl overflow-hidden cursor-pointer group border border-white/10 hover:border-pink-500/50 transition-all duration-300"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-rose-500/0 group-hover:from-pink-500/10 group-hover:to-rose-500/10 transition-all duration-300 rounded-2xl" />

                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <ImageWithFallback
                    src={ticket.imageUrl}
                    alt={ticket.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  {/* Live Badge */}
                  <div className="absolute top-3 left-3 bg-red-500 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg shadow-red-500/30">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-xs text-white font-bold uppercase">Live</span>
                  </div>

                  {/* Category */}
                  <div className="absolute top-3 right-3 bg-pink-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <span className="text-xs text-white font-medium">{ticket.category}</span>
                  </div>

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-lg group-hover:text-pink-200 transition-colors">{ticket.title}</h3>
                    <p className="text-pink-400 text-sm font-medium">{ticket.artist}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="relative p-4 space-y-3 bg-gradient-to-r from-transparent to-pink-500/5 group-hover:to-pink-500/10">
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-pink-400" />
                      {ticket.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-pink-400" />
                      <span className="truncate">{ticket.venue}</span>
                    </span>
                  </div>

                  {/* Price Row */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white/40 text-xs">From</span>
                      <span className="text-white font-bold text-xl ml-2">₹{ticket.price}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-pink-400 text-xs">{ticket.availableSeats} seats</span>
                      <motion.span
                        className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-pink-500/30"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Book →
                      </motion.span>
                    </div>
                  </div>
                </div>
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
