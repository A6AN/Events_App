import { Users, Heart, MessageCircle, Sparkles } from 'lucide-react';
import { Event } from '../types';
import { ScrollArea } from './ui/scroll-area';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface SocialTabProps {
  events: Event[];
  onEventSelect: (event: Event) => void;
}

export function SocialTab({ events, onEventSelect }: SocialTabProps) {
  return (
    <div className="h-full bg-background">
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-xl border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Users className="h-7 w-7 text-primary" />
              <Sparkles className="h-3 w-3 text-primary absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-2xl text-foreground">
                Social Feed
              </h1>
              <p className="text-muted-foreground text-xs">See what your friends are up to</p>
            </div>
          </div>
        </div>

        {/* Feed */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-5">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => onEventSelect(event)}
                className="group cursor-pointer"
              >
                {/* User action header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Avatar className="h-8 w-8 border-2 border-primary/30">
                    <AvatarImage src={event.host.avatar} alt={event.host.name} />
                    <AvatarFallback>{event.host.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <span className="text-foreground">{event.host.name}</span>
                    <span className="text-muted-foreground"> is hosting</span>
                  </div>
                </div>

                {/* Event Card */}
                <div className="relative bg-card rounded-2xl overflow-hidden border border-border group-hover:border-primary/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/10">
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <ImageWithFallback
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Mood badge */}
                    <Badge
                      className="absolute top-3 right-3 bg-primary text-primary-foreground border-0"
                    >
                      {event.mood}
                    </Badge>

                    {/* Event info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white text-xl mb-1">{event.title}</h3>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-primary">{event.startTime}</span>
                        <span className="text-gray-300">{event.location.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Interaction bar */}
                  <div className="p-4 flex items-center justify-between border-t border-border">
                    <div className="flex items-center gap-4 text-muted-foreground text-sm">
                      <Button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                        <Heart className="h-4 w-4" />
                        <span>{Math.floor(Math.random() * 50) + 10}</span>
                      </Button>
                      <Button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        <span>{Math.floor(Math.random() * 20) + 5}</span>
                      </Button>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        <span>{event.attendees} going</span>
                      </div>
                    </div>
                    <div className="text-primary text-sm group-hover:text-primary/80 transition-colors">
                      View Details →
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
