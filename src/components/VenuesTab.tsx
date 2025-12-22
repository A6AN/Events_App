import { Building2, MapPin, Star, Users, IndianRupee, Sparkles } from 'lucide-react';
import { Badge } from './ui/badge';
import { Venue } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';
import { VenueBookingDialog } from './VenueBookingDialog';
import { motion } from 'framer-motion';

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

  const categories = ['All', 'Banquet Hall', 'Rooftop', 'Restaurant', 'Garden', 'Conference Room'];
  const filteredVenues = selectedCategory === 'All'
    ? venues
    : venues.filter(v => v.category === selectedCategory);

  const handleVenueClick = (venue: Venue) => {
    setSelectedVenue(venue);
    setDialogOpen(true);
  };

  return (
    <div className="h-full bg-background overflow-hidden flex flex-col">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-background/80 backdrop-blur-2xl border-b border-white/5 p-4 z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <Sparkles className="h-3 w-3 text-amber-500 absolute -top-1 -right-1" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Premium Venues</h1>
            <p className="text-white/40 text-xs">Book the perfect spot</p>
          </div>
        </div>

        {/* Category Pills - Scrollable */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === cat
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                }`}
            >
              {cat !== 'All' && <span className="mr-1.5">{categoryEmoji[cat as keyof typeof categoryEmoji]}</span>}
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Venues Grid - Scrollable */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-5">
          {filteredVenues.map((venue, index) => (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleVenueClick(venue)}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden cursor-pointer hover:border-amber-500/30 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/5"
            >
              {/* Image with overlay */}
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={venue.imageUrl}
                  alt={venue.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Rating badge */}
                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-500/30 flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span className="text-white font-medium">{venue.rating}</span>
                </div>

                {/* Category badge */}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 rounded-full text-white text-xs font-medium shadow-lg">
                  {categoryEmoji[venue.category as keyof typeof categoryEmoji]} {venue.category}
                </div>

                {/* Venue name overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white text-xl font-bold">{venue.name}</h3>
                  <div className="flex items-center gap-1.5 text-amber-400 text-sm mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{venue.location}</span>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="p-4 space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-white/50 text-xs">Capacity</span>
                    </div>
                    <div className="text-white font-bold text-lg">{venue.capacity}</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                        <IndianRupee className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-white/50 text-xs">Per Hour</span>
                    </div>
                    <div className="text-white font-bold text-lg">₹{venue.pricePerHour.toLocaleString()}</div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2">
                  {venue.amenities.slice(0, 4).map((amenity, idx) => (
                    <Badge
                      key={idx}
                      className="bg-white/5 text-white/70 border-white/10 text-xs"
                    >
                      {amenity}
                    </Badge>
                  ))}
                  {venue.amenities.length > 4 && (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                      +{venue.amenities.length - 4} more
                    </Badge>
                  )}
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between group-hover:from-amber-500/30 group-hover:to-orange-500/30 transition-all">
                  <span className="text-white font-medium">View Details</span>
                  <span className="text-amber-400 group-hover:translate-x-1 transition-transform">Book Now →</span>
                </div>
              </div>
            </motion.div>
          ))}
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
