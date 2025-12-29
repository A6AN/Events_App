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

const MOCK_COMMENTS = [
  {
    id: 1,
    user: 'Anshika',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    text: "Who's coming? 🙋‍♀️✨",
    time: '2h ago',
    likes: 4
  },
  {
    id: 2,
    user: 'Rahul',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    text: "Can't wait for this! 🔥",
    time: '45m ago',
    likes: 2
  }
];

export const EventDetailsSheet = ({ event, open, onClose }: EventDetailsSheetProps) => {
  const { user } = useAuth();
  const [isRsvped, setIsRsvped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [commentText, setCommentText] = useState('');

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center isolate">
      {/* Success Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm"
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
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
        className="relative z-[1000] w-full max-w-md max-h-[85vh] h-auto bg-zinc-900/95 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden flex flex-col shadow-2xl mx-4"
      >
        {/* Image Header */}
        <div className="relative h-56 shrink-0">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-zinc-900" />
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Tags */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-500 text-white shadow-lg shadow-pink-500/20">
                Event
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/40 backdrop-blur-md text-white border border-white/10">
                {event.mood}
              </span>
            </div>
          </div>

          {/* Scrollable Content */}
          <motion.div 
            className="flex-1 overflow-y-auto p-5 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            
            {/* Title & Host */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-white mb-3 leading-tight">{event.title}</h2>
              <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5 w-fit pr-4">
                <img
                  src={event.host.avatar}
                  alt={event.host.name}
                  className="w-8 h-8 rounded-full object-cover border border-pink-500/50"
                />
                <div className="flex flex-col">
                  <span className="text-white/40 text-[10px] uppercase tracking-wider font-medium">Hosted by</span>
                  <span className="text-pink-400 font-medium text-sm">{event.host.name}</span>
                </div>
              </div>
            </motion.div>

            {/* Date, Time, Location */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                    <Calendar className="w-3.5 h-3.5 text-pink-400" />
                  </div>
                  <span className="text-xs text-white/50">Date</span>
                </div>
                <div className="font-medium text-white text-sm pl-8">{event.date || '28th December'}</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                    <Clock className="w-3.5 h-3.5 text-pink-400" />
                  </div>
                  <span className="text-xs text-white/50">Time</span>
                </div>
                <div className="font-medium text-white text-sm pl-8">{event.startTime}</div>
              </div>
              <div className="col-span-2 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                    <MapPin className="w-3.5 h-3.5 text-pink-400" />
                  </div>
                  <span className="text-xs text-white/50">Location</span>
                </div>
                <div className="font-medium text-white text-sm pl-8">{event.location.name}</div>
              </div>
            </motion.div>

            {/* About */}
            <motion.div variants={itemVariants}>
              <h3 className="font-semibold text-white mb-2 text-sm uppercase tracking-wider opacity-80">About Event</h3>
              <p className="text-white/70 text-sm leading-relaxed font-light">
                {event.description || "🔥 Join us for an amazing event! Don't miss out on the fun, good vibes, and great company."}
              </p>
            </motion.div>

            {/* Attendees */}
            <motion.div variants={itemVariants}>
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm uppercase tracking-wider opacity-80">
                Going <span className="bg-white/10 px-2 py-0.5 rounded-full text-white font-bold text-xs">{event.attendees}</span>
              </h3>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex -space-x-3 pl-1">
                  {FRIEND_AVATARS.map((avatar, i) => (
                    <img
                      key={i}
                      src={avatar}
                      alt="Friend"
                      className="w-10 h-10 rounded-full border-2 border-zinc-900 object-cover ring-2 ring-transparent hover:ring-pink-500/50 hover:z-10 transition-all"
                    />
                  ))}
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-xs font-bold text-white">
                    +{Math.max(event.attendees - 5, 0)}
                  </div>
                </div>
                <div className="text-sm text-white/60 pl-4 border-l border-white/10">
                  <span className="text-pink-400 font-bold">8 friends</span> attending
                </div>
              </div>
            </motion.div>

            {/* Comments Section */}
            <motion.div variants={itemVariants} className="pt-4 border-t border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white text-sm uppercase tracking-wider opacity-80">Comments</h3>
                <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-md">{MOCK_COMMENTS.length}</span>
              </div>
              
              <div className="space-y-4 mb-4">
                {MOCK_COMMENTS.map((comment) => (
                  <div key={comment.id} className="flex gap-3 group">
                    <img
                      src={comment.avatar}
                      alt={comment.user}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-pink-500/30 transition-all"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm">{comment.user}</span>
                        <span className="text-white/30 text-xs">{comment.time}</span>
                      </div>
                      <p className="text-white/80 text-sm mt-0.5 leading-relaxed">{comment.text}</p>
                      <button className="text-xs text-white/40 mt-1 hover:text-pink-400 transition-colors font-medium">Reply</button>
                    </div>
                    <button className="self-start text-white/20 hover:text-pink-500 transition-colors p-1 hover:bg-pink-500/10 rounded-full">
                      <Heart className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Comment Input */}
              <div className="relative group">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all"
                />
                <button 
                  disabled={!commentText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-pink-500 text-white disabled:opacity-0 disabled:scale-75 transition-all shadow-lg shadow-pink-500/20"
                >
                  <Share2 className="w-3 h-3 rotate-90" />
                </button>
              </div>
            </motion.div>
          </motion.div>

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
      </motion.div>
    </div>,
    document.body
  );
};
