import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { MapPin, Users, IndianRupee, Star, CheckCircle, Calendar } from 'lucide-react';
import { Venue } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';
import { useState } from 'react';

interface VenueBookingDialogProps {
  venue: Venue | null;
  open: boolean;
  onClose: () => void;
}

export function VenueBookingDialog({ venue, open, onClose }: VenueBookingDialogProps) {
  const [isBooked, setIsBooked] = useState(false);

  if (!venue) return null;

  const handleBook = () => {
    setIsBooked(true);
    setTimeout(() => {
      setIsBooked(false);
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-foreground max-w-md max-h-[90vh] overflow-y-auto">
        {!isBooked ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-foreground">
                {venue.name}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Request a booking for this venue
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Venue Image */}
              <div className="relative h-48 rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={venue.imageUrl}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Rating */}
                <Badge className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white border-primary/50">
                  <Star className="h-3 w-3 fill-primary text-primary mr-1" />
                  {venue.rating}
                </Badge>

                {/* Category */}
                <div className="absolute bottom-3 left-3 text-white">
                  <div className="text-sm text-gray-300">{venue.category}</div>
                </div>
              </div>

              {/* Venue Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{venue.location}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Capacity: {venue.capacity} guests</span>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h4 className="text-sm text-muted-foreground mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {venue.amenities.map((amenity, idx) => (
                    <Badge 
                      key={idx}
                      variant="outline" 
                      className="bg-primary/10 text-primary border-primary/30"
                    >
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IndianRupee className="h-4 w-4 text-primary" />
                    <span className="text-sm">Per Hour</span>
                  </div>
                  <span className="text-2xl text-foreground">₹{venue.pricePerHour.toLocaleString()}</span>
                </div>
              </div>

              {/* Book Button */}
              <Button 
                onClick={handleBook}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Request Booking
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Our team will contact you to confirm availability
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-20 w-20 text-primary mb-4" />
            <h3 className="text-2xl mb-2 text-foreground">
              Request Submitted!
            </h3>
            <p className="text-muted-foreground text-center">
              Your booking request has been sent.<br />
              We'll contact you within 24 hours.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
