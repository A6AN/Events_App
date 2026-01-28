import { Ticket, Calendar, MapPin, Zap } from 'lucide-react';
import { TicketEvent } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';
import { TicketBookingDialog } from './TicketBookingDialog';
import { motion } from 'framer-motion';

interface TicketsTabProps {
  tickets: TicketEvent[];
}

export function TicketsTab({ tickets }: TicketsTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTicket, setSelectedTicket] = useState<TicketEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const categories = ['All', 'Concert', 'Comedy', 'DJ Night', 'Festival'];
  const filteredTickets = selectedCategory === 'All'
    ? tickets
    : tickets.filter(t => t.category === selectedCategory);

  const handleTicketClick = (ticket: TicketEvent) => {
    setSelectedTicket(ticket);
    setDialogOpen(true);
  };

  return (
    <div className="h-full bg-transparent overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">Live Events</h1>
            <p className="text-white/50 text-xs">Get your tickets</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Ticket className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Categories - Pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="flex-1 overflow-y-auto pb-24 px-4">
        <div className="space-y-4">
          {filteredTickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{
                scale: 1.02,
                y: -4,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTicketClick(ticket)}
              className="relative bg-black/40 backdrop-blur-xl rounded-2xl overflow-hidden cursor-pointer group border border-white/10 hover:border-cyan-500/50 transition-all duration-300"
              style={{
                boxShadow: '0 4px 30px rgba(0,0,0,0.4)'
              }}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300 rounded-2xl" />

              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={ticket.imageUrl}
                  alt={ticket.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Category badge - Glowing */}
                <motion.div
                  className="absolute top-3 right-3 bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1.5 rounded-full shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 transition-all"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-xs text-white font-semibold">{ticket.category}</span>
                </motion.div>

                {/* Hot badge for popular events */}
                {ticket.availableSeats < 50 && (
                  <div className="absolute top-3 left-3 bg-red-500 px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                    <Zap className="h-3 w-3 text-white fill-white" />
                    <span className="text-[10px] text-white font-bold">HOT</span>
                  </div>
                )}

                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-xl group-hover:text-cyan-200 transition-colors">{ticket.title}</h3>
                  <p className="text-cyan-400 text-sm font-medium mt-1">{ticket.artist}</p>
                </div>
              </div>

              {/* Details */}
              <div className="relative p-4 bg-gradient-to-r from-transparent to-cyan-500/5 group-hover:to-cyan-500/10 transition-colors">
                <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> {ticket.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {ticket.venue}
                  </span>
                </div>

                {/* Price row */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white/50 text-sm">From </span>
                    <span className="text-white font-bold text-xl">₹{ticket.price}</span>
                  </div>

                  {/* Book Now button with strong glow */}
                  <motion.button
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 group-hover:shadow-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Book Now
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <TicketBookingDialog
        ticket={selectedTicket}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
