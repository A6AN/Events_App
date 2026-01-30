import { Star, Calendar, MapPin, X, Heart, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Use framer-motion in this project
import { Event } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback'; // Adjust based on file location
import { useState } from 'react';

interface EventDetailsSheetProps {
  event: Event | null;
  open: boolean;
  onClose: () => void;
  onBook?: () => void; // New prop for booking trigger
}

export function EventDetailsSheet({ event, open, onClose, onBook }: EventDetailsSheetProps) {
  const [isLiked, setIsLiked] = useState(false);

  if (!event) return null;

  // Format date
  const getFormattedDate = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    return { day, month, weekday };
  };

  const dateInfo = getFormattedDate();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Full Screen Detail Sheet */}
          <motion.div
            className="fixed inset-0 z-50 max-w-lg mx-auto overflow-hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="h-full overflow-y-auto scrollbar-hide bg-background">
              {/* Hero Image Section */}
              <div className="relative h-96">
                <ImageWithFallback
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute inset-0 grain opacity-30" />

                {/* Header Controls */}
                <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
                  <motion.button
                    onClick={onClose}
                    className="glass backdrop-blur-2xl w-10 h-10 rounded-full flex items-center justify-center border border-white/20"
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-5 w-5 text-white" />
                  </motion.button>

                  <motion.button
                    className="glass backdrop-blur-2xl w-10 h-10 rounded-full flex items-center justify-center border border-white/20"
                    whileTap={{ scale: 0.9 }}
                  >
                    {/* Share Icon placeholder */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                      <path d="M18 8h3M21 5v6M12 13v9M8 20h8M3 21l6-6M12 13l3 8 3-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.button>
                </div>

                {/* Event Title & Price Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-white text-3xl font-bold mb-2 drop-shadow-lg">
                        {event.title}
                      </h1>
                      <p className="text-white/80 text-sm">
                        {event.mood}: {event.location.name}
                      </p>
                    </div>
                    <motion.div
                      className="bg-white rounded-3xl px-5 py-3 shadow-2xl ml-4 flex-shrink-0"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-black text-xl font-bold">₹{event.price || '499'}</div>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 space-y-6">
                {/* Date & Time Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-1">
                      <div>
                        <div className="text-3xl font-bold text-foreground">{dateInfo.day}</div>
                        <div className="text-xs text-muted-foreground uppercase">{dateInfo.month}</div>
                      </div>
                      <div className="h-12 w-px bg-border" />
                      <div>
                        <div className="text-lg font-semibold text-foreground">{dateInfo.weekday}</div>
                        <div className="text-sm text-muted-foreground">{event.startTime}</div>
                      </div>
                    </div>
                  </div>
                  <motion.div
                    className="glass backdrop-blur-xl p-3 rounded-2xl border border-white/10"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Calendar className="h-6 w-6 text-foreground" />
                  </motion.div>
                </div>

                {/* About Section */}
                <div>
                  <h3 className="text-foreground text-lg font-semibold mb-3">About this event :</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Join us for {event.title} at {event.location.name}.
                    This is an amazing opportunity to experience live entertainment and connect with fellow enthusiasts.
                    The venue offers excellent atmosphere for all attendees.
                  </p>
                </div>

                {/* Description with Rating */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-foreground text-lg font-semibold">Description</h3>
                    <div className="flex items-center gap-1.5 glass backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-foreground text-sm font-medium">4.8</span>
                    </div>
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="glass backdrop-blur-xl w-6 h-6 rounded-full flex items-center justify-center border border-white/20 flex-shrink-0 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm flex-1">
                        {event.title} performance at {event.startTime}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="glass backdrop-blur-xl w-6 h-6 rounded-full flex items-center justify-center border border-white/20 flex-shrink-0 mt-0.5">
                        <Check className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm flex-1">
                        Meet and greet with hosts after the event
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="glass backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="glass backdrop-blur-xl w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10">
                      <MapPin className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="text-foreground text-sm font-medium mb-0.5">
                        {event.location.name}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {event.location.address}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex gap-3 pb-6">
                  <motion.button
                    onClick={() => setIsLiked(!isLiked)}
                    className="glass backdrop-blur-xl w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart
                      className={`h-6 w-6 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-foreground'
                        }`}
                    />
                  </motion.button>

                  <motion.button
                    onClick={onBook} // Trigger booking
                    className="flex-1 rounded-2xl text-white font-semibold py-4 shadow-lg relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #FF5757 0%, #FF3D3D 100%)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">Get a Ticket</span>
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                      }}
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
