import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { EventWithMeta, TicketWithMeta } from '../types'
import { useFriendsActivity } from '../hooks/useFriends'
import { Sparkles, MapPin, Search, Plus, Users, Heart, MessageCircle, Ticket, Calendar } from 'lucide-react'

const CATEGORY_AURA: Record<string, [string, string, string]> = {
  club:        ['rgba(249,100,60,.5)',  'rgba(232,60,160,.4)',  '#f9643c'],
  dj_night:    ['rgba(249,100,60,.5)',  'rgba(232,60,160,.4)',  '#f9643c'],
  house_party: ['rgba(232,60,160,.45)','rgba(180,140,255,.35)','#e83ca0'],
  comedy:      ['rgba(255,200,60,.45)','rgba(249,100,60,.3)',  '#ffc83c'],
  open_mic:    ['rgba(180,140,255,.45)','rgba(240,180,130,.3)','#b48cff'],
  networking:  ['rgba(180,140,255,.45)','rgba(60,230,180,.3)', '#b48cff'],
  sports:      ['rgba(60,230,180,.4)', 'rgba(80,160,255,.35)', '#3ce6b4'],
  other:       ['rgba(80,160,255,.4)', 'rgba(60,230,180,.3)',  '#50a0ff'],
}

const DEFAULT_AURA: [string, string, string] = ['rgba(180,140,255,.4)', 'rgba(249,100,60,.3)', '#b48cff']

function getAura(category: string) { return CATEGORY_AURA[category] ?? DEFAULT_AURA }

function formatPrice(tickets: EventWithMeta['ticket_types']) {
  if (!tickets?.length) return 'Free'
  const min = Math.min(...tickets.map(t => t.price))
  return min === 0 ? 'Free' : `₹${(min / 100).toLocaleString('en-IN')}`
}

function formatTime(iso: string) { return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) }
function formatDate(iso: string) { return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }) }

interface SocialTabProps {
  events: EventWithMeta[]
  tickets: TicketWithMeta[]
  onEventSelect: (event: EventWithMeta) => void
}

export function SocialTab({ events, tickets, onEventSelect }: SocialTabProps) {
  const [subTab, setSubTab] = useState<'discover' | 'friends'>('discover')

  return (
    <div className="min-h-screen bg-black text-white pb-32 font-['Inter_Tight','Inter',sans-serif]">
      {/* Premium Header */}
      <div className="px-6 pt-14 pb-4 flex items-center justify-between sticky top-0 bg-black/60 backdrop-blur-3xl z-40 border-b border-white/[0.03]">
        <div className="flex flex-col">
           <h1 className="text-[32px] font-black tracking-tighter uppercase leading-none">Milo</h1>
           <div className="flex items-center gap-1.5 mt-1 text-[10px] font-black uppercase tracking-widest text-white/20">
              <MapPin size={10} /> Delhi · Phase 1
           </div>
        </div>
        <div className="flex gap-2">
           <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
              <Search size={18} className="text-white/60" />
           </button>
           <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center active:scale-95 transition-transform">
              <Plus size={18} />
           </button>
        </div>
      </div>

      {/* Glass Sub-tabs */}
      <div className="px-6 py-6 sticky top-[108px] z-30 bg-black/40 backdrop-blur-2xl">
        <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-[24px]">
           {(['discover', 'friends'] as const).map(tab => (
             <button
               key={tab}
               onClick={() => setSubTab(tab)}
               className={`flex-1 py-3 text-[11px] font-black uppercase tracking-[0.2em] rounded-full transition-all relative ${
                 subTab === tab ? 'text-black' : 'text-white/40 hover:text-white/60'
               }`}
             >
               {subTab === tab && (
                 <motion.div layoutId="social-tab-bg" className="absolute inset-0 bg-white rounded-full" />
               )}
               <span className="relative z-10">{tab}</span>
             </button>
           ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6">
        <AnimatePresence mode="wait">
          {subTab === 'discover' ? (
            <motion.div key="disc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
               <DiscoverFeed events={events} onEventSelect={onEventSelect} />
            </motion.div>
          ) : (
            <motion.div key="fri" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
               <FriendsLedger />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function DiscoverFeed({ events, onEventSelect }: { events: EventWithMeta[], onEventSelect: (e: EventWithMeta) => void }) {
  const happeningNow = events.filter(e => {
    const now = Date.now(); const s = new Date(e.start_time).getTime(); const end = new Date(e.end_time).getTime()
    return s <= now && end >= now
  })
  const upcoming = events.filter(e => new Date(e.start_time).getTime() > Date.now()).sort((a,b) => b.fomo_score - a.fomo_score)
  const tonight = upcoming.filter(e => new Date(e.start_time).toDateString() === new Date().toDateString())
  const later = upcoming.filter(e => new Date(e.start_time).toDateString() !== new Date().toDateString())

  return (
    <div className="space-y-12 py-4">
      {happeningNow.length > 0 && (
        <Section label="Happening Now" badge="LIVE">
          <CardCarousel events={happeningNow} onSelect={onEventSelect} live />
        </Section>
      )}
      {tonight.length > 0 && (
        <Section label="Tonight">
          <CardCarousel events={tonight} onSelect={onEventSelect} />
        </Section>
      )}
      {later.length > 0 && (
        <Section label="Coming Up">
          <CardCarousel events={later} onSelect={onEventSelect} />
        </Section>
      )}
      {events.length === 0 && (
        <div className="py-20 text-center flex flex-col items-center">
           <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <Sparkles size={24} className="text-white/10" />
           </div>
           <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em]">Zero Activity near you</p>
        </div>
      )}
    </div>
  )
}

function Section({ label, badge, children }: { label: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">{label}</h3>
        {badge && <div className="text-[9px] font-black bg-red-500 px-2 py-0.5 rounded-full text-white tracking-widest animate-pulse">{badge}</div>}
      </div>
      {children}
    </div>
  )
}

function CardCarousel({ events, onSelect, live }: { events: EventWithMeta[], onSelect: (e: EventWithMeta) => void, live?: boolean }) {
  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6">
      {events.map(e => <SocialEventCard key={e.id} event={e} onSelect={onSelect} live={live} />)}
    </div>
  )
}

function SocialEventCard({ event, onSelect, live }: { event: EventWithMeta, onSelect: (e: EventWithMeta) => void, live?: boolean }) {
  const [a1, a2, accent] = getAura(event.category)
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => onSelect(event)}
      className="shrink-0 w-48 aspect-[3/4] rounded-[36px] overflow-hidden relative border border-white/5 text-left group transition-all"
    >
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity" style={{ background: `radial-gradient(circle at 0% 0%, ${a1} 0%, transparent 60%), radial-gradient(circle at 100% 100%, ${a2} 0%, transparent 60%)` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      
      <div className="absolute bottom-0 inset-x-0 p-6 z-10">
         <div className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: accent }}>{event.category.replace('_',' ')} · {formatPrice(event.ticket_types)}</div>
         <h4 className="text-lg font-black leading-tight text-white mb-1.5 line-clamp-2 tracking-tight uppercase italic">{event.title}</h4>
         <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/40 tracking-widest uppercase">
            {event.city} · {formatTime(event.start_time)}
         </div>
      </div>
      {live && <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />}
    </motion.button>
  )
}

function FriendsLedger() {
  const { data: activity = [], isLoading } = useFriendsActivity()
  if (isLoading) return <div className="py-20 text-center text-[10px] font-black uppercase tracking-widest text-white/20 animate-pulse">Scanning Network...</div>
  if (activity.length === 0) return (
     <div className="py-20 text-center flex flex-col items-center">
        <Users size={32} className="text-white/10 mb-6" />
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] max-w-[200px] leading-relaxed">Add friends to decode their activity pulse tonight.</p>
     </div>
  )
  return <div className="space-y-4 py-4">{activity.map((item, i) => <ActivityRow key={i} item={item} i={i} />)}</div>
}

