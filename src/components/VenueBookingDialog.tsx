import { X, Star, Download, QrCode, Users, IndianRupee } from 'lucide-react';
import { Venue } from '../types';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback'; // Adjust import

interface VenueBookingDialogProps {
  venue: Venue | null;
  open: boolean;
  onClose: () => void;
}

export function VenueBookingDialog({ venue, open, onClose }: VenueBookingDialogProps) {
  const [isBooked, setIsBooked] = useState(false);
  const [selectedHours, setSelectedHours] = useState(4);

  if (!venue) return null;

  const handleBook = () => {
    setIsBooked(true);
  };

  const handleCloseConfirmation = () => {
    setIsBooked(false);
    onClose();
  };

  const totalPrice = venue.pricePerHour * selectedHours;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
            onClick={!isBooked ? onClose : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {!isBooked ? (
            /* Booking Detail View */
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
                    src={venue.imageUrl}
                    alt={venue.name}
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
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                        <path d="M18 8h3M21 5v6M12 13v9M8 20h8M3 21l6-6M12 13l3 8 3-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.button>
                  </div>

                  {/* Venue Title & Rating Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h1 className="text-white text-3xl font-bold mb-2 drop-shadow-lg">
                          {venue.name}
                        </h1>
                        <p className="text-white/80 text-sm">{venue.category} • {venue.location}</p>
                      </div>
                      <motion.div
                        className="glass backdrop-blur-2xl px-4 py-2.5 rounded-2xl shadow-2xl ml-4 flex-shrink-0 border border-white/20"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="flex items-center gap-1.5">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-white text-lg font-semibold">{venue.rating}</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-6">
                  {/* Capacity & Price Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-foreground" />
                        <span className="text-muted-foreground text-xs">Capacity</span>
                      </div>
                      <div className="text-foreground text-2xl font-bold">{venue.capacity}</div>
                    </div>
                    <div className="glass backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <IndianRupee className="h-4 w-4 text-foreground" />
                        <span className="text-muted-foreground text-xs">Per Hour</span>
                      </div>
                      <div className="text-foreground text-2xl font-bold">₹{(venue.pricePerHour / 1000).toFixed(0)}k</div>
                    </div>
                  </div>

                  {/* About Section */}
                  <div>
                    <h3 className="text-foreground text-lg font-semibold mb-3">About this venue :</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {venue.name} is a premium {venue.category.toLowerCase()} located in {venue.location}.
                      Perfect for hosting memorable events with excellent amenities.
                    </p>
                  </div>

                  {/* Amenities */}
                  <div>
                    <h3 className="text-foreground text-lg font-semibold mb-3">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {venue.amenities.map((amenity, idx) => (
                        <div
                          key={idx}
                          className="glass backdrop-blur-xl px-3 py-2 rounded-full text-xs border border-white/10 text-foreground"
                        >
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hours Selection */}
                  <div className="glass backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-foreground text-sm font-medium">Number of hours</span>
                      <span className="text-muted-foreground text-xs">Min 2 hours</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.button
                        onClick={() => setSelectedHours(Math.max(2, selectedHours - 1))}
                        className="glass backdrop-blur-xl w-10 h-10 rounded-xl flex items-center justify-center border border-white/10"
                        whileTap={{ scale: 0.9 }}
                      >
                        <span className="text-foreground text-xl">−</span>
                      </motion.button>
                      <div className="flex-1 glass backdrop-blur-xl rounded-xl py-2 text-center border border-white/10">
                        <span className="text-foreground text-lg font-semibold">{selectedHours} hours</span>
                      </div>
                      <motion.button
                        onClick={() => setSelectedHours(Math.min(12, selectedHours + 1))}
                        className="glass backdrop-blur-xl w-10 h-10 rounded-xl flex items-center justify-center border border-white/10"
                        whileTap={{ scale: 0.9 }}
                      >
                        <span className="text-foreground text-xl">+</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Total Price Display */}
                  <div className="glass backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Total Price</span>
                      <span className="text-foreground text-2xl font-bold">₹{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="pb-6">
                    <motion.button
                      onClick={handleBook}
                      className="w-full rounded-2xl text-white font-semibold py-4 shadow-lg relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #FF5757 0%, #FF3D3D 100%)',
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="relative z-10">Book Venue</span>
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
          ) : (
            /* Booking Confirmation View */
            <motion.div
              className="fixed inset-0 z-50 max-w-lg mx-auto overflow-hidden flex flex-col"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex-1 overflow-y-auto scrollbar-hide p-6" style={{ background: '#4A2424' }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <motion.button
                    onClick={handleCloseConfirmation}
                    className="glass backdrop-blur-2xl w-10 h-10 rounded-full flex items-center justify-center border border-white/20"
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-5 w-5 text-white" />
                  </motion.button>
                  <h2 className="text-white text-xl font-semibold">Booking</h2>
                  <div className="w-10" />
                </div>

                {/* Booking Card */}
                <motion.div
                  className="relative mx-auto"
                  style={{ maxWidth: '340px' }}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Ticket Shape with Notches */}
                  <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl">
                    {/* Hero Image */}
                    <div className="relative h-48 overflow-hidden rounded-t-3xl">
                      <ImageWithFallback
                        src={venue.imageUrl}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>

                    {/* Notches */}
                    <div className="absolute left-0 top-48 -ml-4 w-8 h-8 rounded-full bg-[#4A2424]" />
                    <div className="absolute right-0 top-48 -mr-4 w-8 h-8 rounded-full bg-[#4A2424]" />

                    {/* Dashed Line */}
                    <div className="border-t-2 border-dashed border-gray-300" />

                    {/* Booking Details */}
                    <div className="p-6">
                      <h3 className="text-black text-lg font-bold text-center mb-1">
                        {venue.name}
                      </h3>
                      <p className="text-black/60 text-sm text-center mb-6">
                        {venue.category} • {venue.location}
                      </p>

                      {/* Date & Duration */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Date</div>
                          <div className="text-black font-semibold">Dec 29, 2024</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Duration</div>
                          <div className="text-black font-semibold">{selectedHours} hours</div>
                        </div>
                      </div>

                      {/* Capacity & Total */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Capacity</div>
                          <div className="text-black font-semibold">{venue.capacity} people</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Total</div>
                          <div className="text-black font-semibold">₹{totalPrice.toLocaleString()}</div>
                        </div>
                      </div>

                      {/* Barcode */}
                      <div className="border-t-2 border-dashed border-gray-300 pt-4">
                        <div className="flex justify-center">
                          <svg width="280" height="60" viewBox="0 0 280 60">
                            {[...Array(40)].map((_, i) => (
                              <rect
                                key={i}
                                x={i * 7}
                                y="0"
                                width={Math.random() > 0.5 ? 3 : 2}
                                height="60"
                                fill="black"
                              />
                            ))}
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <div className="mt-8 flex gap-3">
                  <motion.button
                    className="flex-1 rounded-2xl text-white font-semibold py-4 shadow-lg flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #FF5757 0%, #FF3D3D 100%)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="h-5 w-5" />
                    <span>Image</span>
                  </motion.button>

                  <motion.button
                    className="flex-1 bg-white rounded-2xl text-black font-semibold py-4 shadow-lg flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <QrCode className="h-5 w-5" />
                    <span>QR Code</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
