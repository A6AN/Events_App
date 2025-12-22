import { Ticket, Calendar, MapPin } from 'lucide-react';
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
      {/* Header */}
      <div className="flex-shrink-0 p-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">Live Events</h1>
            <p className="text-white/40 text-xs">Get your tickets</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <Ticket className="h-4 w-4 text-cyan-500" />
          </div>
        </div>

        {/* Categories - Simple chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs transition-all ${selectedCategory === cat
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="flex-1 overflow-y-auto pb-24 px-4">
        <div className="space-y-4">
          {filteredTickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => handleTicketClick(ticket)}
              className="bg-white/[0.03] rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
            >
              {/* Image */}
              <div className="relative h-44">
                <ImageWithFallback
                  src={ticket.imageUrl}
                  alt={ticket.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Category badge */}
                <div className="absolute top-3 right-3 bg-cyan-500 px-2.5 py-1 rounded-full">
                  <span className="text-[10px] text-white font-medium">{ticket.category}</span>
                </div>

                {/* Info overlay */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-semibold text-lg">{ticket.title}</h3>
                  <p className="text-cyan-400 text-sm">{ticket.artist}</p>
                </div>
              </div>

              {/* Details */}
              <div className="p-4">
                <div className="flex items-center gap-4 text-xs text-white/60 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {ticket.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {ticket.venue}
                  </span>
                </div>

                {/* Price row */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white/40 text-xs">From </span>
                    <span className="text-white font-bold text-lg">₹{ticket.price}</span>
                  </div>
                  <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                    Book Now
                  </button>
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
