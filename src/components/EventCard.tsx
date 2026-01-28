import { Clock, MapPin, Users } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Event } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface EventCardProps {
  event: Event;
  showHost?: boolean;
}

const moodColors = {
  Chill: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
  Energetic: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
  Creative: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
  Romantic: 'bg-pink-500/20 text-pink-300 border-pink-500/50'
};

export function EventCard({ event, showHost = true }: EventCardProps) {
  return (
    <GlassCard hoverEffect={true} className="overflow-hidden p-0">
      {/* Event Image */}
      <div className="relative h-40 overflow-hidden">
        <ImageWithFallback
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <Badge
          variant="outline"
          className={`absolute top-2 right-2 ${moodColors[event.mood]}`}
        >
          {event.mood}
        </Badge>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        <h3 className="text-white">{event.title}</h3>

        <div className="flex items-center gap-4 text-gray-400 text-xs">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{event.startTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{event.location.name}</span>
          </div>
        </div>

        {showHost && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-700">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={event.host.avatar} alt={event.host.name} />
                <AvatarFallback>{event.host.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-gray-300 text-xs">{event.host.name}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <Users className="h-3.5 w-3.5" />
              <span>{event.attendees}</span>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
