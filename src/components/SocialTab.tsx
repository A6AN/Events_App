import { useState, useEffect } from 'react';
import { Users, Heart, MessageCircle, Sparkles, Bookmark, Share2 } from 'lucide-react';
import { Event } from '../types';
import { ScrollArea } from './ui/scroll-area';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { motion } from 'framer-motion';
import { CommentSection } from './social/CommentSection';

interface SocialTabProps {
  events: Event[];
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

export function SocialTab({ events, onEventSelect }: SocialTabProps) {
  const [likedEvents, setLikedEvents] = useState<Record<string, boolean>>(getLikes());
  const [commentEventId, setCommentEventId] = useState<string | null>(null);

  const handleLike = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isLiked = toggleLike(eventId);
    setLikedEvents({ ...likedEvents, [eventId]: isLiked });
  };

  const handleComment = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCommentEventId(eventId);
  };

  return (
    <div className="h-full bg-background">
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-2xl border-b border-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <Sparkles className="h-3 w-3 text-primary absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Social Feed</h1>
                <p className="text-white/40 text-xs">See what's happening</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-white/50">Live</span>
            </div>
          </div>
        </div>

        {/* Feed */}
        <ScrollArea className="flex-1">
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
                      <span className="text-white font-medium text-sm">{event.host.name}</span>
                      <div className="text-white/40 text-xs">is hosting an event</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={(e) => e.stopPropagation()}>
                    <Bookmark className="h-4 w-4 text-white/50" />
                  </Button>
                </div>

                {/* Event Card - Premium Design */}
                <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10 group-hover:border-primary/30 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-primary/5">
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
                  <div className="p-4 flex items-center justify-between border-t border-white/5">
                    <div className="flex items-center gap-1">
                      {/* Like Button */}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleLike(event.id, e)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-white/10 transition-colors"
                      >
                        <motion.div
                          animate={likedEvents[event.id] ? { scale: [1, 1.3, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <Heart
                            className={`h-5 w-5 transition-colors ${likedEvents[event.id] ? 'text-red-500 fill-red-500' : 'text-white/50'
                              }`}
                          />
                        </motion.div>
                        <span className={`text-sm ${likedEvents[event.id] ? 'text-red-500' : 'text-white/50'}`}>
                          {Math.floor(Math.random() * 50) + 10 + (likedEvents[event.id] ? 1 : 0)}
                        </span>
                      </motion.button>

                      {/* Comment Button */}
                      <button
                        onClick={(e) => handleComment(event.id, e)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-primary"
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-sm">{Math.floor(Math.random() * 20) + 5}</span>
                      </button>

                      {/* Share Button */}
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"
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
        </ScrollArea>
      </div>

      {/* Comment Section Modal */}
      <CommentSection
        eventId={commentEventId || ''}
        isOpen={!!commentEventId}
        onClose={() => setCommentEventId(null)}
      />
    </div>
  );
}
