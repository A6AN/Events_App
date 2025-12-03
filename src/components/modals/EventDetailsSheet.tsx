import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Users, Share2, Heart, Ticket } from 'lucide-react';
import { Button } from '../ui/button';
import { Event } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { rsvpToEvent, checkRsvpStatus } from '../../lib/supabase';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface EventDetailsSheetProps {
  event: Event | null;
  open: boolean;
  onClose: () => void;
}

export const EventDetailsSheet = ({ event, open, onClose }: EventDetailsSheetProps) => {
  const { user } = useAuth();
  const [isRsvped, setIsRsvped] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event && user && open) {
      checkRsvpStatus(event.id, user.id).then(setIsRsvped);
    }
  }, [event, user, open]);

  const handleRsvp = async () => {
    if (!user) {
      toast.error('Please sign in to RSVP');
      return;
    }
    if (!event) return;

    setLoading(true);
    try {
      await rsvpToEvent(event.id, user.id);
      setIsRsvped(true);
      toast.success("You're going! 🎉");

      // Confetti effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (error) {
      toast.error('Failed to RSVP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
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
                  <div className="font-medium">{new Date(event.startTime).toLocaleDateString()}</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <Clock className="w-5 h-5 text-primary mb-2" />
                  <div className="text-xs text-muted-foreground">Time</div>
                  <div className="font-medium">{new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
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
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex -space-x-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-white/10 border-2 border-background" />
                    ))}
                    <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-medium text-primary">
                      +{event.attendees}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {event.capacity ? `${event.attendees} / ${event.capacity} spots filled` : `${event.attendees} going`}
                  </div>
                </div>
              </div>
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
                  className="flex-1"
                  size="lg"
                  onClick={handleRsvp}
                  disabled={loading || isRsvped}
                >
                  {loading ? (
                    'Reserving...'
                  ) : isRsvped ? (
                    <>
                      <Ticket className="w-5 h-5 mr-2" />
                      Ticket Confirmed
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
