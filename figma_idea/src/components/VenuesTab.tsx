import { Building2, MapPin, Star, Users, IndianRupee, Sparkles, Calendar, Search, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Venue } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useRef, useEffect } from 'react';
import { VenueBookingDialog } from './VenueBookingDialog';

interface VenuesTabProps {
  venues: Venue[];
}

const categoryEmoji = {
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
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const categories = ['All', 'Banquet Hall', 'Rooftop', 'Restaurant', 'Garden', 'Conference Room'];
  
  const filteredVenues = venues.filter(v => {
    const matchesCategory = selectedCategory === 'All' || v.category === selectedCategory;
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         v.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Track scroll for header shrinking
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      setIsScrolled(target.scrollTop > 50);
    };

    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll as any);
      return () => scrollContainer.removeEventListener('scroll', handleScroll as any);
    }
  }, []);

  const handleVenueClick = (venue: Venue) => {
    setSelectedVenue(venue);
    setDialogOpen(true);
  };

  return (
    <div className="h-full relative">
      <div className="relative h-full flex flex-col">
        {/* Shrinking Glass Header */}
        <motion.div 
          className="sticky top-0 z-20 glass backdrop-blur-3xl border-b border-white/10"
          animate={{
            paddingTop: isScrolled ? '12px' : '16px',
            paddingBottom: isScrolled ? '12px' : '0px',
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className="px-4">
            {/* Title - Hides on scroll */}
            <motion.div
              className="flex items-center justify-between overflow-hidden"
              animate={{
                height: isScrolled ? 0 : 'auto',
                opacity: isScrolled ? 0 : 1,
                marginBottom: isScrolled ? 0 : '16px',
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div>
                <h1 className="text-foreground mb-0.5">Venues</h1>
                <p className="text-muted-foreground text-xs">Premium event spaces across Delhi</p>
              </div>
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Building2 className="h-5 w-5 text-foreground/60" />
              </motion.div>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              className="relative mb-3 overflow-hidden"
              animate={{
                height: isScrolled ? 0 : 'auto',
                opacity: isScrolled ? 0 : 1,
                marginBottom: isScrolled ? 0 : '12px',
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="relative glass backdrop-blur-xl rounded-2xl border border-white/10">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search venues or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </motion.div>

            {/* Category Pills */}
            <motion.div 
              className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
              animate={{
                marginBottom: isScrolled ? '0px' : '16px',
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {categories.map((cat, idx) => {
                const isActive = selectedCategory === cat;
                return (
                  <motion.button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="relative px-4 py-2 whitespace-nowrap rounded-full text-sm overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeVenueCategory"
                        className="absolute inset-0 glass backdrop-blur-xl rounded-full border border-white/20"
                        style={{
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                        }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <div className={`relative z-10 flex items-center gap-2 font-medium ${
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {cat !== 'All' && (
                        <span className="text-base">{categoryEmoji[cat as keyof typeof categoryEmoji]}</span>
                      )}
                      <span>{cat}</span>
                    </div>
                    {!isActive && (
                      <div className="absolute inset-0 glass opacity-30" />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        </motion.div>

        {/* Venues Grid */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="space-y-3 pb-24">
            <AnimatePresence mode="wait">
              {filteredVenues.length > 0 ? (
                filteredVenues.map((venue, idx) => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    index={idx}
                    onClick={() => handleVenueClick(venue)}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 px-4"
                >
                  <div className="glass backdrop-blur-xl rounded-3xl p-8 text-center border border-white/10">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-foreground text-lg mb-2">No venues found</h3>
                    <p className="text-muted-foreground text-sm">Try adjusting your filters or search</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <VenueBookingDialog 
        venue={selectedVenue}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}

// Separate component for venue cards with full-bleed hero style
function VenueCard({ venue, index, onClick }: { venue: Venue; index: number; onClick: () => void }) {
  return (
    <motion.div
      className="cursor-pointer"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, type: 'spring' }}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
    >
      {/* Full-Bleed Hero Card */}
      <div className="relative overflow-hidden">
        {/* Hero Image */}
        <div className="relative h-80 overflow-hidden">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
          >
            <ImageWithFallback
              src={venue.imageUrl}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Multi-layer Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 grain opacity-30" />

          {/* Floating Rating Badge */}
          <motion.div
            className="absolute top-6 right-6 glass backdrop-blur-2xl px-3 py-2 rounded-2xl border border-white/20 shadow-2xl"
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.08 + 0.3 }}
            whileHover={{ scale: 1.1 }}
          >
            <div className="flex items-center gap-1.5">
              <Star 
                className="h-4 w-4 text-yellow-400 fill-yellow-400"
                style={{ 
                  filter: 'drop-shadow(0 0 4px rgba(250, 204, 21, 0.6))',
                }} 
              />
              <span className="text-white text-sm font-medium">{venue.rating}</span>
            </div>
          </motion.div>

          {/* Category Badge */}
          <motion.div
            className="absolute top-6 left-6 glass backdrop-blur-2xl px-4 py-2 rounded-2xl text-white text-sm border border-white/20 shadow-2xl"
            initial={{ opacity: 0, scale: 0.8, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: index * 0.08 + 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{categoryEmoji[venue.category as keyof typeof categoryEmoji]}</span>
              <span className="font-medium">{venue.category}</span>
            </div>
          </motion.div>

          {/* Venue Info Overlay */}
          <motion.div 
            className="absolute inset-x-0 bottom-0 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 + 0.4 }}
          >
            <h3 className="text-white text-2xl font-medium mb-3 drop-shadow-lg">
              {venue.name}
            </h3>
            <div className="flex items-center gap-2 text-white/90 mb-4">
              <MapPin className="h-4 w-4" />
              <span className="text-sm drop-shadow-md">{venue.location}</span>
            </div>

            {/* Stats Grid - Glass Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <motion.div
                className="glass backdrop-blur-2xl rounded-2xl p-4 border border-white/20"
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-white/80" />
                  <span className="text-white/60 text-xs">Capacity</span>
                </div>
                <div className="text-white text-lg font-medium">{venue.capacity}</div>
              </motion.div>

              <motion.div
                className="glass backdrop-blur-2xl rounded-2xl p-4 border border-white/20"
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <IndianRupee className="h-4 w-4 text-white/80" />
                  <span className="text-white/60 text-xs">Per Hour</span>
                </div>
                <div className="text-white text-lg font-medium">
                  ₹{venue.pricePerHour.toLocaleString()}
                </div>
              </motion.div>
            </div>

            {/* Amenities Pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {venue.amenities.slice(0, 4).map((amenity, idx) => (
                <motion.div
                  key={idx}
                  className="glass backdrop-blur-xl px-3 py-1.5 rounded-full text-xs border border-white/10 text-white/80"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.08 + 0.5 + idx * 0.05 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                >
                  {amenity}
                </motion.div>
              ))}
              {venue.amenities.length > 4 && (
                <motion.div
                  className="glass backdrop-blur-xl px-3 py-1.5 rounded-full text-xs border border-white/10 text-white/60"
                >
                  +{venue.amenities.length - 4} more
                </motion.div>
              )}
            </div>

            {/* CTA Button */}
            <motion.div
              className="glass backdrop-blur-2xl rounded-2xl p-4 text-center border border-white/30 text-white font-medium"
              whileHover={{ 
                scale: 1.02,
                borderColor: 'rgba(255, 255, 255, 0.5)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>View Details & Book</span>
                <span>→</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
