import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Users, Share2, Heart, Ticket, MessageCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Event } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { rsvpToEvent, checkRsvpStatus } from '../../lib/supabase';
import confetti from 'canvas-confetti';

interface EventDetailsSheetProps {
  event: Event | null;
  open: boolean;
  onClose: () => void;
}

// Friend avatars for attendees section
const FRIEND_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
];

// Mock comment from Anshika
const BOHO_FEST_COMMENT = {
  user: 'Anshika',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
  text: "Who's coming? 🙋‍♀️✨",
  time: '2 hours ago'
};

export const EventDetailsSheet = ({ event, open, onClose }: EventDetailsSheetProps) => {
  const { user } = useAuth();
  const [isRsvped, setIsRsvped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (event && user && open) {
      checkRsvpStatus(event.id, user.id).then(setIsRsvped);
    }
    // Reset notification on new event
    setShowNotification(false);
  }, [event, user, open]);

  const handleRsvp = async () => {
    if (!event) return;

    setLoading(true);
    try {
      if (user) {
        await rsvpToEvent(event.id, user.id);
      }
      setIsRsvped(true);

      // Show iPhone-style notification
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);

      // Confetti effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (error) {
      console.error('RSVP error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;

  const isBohoFest = event.id === '1';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* iPhone-style Notification */}
          <AnimatePresence>
            {showNotification && (
              <motion.div
                initial={{ y: -100, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -100, opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-4 left-4 right-4 z-[600] pointer-events-none"
              >
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-gray-200 flex items-center gap-3 mx-auto max-w-sm">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-900 font-semibold text-sm">Tickets Booked! 🎉</div>
                    <div className="text-gray-500 text-xs">Your friends have been notified</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[85vh] bg-background/95 backdrop-blur-xl rounded-t-[2rem] border-t border-white/10 z-[501] overflow-hidden flex flex-col"
          >
            {/* Image Header */}
            <div className="relative h-64 shrink-0">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${event.imageUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-background" />

              <Button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/20">
                    {event.category || 'Event'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-muted-foreground border border-white/10">
                    {event.mood}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-gradient mb-2">{event.title}</h2>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
                    <img src={event.host.avatar} alt={event.host.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm">Hosted by <span className="text-foreground font-medium">{event.host.name}</span></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <Calendar className="w-5 h-5 text-primary mb-2" />
                  <div className="text-xs text-muted-foreground">Date</div>
                  <div className="font-medium">{event.date || '28th December'}</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <Clock className="w-5 h-5 text-primary mb-2" />
                  <div className="text-xs text-muted-foreground">Time</div>
                  <div className="font-medium">{event.startTime}</div>
                </div>
                <div className="col-span-2 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <MapPin className="w-5 h-5 text-primary mb-2" />
                  <div className="text-xs text-muted-foreground">Location</div>
                  <div className="font-medium">{event.location.name}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">About</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {event.description || "Join us for an amazing event! Don't miss out on the fun, good vibes, and great company."}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Attendees</h3>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex -space-x-2">
                      {FRIEND_AVATARS.slice(0, isBohoFest ? 5 : 3).map((avatar, i) => (
                        <div key={i} className="w-9 h-9 rounded-full border-2 border-background overflow-hidden">
                          <img src={avatar} alt="Friend" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <div className="w-9 h-9 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-medium text-primary">
                        +{event.attendees - 5}
                      </div>
                    </div>
                  </div>
                  {isBohoFest ? (
                    <div className="text-sm text-muted-foreground">
                      <span className="text-cyan-400 font-medium">8 friends</span> attending • <span className="text-amber-400 font-medium">4 RSVP'd</span>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {event.capacity ? `${event.attendees} / ${event.capacity} spots filled` : `${event.attendees} going`}
                    </div>
                  )}
                </div>
              </div>

              {/* Comments Section - Only for Boho Fest */}
              {isBohoFest && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Comments</h3>
                    <span className="text-xs text-muted-foreground">1 comment</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                        <img src={BOHO_FEST_COMMENT.avatar} alt={BOHO_FEST_COMMENT.user} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">{BOHO_FEST_COMMENT.user}</span>
                          <span className="text-white/40 text-xs">{BOHO_FEST_COMMENT.time}</span>
                        </div>
                        <p className="text-white/70 text-sm mt-1">{BOHO_FEST_COMMENT.text}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-white/10 bg-background/80 backdrop-blur-xl">
              <div className="flex gap-3">
                <Button variant="outline" size="icon" className="shrink-0">
                  <Share2 className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Heart className="w-5 h-5" />
                </Button>
                <Button
                  className={`flex-1 ${isRsvped ? 'bg-green-500 hover:bg-green-600' : ''}`}
                  size="lg"
                  onClick={handleRsvp}
                  disabled={loading || isRsvped}
                >
                  {loading ? (
                    'Booking...'
                  ) : isRsvped ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Booked
                    </>
                  ) : (
                    'RSVP Now'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
