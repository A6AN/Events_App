import { useState } from 'react';
import { ProfileHeader } from './profile/ProfileHeader';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Ticket as TicketIcon, Star, Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
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

      {/* Tab Selector - Instagram style */}
      <div className="px-4 pt-6">
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('hosted')}
            className={`flex-1 pb-3 text-sm font-medium transition-all relative ${activeTab === 'hosted' ? 'text-white' : 'text-white/40'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="1.5" />
              </svg>
              Posts
            </div>
            {activeTab === 'hosted' && (
              <motion.div
                layoutId="tabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('attended')}
            className={`flex-1 pb-3 text-sm font-medium transition-all relative ${activeTab === 'attended' ? 'text-white' : 'text-white/40'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <TicketIcon className="h-5 w-5" />
              Tickets
            </div>
            {activeTab === 'attended' && (
              <motion.div
                layoutId="tabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
              />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-4">
        <AnimatePresence mode="wait">
          {activeTab === 'hosted' ? (
            <motion.div
              key="hosted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {hostedEvents.length > 0 ? (
                <div className="space-y-6">
                  {hostedEvents.map((event, i) => (
                    <motion.article
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="bg-transparent"
                    >
                      {/* Post Header */}
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-0.5">
                            <img
                              src={user?.user_metadata?.avatar_url || "https://github.com/shadcn.png"}
                              alt="Profile"
                              className="w-full h-full rounded-full object-cover border-2 border-background"
                            />
                          </div>
                          <div>
                            <span className="text-white text-sm font-semibold">
                              {user?.user_metadata?.full_name || 'You'}
                            </span>
                            <span className="text-white/40 text-xs ml-2">• Lucknow</span>
                          </div>
                        </div>
                        <button className="text-white/60 hover:text-white transition-colors">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Post Image */}
                      <div className="relative aspect-square">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Gradient overlay at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />

                        {/* Event badge */}
                        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
                          <span className="text-xs text-white font-medium">{event.category}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="px-4 pt-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <button className="hover:opacity-60 transition-opacity active:scale-90">
                              <Heart className="h-6 w-6 text-white" />
                            </button>
                            <button className="hover:opacity-60 transition-opacity active:scale-90">
                              <MessageCircle className="h-6 w-6 text-white" />
                            </button>
                            <button className="hover:opacity-60 transition-opacity active:scale-90">
                              <Send className="h-6 w-6 text-white" />
                            </button>
                          </div>
                          <button className="hover:opacity-60 transition-opacity active:scale-90">
                            <Bookmark className="h-6 w-6 text-white" />
                          </button>
                        </div>

                        {/* Likes */}
                        <div className="mt-3">
                          <span className="text-white text-sm font-semibold">
                            {Math.floor(Math.random() * 200) + 50} likes
                          </span>
                        </div>

                        {/* Caption */}
                        <div className="mt-1">
                          <span className="text-white text-sm">
                            <span className="font-semibold">{user?.user_metadata?.full_name || 'You'}</span>
                            {' '}{event.title} 🎉
                          </span>
                        </div>

                        {/* Event Details */}
                        <div className="flex items-center gap-3 mt-2 text-white/50 text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {event.date}
                          </span>
                          <span>•</span>
                          <span>{42 + i * 10} guests</span>
                        </div>

                        {/* Timestamp */}
                        <div className="mt-2">
                          <span className="text-white/40 text-[10px] uppercase">2 days ago</span>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-white/40 px-4">
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
              className="space-y-3 px-4"
            >
              {attendedEvents.length > 0 ? (
                attendedEvents.map((ticket, i) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-gradient-to-r from-white/[0.05] to-white/[0.02] rounded-xl p-4 border border-white/10 relative overflow-hidden"
                  >
                    {/* Ticket stub decoration */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-background rounded-r-full" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-background rounded-l-full" />

                    <div className="flex items-center gap-4 ml-2">
                      <img
                        src={ticket.imageUrl}
                        alt={ticket.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm truncate">{ticket.title}</h3>
                        <p className="text-cyan-400 text-xs mt-0.5">{ticket.artist}</p>
                        <div className="flex items-center gap-3 text-white/40 text-xs mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {ticket.date}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-white/40">Ticket</div>
                        <div className="text-white font-bold">₹{ticket.price}</div>
                      </div>
                    </div>
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
