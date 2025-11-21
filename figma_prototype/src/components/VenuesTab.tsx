import { Building2, MapPin, Star, Users, IndianRupee, Sparkles } from 'lucide-react';
import { Badge } from './ui/badge';
import { Venue } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ScrollArea } from './ui/scroll-area';
import { useState } from 'react';
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
  
  const categories = ['All', 'Banquet Hall', 'Rooftop', 'Restaurant', 'Garden', 'Conference Room'];
  const filteredVenues = selectedCategory === 'All' 
    ? venues 
    : venues.filter(v => v.category === selectedCategory);

  const handleVenueClick = (venue: Venue) => {
    setSelectedVenue(venue);
    setDialogOpen(true);
  };

  return (
    <div className="h-full bg-background">
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-xl border-b border-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <Building2 className="h-7 w-7 text-primary" />
              <Sparkles className="h-3 w-3 text-primary absolute -top-1 -right-1" />
            </div>
            <h1 className="text-3xl text-foreground">
              Premium Venues
            </h1>
          </div>
          
          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant="outline"
                className={`cursor-pointer px-3 py-2 whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:bg-muted'
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat !== 'All' && <span className="mr-1">{categoryEmoji[cat as keyof typeof categoryEmoji]}</span>}
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        {/* Venues Grid */}
        <ScrollArea className="flex-1">
          <div className="p-4 grid grid-cols-1 gap-5">
            {filteredVenues.map((venue) => (
              <div 
                key={venue.id}
                onClick={() => handleVenueClick(venue)}
                className="group relative bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50"
              >
                {/* Image with overlay */}
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={venue.imageUrl}
                    alt={venue.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  
                  {/* Rating badge */}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-primary/50 shadow-lg">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="text-white">{venue.rating}</span>
                    </div>
                  </div>

                  {/* Category badge */}
                  <div className="absolute top-4 left-4 bg-primary px-3 py-1.5 rounded-full text-primary-foreground text-xs shadow-lg">
                    {categoryEmoji[venue.category]} {venue.category}
                  </div>

                  {/* Venue name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white text-xl">{venue.name}</h3>
                    <div className="flex items-center gap-1.5 text-primary text-sm mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{venue.location}</span>
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-4 space-y-3">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground text-xs">Capacity</span>
                      </div>
                      <div className="text-foreground">{venue.capacity}</div>
                    </div>
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <IndianRupee className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground text-xs">Per Hour</span>
                      </div>
                      <div className="text-foreground">₹{venue.pricePerHour.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5">
                    {venue.amenities.map((amenity, idx) => (
                      <Badge 
                        key={idx}
                        className="bg-primary/10 text-primary border-primary/30 text-xs"
                      >
                        {amenity}
                      </Badge>
                    ))}
                  </div>

                  {/* View Details button */}
                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center group-hover:bg-primary/20 transition-all">
                    <div className="text-foreground">View Details & Book →</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
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
