import { useState } from 'react';
import { Flashlight, MapPin, Sparkles } from 'lucide-react';
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
      {/* Map Background - Modern minimalist */}
      <div className="absolute inset-0 bg-background">
        {/* Subtle grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-foreground"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Modern abstract shapes */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.02]">
          <circle cx="50%" cy="40%" r="180" fill="#FFCB74" />
          <circle cx="60%" cy="50%" r="120" fill="#FFCB74" />
          <circle cx="40%" cy="55%" r="150" fill="#2F2F2F" />
        </svg>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background pointer-events-none" />
      </div>

      {/* Modern Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-2xl border-b border-border/50">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-foreground mb-0.5">Discover</h1>
              <p className="text-muted-foreground text-xs">Events around Delhi</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className={`rounded-2xl transition-all ${
                torchMode 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-muted'
              }`}
              onClick={() => setTorchMode(!torchMode)}
            >
              <Flashlight className="h-5 w-5" />
            </Button>
          </div>

          {/* Mood filters */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {moods.map((mood) => (
              <Badge
                key={mood}
                variant="outline"
                className={`cursor-pointer px-4 py-2 whitespace-nowrap rounded-xl transition-all ${
                  selectedMood === mood 
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:bg-muted'
                }`}
                onClick={() => setSelectedMood(mood)}
              >
                {mood}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Event Hotspots - Minimalist markers */}
      <div className="absolute inset-0 pointer-events-none z-[5]">
        {filteredEvents.slice(0, 6).map((event, index) => {
          const position = delhiEventPositions[index] || delhiEventPositions[0];
          
          return (
            <div
              key={event.id}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto group"
              style={{ top: position.top, left: position.left }}
              onClick={() => onEventSelect(event)}
            >
              {/* Modern hotspot marker */}
              <div className="relative">
                {/* Outer pulse ring */}
                <div 
                  className="absolute rounded-full bg-primary/20 animate-ping"
                  style={{ 
                    width: '48px',
                    height: '48px',
                    top: '-16px',
                    left: '-16px',
                    animationDuration: '2.5s'
                  }}
                />
                
                {/* Static glow */}
                <div 
                  className="absolute rounded-full bg-primary/30 blur-xl group-hover:bg-primary/50 transition-all"
                  style={{ 
                    width: '32px',
                    height: '32px',
                    top: '-8px',
                    left: '-8px',
                  }}
                />
                
                {/* Core marker */}
                <div 
                  className="relative w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/50 group-hover:scale-125 transition-transform"
                >
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary-foreground rounded-full" />
                </div>

                {/* Floating label */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-card/90 backdrop-blur-xl border border-border/50 px-3 py-1.5 rounded-xl text-[10px] text-foreground whitespace-nowrap pointer-events-none shadow-lg opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-2.5 w-2.5 text-primary" />
                    {event.title}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modern Bottom Stats */}
      <div className="absolute bottom-6 left-4 right-4 bg-card/80 backdrop-blur-2xl border border-border/50 rounded-2xl p-4 z-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-foreground mb-1 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm">{filteredEvents.length} events live</span>
            </div>
            <div className="text-muted-foreground text-xs">Tap markers to explore</div>
          </div>
          {torchMode && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl px-3 py-1.5 text-primary flex items-center gap-1.5 text-xs">
              <Flashlight className="h-3 w-3" />
              Nearby
            </div>
          )}
        </div>
      </div>
    </div>
  );
}