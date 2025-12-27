import { Instagram, Edit2, Grid3X3, Calendar, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Event } from '../types';
import { ScrollArea } from './ui/scroll-area';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';

interface ProfileTabProps {
  events: Event[];
}

export function ProfileTab({ events }: ProfileTabProps) {
  const [activeTab, setActiveTab] = useState<'hosted' | 'attended'>('hosted');
  
  // Split events into hosted and attended (mock data)
  const hostedEvents = events.slice(0, 3);
  const attendedEvents = events.slice(3);

  return (
    <div className="h-full bg-background">
      <ScrollArea className="h-full relative">
        <div className="pb-20">
          {/* Profile Header - Modern minimalist */}
          <div className="p-6 border-b border-border/50 bg-background">
            {/* Profile Info Row */}
            <div className="flex items-start gap-5 mb-5">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-primary/30 ring-4 ring-primary/10">
                  <AvatarImage 
                    src="https://images.unsplash.com/photo-1667382136327-5f78dc5cf835?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjMzNzA5NzN8MA&ixlib=rb-4.1.0&q=80&w=1080" 
                    alt="Profile" 
                  />
                  <AvatarFallback className="bg-primary/20 text-primary">AM</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                  <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex-1 grid grid-cols-3 gap-3 pt-2">
                <div className="text-center">
                  <div className="text-foreground text-xl mb-0.5">{hostedEvents.length}</div>
                  <div className="text-muted-foreground text-xs">Hosted</div>
                </div>
                <div className="text-center">
                  <div className="text-foreground text-xl mb-0.5">{attendedEvents.length}</div>
                  <div className="text-muted-foreground text-xs">Attended</div>
                </div>
                <div className="text-center">
                  <div className="text-foreground text-xl mb-0.5">156</div>
                  <div className="text-muted-foreground text-xs">Friends</div>
                </div>
              </div>
            </div>

            {/* Name & Bio */}
            <div className="mb-4">
              <h1 className="text-foreground mb-1">Arjun Malhotra</h1>
              <p className="text-muted-foreground text-sm mb-2">Event Curator • Delhi</p>
              <p className="text-foreground text-sm leading-relaxed">
                🎉 Creating unforgettable experiences<br />
                📍 Hauz Khas • CP • Khan Market
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5">
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                className="bg-card border-border text-foreground hover:bg-muted rounded-xl h-11 px-4"
              >
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tab Selector - Modern segmented control */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-2xl border-b border-border/50">
            <div className="p-4 pb-0">
              <div className="bg-muted/30 p-1 rounded-2xl grid grid-cols-2 gap-1 mb-3">
                <button
                  onClick={() => setActiveTab('hosted')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-all relative ${
                    activeTab === 'hosted' 
                      ? 'text-primary-foreground' 
                      : 'text-muted-foreground'
                  }`}
                >
                  {activeTab === 'hosted' && (
                    <div className="absolute inset-0 bg-primary rounded-xl shadow-lg" />
                  )}
                  <Grid3X3 className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">Hosted</span>
                </button>
                <button
                  onClick={() => setActiveTab('attended')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-all relative ${
                    activeTab === 'attended' 
                      ? 'text-primary-foreground' 
                      : 'text-muted-foreground'
                  }`}
                >
                  {activeTab === 'attended' && (
                    <div className="absolute inset-0 bg-primary rounded-xl shadow-lg" />
                  )}
                  <Calendar className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">Attended</span>
                </button>
              </div>
            </div>
          </div>

          {/* Events Grid - Modern Bento */}
          <div className="p-2">
            {activeTab === 'hosted' && (
              <div className="grid grid-cols-3 gap-2">
                {hostedEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="aspect-square relative group cursor-pointer overflow-hidden rounded-2xl"
                  >
                    <ImageWithFallback
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
                      <div className="text-white text-center w-full">
                        <div className="text-xs mb-1 line-clamp-2">{event.title}</div>
                        <div className="text-[10px] text-primary">{event.attendees} attendees</div>
                      </div>
                    </div>
                    {/* Mood indicator */}
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary shadow-lg shadow-primary/50" />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'attended' && (
              <div className="grid grid-cols-3 gap-2">
                {attendedEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="aspect-square relative group cursor-pointer overflow-hidden rounded-2xl"
                  >
                    <ImageWithFallback
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
                      <div className="text-white text-center w-full">
                        <div className="text-xs mb-1 line-clamp-2">{event.title}</div>
                        <div className="text-[10px] text-primary">by {event.host.name}</div>
                      </div>
                    </div>
                    {/* Mood indicator */}
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary shadow-lg shadow-primary/50" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}