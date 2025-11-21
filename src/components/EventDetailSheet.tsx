import { Instagram, Users, Clock, MapPin, X } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Event } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface EventDetailSheetProps {
  event: Event | null;
  open: boolean;
  onClose: () => void;
}

export function EventDetailSheet({ event, open, onClose }: EventDetailSheetProps) {
  if (!event || !open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl border-t border-border animate-in slide-in-from-bottom duration-300 max-w-lg mx-auto">
        {/* Event Image */}
        <div className="relative h-48 rounded-t-3xl overflow-hidden">
          <ImageWithFallback
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          <Badge 
            variant="outline" 
            className="absolute top-4 left-4 bg-primary/20 text-primary border-primary/50"
          >
            {event.mood}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <h2 className="text-foreground text-2xl">{event.title}</h2>

          {/* Time and Location */}
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{event.startTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>{event.location.name}</span>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-muted-foreground text-sm">{event.description}</p>
          )}

          {/* Host Info */}
          <div className="flex items-center justify-between py-3 border-t border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={event.host.avatar} alt={event.host.name} />
                <AvatarFallback>{event.host.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-foreground text-sm">Hosted by</div>
                <div className="text-foreground">{event.host.name}</div>
              </div>
            </div>
            {event.host.instagram && (
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                <Instagram className="h-4 w-4 mr-1" />
                {event.host.instagram}
              </Button>
            )}
          </div>

          {/* Attendees */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5" />
            <span className="text-sm">
              <span className="text-foreground">{event.attendees}</span> people attending
            </span>
          </div>

          {/* RSVP Button */}
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
          >
            RSVP to Event
          </Button>
        </div>
      </div>
    </>
  );
}
