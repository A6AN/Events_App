import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, UserPlus, Heart, MessageCircle, Ticket, Calendar, Check, Loader2, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  getNotifications,
  markAllNotificationsRead,
  subscribeToNotifications,
  AppNotification,
} from '../../lib/services/notificationService'

interface NotificationsSheetProps {
  open: boolean
  onClose: () => void
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return 'Just Now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function groupNotifications(notifs: AppNotification[]): { label: string; items: AppNotification[] }[] {
  const now = Date.now()
  const today: AppNotification[] = []
  const thisWeek: AppNotification[] = []
  const earlier: AppNotification[] = []

  notifs.forEach(n => {
    const age = now - new Date(n.created_at).getTime()
    if (age < 86400000) today.push(n)
    else if (age < 604800000) thisWeek.push(n)
    else earlier.push(n)
  })

  const groups = []
  if (today.length) groups.push({ label: 'Today', items: today })
  if (thisWeek.length) groups.push({ label: 'This Week', items: thisWeek })
  if (earlier.length) groups.push({ label: 'Earlier', items: earlier })
  return groups
}

const TYPE_CONFIG: Record<AppNotification['type'], { icon: any; color: string }> = {
  follow: { icon: UserPlus, color: '#a78bfa' },
  like: { icon: Heart, color: '#f472b6' },
  comment: { icon: MessageCircle, color: '#60a5fa' },
  booking: { icon: Ticket, color: '#34d399' },
  dm: { icon: MessageCircle, color: '#facc15' },
  event_reminder: { icon: Calendar, color: '#fb923c' },
  friend_request: { icon: UserPlus, color: '#a78bfa' },
  friend_accepted: { icon: Sparkles, color: '#34d399' },
}

export function NotificationsSheet({ open, onClose }: NotificationsSheetProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingRead, setMarkingRead] = useState(false)

  const load = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    const data = await getNotifications(user.id)
    setNotifications(data)
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    if (open && user?.id) load()
  }, [open, user?.id, load])

  useEffect(() => {
    if (open && user?.id) {
      markAllNotificationsRead(user.id)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }
  }, [open, user?.id])

  useEffect(() => {
    if (!user?.id) return
    const channel = subscribeToNotifications(user.id, (notif) => {
      setNotifications(prev => [notif, ...prev])
    })
    return () => { channel.unsubscribe() }
  }, [user?.id])

  const handleMarkAllRead = async () => {
    if (!user?.id) return
    setMarkingRead(true)
    await markAllNotificationsRead(user.id)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setMarkingRead(false)
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const groups = groupNotifications(notifications)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[3000] bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[3001] h-[85vh] flex flex-col"
          >
            <div 
              className="flex-1 flex flex-col bg-[#0A0A0A] border-t border-white/10 rounded-t-[40px] overflow-hidden"
              style={{
                background: 'rgba(10, 10, 10, 0.9)',
                backdropFilter: 'blur(40px) saturate(150%)',
                WebkitBackdropFilter: 'blur(40px) saturate(150%)',
              }}
            >
              {/* Handle */}
              <div className="flex justify-center py-4">
                <div className="w-12 h-1.5 bg-white/10 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-6 pb-6 flex items-center justify-between border-b border-white/[0.05]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight leading-none mb-1">Alerts</h2>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30">
                      {unreadCount > 0 ? `${unreadCount} unread messages` : 'Up To Date'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase text-white/60 tracking-widest active:scale-95 transition-all">
                      Clear All
                    </button>
                  )}
                  <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
                    <X size={20} className="text-white/60" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar">
                {loading ? (
                  <div className="space-y-4 px-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="flex gap-4 animate-pulse">
                        <div className="w-12 h-12 rounded-full bg-white/5" />
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-3 w-40 bg-white/5 rounded" />
                          <div className="h-2 w-20 bg-white/5 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                    <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                      <Sparkles size={24} className="text-white/20" />
                    </div>
                    <p className="text-white font-bold mb-1">Clear Horizon</p>
                    <p className="text-white/30 text-xs font-medium px-4">Follow friends and join events to start filling your vibe sheet.</p>
                  </div>
                ) : (
                  groups.map(({ label, items }) => (
                    <div key={label} className="mb-6">
                      <div className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mb-4 px-4">{label}</div>
                      <div className="space-y-2">
                        {items.map((n, i) => {
                          const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.follow
                          const Icon = config.icon
                          return (
                            <motion.div
                              key={n.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03 }}
                              className={`flex items-center gap-4 p-4 rounded-[32px] transition-all group relative overflow-hidden ${
                                !n.read ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-transparent hover:bg-white/[0.02]'
                              }`}
                            >
                               {/* Icon Overlay for unread */}
                               {!n.read && (
                                 <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/[0.03] to-transparent pointer-events-none" />
                               )}

                               <div className="relative shrink-0">
                                  <img 
                                    src={n.actor?.avatar_url || `https://ui-avatars.com/api/?name=${n.actor?.display_name || '?'}&background=222&color=fff`} 
                                    className="w-12 h-12 rounded-full border-2 border-white/5 object-cover" 
                                    alt="" 
                                  />
                                  <div 
                                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[#0A0A0A] flex items-center justify-center shadow-lg"
                                    style={{ background: config.color }}
                                  >
                                    <Icon size={12} className="text-black" strokeWidth={3} />
                                  </div>
                               </div>

                               <div className="flex-1 min-w-0">
                                  <p className="text-sm text-white/80 leading-snug">
                                    <span className="font-black text-white">{n.actor?.display_name || 'Anonymous'}</span> {n.body}
                                  </p>
                                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1.5 block">
                                    {timeAgo(n.created_at)}
                                  </span>
                               </div>

                               {!n.read && (
                                 <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                               )}
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
