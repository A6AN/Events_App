import { Instagram, Users, Clock, MapPin, X, Sparkles } from 'lucide-react';
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in"
        onClick={onClose}
      />
      
      {/* Bottom Sheet - Modern Design */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl border-t border-border/50 animate-in slide-in-from-bottom duration-300 max-w-lg mx-auto shadow-2xl">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-muted rounded-full" />
        </div>

        {/* Event Image */}
        <div className="relative h-56 mx-4 rounded-2xl overflow-hidden">
          <ImageWithFallback
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-2xl backdrop-blur-md"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          
          <Badge 
            className="absolute top-3 left-3 bg-primary/90 backdrop-blur-md text-primary-foreground border-0 shadow-lg"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            {event.mood}
          </Badge>

          {/* Event Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="text-white text-2xl">{event.title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[50vh] overflow-y-auto">
          {/* Time and Location */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-border/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground text-xs">Time</span>
              </div>
              <div className="text-foreground">{event.startTime}</div>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground text-xs">Location</span>
              </div>
              <div className="text-foreground text-sm truncate">{event.location.name}</div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="space-y-2">
              <h3 className="text-foreground">About</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Host Info */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-primary/30 ring-2 ring-primary/10">
                  <AvatarImage src={event.host.avatar} alt={event.host.name} />
                  <AvatarFallback className="bg-primary/20 text-primary">{event.host.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-muted-foreground text-xs mb-0.5">Hosted by</div>
                  <div className="text-foreground">{event.host.name}</div>
                </div>
              </div>
              {event.host.instagram && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:text-primary/80 hover:bg-primary/10 rounded-xl"
                >
                  <Instagram className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Attendees */}
          <div className="flex items-center gap-3 py-3 px-4 bg-card border border-border/50 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-foreground text-lg">{event.attendees}</div>
              <div className="text-muted-foreground text-xs">people attending</div>
            </div>
          </div>

          {/* RSVP Button */}
          <div className="pt-2">
            <Button 
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              I'm Attending!
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}