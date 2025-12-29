import { useState } from 'react';
import { ProfileHeader } from './profile/ProfileHeader';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Ticket as TicketIcon, Star, Grid3X3, MapPin } from 'lucide-react';
import { mockTickets } from '../data/mockTickets';
import { ImageWithFallback } from './figma/ImageWithFallback';


export function ProfileTab() {
  const [activeTab, setActiveTab] = useState<'hosted' | 'attended'>('hosted');
  const { user } = useAuth();

  const hostedEvents = mockTickets.filter((_, i) => i < 3);
  const attendedEvents = mockTickets.filter((_, i) => i >= 3);

  return (
    <div className="h-full bg-background overflow-y-auto pb-24">
      <ProfileHeader
        hostedCount={hostedEvents.length}
        attendedCount={attendedEvents.length}
        followersCount={128}
      />

      {/* Tab Selector - Clean Pill Style */}
      <div className="px-4 pt-6">
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveTab('hosted')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all backdrop-blur-md ${activeTab === 'hosted'
              ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30'
              : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'
              }`}
          >
            <Grid3X3 className="h-4 w-4" />
            Posts
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveTab('attended')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all backdrop-blur-md ${activeTab === 'attended'
              ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30'
              : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'
              }`}
          >
            <TicketIcon className="h-4 w-4" />
            Tickets
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-4 px-4">
        <AnimatePresence mode="wait">
          {activeTab === 'hosted' ? (
            <motion.div
              key="hosted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {hostedEvents.length > 0 ? (
                /* Grid Layout for Posts */
                <div className="grid grid-cols-2 gap-3">
                  {hostedEvents.map((event, i) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer"
                    >
                      <ImageWithFallback
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Category Badge */}
                      <div className="absolute top-2 right-2 bg-violet-500/90 px-2 py-0.5 rounded-full">
                        <span className="text-[10px] text-white font-medium">{event.category}</span>
                      </div>

                      {/* Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="text-white font-semibold text-sm truncate">{event.title}</h3>
                        <div className="flex items-center gap-2 text-white/60 text-xs mt-1">
                          <Calendar className="h-3 w-3" />
                          {event.date}
                        </div>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-white/40">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-white/20 flex items-center justify-center">
                    <Star className="h-8 w-8" />
                  </div>
                  <p className="text-lg font-medium text-white mb-1">No Posts Yet</p>
                  <p className="text-sm">Host your first event to share with your followers</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="attended"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {attendedEvents.length > 0 ? (
                attendedEvents.map((ticket, i) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative bg-gradient-to-br from-white/10 to-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-violet-500/50 transition-all cursor-pointer group"
                  >
                    {/* Ticket stub decoration */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-background rounded-r-full" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-background rounded-l-full" />

                    <div className="flex items-center gap-4 p-4 pl-5">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={ticket.imageUrl}
                          alt={ticket.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm truncate">{ticket.title}</h3>
                        <p className="text-violet-400 text-xs mt-0.5">{ticket.artist}</p>
                        <div className="flex items-center gap-3 text-white/40 text-xs mt-1.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {ticket.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {ticket.venue.split(',')[0]}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-white/40">Ticket</div>
                        <div className="text-white font-bold">₹{ticket.price}</div>
                      </div>
                    </div>

                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-purple-500/0 group-hover:from-violet-500/5 group-hover:to-purple-500/5 transition-all duration-300 rounded-2xl pointer-events-none" />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-16 text-white/40">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-white/20 flex items-center justify-center">
                    <TicketIcon className="h-8 w-8" />
                  </div>
                  <p className="text-lg font-medium text-white mb-1">No Tickets Yet</p>
                  <p className="text-sm">Attend an event to get your first ticket</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
