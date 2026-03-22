import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, Clock, MapPin, ArrowLeft, Share2, 
  Bookmark, Heart, MessageCircle, Send, Trash2, 
  ArrowRight, ShieldCheck, Users, Info
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { 
  likeEvent, unlikeEvent, getEventLikeStatus, 
  getComments, addComment, deleteComment 
} from '../../lib/services/socialService'
import type { EventWithMeta, DbTicketType } from '../../types'

interface Comment {
  id: string
  user_id: string
  content: string
  created_at: string
  user?: {
    username: string
    display_name: string
    avatar_url: string
  }
}

interface EventDetailsSheetProps {
  event: EventWithMeta | null
  open: boolean
  onClose: () => void
  onBook?: (ticketType?: DbTicketType) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  club: '#f9643c',
  dj_night: '#f9643c',
  house_party: '#e83ca0',
  comedy: '#ffc83c',
  open_mic: '#b48cff',
  networking: '#b48cff',
  sports: '#3ce6b4',
}

export function EventDetailsSheet({ event, open, onClose, onBook }: EventDetailsSheetProps) {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (event?.id && user?.id && open) {
      getEventLikeStatus(event.id, user.id).then(({ isLiked, likeCount }) => {
        setIsLiked(isLiked)
        setLikeCount(likeCount)
      })
      getComments(event.id).then(setComments as any)
    }
  }, [event?.id, user?.id, open])

  if (!event) return null

  const catColor = CATEGORY_COLORS[event.category] || '#FFFFFF'

  const handleLike = async () => {
    if (!user?.id) return
    try {
      if (isLiked) {
        await unlikeEvent(event.id, user.id)
        setIsLiked(false)
        setLikeCount(prev => Math.max(0, prev - 1))
      } else {
        await likeEvent(event.id, user.id)
        setIsLiked(true)
        setLikeCount(prev => prev + 1)
      }
    } catch (err) { console.error(err) }
  }

  const handleAddComment = async () => {
    if (!user?.id || !newComment.trim()) return
    setIsSubmitting(true)
    try {
      const comment = await addComment(event.id, user.id, newComment.trim())
      if (comment) {
        setComments(prev => [comment as unknown as Comment, ...prev])
        setNewComment('')
      }
    } catch (err) { console.error(err) } finally { setIsSubmitting(false) }
  }

  const handleDeleteComment = async (id: string) => {
    try {
      await deleteComment(id)
      setComments(prev => prev.filter(c => c.id !== id))
    } catch (err) { console.error(err) }
  }

  const startDate = event.start_time ? new Date(event.start_time) : new Date()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[1001] flex flex-col bg-black overflow-hidden"
          >
            {/* ─── HEADER ACTIONS ────────────────────────── */}
            <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              
              <div className="flex gap-3">
                <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 active:scale-90 transition-transform">
                  <Share2 size={18} className="text-white" />
                </button>
                <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 active:scale-90 transition-transform">
                  <Bookmark size={18} className="text-white" />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto pb-40">
              {/* ─── HERO IMAGE ───────────────────────────── */}
              <div className="relative w-full aspect-[4/5]">
                <img 
                  src={event.cover_url || ''} 
                  className="w-full h-full object-cover"
                  alt={event.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                
                {/* Category Badge */}
                <div className="absolute bottom-6 left-6">
                  <div 
                    className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                    style={{ 
                      backgroundColor: `${catColor}20`,
                      borderColor: `${catColor}40`,
                      color: catColor,
                      boxShadow: `0 0 20px ${catColor}30`
                    }}
                  >
                    {event.category.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* ─── CONTENT ──────────────────────────────── */}
              <div className="px-6 -mt-12 relative z-10">
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-4xl font-black text-white leading-tight mb-6"
                >
                  {event.title}
                </motion.h1>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex flex-col gap-2">
                    <Calendar size={18} style={{ color: catColor }} />
                    <div className="text-xs text-white/40 font-bold uppercase tracking-wider">Date</div>
                    <div className="text-sm text-white font-medium">
                      {startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex flex-col gap-2">
                    <Clock size={18} style={{ color: catColor }} />
                    <div className="text-xs text-white/40 font-bold uppercase tracking-wider">Time</div>
                    <div className="text-sm text-white font-medium">
                      {startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-8 p-4 rounded-3xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <MapPin size={20} className="text-white/60" />
                  </div>
                  <div>
                    <div className="text-xs text-white/40 font-bold uppercase tracking-wider mb-1">Location</div>
                    <div className="text-sm text-white font-medium leading-relaxed">
                      {event.address || 'TBD'}, {event.city}
                    </div>
                  </div>
                </div>

                {/* Host Section */}
                <div className="flex items-center gap-4 mb-10 group">
                  <div className="relative">
                    <img 
                      src={event.host?.avatar_url || ''} 
                      className="w-14 h-14 rounded-full border-2 border-white/10"
                      alt="Host"
                    />
                    {event.host?.is_verified && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 border-2 border-black">
                        <ShieldCheck size={10} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-0.5">Hosted By</div>
                    <div className="text-lg font-bold text-white flex items-center gap-1.5 leading-none">
                      {event.host?.display_name}
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 flex items-center gap-1">
                        {event.host?.rep_tier?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <button className="px-5 py-2 rounded-full border border-white/10 text-xs font-bold text-white active:bg-white/10 transition-colors">
                    Follow
                  </button>
                </div>

                {/* About Section */}
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4 text-white/40 font-bold text-xs uppercase tracking-widest">
                    <Info size={14} />
                    About This Event
                  </div>
                  <p className="text-lg text-white/70 leading-relaxed font-medium">
                    {event.description || `Join us for ${event.title} at ${event.address || 'the venue'}. Expect high energy, great vibes, and an unforgettable night.`}
                  </p>
                </div>

                {/* Social Proof */}
                <div className="mb-12 flex items-center justify-between p-6 rounded-[32px] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10">
                  <div className="flex flex-col gap-1">
                    <div className="flex -space-x-2">
                      {[1,2,3,4].map(i => (
                        <img 
                          key={i} 
                          src={`https://i.pravatar.cc/100?u=${event.id}${i}`} 
                          className="w-9 h-9 rounded-full border-2 border-black" 
                          alt="" 
                        />
                      ))}
                    </div>
                    <div className="text-[11px] font-bold text-white/60 mt-2 flex items-center gap-1">
                      <Users size={12} />
                      {Math.floor(Math.random() * 50) + 12} Friends Attending
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">Status</div>
                    <div className="text-xs font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
                      Selling Fast
                    </div>
                  </div>
                </div>

                {/* Comments Toggle */}
                <div className="mb-8">
                   <button 
                    onClick={() => setShowComments(!showComments)}
                    className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
                   >
                     <div className="flex items-center gap-3">
                       <MessageCircle size={18} className="text-white/40" />
                       <span className="text-sm font-bold text-white">Discussion</span>
                       <span className="text-xs text-white/30 font-medium">({comments.length})</span>
                     </div>
                     <motion.div animate={{ rotate: showComments ? 180 : 0 }}>
                        <ArrowRight size={16} className="text-white/20 rotate-90" />
                     </motion.div>
                   </button>

                   <AnimatePresence>
                    {showComments && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 flex flex-col gap-4 px-2"
                      >
                        {user && (
                          <div className="flex gap-3 mb-4">
                            <input 
                              placeholder="Say something..." 
                              value={newComment}
                              onChange={e => setNewComment(e.target.value)}
                              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                            />
                            <button 
                              onClick={handleAddComment}
                              disabled={isSubmitting || !newComment.trim()}
                              className="w-10 h-10 items-center justify-center flex bg-white rounded-xl text-black active:scale-95 transition-transform"
                            >
                              <Send size={16} />
                            </button>
                          </div>
                        )}
                        {comments.map(c => (
                          <div key={c.id} className="flex gap-3 group">
                            <img src={c.user?.avatar_url || ''} className="w-8 h-8 rounded-full" alt="" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-xs font-bold text-white/80">{c.user?.display_name}</span>
                                {c.user_id === user?.id && (
                                  <button onClick={() => handleDeleteComment(c.id)} className="opacity-0 group-hover:opacity-100 p-1">
                                    <Trash2 size={12} className="text-red-400" />
                                  </button>
                                )}
                              </div>
                              <p className="text-sm text-white/50">{c.content}</p>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                   </AnimatePresence>
                </div>
              </div>
            </div>

            {/* ─── STICKY FOOTER ─────────────────────────── */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pb-10 bg-black/60 backdrop-blur-3xl border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
              <div className="max-w-[400px] mx-auto flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Standard Entry</div>
                  <div className="text-2xl font-black text-white flex items-baseline gap-1">
                    {event.is_free ? 'FREE' : `₹${event.ticket_types?.[0]?.price || '??'}`}
                    {!event.is_free && <span className="text-[10px] text-white/30 font-bold">/ PERSON</span>}
                  </div>
                </div>

                <button 
                  onClick={handleLike}
                  className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 bg-white/5 border border-white/10 active:scale-95 transition-transform"
                >
                  <Heart size={20} className={isLiked ? 'fill-red-500 text-red-500' : 'text-white/40'} />
                  <span className="text-[9px] font-bold text-white/30">{likeCount}</span>
                </button>

                <button 
                  onClick={() => onBook?.(event.ticket_types?.[0])}
                  className="px-8 h-14 rounded-2xl bg-white text-black font-black flex items-center gap-2 active:scale-95 transition-transform shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                >
                  BOOK NOW
                  <ArrowRight size={18} strokeWidth={3} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
