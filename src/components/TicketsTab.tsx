import { Ticket, Calendar, MapPin, Sparkles } from 'lucide-react';
import { Badge } from './ui/badge';
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
    <div className="h-full bg-background overflow-hidden flex flex-col">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-background/80 backdrop-blur-2xl border-b border-white/5 p-4 z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Ticket className="h-5 w-5 text-white" />
            </div>
            <Sparkles className="h-3 w-3 text-cyan-500 absolute -top-1 -right-1" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Live Events</h1>
            <p className="text-white/40 text-xs">Get your tickets now</p>
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
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tickets Grid - Scrollable */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-5">
          {filteredTickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleTicketClick(ticket)}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden cursor-pointer hover:border-cyan-500/30 transition-all duration-500 hover:shadow-xl hover:shadow-cyan-500/5"
            >
              {/* Image Container */}
              <div className="relative h-52 overflow-hidden">
                <ImageWithFallback
                  src={ticket.imageUrl}
                  alt={ticket.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                {/* Floating category badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1.5 rounded-full text-white text-xs font-medium shadow-lg">
                  {ticket.category}
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white text-xl font-bold mb-1">{ticket.title}</h3>
                  <p className="text-cyan-400 text-sm font-medium">{ticket.artist}</p>
                </div>
              </div>

              {/* Details Section */}
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wider">Date</div>
                      <div className="text-white text-sm font-medium">{ticket.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wider">Venue</div>
                      <div className="text-white text-sm font-medium truncate max-w-[100px]">{ticket.venue}</div>
                    </div>
                  </div>
                </div>

                {/* Price tag */}
                <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-white/50 text-xs">From</div>
                    <div className="text-white text-2xl font-bold">₹{ticket.price}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-cyan-400 text-xs font-medium">{ticket.availableSeats} seats left</div>
                    <div className="text-white font-medium group-hover:translate-x-1 transition-transform">Book Now →</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Booking Dialog */}
      <TicketBookingDialog
        ticket={selectedTicket}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
