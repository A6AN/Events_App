import { Building2, MapPin, Star, Users, Sparkles } from 'lucide-react';
import { Venue } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useRef, useEffect } from 'react';
import { VenueBookingDialog } from './VenueBookingDialog';
import { motion, AnimatePresence } from 'framer-motion';

interface VenuesTabProps {
  venues: Venue[];
}

const categoryEmoji: Record<string, string> = {
  'Banquet Hall': '🏛️',
  'Rooftop': '🌆',
  'Restaurant': '🍽️',
  'Garden': '🌳',
  'Conference Room': '💼'
};

export function VenuesTab({ venues }: VenuesTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Track scroll for header shrink
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => setIsScrolled(el.scrollTop > 50);
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = ['All', 'Banquet Hall', 'Rooftop', 'Restaurant', 'Garden'];
  const filteredVenues = selectedCategory === 'All'
    ? venues
    : venues.filter(v => v.category === selectedCategory);

  const handleVenueClick = (venue: Venue) => {
    setSelectedVenue(venue);
    setDialogOpen(true);
  };

  return (
    <div className="h-full bg-transparent overflow-hidden flex flex-col">
      {/* Header - Shrinks on scroll */}
      <motion.div
        className="flex-shrink-0 px-4 pt-4 pb-3"
        animate={{
          paddingTop: isScrolled ? '8px' : '16px',
          paddingBottom: isScrolled ? '8px' : '12px'
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Title Section - Hides on scroll */}
        <AnimatePresence>
          {!isScrolled && (
            <motion.div
              initial={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="flex items-center justify-between mb-4 overflow-hidden"
            >
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Venues</h1>
                <p className="text-white/40 text-sm mt-0.5">Find the perfect spot</p>
              </div>
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B, #EA580C)',
                  boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)'
                }}
              >
                <Building2 className="h-5 w-5 text-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories - Glass horizontal scroll */}
        <motion.div
          className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1"
          layout
        >
          {categories.map((cat, index) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedCategory === cat
                ? 'text-white shadow-lg'
                : 'text-white/60 hover:text-white border border-white/10 hover:border-white/20'
                }`}
              style={selectedCategory === cat ? {
                background: 'linear-gradient(135deg, #F59E0B, #EA580C)',
                boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)'
              } : {
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)'
              }}
            >
              {cat !== 'All' && <span className="mr-1.5">{categoryEmoji[cat]}</span>}
              {cat}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* Venues List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-24 px-4">
        {filteredVenues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(234, 88, 12, 0.2))' }}
            >
              <Building2 className="w-8 h-8 text-amber-400/50" />
            </div>
            <h3 className="text-white/70 font-medium mb-1">No venues found</h3>
            <p className="text-white/40 text-sm">Try selecting a different category</p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {filteredVenues.map((venue, index) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, type: "spring", stiffness: 400, damping: 30 }}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleVenueClick(venue)}
                className="relative bg-zinc-900/80 rounded-2xl overflow-hidden cursor-pointer group border border-white/5 hover:border-amber-500/30 transition-all"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/10 group-hover:to-orange-500/5 transition-all duration-300 rounded-2xl pointer-events-none" />

                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <ImageWithFallback
                    src={venue.imageUrl}
                    alt={venue.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />

                  {/* Rating Badge */}
                  <motion.div
                    className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 group-hover:bg-amber-500 group-hover:border-amber-400 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 group-hover:fill-white group-hover:text-white transition-colors" />
                    <span className="text-sm text-white font-semibold">{venue.rating}</span>
                  </motion.div>

                  {/* Info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-lg group-hover:text-amber-200 transition-colors">{venue.name}</h3>
                    <div className="flex items-center gap-1.5 text-white/60 text-sm mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {venue.location}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="relative p-4 bg-gradient-to-r from-transparent to-amber-500/5 group-hover:to-amber-500/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" /> {venue.capacity}
                      </span>
                      <span className="text-amber-400 font-bold">₹{venue.pricePerHour.toLocaleString()}/hr</span>
                    </div>

                    {/* Book button with glow */}
                    <motion.span
                      className="flex items-center gap-1 text-amber-400 font-semibold text-sm group-hover:text-amber-300"
                      whileHover={{ x: 3 }}
                    >
                      <Sparkles className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      Book Now →
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <VenueBookingDialog
        venue={selectedVenue}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
