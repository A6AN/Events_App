import { Calendar, X, Download, QrCode, Check } from 'lucide-react';
import { TicketEvent } from '../types';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback'; // Adjust path if needed

interface TicketBookingDialogProps {
  ticket: TicketEvent | null; // Or generic Event
  open: boolean;
  onClose: () => void;
}

export function TicketBookingDialog({ ticket, open, onClose }: TicketBookingDialogProps) {
  const [isBooked, setIsBooked] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState(2);

  if (!ticket) return null;

  const handleBook = () => {
    setIsBooked(true);
  };

  const handleCloseConfirmation = () => {
    setIsBooked(false);
    onClose();
  };

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
                    src={ticket.imageUrl}
                    alt={ticket.title}
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
                      {/* Share Icon */}
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
                          {ticket.title}
                        </h1>
                        <p className="text-white/80 text-sm">
                          {ticket.category}: {ticket.venue}
                        </p>
                      </div>
                      <motion.div
                        className="bg-white rounded-3xl px-5 py-3 shadow-2xl ml-4 flex-shrink-0"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="text-black text-xl font-bold">₹{ticket.price}</div>
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
                          <div className="text-3xl font-bold text-foreground">29</div>
                          <div className="text-xs text-muted-foreground uppercase">December</div>
                        </div>
                        <div className="h-12 w-px bg-border" />
                        <div>
                          <div className="text-lg font-semibold text-foreground">Tuesday</div>
                          <div className="text-sm text-muted-foreground">{ticket.time} - End</div>
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
                      Experience {ticket.title} live at {ticket.venue}.
                      An unforgettable evening of entertainment and connection.
                    </p>
                  </div>

                  {/* Description with Rating */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-foreground text-lg font-semibold">Description</h3>
                      <div className="flex items-center gap-1.5 glass backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10">
                        <svg className="h-4 w-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
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
                          {ticket.title} performance at {ticket.time}
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="glass backdrop-blur-xl w-6 h-6 rounded-full flex items-center justify-center border border-white/20 flex-shrink-0 mt-0.5">
                          <Check className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-sm flex-1">
                          Meet and greet opportunities available
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Seats Available */}
                  <div className="glass backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-foreground text-sm font-medium">Number of tickets</span>
                      <span className="text-muted-foreground text-xs">{ticket.availableSeats} available</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.button
                        onClick={() => setSelectedSeats(Math.max(1, selectedSeats - 1))}
                        className="glass backdrop-blur-xl w-10 h-10 rounded-xl flex items-center justify-center border border-white/10"
                        whileTap={{ scale: 0.9 }}
                      >
                        <span className="text-foreground text-xl">−</span>
                      </motion.button>
                      <div className="flex-1 glass backdrop-blur-xl rounded-xl py-2 text-center border border-white/10">
                        <span className="text-foreground text-lg font-semibold">{selectedSeats}</span>
                      </div>
                      <motion.button
                        onClick={() => setSelectedSeats(Math.min(10, selectedSeats + 1))}
                        className="glass backdrop-blur-xl w-10 h-10 rounded-xl flex items-center justify-center border border-white/10"
                        whileTap={{ scale: 0.9 }}
                      >
                        <span className="text-foreground text-xl">+</span>
                      </motion.button>
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
                      <span className="relative z-10">Confirm Booking</span>
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
            /* Ticket Confirmation View */
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
                  <h2 className="text-white text-xl font-semibold">Tickets</h2>
                  <div className="w-10" />
                </div>

                {/* Ticket Card */}
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
                        src={ticket.imageUrl}
                        alt={ticket.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>

                    {/* Notches */}
                    <div className="absolute left-0 top-48 -ml-4 w-8 h-8 rounded-full bg-[#4A2424]" />
                    <div className="absolute right-0 top-48 -mr-4 w-8 h-8 rounded-full bg-[#4A2424]" />

                    {/* Dashed Line */}
                    <div className="border-t-2 border-dashed border-gray-300" />

                    {/* Ticket Details */}
                    <div className="p-6">
                      <h3 className="text-black text-lg font-bold text-center mb-1">
                        {ticket.title}
                      </h3>
                      <p className="text-black/60 text-sm text-center mb-6">
                        {ticket.venue}
                      </p>

                      {/* Date & Time */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Date</div>
                          <div className="text-black font-semibold">Dec 29, 2024</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Time</div>
                          <div className="text-black font-semibold">{ticket.time}</div>
                        </div>
                      </div>

                      {/* Venue & Seat */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Location</div>
                          <div className="text-black font-semibold truncate">{ticket.venue}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Quantity</div>
                          <div className="text-black font-semibold">{selectedSeats} Tickets</div>
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
