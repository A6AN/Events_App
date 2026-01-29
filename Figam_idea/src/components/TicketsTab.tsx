import { Ticket, Calendar, MapPin, Sparkles } from 'lucide-react';
import { Badge } from './ui/badge';
import { TicketEvent } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ScrollArea } from './ui/scroll-area';
import { useState } from 'react';
import { TicketBookingDialog } from './TicketBookingDialog';

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
    <div className="h-full bg-background">
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-xl border-b border-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <Ticket className="h-7 w-7 text-primary" />
              <Sparkles className="h-3 w-3 text-primary absolute -top-1 -right-1" />
            </div>
            <h1 className="text-3xl text-foreground">
              Live Events
            </h1>
          </div>
          
          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant="outline"
                className={`cursor-pointer px-4 py-2 whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:bg-muted'
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        {/* Tickets Grid */}
        <ScrollArea className="flex-1">
          <div className="p-4 grid grid-cols-1 gap-5">
            {filteredTickets.map((ticket) => (
              <div 
                key={ticket.id} 
                onClick={() => handleTicketClick(ticket)}
                className="group relative bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50"
              >
                {/* Image Container */}
                <div className="relative h-52 overflow-hidden">
                  <ImageWithFallback
                    src={ticket.imageUrl}
                    alt={ticket.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />
                  
                  {/* Floating category badge */}
                  <div className="absolute top-4 right-4 bg-primary px-3 py-1.5 rounded-full text-primary-foreground text-xs backdrop-blur-sm shadow-lg">
                    {ticket.category}
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white text-xl mb-1">{ticket.title}</h3>
                    <p className="text-primary text-sm">{ticket.artist}</p>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{ticket.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-xs truncate max-w-[120px]">{ticket.venue}</span>
                    </div>
                  </div>

                  {/* Price tag */}
                  <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="text-muted-foreground text-xs">From</div>
                      <div className="text-foreground text-2xl">₹{ticket.price}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-primary text-xs">{ticket.availableSeats} left</div>
                      <div className="text-foreground text-sm">Book Now →</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
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
