import { useState } from 'react';
import { Flashlight, MapPin, Sparkles, Navigation, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Event, MoodFilter } from '../types';

interface MapTabProps {
  events: Event[];
  onEventSelect: (event: Event) => void;
}

const moods: MoodFilter[] = ['All', 'Chill', 'Energetic', 'Creative', 'Romantic'];

const moodGradients = {
  All: 'rgba(255, 255, 255, 0.15)',
  Chill: 'rgba(76, 201, 240, 0.15)',
  Energetic: 'rgba(255, 107, 53, 0.15)',
  Creative: 'rgba(255, 184, 0, 0.15)',
  Romantic: 'rgba(236, 72, 153, 0.15)',
};

const moodEmojis = {
  All: '✨',
  Chill: '🌊',
  Energetic: '⚡',
  Creative: '🎨',
  Romantic: '💖',
};

export function MapTab({ events, onEventSelect }: MapTabProps) {
  const [selectedMood, setSelectedMood] = useState<MoodFilter>('All');
  const [torchMode, setTorchMode] = useState(false);
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

  const filteredEvents = selectedMood === 'All' 
    ? events 
    : events.filter(e => e.mood === selectedMood);

  // Delhi map coordinates for event positioning
  const delhiEventPositions = [
    { top: '30%', left: '45%', label: 'Hauz Khas Village' },
    { top: '35%', left: '55%', label: 'Khan Market' },
    { top: '40%', left: '50%', label: 'Connaught Place' },
    { top: '50%', left: '40%', label: 'Lodhi Garden' },
    { top: '38%', left: '58%', label: 'India Gate' },
    { top: '55%', left: '42%', label: 'Qutub Minar' }
  ];

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Ultra Premium Animated Background */}
      <div className="absolute inset-0">
        {/* Base dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0F] via-[#12121A] to-[#0A0A0F]" />
        
        {/* Animated gradient blobs */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(247, 37, 133, 0.4) 0%, transparent 70%)',
            top: '20%',
            left: '10%',
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(76, 201, 240, 0.4) 0%, transparent 70%)',
            bottom: '20%',
            right: '10%',
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, -50, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(114, 9, 183, 0.4) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Futuristic grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.08]">
          <defs>
            <pattern id="futuristicGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path 
                d="M 40 0 L 0 0 0 40" 
                fill="none" 
                stroke="url(#gridGradient)" 
                strokeWidth="0.5"
              />
            </pattern>
            <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F72585" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#4CC9F0" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#futuristicGrid)" />
        </svg>

        {/* Grain texture overlay */}
        <div className="absolute inset-0 grain opacity-50" />

        {/* Scanning line effect */}
        {torchMode && (
          <motion.div
            className="absolute left-0 right-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(76, 201, 240, 0.8) 50%, transparent 100%)',
              boxShadow: '0 0 20px rgba(76, 201, 240, 0.8)',
            }}
            animate={{
              top: ['0%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}
      </div>

      {/* Ultra Premium Glass Header */}
      <motion.div 
        className="absolute top-0 left-0 right-0 z-20 glass backdrop-blur-3xl border-b border-white/10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
      >
        <div className="p-4 relative overflow-hidden">
          {/* Header gradient accent */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(76, 201, 240, 0.2) 50%, transparent 100%)',
            }}
          />
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <motion.h1 
                className="gradient-text mb-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Discover
              </motion.h1>
              <motion.p 
                className="text-muted-foreground text-xs flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Navigation className="h-3 w-3" style={{ color: '#4CC9F0' }} />
                Events around Delhi
              </motion.p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="icon"
                variant="ghost"
                className={`rounded-2xl transition-all ${
                  torchMode 
                    ? 'text-white shadow-lg shadow-cyan-500/50' 
                    : 'glass-hover'
                }`}
                style={{
                  background: torchMode 
                    ? 'linear-gradient(135deg, #4CC9F0 0%, #7209B7 100%)'
                    : undefined,
                }}
                onClick={() => setTorchMode(!torchMode)}
              >
                <Flashlight className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>

          {/* Premium Mood Filters */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 relative z-10">
            {moods.map((mood, idx) => {
              const isActive = selectedMood === mood;
              return (
                <motion.button
                  key={mood}
                  onClick={() => setSelectedMood(mood)}
                  className="relative px-4 py-2.5 whitespace-nowrap rounded-2xl text-sm overflow-hidden"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeMood"
                      className="absolute inset-0"
                      style={{
                        background: moodGradients[mood],
                        boxShadow: '0 4px 16px rgba(247, 37, 133, 0.4)',
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className={`relative z-10 flex items-center gap-2 ${
                    isActive ? 'text-white' : 'text-muted-foreground'
                  }`}>
                    <span className="text-base">{moodEmojis[mood]}</span>
                    <span>{mood}</span>
                  </div>
                  {!isActive && (
                    <div className="absolute inset-0 glass" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Sci-Fi Event Hotspots */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <AnimatePresence>
          {filteredEvents.slice(0, 6).map((event, index) => {
            const position = delhiEventPositions[index] || delhiEventPositions[0];
            const isHovered = hoveredEvent === event.id;
            
            return (
              <motion.div
                key={event.id}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                style={{ top: position.top, left: position.left }}
                onClick={() => onEventSelect(event)}
                onHoverStart={() => setHoveredEvent(event.id)}
                onHoverEnd={() => setHoveredEvent(null)}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ delay: index * 0.1, type: 'spring' }}
              >
                {/* Outer pulse rings - multiple layers */}
                <motion.div 
                  className="absolute rounded-full"
                  style={{ 
                    width: '80px',
                    height: '80px',
                    top: '-32px',
                    left: '-32px',
                    border: '2px solid rgba(247, 37, 133, 0.3)',
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
                <motion.div 
                  className="absolute rounded-full"
                  style={{ 
                    width: '60px',
                    height: '60px',
                    top: '-22px',
                    left: '-22px',
                    border: '2px solid rgba(76, 201, 240, 0.4)',
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeOut',
                    delay: 0.5,
                  }}
                />
                
                {/* Rotating gradient ring */}
                <motion.div
                  className="absolute rounded-full"
                  style={{ 
                    width: '40px',
                    height: '40px',
                    top: '-12px',
                    left: '-12px',
                    background: `conic-gradient(from 0deg, transparent, ${
                      isHovered ? 'rgba(247, 37, 133, 0.8)' : 'rgba(247, 37, 133, 0.4)'
                    }, transparent)`,
                  }}
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
                
                {/* Core marker with glow */}
                <motion.div 
                  className="relative w-4 h-4 rounded-full shadow-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #F72585 0%, #7209B7 100%)',
                    boxShadow: isHovered 
                      ? '0 0 30px rgba(247, 37, 133, 0.8), 0 0 60px rgba(247, 37, 133, 0.4)'
                      : '0 0 20px rgba(247, 37, 133, 0.6)',
                  }}
                  whileHover={{ scale: 1.5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  {/* Inner dot */}
                  <motion.div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                </motion.div>

                {/* Premium Floating Card on Hover */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      className="absolute -bottom-24 left-1/2 transform -translate-x-1/2 w-64 pointer-events-none"
                      initial={{ opacity: 0, y: -10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <div className="glass backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-2xl overflow-hidden">
                        {/* Card gradient accent */}
                        <div 
                          className="absolute inset-0 opacity-20"
                          style={{
                            background: 'radial-gradient(circle at top left, rgba(247, 37, 133, 0.3) 0%, transparent 70%)',
                          }}
                        />
                        
                        <div className="relative z-10">
                          <div className="flex items-start gap-3 mb-2">
                            <div className="flex-1">
                              <h4 className="text-white text-sm font-medium mb-1 line-clamp-1">
                                {event.title}
                              </h4>
                              <div className="flex items-center gap-1.5 text-xs" style={{ color: '#F72585' }}>
                                <MapPin className="h-3 w-3" />
                                <span>{position.label}</span>
                              </div>
                            </div>
                            <Badge 
                              className="text-[10px] px-2 py-0.5"
                              style={{
                                background: moodGradients[event.mood as MoodFilter] || moodGradients.All,
                                border: 'none',
                                color: 'white',
                              }}
                            >
                              {event.mood}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-white/70">
                            <span>{event.startTime}</span>
                            <span className="flex items-center gap-1">
                              <Sparkles className="h-3 w-3" style={{ color: '#FFB800' }} />
                              {event.attendees} going
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Premium Bottom Stats Card */}
      <motion.div 
        className="absolute bottom-6 left-4 right-4 glass backdrop-blur-3xl border border-white/20 rounded-2xl p-4 z-20 overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {/* Card gradient accent */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(76, 201, 240, 0.2) 50%, transparent 100%)',
          }}
        />
        
        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="text-foreground mb-1 flex items-center gap-2">
              <motion.div 
                className="w-2 h-2 rounded-full"
                style={{ background: 'linear-gradient(135deg, #F72585 0%, #4CC9F0 100%)' }}
                animate={{
                  scale: [1, 1.3, 1],
                  boxShadow: [
                    '0 0 0px rgba(247, 37, 133, 0.5)',
                    '0 0 10px rgba(247, 37, 133, 0.8)',
                    '0 0 0px rgba(247, 37, 133, 0.5)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <span className="text-sm">{filteredEvents.length} events live</span>
            </div>
            <div className="text-muted-foreground text-xs flex items-center gap-1.5">
              <Zap className="h-3 w-3" style={{ color: '#4CC9F0' }} />
              Tap markers to explore
            </div>
          </div>
          {torchMode && (
            <motion.div 
              className="backdrop-blur-xl rounded-xl px-3 py-2 text-white flex items-center gap-2 text-xs border border-white/20"
              style={{
                background: 'linear-gradient(135deg, rgba(76, 201, 240, 0.3) 0%, rgba(114, 9, 183, 0.3) 100%)',
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <Flashlight className="h-3.5 w-3.5" />
              Scanning...
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}