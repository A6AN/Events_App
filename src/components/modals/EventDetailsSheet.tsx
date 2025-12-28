import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Share2, Heart, CheckCircle } from 'lucide-react';
import { Event } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { rsvpToEvent, checkRsvpStatus } from '../../lib/supabase';
import confetti from 'canvas-confetti';

interface EventDetailsSheetProps {
  event: Event | null;
  open: boolean;
  onClose: () => void;
}

const FRIEND_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
];

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
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (error) {
      console.error('RSVP error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;
  if (!open) return null;

  const isBohoFest = event.id === '1';

  return createPortal(
    <>
      {/* Success Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[700] w-[90%] max-w-sm"
          >
            <div className="bg-zinc-900 rounded-2xl p-4 shadow-2xl border border-pink-500/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
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
        className="fixed inset-0 bg-black/90 z-[600]"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed inset-x-4 top-[5%] bottom-[5%] z-[601] flex items-center justify-center"
      >
        <div className="w-full max-w-md h-full bg-zinc-900 rounded-3xl border border-white/10 overflow-hidden flex flex-col shadow-2xl">
          
          {/* Image Header */}
          <div className="relative h-48 shrink-0">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-zinc-900" />
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Tags */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-500 text-white">
                Event
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/50 text-white">
                {event.mood}
              </span>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            
            {/* Title & Host */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{event.title}</h2>
              <div className="flex items-center gap-2">
                <img
                  src={event.host.avatar}
                  alt={event.host.name}
                  className="w-7 h-7 rounded-full object-cover border border-pink-500/50"
                />
                <span className="text-white/60 text-sm">
                  Hosted by <span className="text-pink-400 font-medium">{event.host.name}</span>
                </span>
              </div>
            </div>

            {/* Date, Time, Location */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <Calendar className="w-5 h-5 text-pink-400 mb-2" />
                <div className="text-xs text-white/50">Date</div>
                <div className="font-semibold text-white">{event.date || '28th December'}</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <Clock className="w-5 h-5 text-pink-400 mb-2" />
                <div className="text-xs text-white/50">Time</div>
                <div className="font-semibold text-white">{event.startTime}</div>
              </div>
              <div className="col-span-2 p-4 rounded-2xl bg-white/5 border border-white/10">
                <MapPin className="w-5 h-5 text-pink-400 mb-2" />
                <div className="text-xs text-white/50">Location</div>
                <div className="font-semibold text-white">{event.location.name}</div>
              </div>
            </div>

            {/* About */}
            <div>
              <h3 className="font-semibold text-white mb-2">About</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {event.description || "🔥 Join us for an amazing event! Don't miss out on the fun, good vibes, and great company."}
              </p>
            </div>

            {/* Attendees */}
            <div>
              <h3 className="font-semibold text-white mb-2">Attendees</h3>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex -space-x-2 mb-3">
                  {FRIEND_AVATARS.slice(0, isBohoFest ? 5 : 3).map((avatar, i) => (
                    <img
                      key={i}
                      src={avatar}
                      alt="Friend"
                      className="w-8 h-8 rounded-full border-2 border-zinc-900 object-cover"
                    />
                  ))}
                  <div className="w-8 h-8 rounded-full bg-pink-500 border-2 border-zinc-900 flex items-center justify-center text-xs font-bold text-white">
                    +{event.attendees - 5}
                  </div>
                </div>
                {isBohoFest ? (
                  <div className="text-sm text-white/60">
                    <span className="text-pink-400 font-medium">8 friends</span> attending • <span className="text-amber-400 font-medium">4 RSVP'd</span>
                  </div>
                ) : (
                  <div className="text-sm text-white/60">
                    {event.attendees} going
                  </div>
                )}
              </div>
            </div>

            {/* Comments - Boho Fest only */}
            {isBohoFest && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">Comments</h3>
                  <span className="text-xs text-white/40">1 comment</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex gap-3">
                    <img
                      src={BOHO_FEST_COMMENT.avatar}
                      alt={BOHO_FEST_COMMENT.user}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
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
          <div className="p-4 border-t border-white/10 bg-zinc-900 shrink-0">
            <div className="flex gap-3">
              <button className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-pink-400 hover:bg-pink-500/10">
                <Heart className="w-5 h-5" />
              </button>
              <button
                onClick={handleRsvp}
                disabled={loading || isRsvped}
                className={`flex-1 h-11 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  isRsvped
                    ? 'bg-green-500 text-white'
                    : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30'
                }`}
              >
                {loading ? 'Booking...' : isRsvped ? (
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
    </>,
    document.body
  );
};
