import { useState } from 'react';
import { Users, Heart, MessageCircle, Sparkles, Bookmark, Share2, Calendar, MapPin } from 'lucide-react';
import { Event, TicketEvent } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
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
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-background/80 backdrop-blur-2xl border-b border-border/50">
        <div className="p-4 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <Sparkles className="h-3 w-3 text-primary absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Social Feed</h1>
                <p className="text-muted-foreground text-xs">
                  {activeTab === 'friends' ? "See what's happening" : "Live around you"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          </div>

          {/* Segmented Control */}
          <div className="relative bg-muted/30 p-1 rounded-2xl flex gap-1 mb-4">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 py-2.5 rounded-xl text-sm transition-all duration-300 relative ${
                activeTab === 'friends'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {activeTab === 'friends' && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-xl shadow-lg" 
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                Friends
              </span>
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`flex-1 py-2.5 rounded-xl text-sm transition-all duration-300 relative ${
                activeTab === 'live'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {activeTab === 'live' && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-xl shadow-lg" 
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                Live
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Feed - Scrollable */}
      <div className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'friends' ? (
          /* Friends Feed */
          <div className="p-4 space-y-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onEventSelect(event)}
                className="group cursor-pointer"
              >
                {/* User action header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10 border-2 border-primary/30">
                        <AvatarImage src={event.host.avatar} alt={event.host.name} />
                        <AvatarFallback className="bg-primary/20">{event.host.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                    </div>
                    <div>
                      <span className="text-foreground font-medium text-sm">{event.host.name}</span>
                      <div className="text-muted-foreground text-xs">is hosting an event</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" onClick={(e) => e.stopPropagation()}>
                    <Bookmark className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>

                {/* Event Card - Premium Design */}
                <div className="relative bg-card backdrop-blur-sm rounded-3xl overflow-hidden border border-border/50 group-hover:border-primary/30 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-primary/5">
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <ImageWithFallback
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                    {/* Mood badge */}
                    <Badge className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white border-white/20 px-3 py-1">
                      {event.mood}
                    </Badge>

                    {/* Attendees badge */}
                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-1.5 border border-white/10">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs text-white font-medium">{event.attendees}</span>
                    </div>

                    {/* Event info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-white text-xl font-bold mb-2">{event.title}</h3>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-primary font-medium">{event.startTime}</span>
                        <span className="text-white/40">•</span>
                        <span className="text-white/60 truncate">{event.location.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Interaction bar */}
                  <div className="p-4 flex items-center justify-between border-t border-border/20">
                    <div className="flex items-center gap-1">
                      {/* Like Button */}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleLike(event.id, e)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-muted transition-colors"
                      >
                        <motion.div
                          animate={likedEvents[event.id] ? { scale: [1, 1.3, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <Heart
                            className={`h-5 w-5 transition-colors ${likedEvents[event.id] ? 'text-red-500 fill-red-500' : 'text-muted-foreground'
                              }`}
                          />
                        </motion.div>
                        <span className={`text-sm ${likedEvents[event.id] ? 'text-red-500' : 'text-muted-foreground'}`}>
                          {Math.floor(Math.random() * 50) + 10 + (likedEvents[event.id] ? 1 : 0)}
                        </span>
                      </motion.button>

                      {/* Comment Button */}
                      <button
                        onClick={(e) => handleComment(event.id, e)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-sm">{Math.floor(Math.random() * 20) + 5}</span>
                      </button>

                      {/* Share Button */}
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                      View →
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Live Events / Ticketed Events */
          <div className="p-4 space-y-4">
            {tickets.map((ticket, idx) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleTicketClick(ticket)}
                className="group relative bg-card border border-border/50 rounded-3xl overflow-hidden cursor-pointer hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                {/* Image Container */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  <ImageWithFallback
                    src={ticket.imageUrl}
                    alt={ticket.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-primary-foreground text-xs shadow-xl">
                    {ticket.category}
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white text-lg font-bold mb-1">{ticket.title}</h3>
                    <p className="text-primary text-sm">{ticket.artist}</p>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs">{ticket.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs truncate">{ticket.venue}</span>
                    </div>
                  </div>

                  {/* Price Card */}
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-muted-foreground text-xs mb-0.5">Starting at</div>
                      <div className="text-foreground text-2xl font-bold">₹{ticket.price}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-primary text-xs mb-1">{ticket.availableSeats} seats left</div>
                      <div className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm hover:bg-primary/90 transition-colors font-medium">
                        Book →
                      </div>
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
