import { Building2, MapPin, Star, Users } from 'lucide-react';
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
            <p className="text-white/40 text-xs">Find the perfect spot</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-amber-500" />
          </div>
        </div>

        {/* Categories - Simple chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs transition-all ${selectedCategory === cat
                  ? 'bg-amber-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
            >
              {cat !== 'All' && categoryEmoji[cat]} {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Venues List */}
      <div className="flex-1 overflow-y-auto pb-24 px-4">
        <div className="space-y-4">
          {filteredVenues.map((venue, index) => (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleVenueClick(venue)}
              className="bg-white/[0.03] rounded-2xl overflow-hidden cursor-pointer group transition-all hover:bg-white/[0.06] hover:shadow-lg hover:shadow-amber-500/10"
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                <ImageWithFallback
                  src={venue.imageUrl}
                  alt={venue.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                {/* Rating */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full transition-all group-hover:bg-amber-500">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400 group-hover:fill-white group-hover:text-white" />
                  <span className="text-xs text-white font-medium">{venue.rating}</span>
                </div>

                {/* Info overlay */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-semibold text-base group-hover:text-amber-200 transition-colors">{venue.name}</h3>
                  <div className="flex items-center gap-1 text-white/70 text-xs mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {venue.location}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-white/60">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {venue.capacity}
                    </span>
                    <span className="text-amber-400 font-medium">₹{venue.pricePerHour.toLocaleString()}/hr</span>
                  </div>
                  <span className="text-amber-500 text-xs font-medium group-hover:translate-x-1 transition-transform">Book →</span>
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
