import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Share2, Heart, CheckCircle, Sparkles, Send } from 'lucide-react';
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
      <div className="fixed inset-0 z-[9999]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/95"
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
              <div className="bg-green-500 rounded-2xl p-4 shadow-2xl flex items-center gap-3 mx-auto max-w-sm">
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

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="absolute inset-4 top-8 bottom-8 flex items-center justify-center pointer-events-none"
        >
          <div className="w-full max-w-md h-full max-h-[85vh] bg-zinc-900 rounded-3xl overflow-hidden flex flex-col pointer-events-auto shadow-2xl border border-zinc-800">
            
            {/* Header Image */}
            <div className="relative h-52 flex-shrink-0">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-zinc-900" />
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Tags */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Event
                </span>
                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-black/50 backdrop-blur-sm text-white">
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
                    className="w-6 h-6 rounded-full object-cover ring-2 ring-pink-500"
                  />
                  <span className="text-white/80 text-sm">
                    by <span className="text-pink-400 font-medium">{event.host.name}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Quick Info Row */}
              <div className="flex gap-2">
                <div className="flex-1 bg-zinc-800/50 rounded-2xl p-3 border border-zinc-700/50">
                  <div className="flex items-center gap-2 text-pink-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs text-zinc-400">Date</span>
                  </div>
                  <div className="text-white font-semibold text-sm">{event.date || '28th Dec'}</div>
                </div>
                <div className="flex-1 bg-zinc-800/50 rounded-2xl p-3 border border-zinc-700/50">
                  <div className="flex items-center gap-2 text-pink-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs text-zinc-400">Time</span>
                  </div>
                  <div className="text-white font-semibold text-sm">{event.startTime}</div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-zinc-800/50 rounded-2xl p-3 border border-zinc-700/50">
                <div className="flex items-center gap-2 text-pink-400 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs text-zinc-400">Location</span>
                </div>
                <div className="text-white font-semibold text-sm">{event.location.name}</div>
              </div>

              {/* About */}
              <div>
                <h3 className="text-zinc-400 text-xs uppercase tracking-wider font-semibold mb-2">About</h3>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  {event.description || "Join us for an amazing event! Great vibes guaranteed 🔥"}
                </p>
              </div>

              {/* Attendees */}
              <div>
                <h3 className="text-zinc-400 text-xs uppercase tracking-wider font-semibold mb-3">
                  Who's Going • <span className="text-pink-400">{event.attendees}</span>
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {FRIEND_AVATARS.map((avatar, i) => (
                      <img
                        key={i}
                        src={avatar}
                        alt="Attendee"
                        className="w-9 h-9 rounded-full border-2 border-zinc-900 object-cover"
                      />
                    ))}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 border-2 border-zinc-900 flex items-center justify-center text-xs font-bold text-white">
                      +{Math.max(event.attendees - 5, 0)}
                    </div>
                  </div>
                  <span className="text-sm text-zinc-400">
                    <span className="text-pink-400 font-semibold">8 friends</span> going
                  </span>
                </div>
              </div>

              {/* Comments */}
              <div>
                <h3 className="text-zinc-400 text-xs uppercase tracking-wider font-semibold mb-3">
                  Comments • <span className="text-pink-400">{MOCK_COMMENTS.length}</span>
                </h3>
                <div className="space-y-3">
                  {MOCK_COMMENTS.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <img
                        src={comment.avatar}
                        alt={comment.user}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 bg-zinc-800/50 rounded-2xl rounded-tl-md p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium text-sm">{comment.user}</span>
                          <span className="text-zinc-500 text-xs">{comment.time}</span>
                        </div>
                        <p className="text-zinc-300 text-sm">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment Input */}
                <div className="relative mt-3">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-pink-500/50 transition-colors"
                  />
                  <button 
                    disabled={!commentText.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-pink-500 text-white disabled:opacity-30 transition-opacity"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/95 flex-shrink-0">
              <div className="flex gap-3">
                <button className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setLiked(!liked)}
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${
                    liked 
                      ? 'bg-pink-500/20 border-pink-500 text-pink-400' 
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-pink-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${liked ? 'fill-pink-400' : ''}`} />
                </button>
                <button
                  onClick={handleRsvp}
                  disabled={loading || isRsvped}
                  className={`flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    isRsvped
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-90'
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
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
