import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Share2, Heart, CheckCircle, Sparkles, Users, MessageCircle, Send } from 'lucide-react';
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
  const [liked, setLiked] = useState(false);

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
        staggerChildren: 0.08,
        delayChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center isolate">
      {/* Success Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ y: -100, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -100, opacity: 0, scale: 0.8 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm"
          >
            <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-pink-500/30 flex items-center gap-3">
              <motion.div 
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <CheckCircle className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <div className="text-white font-bold text-base">You're Going! 🎉</div>
                <div className="text-white/60 text-xs">Your friends have been notified</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop with gradient */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/80 to-pink-950/30"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ type: "spring", duration: 0.6, bounce: 0.25 }}
        className="relative z-[1000] w-full max-w-md max-h-[90vh] bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 rounded-[2rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl shadow-pink-500/10 mx-4"
      >
        {/* Glowing accent at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent rounded-full" />
        
        {/* Image Header */}
        <div className="relative h-52 shrink-0 overflow-hidden">
          <motion.img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8 }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-zinc-900" />
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-transparent to-rose-500/10" />
          
          {/* Close Button */}
          <motion.button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/30 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-black/50 transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* Tags */}
          <div className="absolute top-4 left-4 flex gap-2">
            <motion.span 
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 flex items-center gap-1"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-3 h-3" />
              Event
            </motion.span>
            <motion.span 
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 backdrop-blur-xl text-white border border-white/20"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {event.mood}
            </motion.span>
          </div>

          {/* Floating price tag if applicable */}
          {event.price && event.price > 0 && (
            <motion.div 
              className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm shadow-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              ₹{event.price}
            </motion.div>
          )}
        </div>

        {/* Scrollable Content */}
        <motion.div 
          className="flex-1 overflow-y-auto p-5 space-y-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          
          {/* Title & Host */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-white mb-3 leading-tight">{event.title}</h2>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 w-fit">
              <div className="relative">
                <img
                  src={event.host.avatar}
                  alt={event.host.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-500/50"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-900" />
              </div>
              <div>
                <span className="text-white/40 text-[10px] uppercase tracking-wider font-medium block">Hosted by</span>
                <span className="text-white font-semibold text-sm">{event.host.name}</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats Row */}
          <motion.div variants={itemVariants} className="flex gap-2">
            <div className="flex-1 p-3 rounded-2xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/20 text-center">
              <Users className="w-4 h-4 text-pink-400 mx-auto mb-1" />
              <div className="text-white font-bold text-lg">{event.attendees}</div>
              <div className="text-white/40 text-[10px] uppercase tracking-wider">Going</div>
            </div>
            <div className="flex-1 p-3 rounded-2xl bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/20 text-center">
              <MessageCircle className="w-4 h-4 text-rose-400 mx-auto mb-1" />
              <div className="text-white font-bold text-lg">{MOCK_COMMENTS.length}</div>
              <div className="text-white/40 text-[10px] uppercase tracking-wider">Comments</div>
            </div>
            <div className="flex-1 p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 text-center">
              <Heart className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <div className="text-white font-bold text-lg">8</div>
              <div className="text-white/40 text-[10px] uppercase tracking-wider">Friends</div>
            </div>
          </motion.div>

          {/* Date, Time, Location */}
          <motion.div variants={itemVariants} className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 group hover:bg-white/10 transition-all">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-500/10 flex items-center justify-center group-hover:from-pink-500/30 group-hover:to-pink-500/20 transition-all">
                  <Calendar className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <div className="text-white/40 text-[10px] uppercase tracking-wider">Date</div>
                  <div className="text-white font-semibold text-sm">{event.date || '28th December'}</div>
                </div>
              </div>
              <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 group hover:bg-white/10 transition-all">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-500/10 flex items-center justify-center group-hover:from-rose-500/30 group-hover:to-rose-500/20 transition-all">
                  <Clock className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <div className="text-white/40 text-[10px] uppercase tracking-wider">Time</div>
                  <div className="text-white font-semibold text-sm">{event.startTime}</div>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 group hover:bg-white/10 transition-all">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center group-hover:from-amber-500/30 group-hover:to-amber-500/20 transition-all">
                <MapPin className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-white/40 text-[10px] uppercase tracking-wider">Location</div>
                <div className="text-white font-semibold text-sm">{event.location.name}</div>
              </div>
            </div>
          </motion.div>

          {/* About */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white/40 text-[10px] uppercase tracking-wider font-semibold mb-2">About This Event</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              {event.description || "🔥 Join us for an amazing event! Don't miss out on the fun, good vibes, and great company."}
            </p>
          </motion.div>

          {/* Attendees */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white/40 text-[10px] uppercase tracking-wider font-semibold mb-3">Who's Going</h3>
            <div className="flex items-center">
              <div className="flex -space-x-3">
                {FRIEND_AVATARS.map((avatar, i) => (
                  <motion.img
                    key={i}
                    src={avatar}
                    alt="Friend"
                    className="w-10 h-10 rounded-full border-2 border-zinc-900 object-cover ring-2 ring-pink-500/30 hover:ring-pink-500 hover:z-10 transition-all cursor-pointer"
                    initial={{ scale: 0, x: -10 }}
                    animate={{ scale: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    whileHover={{ scale: 1.15, y: -5 }}
                  />
                ))}
                <motion.div 
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 border-2 border-zinc-900 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-pink-500/20"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  +{Math.max(event.attendees - 5, 0)}
                </motion.div>
              </div>
              <div className="ml-4 text-sm">
                <span className="text-pink-400 font-bold">8 friends</span>
                <span className="text-white/40"> attending</span>
              </div>
            </div>
          </motion.div>

          {/* Comments Section */}
          <motion.div variants={itemVariants} className="pt-4 border-t border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white/40 text-[10px] uppercase tracking-wider font-semibold">Comments</h3>
              <span className="text-xs text-white/30 bg-white/5 px-2 py-1 rounded-full">{MOCK_COMMENTS.length}</span>
            </div>
            
            <div className="space-y-4 mb-4">
              {MOCK_COMMENTS.map((comment, i) => (
                <motion.div 
                  key={comment.id} 
                  className="flex gap-3 group"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <img
                    src={comment.avatar}
                    alt={comment.user}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-pink-500/30 transition-all"
                  />
                  <div className="flex-1 bg-white/5 rounded-2xl rounded-tl-sm p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm">{comment.user}</span>
                      <span className="text-white/30 text-xs">{comment.time}</span>
                    </div>
                    <p className="text-white/80 text-sm mt-1">{comment.text}</p>
                  </div>
                  <button className="self-end text-white/20 hover:text-pink-500 transition-colors p-2 hover:bg-pink-500/10 rounded-full">
                    <Heart className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Comment Input */}
            <div className="relative">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all"
              />
              <motion.button 
                disabled={!commentText.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white disabled:opacity-0 disabled:scale-75 transition-all shadow-lg shadow-pink-500/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-gradient-to-t from-zinc-950 to-zinc-900 shrink-0">
          <div className="flex gap-3">
            <motion.button 
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
            <motion.button 
              onClick={() => setLiked(!liked)}
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${
                liked 
                  ? 'bg-pink-500/20 border-pink-500/50 text-pink-400' 
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-pink-400 hover:bg-pink-500/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-pink-400' : ''}`} />
            </motion.button>
            <motion.button
              onClick={handleRsvp}
              disabled={loading || isRsvped}
              className={`flex-1 h-12 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                isRsvped
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                  : 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 bg-[length:200%_100%] animate-gradient text-white shadow-lg shadow-pink-500/30'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : isRsvped ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  You're In! 🎉
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  RSVP Now
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
