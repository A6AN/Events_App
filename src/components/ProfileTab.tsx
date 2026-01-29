import { Share2, Settings, Grid3X3, Heart, Sparkles, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Event } from '../types';
import { ScrollArea } from './ui/scroll-area';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';

interface ProfileTabProps {
  events?: Event[];
}

export function ProfileTab({ events = [] }: ProfileTabProps) {
  const [activeTab, setActiveTab] = useState<'liked' | 'saved' | 'about'>('liked');

  // Split events into hosted and attended (mock data)
  const likedEvents = events.slice(0, 6);
  const savedEvents = events.slice(3, 9);

  return (
    <div className="h-full relative">
      <ScrollArea className="h-full">
        <div className="pb-24">
          {/* Full-Bleed Hero Section */}
          <div className="relative h-[50vh] overflow-hidden">
            {/* Hero Background Image */}
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=800&fit=crop"
                alt="Profile Hero"
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
              <div
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(ellipse at 50% 80%, rgba(247, 37, 133, 0.2) 0%, transparent 60%)',
                }}
              />
            </motion.div>

            {/* Floating Header Bar */}
            <motion.div
              className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between glass backdrop-blur-2xl border-b border-white/10"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                size="icon"
                variant="ghost"
                className="glass-hover rounded-2xl w-10 h-10 btn-press"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <h2 className="gradient-text">Profile</h2>
              <Button
                size="icon"
                variant="ghost"
                className="glass-hover rounded-2xl w-10 h-10 btn-press"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </motion.div>

            {/* Profile Info - Bottom of Hero */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-end gap-4 mb-4">
                {/* Avatar with ring */}
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative"
                  >
                    <Avatar className="h-24 w-24 border-4 border-white/20 shadow-2xl">
                      <AvatarImage
                        src="https://images.unsplash.com/photo-1667382136327-5f78dc5cf835?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjMzNzA5NzN8MA&ixlib=rb-4.1.0&q=80&w=1080"
                        alt="Profile"
                      />
                      <AvatarFallback>AM</AvatarFallback>
                    </Avatar>
                    <motion.div
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg"
                      style={{
                        background: 'linear-gradient(135deg, #F72585 0%, #7209B7 100%)',
                      }}
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </motion.div>
                  </motion.div>
                </div>

                {/* Stats */}
                <div className="flex-1 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Hosted', value: likedEvents.length },
                    { label: 'Attended', value: savedEvents.length },
                    { label: 'Friends', value: 156 },
                  ].map((stat, idx) => (
                    <motion.div
                      key={stat.label}
                      className="text-center glass backdrop-blur-xl rounded-2xl p-2.5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-white text-lg mb-0.5">{stat.value}</div>
                      <div className="text-white/60 text-[10px]">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Name and Location */}
              <div>
                <h1 className="text-white mb-1">Arjun Malhotra</h1>
                <div className="flex items-center gap-2 text-white/80 text-sm mb-3">
                  <MapPin className="h-3.5 w-3.5" style={{ color: '#F72585' }} />
                  <span>Delhi • Event Curator</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Segmented Control - Sticky */}
          <div className="sticky top-0 z-20 glass backdrop-blur-2xl border-b border-white/10">
            <div className="p-4">
              <div className="glass p-1 rounded-2xl grid grid-cols-3 gap-1">
                {[
                  { id: 'liked' as const, icon: Heart, label: 'Liked' },
                  { id: 'saved' as const, icon: Grid3X3, label: 'Saved' },
                  { id: 'about' as const, icon: Sparkles, label: 'About' },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-all relative overflow-hidden ${isActive ? 'text-white' : 'text-muted-foreground'
                        }`}
                      whileTap={{ scale: 0.97 }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeProfileTab"
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: 'linear-gradient(135deg, #F72585 0%, #7209B7 100%)',
                            boxShadow: '0 4px 12px rgba(247, 37, 133, 0.3)',
                          }}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <Icon className="h-4 w-4 relative z-10" />
                      <span className="relative z-10">{tab.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="p-4">
            {activeTab === 'liked' && (
              <div className="grid grid-cols-3 gap-2">
                {likedEvents.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    className="aspect-square relative group cursor-pointer overflow-hidden rounded-2xl"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ImageWithFallback
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Gradient Overlay on hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end justify-center p-3"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-white text-center w-full">
                        <div className="text-xs mb-1 line-clamp-2">{event.title}</div>
                        <div className="text-[10px]" style={{ color: '#F72585' }}>
                          {event.attendees} attendees
                        </div>
                      </div>
                    </motion.div>

                    {/* Heart indicator */}
                    <motion.div
                      className="absolute top-2 right-2 w-6 h-6 rounded-full glass backdrop-blur-xl flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Heart className="h-3 w-3" style={{ color: '#F72585', fill: '#F72585' }} />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'saved' && (
              <div className="grid grid-cols-3 gap-2">
                {savedEvents.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    className="aspect-square relative group cursor-pointer overflow-hidden rounded-2xl"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ImageWithFallback
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Gradient Overlay on hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end justify-center p-3"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-white text-center w-full">
                        <div className="text-xs mb-1 line-clamp-2">{event.title}</div>
                        <div className="text-[10px]" style={{ color: '#F72585' }}>
                          by {event.host.name}
                        </div>
                      </div>
                    </motion.div>

                    {/* Bookmark indicator */}
                    <motion.div
                      className="absolute top-2 right-2 w-6 h-6 rounded-full glass backdrop-blur-xl flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Grid3X3 className="h-3 w-3" style={{ color: '#4CC9F0' }} />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'about' && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="glass backdrop-blur-xl rounded-3xl p-6">
                  <h3 className="text-foreground mb-3">About</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    🎉 Creating unforgettable experiences across Delhi's hottest venues.
                    From intimate gatherings to spectacular events, I bring people together
                    through music, art, and culture.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Events', 'Music', 'Art', 'Culture', 'Delhi'].map((tag) => (
                      <motion.span
                        key={tag}
                        className="px-3 py-1.5 rounded-full text-xs glass"
                        whileHover={{ scale: 1.05 }}
                        style={{ color: '#F72585' }}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </div>

                <div className="glass backdrop-blur-xl rounded-3xl p-6">
                  <h3 className="text-foreground mb-3">Favorite Spots</h3>
                  <div className="space-y-3">
                    {['Hauz Khas Village', 'Connaught Place', 'Khan Market'].map((spot, idx) => (
                      <motion.div
                        key={spot}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <MapPin className="h-4 w-4" style={{ color: '#F72585' }} />
                        <span className="text-sm text-foreground">{spot}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
