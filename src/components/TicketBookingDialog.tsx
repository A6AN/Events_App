import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Calendar, MapPin, Clock, Ticket, CreditCard, CheckCircle, Users, Sparkles, X, Minus, Plus, Zap } from 'lucide-react';
import { TicketEvent } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface TicketBookingDialogProps {
  ticket: TicketEvent | null;
  open: boolean;
  onClose: () => void;
}

export function TicketBookingDialog({ ticket, open, onClose }: TicketBookingDialogProps) {
  const [isBooked, setIsBooked] = useState(false);
  const [quantity, setQuantity] = useState(1);

  if (!ticket) return null;

  const handleBook = () => {
    setIsBooked(true);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => {
      setIsBooked(false);
      setQuantity(1);
      onClose();
    }, 2500);
  };

  const totalPrice = ticket.price * quantity;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-2 border-cyan-500/50 text-white max-w-md max-h-[90vh] overflow-hidden p-0 rounded-3xl shadow-2xl shadow-cyan-500/30">
        <AnimatePresence mode="wait">
          {!isBooked ? (
            <motion.div
              key="booking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col max-h-[90vh]"
            >
              {/* Header Image */}
              <div className="relative h-48 flex-shrink-0">
                <ImageWithFallback
                  src={ticket.imageUrl}
                  alt={ticket.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-zinc-900/80 backdrop-blur-sm hover:bg-cyan-500/80 transition-all hover:scale-110 flex items-center justify-center border border-white/10"
                >
                  <X className="h-5 w-5 text-white" />
                </button>

                {/* Category Badge */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="absolute top-4 left-4 bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1.5 rounded-full shadow-lg shadow-cyan-500/40 flex items-center gap-1"
                >
                  <Ticket className="h-3 w-3 text-white" />
                  <span className="text-sm text-white font-bold">{ticket.category}</span>
                </motion.div>

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h2 className="text-2xl font-bold text-white">{ticket.title}</h2>
                  <p className="text-cyan-400 font-semibold mt-1">{ticket.artist}</p>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-zinc-950">
                {/* Event Details */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-cyan-500/15 rounded-2xl p-4 border-2 border-cyan-500/40 shadow-lg shadow-cyan-500/10"
                  >
                    <Calendar className="h-5 w-5 text-cyan-400 mb-2" />
                    <div className="text-white font-bold text-sm">{ticket.date}</div>
                    <div className="text-cyan-300/70 text-xs">{ticket.time}</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-blue-500/15 rounded-2xl p-4 border-2 border-blue-500/40 shadow-lg shadow-blue-500/10"
                  >
                    <MapPin className="h-5 w-5 text-blue-400 mb-2" />
                    <div className="text-white font-bold text-sm truncate">{ticket.venue.split(',')[0]}</div>
                    <div className="text-blue-300/70 text-xs truncate">{ticket.venue.split(',').slice(1).join(',')}</div>
                  </motion.div>
                </div>

                {/* Availability */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between p-4 bg-zinc-900 rounded-2xl border-2 border-cyan-500/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 shadow-lg shadow-cyan-500/20">
                      <Users className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-white font-bold">{ticket.availableSeats} seats left</div>
                      <div className="text-cyan-300/60 text-xs">Book before they sell out!</div>
                    </div>
                  </div>
                  {ticket.availableSeats < 50 && (
                    <motion.span
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold flex items-center gap-1 shadow-lg shadow-red-500/30"
                    >
                      <Zap className="h-3 w-3" />
                      HOT
                    </motion.span>
                  )}
                </motion.div>

                {/* Quantity Selector */}
                <div>
                  <h4 className="text-sm text-cyan-300 font-medium mb-3">Number of Tickets</h4>
                  <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-2xl border-2 border-cyan-500/30">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 flex items-center justify-center hover:from-cyan-500/30 hover:to-blue-500/30 transition-all"
                    >
                      <Minus className="h-5 w-5 text-cyan-400" />
                    </motion.button>
                    <motion.span
                      key={quantity}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-4xl font-bold text-white"
                    >
                      {quantity}
                    </motion.span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 flex items-center justify-center hover:from-cyan-500/30 hover:to-blue-500/30 transition-all"
                    >
                      <Plus className="h-5 w-5 text-cyan-400" />
                    </motion.button>
                  </div>
                </div>

                {/* Pricing Summary */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="bg-gradient-to-br from-cyan-500/15 to-blue-500/15 border-2 border-cyan-500/40 rounded-2xl p-5 shadow-lg shadow-cyan-500/10"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-cyan-200/70 text-sm">₹{ticket.price} × {quantity} ticket{quantity > 1 ? 's' : ''}</span>
                    <span className="text-cyan-200/70 text-sm">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-cyan-500/30">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      ₹{totalPrice.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 p-5 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent border-t border-cyan-500/20">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleBook}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-lg shadow-xl shadow-cyan-500/40 border-0"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Book {quantity} Ticket{quantity > 1 ? 's' : ''} Now
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 px-8"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-6 shadow-2xl shadow-cyan-500/50"
              >
                <CheckCircle className="h-12 w-12 text-white" />
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-white mb-2"
              >
                Booking Confirmed! 🎉
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-zinc-400 text-center"
              >
                Your ticket{quantity > 1 ? 's have' : ' has'} been booked successfully.<br />
                Check your email for details.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/40"
              >
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span className="text-sm text-cyan-300">E-ticket sent to your email</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
