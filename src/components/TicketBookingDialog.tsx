import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Calendar, MapPin, Clock, Ticket, CreditCard, CheckCircle, Users, Sparkles, X, Minus, Plus } from 'lucide-react';
import { TicketEvent } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';
import { motion } from 'framer-motion';

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
    setTimeout(() => {
      setIsBooked(false);
      setQuantity(1);
      onClose();
    }, 2500);
  };

  const totalPrice = ticket.price * quantity;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-b from-slate-900 to-slate-950 border-white/10 text-white max-w-md max-h-[90vh] overflow-hidden p-0 rounded-3xl">
        {!isBooked ? (
          <div className="flex flex-col max-h-[90vh]">
            {/* Header Image */}
            <div className="relative h-48 flex-shrink-0">
              <ImageWithFallback
                src={ticket.imageUrl}
                alt={ticket.title}
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
              
              {/* Category Badge */}
              <div className="absolute top-4 left-4 bg-pink-500 px-3 py-1.5 rounded-full shadow-lg shadow-pink-500/30">
                <span className="text-sm text-white font-bold">{ticket.category}</span>
              </div>

              {/* Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h2 className="text-2xl font-bold text-white">{ticket.title}</h2>
                <p className="text-pink-400 font-medium mt-1">{ticket.artist}</p>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Event Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <Calendar className="h-5 w-5 text-pink-400 mb-2" />
                  <div className="text-white font-medium text-sm">{ticket.date}</div>
                  <div className="text-white/50 text-xs">{ticket.time}</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <MapPin className="h-5 w-5 text-pink-400 mb-2" />
                  <div className="text-white font-medium text-sm truncate">{ticket.venue.split(',')[0]}</div>
                  <div className="text-white/50 text-xs truncate">{ticket.venue.split(',').slice(1).join(',')}</div>
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-pink-500/20">
                    <Users className="h-5 w-5 text-pink-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">{ticket.availableSeats} seats left</div>
                    <div className="text-white/50 text-xs">Book before they sell out!</div>
                  </div>
                </div>
                {ticket.availableSeats < 50 && (
                  <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold animate-pulse">
                    HOT 🔥
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              <div>
                <h4 className="text-sm text-white/50 mb-3">Number of Tickets</h4>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <Minus className="h-5 w-5 text-white" />
                  </button>
                  <span className="text-3xl font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <Plus className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white/60 text-sm">₹{ticket.price} × {quantity} ticket{quantity > 1 ? 's' : ''}</span>
                  <span className="text-white/60 text-sm">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-2xl font-bold text-pink-400">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-5 bg-gradient-to-t from-slate-950 to-transparent">
              <Button 
                onClick={handleBook}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-semibold text-base shadow-lg shadow-pink-500/30"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Book {quantity} Ticket{quantity > 1 ? 's' : ''} Now
              </Button>
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
              className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-6 shadow-xl shadow-pink-500/30"
            >
              <CheckCircle className="h-10 w-10 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h3>
            <p className="text-white/50 text-center">
              Your ticket{quantity > 1 ? 's have' : ' has'} been booked successfully.<br />
              Check your email for details.
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 mt-6 text-pink-400"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm">E-ticket sent to your email</span>
            </motion.div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
