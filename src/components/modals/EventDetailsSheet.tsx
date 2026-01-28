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

// Extract dominant color from image using canvas
const extractDominantColor = (imgElement: HTMLImageElement): Promise<{ r: number; g: number; b: number }> => {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ r: 139, g: 92, b: 246 }); // Fallback violet
        return;
      }

      // Sample at reduced size for performance
      const sampleSize = 50;
      canvas.width = sampleSize;
      canvas.height = sampleSize;

      ctx.drawImage(imgElement, 0, 0, sampleSize, sampleSize);
      const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;

      let r = 0, g = 0, b = 0, count = 0;

      // Sample every 4th pixel for speed
      for (let i = 0; i < imageData.length; i += 16) {
        const red = imageData[i];
        const green = imageData[i + 1];
        const blue = imageData[i + 2];

        // Skip very dark or very light pixels
        const brightness = (red + green + blue) / 3;
        if (brightness > 30 && brightness < 220) {
          r += red;
          g += green;
          b += blue;
          count++;
        }
      }

      if (count > 0) {
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        // Boost saturation for more vibrant theme
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const l = (max + min) / 2;

        if (max !== min) {
          const s = l > 127 ? (max - min) / (510 - max - min) : (max - min) / (max + min);
          const satBoost = 1.3;
          r = Math.min(255, Math.round(l + (r - l) * satBoost));
          g = Math.min(255, Math.round(l + (g - l) * satBoost));
          b = Math.min(255, Math.round(l + (b - l) * satBoost));
        }

        resolve({ r, g, b });
      } else {
        resolve({ r: 139, g: 92, b: 246 }); // Fallback violet
      }
    } catch (e) {
      resolve({ r: 139, g: 92, b: 246 }); // Fallback violet
    }
  });
};

