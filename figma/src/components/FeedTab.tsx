import { useState } from 'react';
import { Heart, MessageCircle, Users, Sparkles, Calendar, MapPin } from 'lucide-react';
import { Event, TicketEvent } from '../types';
import { ScrollArea } from './ui/scroll-area';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { TicketBookingDialog } from './TicketBookingDialog';

interface FeedTabProps {
  events: Event[];
  tickets: TicketEvent[];
  onEventSelect: (event: Event) => void;
}

export function FeedTab({ events, tickets, onEventSelect }: FeedTabProps) {
  const [activeTab, setActiveTab] = useState<'friends' | 'live'>('friends');
  const [selectedTicket, setSelectedTicket] = useState<TicketEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleTicketClick = (ticket: TicketEvent) => {
    setSelectedTicket(ticket);
    setDialogOpen(true);
  };

  return (
    <div className="h-full bg-background">
      <div className="relative h-full flex flex-col">
        {/* Modern Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-2xl border-b border-border/50">
          <div className="p-4 pb-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-foreground mb-0.5">Feed</h1>
                <p className="text-muted-foreground text-xs">
                  {activeTab === 'friends' ? "What's happening" : "Live around you"}
                </p>
              </div>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>

            {/* Segmented Control */}
            <div className="relative bg-muted/30 p-1 rounded-2xl flex gap-1 mb-4">
              <button
                onClick={() => setActiveTab('friends')}
                className={`flex-1 py-2.5 rounded-xl text-sm transition-all duration-300 relative ${
                  activeTab === 'friends'
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {activeTab === 'friends' && (
                  <div className="absolute inset-0 bg-primary rounded-xl shadow-lg" />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Users className="h-4 w-4" />
                  Friends
                </span>
              </button>
              <button
                onClick={() => setActiveTab('live')}
                className={`flex-1 py-2.5 rounded-xl text-sm transition-all duration-300 relative ${
                  activeTab === 'live'
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {activeTab === 'live' && (
                  <div className="absolute inset-0 bg-primary rounded-xl shadow-lg" />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Live
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          {activeTab === 'friends' ? (
            // Friends Feed
            <div className="p-4 space-y-4">
              {events.map((event, idx) => (
                <div 
                  key={event.id}
                  onClick={() => onEventSelect(event)}
                  className="group cursor-pointer"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* User Header */}
                  <div className="flex items-center gap-2.5 mb-3 px-1">
                    <Avatar className="h-9 w-9 border-2 border-primary/20 ring-2 ring-primary/10">
                      <AvatarImage src={event.host.avatar} alt={event.host.name} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {event.host.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-foreground text-sm">{event.host.name}</span>
                        <span className="text-muted-foreground text-xs">is hosting</span>
                      </div>
                      <span className="text-muted-foreground text-xs">{event.startTime}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="bg-primary/10 text-primary border-primary/20 text-xs px-2 py-0.5"
                    >
                      {event.mood}
                    </Badge>
                  </div>

                  {/* Event Card - Modern Bento Style */}
                  <div className="relative bg-card rounded-3xl overflow-hidden border border-border/50 group-hover:border-primary/30 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/5 group-hover:-translate-y-1">
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <ImageWithFallback
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      
                      {/* Event Info */}
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <h3 className="text-white text-lg mb-1.5 line-clamp-1">{event.title}</h3>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1.5 text-primary">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="text-xs">{event.location.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-300">
                            <Users className="h-3.5 w-3.5" />
                            <span className="text-xs">{event.attendees}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interaction Bar */}
                    <div className="p-4 flex items-center justify-between bg-card/50 backdrop-blur-sm">
                      <div className="flex items-center gap-5 text-muted-foreground">
                        <button className="flex items-center gap-1.5 hover:text-primary transition-colors group/btn">
                          <Heart className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                          <span className="text-sm">{Math.floor(Math.random() * 50) + 10}</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-primary transition-colors group/btn">
                          <MessageCircle className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                          <span className="text-sm">{Math.floor(Math.random() * 20) + 5}</span>
                        </button>
                      </div>
                      <div className="text-primary text-xs group-hover:gap-2 flex items-center gap-1 transition-all">
                        View
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Live Events
            <div className="p-4 space-y-4">
              {tickets.map((ticket, idx) => (
                <div 
                  key={ticket.id} 
                  onClick={() => handleTicketClick(ticket)}
                  className="group relative bg-card border border-border/50 rounded-3xl overflow-hidden cursor-pointer hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <ImageWithFallback
                      src={ticket.imageUrl}
                      alt={ticket.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-primary-foreground text-xs shadow-xl">
                      {ticket.category}
                    </div>

                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-white text-lg mb-1">{ticket.title}</h3>
                      <p className="text-primary text-sm">{ticket.artist}</p>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs">{ticket.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs truncate">{ticket.venue}</span>
                      </div>
                    </div>

                    {/* Price Card */}
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <div className="text-muted-foreground text-xs mb-0.5">Starting at</div>
                        <div className="text-foreground text-2xl">₹{ticket.price}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-primary text-xs mb-1">{ticket.availableSeats} seats left</div>
                        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm hover:bg-primary/90 transition-colors">
                          Book →
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
