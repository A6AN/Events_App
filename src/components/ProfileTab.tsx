import { Instagram, Edit2, Grid3X3, Calendar } from 'lucide-react';
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
          {/* Profile Header - Instagram Style */}
          <div className="p-4 border-b border-border bg-card/80 backdrop-blur-sm">
            {/* Profile Info Row */}
            <div className="flex items-center gap-4 mb-4">
              {/* Avatar */}
              <Avatar className="h-20 w-20 border-2 border-primary/30">
                <AvatarImage 
                  src="https://images.unsplash.com/photo-1667382136327-5f78dc5cf835?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjMzNzA5NzN8MA&ixlib=rb-4.1.0&q=80&w=1080" 
                  alt="Profile" 
                />
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
              
              {/* Stats */}
              <div className="flex-1 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-foreground">{hostedEvents.length}</div>
                  <div className="text-muted-foreground text-xs">Hosted</div>
                </div>
                <div>
                  <div className="text-foreground">{attendedEvents.length}</div>
                  <div className="text-muted-foreground text-xs">Attended</div>
                </div>
                <div>
                  <div className="text-foreground">156</div>
                  <div className="text-muted-foreground text-xs">Friends</div>
                </div>
              </div>
            </div>

            {/* Name & Bio */}
            <div className="mb-3">
              <h1 className="text-foreground">Arjun Malhotra</h1>
              <p className="text-muted-foreground text-sm">Event Curator • Delhi</p>
              <p className="text-foreground text-sm mt-2">
                🎉 Creating unforgettable experiences in Delhi<br />
                📍 Hauz Khas | CP | Khan Market
              </p>
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
            </div>
          </div>

          {/* Tab Selector - Instagram Style */}
          <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-md border-b border-border grid grid-cols-2">
            <button
              onClick={() => setActiveTab('hosted')}
              className={`flex items-center justify-center gap-2 py-3 transition-colors relative ${
                activeTab === 'hosted' 
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
              className={`flex items-center justify-center gap-2 py-3 transition-colors relative ${
                activeTab === 'attended' 
                  ? 'text-foreground' 
                  : 'text-muted-foreground'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Attended</span>
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
              </div>
            )}

            {activeTab === 'attended' && (
              <div className="grid grid-cols-3 gap-1">
                {attendedEvents.map((event) => (
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
                        <div className="text-[10px] text-gray-300">by {event.host.name}</div>
                      </div>
                    </div>
                    {/* Mood indicator */}
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
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