// Lighten or darken a color
const adjustColor = (r: number, g: number, b: number, amount: number) => {
  return {
    r: Math.max(0, Math.min(255, r + amount)),
    g: Math.max(0, Math.min(255, g + amount)),
    b: Math.max(0, Math.min(255, b + amount)),
  };
};

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
  const [themeColor, setThemeColor] = useState({ r: 139, g: 92, b: 246 }); // Default violet
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (event && user && open) {
      checkRsvpStatus(event.id, user.id).then(setIsRsvped);
    }
    if (open) {
      setShowNotification(false);
    }
  }, [event, user, open]);

  // Extract color when image loads
  useEffect(() => {
    if (event?.imageUrl && open) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        extractDominantColor(img).then(setThemeColor);
      };
      img.src = event.imageUrl;
    }
  }, [event?.imageUrl, open]);

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

  // Generate color variations
  const { r, g, b } = themeColor;
  const primaryColor = `rgb(${r}, ${g}, ${b})`;
  const primaryColorLight = `rgba(${r}, ${g}, ${b}, 0.4)`;
  const primaryColorGlow = `rgba(${r}, ${g}, ${b}, 0.5)`;
  const darkerColor = adjustColor(r, g, b, -40);
  const gradientFrom = `rgb(${r}, ${g}, ${b})`;
  const gradientTo = `rgb(${darkerColor.r}, ${darkerColor.g}, ${darkerColor.b})`;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex flex-col">
        {/* Full Screen Container with Dynamic Gradient Background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, rgba(${r}, ${g}, ${b}, 0.6) 0%, rgba(${darkerColor.r}, ${darkerColor.g}, ${darkerColor.b}, 0.4) 30%, rgba(0, 0, 0, 1) 100%)`
          }}
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

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative flex-1 flex flex-col max-h-screen overflow-hidden"
        >
          {/* Hero Image Section */}
          <div className="relative h-[45vh] flex-shrink-0">
            <img
              ref={imgRef}
              src={event.imageUrl}
              alt={event.title}
              crossOrigin="anonymous"
              className="w-full h-full object-cover"
            />
            {/* Dynamic Gradient Overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, rgba(${r}, ${g}, ${b}, 0.3) 0%, transparent 40%, rgba(0, 0, 0, 0.9) 100%)`
              }}
            />

            {/* Top Navigation */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-11 h-11 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 shadow-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-11 h-11 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 shadow-lg"
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Image Dots Indicator */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
              <div className="w-2 h-2 rounded-full bg-white" />
              <div className="w-2 h-2 rounded-full bg-white/40" />
              <div className="w-2 h-2 rounded-full bg-white/40" />
            </div>
          </div>

          {/* Floating Info Card - Overlaps Image with Dynamic Color */}
          <div className="relative -mt-20 flex-1 flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 25 }}
              className="mx-4 mb-4 p-5 rounded-3xl backdrop-blur-2xl border border-white/20 shadow-2xl"
              style={{
                background: `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.7) 0%, rgba(${darkerColor.r}, ${darkerColor.g}, ${darkerColor.b}, 0.6) 100%)`
              }}
            >
              {/* Title Row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white leading-tight">{event.title}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin className="w-4 h-4 text-white/70" />
                    <span className="text-white/70 text-sm">{event.location.name}</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white text-zinc-900 font-bold text-sm rounded-full shadow-lg"
                >
                  + Follow
                </motion.button>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-white font-semibold">4.8 / 5.0</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-1.5 bg-white/10 text-white text-sm font-medium rounded-full border border-white/20">
                  #{event.mood}
                </span>
                <span className="px-4 py-1.5 bg-white/10 text-white text-sm font-medium rounded-full border border-white/20">
                  #Event
                </span>
                <span className="px-4 py-1.5 bg-white/10 text-white text-sm font-medium rounded-full border border-white/20">
                  #Trending
                </span>
              </div>
            </motion.div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-28">
              {/* About Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-5"
              >
                <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" style={{ color: primaryColor }} />
                  About
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  {event.description || "🔥 DIVINE is coming to Lucknow! The biggest bohemian music and art festival featuring live performances, art installations, street food, and the legendary rapper DIVINE headlining the night. Get ready for Gully Boy vibes!"}
                </p>
              </motion.div>

              {/* Date & Time */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex gap-3 mb-5"
              >
                <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-1" style={{ color: primaryColor }}>
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium">Date</span>
                  </div>
                  <div className="text-white font-semibold">{event.date || '28th December'}</div>
                </div>
                <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-1" style={{ color: primaryColor }}>
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-medium">Time</span>
                  </div>
                  <div className="text-white font-semibold">{event.startTime}</div>
                </div>
              </motion.div>

              {/* Who's Going */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-5"
              >
                <h3 className="text-white/70 text-xs uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" style={{ color: primaryColor }} />
                  Who's Going • <span style={{ color: primaryColor }}>{event.attendees}</span>
                </h3>
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="flex -space-x-3">
                    {FRIEND_AVATARS.map((avatar, i) => (
                      <motion.img
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.35 + i * 0.08 }}
                        src={avatar}
                        alt="Attendee"
                        className="w-10 h-10 rounded-full border-2 border-black/50 object-cover"
                      />
                    ))}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 }}
                      className="w-10 h-10 rounded-full border-2 border-black/50 flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
                    >
                      +{Math.max(event.attendees - 5, 245)}
                    </motion.div>
                  </div>
                  <span className="text-sm text-white/70">
                    <span style={{ color: primaryColor }} className="font-bold">8 friends</span> going
                  </span>
                </div>
              </motion.div>

              {/* Comments */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <h3 className="text-white/70 text-xs uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
                  <span style={{ color: primaryColor }}>💬</span>
                  Comments • <span style={{ color: primaryColor }}>{MOCK_COMMENTS.length}</span>
                </h3>
                <div className="space-y-3">
                  {MOCK_COMMENTS.map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex gap-3"
                    >
                      <img
                        src={comment.avatar}
                        alt={comment.user}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                        style={{ boxShadow: `0 0 0 2px ${primaryColorLight}` }}
                      />
                      <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-2xl rounded-tl-md p-3 border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm" style={{ color: primaryColor }}>{comment.user}</span>
                          <span className="text-white/40 text-xs">{comment.time}</span>
                        </div>
                        <p className="text-white/80 text-sm">{comment.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Comment Input */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="relative mt-4"
                >
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-14 text-sm text-white placeholder:text-white/40 focus:outline-none transition-all"
                    style={{
                      '--tw-ring-color': primaryColor,
                    } as React.CSSProperties}
                    onFocus={(e) => {
                      e.target.style.borderColor = primaryColor;
                      e.target.style.boxShadow = `0 0 0 2px ${primaryColorLight}`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    disabled={!commentText.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg text-white disabled:opacity-30 transition-all hover:scale-110 active:scale-95"
                    style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Fixed Bottom CTA with Dynamic Color */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent pt-8"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRsvp}
              disabled={loading || isRsvped}
              className="w-full h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-2xl text-white"
              style={{
                background: isRsvped
                  ? 'linear-gradient(135deg, rgb(16, 185, 129), rgb(34, 197, 94))'
                  : `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                boxShadow: isRsvped
                  ? '0 10px 40px rgba(16, 185, 129, 0.4)'
                  : `0 10px 40px ${primaryColorGlow}`
              }}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isRsvped ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  You're In!
                </>
              ) : (
                'Book Now'
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.getElementById('app-container') || document.body
  );
};