function ActivityRow({ item, i }: { item: any, i: number }) {
  const actions: Record<string, string> = { ticket_purchased: 'booked', event_hosted: 'hosting', checked_in: 'spotted at' }
  const timeAgo = (() => {
    const diff = Date.now() - new Date(item.created_at).getTime()
    const m = Math.floor(diff / 60000); if (m < 60) return `${m}m`
    const h = Math.floor(m / 60); if (h < 24) return `${h}h`
    return `${Math.floor(h / 24)}d`
  })()

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
      className="flex items-center gap-4 p-4 rounded-[32px] bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all group"
    >
       <div className="w-12 h-12 rounded-full border-2 border-white/10 overflow-hidden shrink-0">
          {item.profile?.avatar_url ? <img src={item.profile.avatar_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center font-black text-white/20 bg-white/5 uppercase italic">{item.profile?.display_name?.[0]}</div>}
       </div>
       <div className="flex-1 min-w-0 pr-2">
          <div className="text-[13px] leading-snug">
             <span className="font-black text-white uppercase italic tracking-tighter mr-1">{item.profile?.display_name || item.profile?.username}</span>
             <span className="text-white/40 font-bold uppercase tracking-widest text-[10px] mr-1">{actions[item.activity_type] || 'moving to'}</span>
             {item.event && <span className="font-black text-white/80 uppercase tracking-tighter italic">{item.event.title}</span>}
          </div>
          <div className="flex items-center gap-2 mt-1">
             <div className="text-[9px] font-bold text-white/20 tracking-widest uppercase">{timeAgo} ago</div>
             {item.event && <div className="w-1 h-1 rounded-full bg-white/5" />}
             {item.event && <div className="text-[9px] font-bold text-white/20 tracking-widest uppercase truncate">{item.event.city}</div>}
          </div>
       </div>
       <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white hover:text-black transition-all">
          <ChevronRight size={16} className="opacity-40 group-hover:opacity-100" />
       </div>
    </motion.div>
  )
}

function ChevronRight({ size, className }: { size: number, className?: string }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg> }
