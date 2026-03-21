import { Clock, MapPin, Users } from 'lucide-react';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { EventWithMeta } from '../types';

interface EventCardProps {
  event: EventWithMeta;
  showHost?: boolean;
}

export function EventCard({ event, showHost = true }: EventCardProps) {
  return (
    <Card className="bg-black/30 backdrop-blur-xl border border-white/10 overflow-hidden transition-all duration-300 hover:bg-black/40 hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(236,72,153,0.15)] hover:border-pink-500/30 cursor-pointer rounded-2xl">
      {/* Event Image */}
      <div className="relative h-40 overflow-hidden">
        <ImageWithFallback
          src={event.cover_url || undefined}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <Badge
          variant="outline"
          className="absolute top-2 right-2 bg-black/50 text-white border-white/20"
        >
          {event.category}
        </Badge>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        <h3 className="text-white">{event.title}</h3>

        <div className="flex items-center gap-4 text-gray-400 text-xs">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{new Date(event.start_time).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{event.address}</span>
          </div>
        </div>

        {showHost && event.host && (
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={event.host.avatar_url || undefined} alt={event.host.display_name || ''} />
                <AvatarFallback>{(event.host.display_name || 'U')[0]}</AvatarFallback>
              </Avatar>
              <span className="text-gray-300 text-xs">{event.host.display_name}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <Users className="h-3.5 w-3.5" />
              <span>{Math.floor(Math.random() * 50) + 10}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
