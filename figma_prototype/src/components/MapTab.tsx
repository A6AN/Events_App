import { useState } from 'react';
import { Flashlight, MapPin } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Event, MoodFilter } from '../types';

interface MapTabProps {
  events: Event[];
  onEventSelect: (event: Event) => void;
}

const moods: MoodFilter[] = ['All', 'Chill', 'Energetic', 'Creative', 'Romantic'];

const moodColors = {
  Chill: 'bg-[#FFCB74]/20 text-[#FFCB74] border-[#FFCB74]/50 hover:bg-[#FFCB74]/30',
  Energetic: 'bg-[#FFCB74]/20 text-[#FFCB74] border-[#FFCB74]/50 hover:bg-[#FFCB74]/30',
  Creative: 'bg-[#FFCB74]/20 text-[#FFCB74] border-[#FFCB74]/50 hover:bg-[#FFCB74]/30',
  Romantic: 'bg-[#FFCB74]/20 text-[#FFCB74] border-[#FFCB74]/50 hover:bg-[#FFCB74]/30',
  All: 'bg-muted/50 text-foreground border-border hover:bg-muted'
};

export function MapTab({ events, onEventSelect }: MapTabProps) {
  const [selectedMood, setSelectedMood] = useState<MoodFilter>('All');
  const [torchMode, setTorchMode] = useState(false);

  const filteredEvents = selectedMood === 'All' 
    ? events 
    : events.filter(e => e.mood === selectedMood);

  // Delhi map coordinates for event positioning
  const delhiEventPositions = [
    { top: '30%', left: '45%', label: 'Hauz Khas' },
    { top: '35%', left: '55%', label: 'Khan Market' },
    { top: '40%', left: '50%', label: 'CP' },
    { top: '50%', left: '40%', label: 'Garden' },
    { top: '38%', left: '58%', label: 'India Gate' },
    { top: '55%', left: '42%', label: 'Qutub Minar' }
  ];

  return (
    <div className="relative h-full w-full bg-background overflow-hidden">
      {/* Map Background - Delhi styled */}
      <div className="absolute inset-0 bg-card">
        {/* Grid pattern for map effect */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Delhi area shapes */}
        <svg className="absolute inset-0 w-full h-full opacity-5">
          <circle cx="50%" cy="40%" r="120" fill="#FFCB74" opacity="0.3" />
          <circle cx="55%" cy="45%" r="80" fill="#FFCB74" opacity="0.2" />
          <circle cx="45%" cy="50%" r="100" fill="#2F2F2F" opacity="0.2" />
        </svg>

        {/* Location labels */}
        <div className="absolute inset-0 text-muted-foreground text-xs pointer-events-none">
          <div className="absolute" style={{ top: '25%', left: '43%' }}>Hauz Khas</div>
          <div className="absolute" style={{ top: '30%', left: '53%' }}>Khan Market</div>
          <div className="absolute" style={{ top: '35%', left: '48%' }}>CP</div>
          <div className="absolute" style={{ top: '45%', left: '38%' }}>South Delhi</div>
          <div className="absolute" style={{ top: '33%', left: '56%' }}>India Gate</div>
          <div className="absolute" style={{ top: '52%', left: '40%' }}>Mehrauli</div>
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background/90 pointer-events-none" />
      </div>

      {/* Top Filter Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-background via-background/80 to-transparent backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide">
            {moods.map((mood) => (
              <Badge
                key={mood}
                variant="outline"
                className={`cursor-pointer px-4 py-2 whitespace-nowrap transition-all ${
                  selectedMood === mood 
                    ? moodColors[mood]
                    : 'bg-card text-muted-foreground border-border hover:bg-muted'
                }`}
                onClick={() => setSelectedMood(mood)}
              >
                {mood}
              </Badge>
            ))}
          </div>
          <Button
            size="icon"
            variant="outline"
            className={`shrink-0 transition-all ${
              torchMode 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-card text-muted-foreground border-border hover:bg-muted'
            }`}
            onClick={() => setTorchMode(!torchMode)}
          >
            <Flashlight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Event Hotspots - Fixed positions */}
      <div className="absolute inset-0 pointer-events-none z-[5]">
        {filteredEvents.slice(0, 6).map((event, index) => {
          const position = delhiEventPositions[index] || delhiEventPositions[0];
          
          return (
            <div
              key={event.id}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              style={{ top: position.top, left: position.left }}
              onClick={() => onEventSelect(event)}
            >
              {/* Hotspot marker */}
              <div className="relative">
                {/* Outer ring - pulsing */}
                <div 
                  className="absolute rounded-full animate-ping bg-primary/40"
                  style={{ 
                    width: '60px',
                    height: '60px',
                    top: '-22px',
                    left: '-22px',
                    animationDuration: '2s'
                  }}
                />
                
                {/* Middle ring - static glow */}
                <div 
                  className="absolute rounded-full bg-primary/50 blur-md"
                  style={{ 
                    width: '38px',
                    height: '38px',
                    top: '-11px',
                    left: '-11px',
                  }}
                />
                
                {/* Core hotspot */}
                <div 
                  className="relative w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/50"
                >
                  {/* Inner dot */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary-foreground rounded-full" />
                </div>

                {/* Event label */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-card/90 backdrop-blur-sm border border-border px-2 py-1 rounded text-[10px] text-foreground whitespace-nowrap pointer-events-none">
                  {event.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Legend */}
      <div className="absolute bottom-4 left-4 right-4 bg-card/90 backdrop-blur-xl border border-border rounded-xl p-3 text-xs z-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-foreground mb-1 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>{filteredEvents.length} events in Delhi NCR</span>
            </div>
            <div className="text-muted-foreground text-[10px]">Tap on hotspots to view details</div>
          </div>
          {torchMode && (
            <div className="text-primary flex items-center gap-1 text-[10px]">
              <Flashlight className="h-3 w-3" />
              Nearby only
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
