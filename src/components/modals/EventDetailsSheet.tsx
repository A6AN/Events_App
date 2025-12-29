import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Share2, Heart, CheckCircle, Sparkles, Send, Users } from 'lucide-react';
import { Event } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { rsvpToEvent, checkRsvpStatus } from '../../lib/supabase';
import confetti from 'canvas-confetti';

// Staggered animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
};

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
  },
  {
    id: 2,
    user: 'Rahul',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    text: "Can't wait for this! 🔥",
    time: '45m ago',
  }
];

export const EventDetailsSheet = ({ event, open, onClose }: EventDetailsSheetProps) => {
  const { user } = useAuth();
  const [isRsvped, setIsRsvped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (event && user && open) {
      checkRsvpStatus(event.id, user.id).then(setIsRsvped);
    }
    if (open) {
      setShowNotification(false);
    }
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
      setTimeout(() => setShowNotification(false), 4000);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (error) {
      console.error('RSVP error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!event || !open) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        {/* Backdrop with blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* Success Notification */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="absolute top-4 left-4 right-4 z-[10000]"
            >
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl p-4 shadow-2xl shadow-green-500/30 flex items-center gap-3 mx-auto max-w-sm border border-green-400/30">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold">You're In! 🎉</div>
                  <div className="text-white/80 text-xs">Your friends have been notified</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Container - Properly Centered */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md mx-4 max-h-[90vh] z-10"
        >
          {/* Glowing border effect - double layer for stronger glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 rounded-[28px] blur-md" />
          <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 rounded-3xl opacity-90" />

          {/* Modal content */}
          <div className="relative w-full h-full max-h-[90vh] bg-zinc-950 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-pink-500/50">

            {/* Header Image */}
            <div className="relative h-52 flex-shrink-0">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-zinc-950" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-zinc-900/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-pink-500/80 transition-all hover:scale-110 border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Tags */}
              <div className="absolute top-4 left-4 flex gap-2">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center gap-1 shadow-lg shadow-pink-500/40"
                >
                  <Sparkles className="w-3 h-3" />
                  Event
                </motion.span>
                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-900/80 backdrop-blur-sm text-white border border-white/20">
                  {event.mood}
                </span>
              </div>

              {/* Title on Image */}
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-2xl font-bold text-white drop-shadow-lg">{event.title}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <img
                    src={event.host.avatar}
                    alt={event.host.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-pink-500 shadow-lg shadow-pink-500/30"
                  />
                  <span className="text-white/90 text-sm">
                    by <span className="text-pink-400 font-semibold">{event.host.name}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950"
            >

              {/* Quick Info Row - Vibrant colored cards */}
              <motion.div variants={itemVariants} className="flex gap-3">
                <motion.div
                  whileHover={{ scale: 1.02, y: -3 }}
                  className="flex-1 bg-pink-500/20 rounded-2xl p-4 border-2 border-pink-500/60 shadow-lg shadow-pink-500/25"
                >
                  <div className="flex items-center gap-2 text-pink-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs text-pink-300 font-medium">Date</span>
                  </div>
                  <div className="text-white font-bold text-sm">{event.date || '28th December'}</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02, y: -3 }}
                  className="flex-1 bg-violet-500/20 rounded-2xl p-4 border-2 border-violet-500/60 shadow-lg shadow-violet-500/25"
                >
                  <div className="flex items-center gap-2 text-violet-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs text-violet-300 font-medium">Time</span>
                  </div>
                  <div className="text-white font-bold text-sm">{event.startTime}</div>
                </motion.div>
              </motion.div>

              {/* Location */}
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.01, y: -2 }}
                className="bg-amber-500/20 rounded-2xl p-4 border-2 border-amber-500/50 shadow-lg shadow-amber-500/20"
              >
                <div className="flex items-center gap-2 text-amber-400 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs text-amber-300 font-medium">Location</span>
                </div>
                <div className="text-white font-bold text-sm">{event.location.name}</div>
              </motion.div>

              {/* About - Pink themed */}
              <motion.div variants={itemVariants} className="bg-zinc-900 rounded-2xl p-4 border-2 border-pink-500/30">
                <h3 className="text-pink-400 text-xs uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  About
                </h3>
                <p className="text-zinc-200 text-sm leading-relaxed">
                  {event.description || "🔥 DIVINE is coming to Lucknow! The biggest bohemian music and art festival featuring live performances, art installations, street food, and the legendary rapper DIVINE headlining the night. Get ready for Gully Boy vibes!"}
                </p>
              </motion.div>

              {/* Attendees */}
              <motion.div variants={itemVariants}>
                <h3 className="text-zinc-300 text-xs uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-pink-400" />
                  Who's Going • <span className="text-pink-400">{event.attendees}</span>
                </h3>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center gap-3 bg-zinc-900 rounded-2xl p-4 border-2 border-pink-500/40 shadow-lg shadow-pink-500/10"
                >
                  <div className="flex -space-x-3">
                    {FRIEND_AVATARS.map((avatar, i) => (
                      <motion.img
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        src={avatar}
                        alt="Attendee"
                        className="w-10 h-10 rounded-full border-2 border-zinc-950 object-cover ring-2 ring-pink-500/20"
                      />
                    ))}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 }}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 border-2 border-zinc-950 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-pink-500/40"
                    >
                      +{Math.max(event.attendees - 5, 245)}
                    </motion.div>
                  </div>
                  <span className="text-sm text-zinc-300">
                    <span className="text-pink-400 font-bold">8 friends</span> going
                  </span>
                </motion.div>
              </motion.div>

              {/* Comments */}
              <motion.div variants={itemVariants}>
                <h3 className="text-zinc-300 text-xs uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
                  <span className="text-pink-400">💬</span>
                  Comments • <span className="text-pink-400">{MOCK_COMMENTS.length}</span>
                </h3>
                <div className="space-y-3">
                  {MOCK_COMMENTS.map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.15 }}
                      className="flex gap-3"
                    >
                      <img
                        src={comment.avatar}
                        alt={comment.user}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2 ring-pink-500/40 shadow-lg shadow-pink-500/20"
                      />
                      <div className="flex-1 bg-zinc-900/80 rounded-2xl rounded-tl-md p-3 border border-zinc-800 hover:border-pink-500/30 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-pink-400 font-semibold text-sm">{comment.user}</span>
                          <span className="text-zinc-500 text-xs">{comment.time}</span>
                        </div>
                        <p className="text-zinc-200 text-sm">{comment.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Comment Input */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="relative mt-4"
                >
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-4 pr-14 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 transition-all"
                  />
                  <button
                    disabled={!commentText.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white disabled:opacity-30 transition-all hover:scale-110 active:scale-95 shadow-lg shadow-pink-500/30"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Footer - Premium Action Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 border-t border-pink-500/20 bg-gradient-to-t from-zinc-950 to-zinc-950/95 flex-shrink-0"
            >
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-pink-400 hover:border-pink-500/50 hover:bg-zinc-800 transition-all"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLiked(!liked)}
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${liked
                    ? 'bg-pink-500/30 border-pink-500 text-pink-400 shadow-lg shadow-pink-500/30'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-pink-400 hover:border-pink-500/50'
                    }`}
                >
                  <Heart className={`w-5 h-5 transition-all ${liked ? 'fill-pink-400 scale-110' : ''}`} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRsvp}
                  disabled={loading || isRsvped}
                  className={`flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all relative overflow-hidden ${isRsvped
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-green-500/40'
                    : 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 bg-[length:200%_100%] animate-gradient text-white shadow-xl shadow-pink-500/40'
                    }`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isRsvped ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      You're In!
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      RSVP Now
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
