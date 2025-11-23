import { Instagram, Edit2, Grid3X3, Calendar, LogOut, Ticket } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Event } from '../types';
import { ScrollArea } from './ui/scroll-area';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserTickets } from '../lib/supabase';
import { TicketCard } from './tickets/TicketCard';

interface ProfileTabProps {
  events: Event[];
}

export function ProfileTab({ events }: ProfileTabProps) {
  const [activeTab, setActiveTab] = useState<'hosted' | 'attended'>('hosted');
  const { user, signOut } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);

  // Fetch tickets when tab is active
  useEffect(() => {
    if (user && activeTab === 'attended') {
      getUserTickets(user.id).then(setTickets);
    }
  }, [user, activeTab]);

  // Filter hosted events (mock logic for now, ideally fetch from DB)
  const hostedEvents = events.filter(e => e.host.id === user?.id);

  return (
    <div className="h-full bg-background">
      <ScrollArea className="h-full relative">
        <div className="pb-20">
          {/* Profile Header - Instagram Style */}
          <div className="p-4 border-b border-border bg-card/80 backdrop-blur-sm">
            {/* Profile Info Row */}
            <div className="flex items-center gap-4 mb-4">
              {/* Avatar */}
              <Avatar className="h-20 w-20 border-2 border-primary/30">
                <AvatarImage
                  src={user?.user_metadata?.avatar_url || "https://github.com/shadcn.png"}
                  alt="Profile"
                />
                <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>

              {/* Stats */}
              <div className="flex-1 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-foreground">{hostedEvents.length}</div>
                  <div className="text-muted-foreground text-xs">Hosted</div>
                </div>
                <div>
                  <div className="text-foreground">{tickets.length}</div>
                  <div className="text-muted-foreground text-xs">Tickets</div>
                </div>
                <div>
                  <div className="text-foreground">0</div>
                  <div className="text-muted-foreground text-xs">Followers</div>
                </div>
              </div>
            </div>

            {/* Name & Bio */}
            <div className="mb-3">
              <h1 className="text-foreground text-lg font-semibold">{user?.user_metadata?.full_name || 'User'}</h1>
              <p className="text-muted-foreground text-sm">Event Enthusiast</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground border-0"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button
                variant="outline"
                className="bg-card border-border text-foreground hover:bg-muted"
              >
                <Instagram className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="bg-card border-border text-destructive hover:bg-destructive/10"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tab Selector - Instagram Style */}
          <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-md border-b border-border grid grid-cols-2">
            <button
              onClick={() => setActiveTab('hosted')}
              className={`flex items-center justify-center gap-2 py-3 transition-colors relative ${activeTab === 'hosted'
                ? 'text-foreground'
                : 'text-muted-foreground'
                }`}
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="text-sm">Hosted</span>
              {activeTab === 'hosted' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('attended')}
              className={`flex items-center justify-center gap-2 py-3 transition-colors relative ${activeTab === 'attended'
                ? 'text-foreground'
                : 'text-muted-foreground'
                }`}
            >
              <Ticket className="h-4 w-4" />
              <span className="text-sm">My Tickets</span>
              {activeTab === 'attended' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>

          {/* Events Grid - Instagram Style */}
          <div className="p-1">
            {activeTab === 'hosted' && (
              <div className="grid grid-cols-3 gap-1">
                {hostedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="aspect-square relative group cursor-pointer overflow-hidden"
                  >
                    <ImageWithFallback
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                      <div className="text-white text-center">
                        <div className="text-xs mb-1">{event.title}</div>
                        <div className="text-[10px] text-gray-300">{event.attendees} attendees</div>
                      </div>
                    </div>
                    {/* Mood indicator */}
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                  </div>
                ))}
                {hostedEvents.length === 0 && (
                  <div className="col-span-3 py-10 text-center text-muted-foreground text-sm">
                    No events hosted yet.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'attended' && (
              <div className="p-4 space-y-4">
                {tickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    event={ticket.event}
                    ticketId={ticket.id}
                  />
                ))}
                {tickets.length === 0 && (
                  <div className="py-10 text-center text-muted-foreground text-sm">
                    You haven't RSVP'd to any events yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
