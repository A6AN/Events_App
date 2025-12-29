import { Building2, MapPin, Star, Users, Sparkles } from 'lucide-react';
import { Venue } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';
import { VenueBookingDialog } from './VenueBookingDialog';
import { motion } from 'framer-motion';

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

  const categories = ['All', 'Banquet Hall', 'Rooftop', 'Restaurant', 'Garden'];
  const filteredVenues = selectedCategory === 'All'
    ? venues
    : venues.filter(v => v.category === selectedCategory);

  const handleVenueClick = (venue: Venue) => {
    setSelectedVenue(venue);
    setDialogOpen(true);
  };

  return (
    <div className="h-full bg-background overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">Venues</h1>
            <p className="text-white/50 text-xs">Find the perfect spot</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Building2 className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Categories - Redesigned Pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
          {categories.map((cat, index) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05, y: -2 }}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all backdrop-blur-sm border ${selectedCategory === cat
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/40 border-amber-400'
                : 'bg-zinc-900/80 text-white/70 hover:bg-zinc-800 hover:text-white border-white/10 hover:border-amber-500/30'
                }`}
            >
              {cat !== 'All' && <span className="mr-1.5">{categoryEmoji[cat]}</span>}
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Venues List */}
      <div className="flex-1 overflow-y-auto pb-24 px-4">
        <div className="space-y-4">
          {filteredVenues.map((venue, index) => (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{
                scale: 1.02,
                y: -4,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleVenueClick(venue)}
              className="relative bg-gradient-to-br from-white/10 to-white/5 rounded-2xl overflow-hidden cursor-pointer group border border-white/10 hover:border-amber-500/50 transition-all duration-300"
              style={{
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
              }}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/10 group-hover:to-orange-500/10 transition-all duration-300 rounded-2xl" />

              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <ImageWithFallback
                  src={venue.imageUrl}
                  alt={venue.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                {/* Rating - Glowing badge */}
                <motion.div
                  className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 group-hover:bg-amber-500 group-hover:border-amber-400 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 group-hover:fill-white group-hover:text-white transition-colors" />
                  <span className="text-sm text-white font-semibold">{venue.rating}</span>
                </motion.div>

                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg group-hover:text-amber-200 transition-colors">{venue.name}</h3>
                  <div className="flex items-center gap-1.5 text-white/70 text-sm mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {venue.location}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="relative p-4 bg-gradient-to-r from-transparent to-amber-500/5 group-hover:to-amber-500/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-white/70">
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
      </div>

      <VenueBookingDialog
        venue={selectedVenue}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
