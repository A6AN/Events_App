import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Share2, Heart, CheckCircle, Sparkles, Send, Users, Star, ChevronLeft } from 'lucide-react';
import { Event } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { rsvpToEvent, checkRsvpStatus } from '../../lib/supabase';
import confetti from 'canvas-confetti';

interface EventDetailsSheetProps {
  event: Event | null;
  open: boolean;
  onClose: () => void;
}

// Extract dominant color from image
const extractDominantColor = (imgElement: HTMLImageElement): Promise<{ r: number; g: number; b: number }> => {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ r: 139, g: 92, b: 246 });
        return;
      }
      const sampleSize = 50;
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      ctx.drawImage(imgElement, 0, 0, sampleSize, sampleSize);
      const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;

      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < imageData.length; i += 16) {
        const red = imageData[i];
        const green = imageData[i + 1];
        const blue = imageData[i + 2];
        const brightness = (red + green + blue) / 3;
        if (brightness > 30 && brightness < 220) {
          r += red; g += green; b += blue; count++;
        }
      }
      if (count > 0) {
        resolve({ r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) });
      } else {
        resolve({ r: 139, g: 92, b: 246 });
      }
    } catch {
      resolve({ r: 139, g: 92, b: 246 });
    }
  });
};

const adjustColor = (r: number, g: number, b: number, amount: number) => ({
  r: Math.max(0, Math.min(255, r + amount)),
  g: Math.max(0, Math.min(255, g + amount)),
  b: Math.max(0, Math.min(255, b + amount)),
});

const FRIEND_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
];

const MOCK_COMMENTS = [
  { id: 1, user: 'Anshika', avatar: FRIEND_AVATARS[0], text: "Who's coming? 🙋‍♀️✨", time: '2h ago' },
  { id: 2, user: 'Rahul', avatar: FRIEND_AVATARS[3], text: "Can't wait for this! 🔥", time: '45m ago' }
];

export const EventDetailsSheet = ({ event, open, onClose }: EventDetailsSheetProps) => {
  const { user } = useAuth();
  const [isRsvped, setIsRsvped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [themeColor, setThemeColor] = useState({ r: 139, g: 92, b: 246 });

  useEffect(() => {
    if (event && user && open) {
      checkRsvpStatus(event.id, user.id).then(setIsRsvped);
    }
    if (open) setShowNotification(false);
  }, [event, user, open]);

  useEffect(() => {
    if (event?.imageUrl && open) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => extractDominantColor(img).then(setThemeColor);
      img.src = event.imageUrl;
    }
  }, [event?.imageUrl, open]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleRsvp = async () => {
    if (!event) return;
    setLoading(true);
    try {
      if (user) await rsvpToEvent(event.id, user.id);
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

  const { r, g, b } = themeColor;
  const darkerColor = adjustColor(r, g, b, -40);
  const primaryColor = `rgb(${r}, ${g}, ${b})`;
  const gradientFrom = `rgb(${r}, ${g}, ${b})`;
  const gradientTo = `rgb(${darkerColor.r}, ${darkerColor.g}, ${darkerColor.b})`;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Success Notification */}
          <AnimatePresence>
            {showNotification && (
              <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                className="absolute top-4 left-4 right-4 z-[10001]"
              >
                <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl p-4 shadow-2xl flex items-center gap-3 mx-auto max-w-sm">
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

          {/* Modal Container - Mobile sized */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[420px] h-[85vh] max-h-[800px] bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl z-[10000]"
            style={{ boxShadow: `0 0 80px ${primaryColor}40` }}
          >
            {/* Scrollable Content */}
            <div className="h-full overflow-y-auto">
              {/* Hero Image */}
              <div className="relative h-64 flex-shrink-0">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(to bottom, rgba(${r}, ${g}, ${b}, 0.3) 0%, transparent 40%, rgba(0, 0, 0, 0.95) 100%)` }}
                />

                {/* Top Navigation */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-10 h-10 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center text-white"
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Dots Indicator */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                </div>
              </div>

              {/* Info Card - Overlaps Image */}
              <div
                className="-mt-16 mx-4 p-5 rounded-2xl backdrop-blur-xl border border-white/10"
                style={{ background: `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.6) 0%, rgba(${darkerColor.r}, ${darkerColor.g}, ${darkerColor.b}, 0.5) 100%)` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white leading-tight">{event.title}</h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      <MapPin className="w-3.5 h-3.5 text-white/70" />
                      <span className="text-white/70 text-sm">{event.location.name}</span>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-white text-zinc-900 font-bold text-xs rounded-full">
                    + Follow
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-medium text-sm">4.8 / 5.0</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full">#{event.mood}</span>
                  <span className="px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full">#Event</span>
                  <span className="px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full">#Trending</span>
                </div>
              </div>

              {/* Content Sections */}
              <div className="px-4 py-4 pb-24 space-y-5">
                {/* About */}
                <div>
                  <h3 className="text-white font-bold text-base mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" style={{ color: primaryColor }} />
                    About
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {event.description || "🔥 The biggest bohemian music and art festival featuring live performances, art installations, street food, and legendary performances!"}
                  </p>
                </div>

                {/* Date & Time */}
                <div className="flex gap-3">
                  <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-1.5 mb-1" style={{ color: primaryColor }}>
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Date</span>
                    </div>
                    <div className="text-white font-semibold text-sm">{event.date || '28th December'}</div>
                  </div>
                  <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-1.5 mb-1" style={{ color: primaryColor }}>
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Time</span>
                    </div>
                    <div className="text-white font-semibold text-sm">{event.startTime}</div>
                  </div>
                </div>

                {/* Who's Going */}
                <div>
                  <h3 className="text-white/60 text-xs uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                    Who's Going • <span style={{ color: primaryColor }}>{event.attendees}</span>
                  </h3>
                  <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
                    <div className="flex -space-x-2">
                      {FRIEND_AVATARS.slice(0, 4).map((avatar, i) => (
                        <img key={i} src={avatar} alt="" className="w-8 h-8 rounded-full border-2 border-zinc-950 object-cover" />
                      ))}
                      <div
                        className="w-8 h-8 rounded-full border-2 border-zinc-950 flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
                      >+{event.attendees - 4}</div>
                    </div>
                    <span className="text-sm text-white/60">
                      <span style={{ color: primaryColor }} className="font-bold">8 friends</span> going
                    </span>
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <h3 className="text-white/60 text-xs uppercase tracking-wider font-bold mb-2">
                    💬 Comments • {MOCK_COMMENTS.length}
                  </h3>
                  <div className="space-y-2">
                    {MOCK_COMMENTS.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <img src={comment.avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        <div className="flex-1 bg-white/5 rounded-xl rounded-tl-sm p-2.5 border border-white/5">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-medium text-sm" style={{ color: primaryColor }}>{comment.user}</span>
                            <span className="text-white/30 text-xs">{comment.time}</span>
                          </div>
                          <p className="text-white/70 text-sm">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="relative mt-3">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-4 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                    />
                    <button
                      disabled={!commentText.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-white disabled:opacity-30"
                      style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Bottom CTA */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleRsvp}
                disabled={loading || isRsvped}
                className="w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 text-white shadow-xl"
                style={{
                  background: isRsvped
                    ? 'linear-gradient(135deg, rgb(16, 185, 129), rgb(34, 197, 94))'
                    : `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isRsvped ? (
                  <><CheckCircle className="w-5 h-5" /> You're In!</>
                ) : (
                  'Book Now'
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
