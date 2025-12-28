import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Users, Share2, Heart, CheckCircle } from 'lucide-react';
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

  const modalContent = (
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
                className="fixed top-4 left-1/2 -translate-x-1/2 z-[700] pointer-events-none w-[90%] max-w-sm"
              >
                <div className="bg-zinc-900/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-pink-500/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-pink-500/30">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm">You're Going! 🎉</div>
                    <div className="text-white/60 text-xs">Your friends have been notified</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[600]"
          />
          
          {/* Modal Container - Centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 z-[601] flex items-center justify-center pointer-events-none"
          >
            <div className="w-full max-w-lg max-h-[90vh] bg-zinc-900/98 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden flex flex-col pointer-events-auto shadow-2xl shadow-pink-500/10">
              {/* Image Header */}
              <div className="relative h-52 shrink-0">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${event.imageUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-zinc-900" />

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors border border-white/20"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Tags */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30">
                    Event
                  </span>
                  <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-black/40 backdrop-blur-sm text-white border border-white/20">
                    {event.mood}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Title & Host */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{event.title}</h2>
                  <div className="flex items-center gap-2 text-white/60">
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-pink-500/30">
                      <img src={event.host.avatar} alt={event.host.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm">Hosted by <span className="text-pink-400 font-medium">{event.host.name}</span></span>
                  </div>
                </div>

                {/* Date, Time, Location Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <Calendar className="w-5 h-5 text-pink-400 mb-2" />
                    <div className="text-xs text-white/50">Date</div>
                    <div className="font-semibold text-white">{event.date || '28th December'}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <Clock className="w-5 h-5 text-pink-400 mb-2" />
                    <div className="text-xs text-white/50">Time</div>
                    <div className="font-semibold text-white">{event.startTime}</div>
                </div>
                <div className="col-span-2 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <MapPin className="w-5 h-5 text-pink-400 mb-2" />
                  <div className="text-xs text-white/50">Location</div>
                  <div className="font-semibold text-white">{event.location.name}</div>
                </div>
              </div>

                {/* About */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">About</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {event.description || "🔥 Join us for an amazing event! Don't miss out on the fun, good vibes, and great company."}
                  </p>
                </div>

                {/* Attendees */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">Attendees</h3>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center mb-3">
                      <div className="flex -space-x-2">
                        {FRIEND_AVATARS.slice(0, isBohoFest ? 5 : 3).map((avatar, i) => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-900 overflow-hidden">
                            <img src={avatar} alt="Friend" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 border-2 border-zinc-900 flex items-center justify-center text-xs font-bold text-white">
                          +{event.attendees - 5}
                        </div>
                      </div>
                    </div>
                    {isBohoFest ? (
                      <div className="text-sm text-white/60">
                        <span className="text-pink-400 font-medium">8 friends</span> attending • <span className="text-amber-400 font-medium">4 RSVP'd</span>
                      </div>
                    ) : (
                      <div className="text-sm text-white/60">
                        {event.capacity ? `${event.attendees} / ${event.capacity} spots filled` : `${event.attendees} going`}
                      </div>
                    )}
                  </div>
                </div>

                {/* Comments Section - Only for Boho Fest */}
                {isBohoFest && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white">Comments</h3>
                      <span className="text-xs text-white/40">1 comment</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-pink-500/30">
                          <img src={BOHO_FEST_COMMENT.avatar} alt={BOHO_FEST_COMMENT.user} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-pink-400 font-medium text-sm">{BOHO_FEST_COMMENT.user}</span>
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
              <div className="p-4 border-t border-white/10 bg-zinc-900/80 shrink-0">
                <div className="flex gap-3">
                  <button className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-pink-400 hover:bg-pink-500/10 hover:border-pink-500/30 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleRsvp}
                    disabled={loading || isRsvped}
                    className={`flex-1 h-11 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      isRsvped 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50'
                    }`}
                  >
                    {loading ? (
                      'Booking...'
                    ) : isRsvped ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Booked!
                      </>
                    ) : (
                      'RSVP Now'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Render via portal to ensure proper positioning
  return createPortal(modalContent, document.body);
};
