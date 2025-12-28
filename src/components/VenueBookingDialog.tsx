import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { MapPin, Users, Star, CheckCircle, Calendar, Clock, Sparkles, X } from 'lucide-react';
import { Venue } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface VenueBookingDialogProps {
  venue: Venue | null;
  open: boolean;
  onClose: () => void;
}

export function VenueBookingDialog({ venue, open, onClose }: VenueBookingDialogProps) {
  const [isBooked, setIsBooked] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(2);

  if (!venue) return null;

  const handleBook = () => {
    setIsBooked(true);
    setTimeout(() => {
      setIsBooked(false);
      onClose();
    }, 2500);
  };

  const totalPrice = venue.pricePerHour * duration;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-b from-slate-900 to-slate-950 border-white/10 text-white max-w-md max-h-[90vh] overflow-hidden p-0 rounded-3xl">
        {!isBooked ? (
          <div className="flex flex-col max-h-[90vh]">
            {/* Header Image */}
            <div className="relative h-52 flex-shrink-0">
              <ImageWithFallback
                src={venue.imageUrl}
                alt={venue.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
              
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
              
              {/* Rating */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-amber-500 px-3 py-1.5 rounded-full shadow-lg shadow-amber-500/30">
                <Star className="h-4 w-4 text-white fill-white" />
                <span className="text-sm text-white font-bold">{venue.rating}</span>
              </div>

              {/* Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="text-amber-400 text-sm font-medium">{venue.category}</span>
                <h2 className="text-2xl font-bold text-white mt-1">{venue.name}</h2>
                <div className="flex items-center gap-2 text-white/60 text-sm mt-2">
                  <MapPin className="h-4 w-4 text-amber-400" />
                  {venue.location}
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Quick Info */}
              <div className="flex gap-3">
                <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10">
                  <Users className="h-5 w-5 text-amber-400 mb-2" />
                  <div className="text-white font-semibold">{venue.capacity}</div>
                  <div className="text-white/50 text-xs">Max Guests</div>
                </div>
                <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10">
                  <Clock className="h-5 w-5 text-amber-400 mb-2" />
                  <div className="text-white font-semibold">₹{venue.pricePerHour.toLocaleString()}</div>
                  <div className="text-white/50 text-xs">Per Hour</div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h4 className="text-sm text-white/50 mb-3">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {venue.amenities.map((amenity, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-4">
                <h4 className="text-sm text-white/50">Booking Details</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs text-white/50">Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-amber-500/50 outline-none transition-colors [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/50">Time</label>
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-amber-500/50 outline-none transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-white/50">Duration (hours)</label>
                  <div className="flex gap-2">
                    {[2, 4, 6, 8].map((hours) => (
                      <button
                        key={hours}
                        onClick={() => setDuration(hours)}
                        className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                          duration === hours
                            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                            : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {hours}h
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white/60 text-sm">₹{venue.pricePerHour.toLocaleString()} × {duration} hours</span>
                  <span className="text-white/60 text-sm">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-2xl font-bold text-amber-400">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-5 bg-gradient-to-t from-slate-950 to-transparent">
              <Button 
                onClick={handleBook}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold text-base shadow-lg shadow-amber-500/30"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Request Booking
              </Button>
              <p className="text-xs text-white/40 text-center mt-3">
                Our team will contact you to confirm availability
              </p>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 px-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6 shadow-xl shadow-amber-500/30"
            >
              <CheckCircle className="h-10 w-10 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">Request Submitted!</h3>
            <p className="text-white/50 text-center">
              Your booking request has been sent.<br />
              We'll contact you within 24 hours.
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 mt-6 text-amber-400"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm">Confirmation coming soon</span>
            </motion.div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
