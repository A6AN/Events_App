import { useState } from 'react';
import { ProfileHeader } from './profile/ProfileHeader';
import { TicketCard } from './tickets/TicketCard';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Ticket as TicketIcon, Star } from 'lucide-react';
import { mockTickets } from '../data/mockTickets';

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

      {/* Tab Selector */}
      <div className="px-4 pt-6">
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
          <button
            onClick={() => setActiveTab('hosted')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'hosted'
                ? 'bg-white/10 text-white'
                : 'text-white/50'
              }`}
          >
            <Star className="h-4 w-4" />
            Hosted
          </button>
          <button
            onClick={() => setActiveTab('attended')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'attended'
                ? 'bg-white/10 text-white'
                : 'text-white/50'
              }`}
          >
            <TicketIcon className="h-4 w-4" />
            Attended
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        <AnimatePresence mode="wait">
          {activeTab === 'hosted' ? (
            <motion.div
              key="hosted"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              {hostedEvents.length > 0 ? (
                hostedEvents.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/[0.03] rounded-xl p-3 flex items-center gap-3"
                  >
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm truncate">{event.title}</h3>
                      <div className="flex items-center gap-2 text-white/40 text-xs mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {event.date}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400 font-semibold text-sm">42</div>
                      <div className="text-white/40 text-xs">guests</div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-white/40">
                  <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hosted events yet</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="attended"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-3"
            >
              {attendedEvents.length > 0 ? (
                attendedEvents.map((ticket, i) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <TicketCard ticket={ticket} />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-white/40">
                  <TicketIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No attended events yet</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
