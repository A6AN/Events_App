import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Ticket, Coffee, X, Sparkles } from 'lucide-react'

const CATEGORIES = [
  { id: 'club',        name: 'Clubbing',    c1: '#f9643c', c2: '#e83ca0' },
  { id: 'dj_night',    name: 'DJ Night',    c1: '#f9643c', c2: '#b48cff' },
  { id: 'house_party', name: 'House Party', c1: '#e83ca0', c2: '#b48cff' },
  { id: 'comedy',      name: 'Comedy',      c1: '#ffc83c', c2: '#f9643c' },
  { id: 'open_mic',    name: 'Open Mic',    c1: '#b48cff', c2: '#3ce6b4' },
  { id: 'networking',  name: 'Networking',  c1: '#3ce6b4', c2: '#b48cff' },
  { id: 'sports',      name: 'Sports',      c1: '#3ce6b4', c2: '#4169e1' },
  { id: 'other',       name: 'Other',       c1: '#FFFFFF', c2: '#333333' },
]

interface CreateEventWheelProps {
  open: boolean
  onClose: () => void
  onSelectType: (type: 'casual' | 'ticketed') => void
}

export function CreateEventWheel({ open, onClose, onSelectType }: CreateEventWheelProps) {
  const [category, setCategory] = useState(CATEGORIES[0])
  const [eventType, setEventType] = useState<'casual' | 'ticketed'>('casual')

  useEffect(() => {
    if (!open) {
      setCategory(CATEGORIES[1]) // Default to DJ Night
      setEventType('casual')
    }
  }, [open])

  const handleContinue = () => {
    onSelectType(eventType)
    onClose()
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[6000] bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[6001] h-[80vh] bg-[#0A0A0A] rounded-t-[40px] border-t border-white/10 flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
            style={{
              background: 'rgba(10, 10, 10, 0.95)',
              backdropFilter: 'blur(40px) saturate(150%)',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center py-4">
              <div className="w-12 h-1.5 bg-white/10 rounded-full" />
            </div>

            {/* Close */}
            <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
              <X size={20} className="text-white/60" />
            </button>

            <div className="flex-1 overflow-y-auto px-8 py-4 no-scrollbar">
               <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">
                    <Sparkles size={10} /> Mode Selection
                  </div>
                  <h2 className="text-[32px] font-black text-white tracking-tighter leading-tight uppercase">Set the Vibe</h2>
               </div>

               {/* Large Active Disc (Visual Only) */}
               <div className="flex flex-col items-center mb-12">
                  <div className="relative group perspective-1000">
                     <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                        className="w-48 h-48 rounded-full shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] flex items-center justify-center relative border-4 border-white/10 overflow-hidden"
                     >
                        <div 
                           className="absolute inset-0 opacity-80"
                           style={{
                              background: `conic-gradient(from 0deg, ${category.c1}, ${category.c2}, #FFF, ${category.c1})`
                           }}
                        />
                        <div className="absolute inset-2 rounded-full border border-white/5" />
                        <div className="absolute inset-4 rounded-full border border-white/5" />
                        <div className="absolute inset-6 rounded-full border border-white/5" />
                        <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 z-10 flex items-center justify-center shadow-inner">
                           <div className="w-2 h-2 rounded-full bg-white/20" />
                        </div>
                        {/* Vinyl Texture */}
                        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: 'repeating-radial-gradient(circle at center, transparent, transparent 1px, #FFF 1.1px, transparent 1.2px)', backgroundSize: '100% 100%' }} />
                     </motion.div>
                  </div>
                  <div className="mt-6 text-white font-black uppercase tracking-[0.2em]">{category.name}</div>
               </div>

               {/* Mini Disc Scroller */}
               <div className="flex gap-4 overflow-x-auto no-scrollbar pb-8 px-4 -mx-4">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat.id} 
                      onClick={() => setCategory(cat)}
                      className={`flex flex-col items-center gap-3 shrink-0 transition-all active:scale-90 ${category.id === cat.id ? 'opacity-100' : 'opacity-40 grayscale hover:grayscale-0 hover:opacity-100'}`}
                    >
                      <div 
                        className={`w-14 h-14 rounded-full border-2 transition-all ${category.id === cat.id ? 'border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'border-white/10 shadow-lg'}`}
                        style={{ background: `linear-gradient(135deg, ${cat.c1}, ${cat.c2})` }}
                      >
                         <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white/20" />
                         </div>
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">{cat.name.split(' ')[0]}</span>
                    </button>
                  ))}
               </div>

               {/* Type Toggle */}
               <div className="bg-white/[0.03] border border-white/[0.06] rounded-[32px] p-2 flex gap-2 mb-10">
                  <button 
                    onClick={() => setEventType('casual')}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${eventType === 'casual' ? 'bg-white text-black shadow-xl shadow-white/5' : 'text-white/40'}`}
                  >
                    <Coffee size={16} /> Casual
                  </button>
                  <button 
                    onClick={() => setEventType('ticketed')}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${eventType === 'ticketed' ? 'bg-white text-black shadow-xl shadow-white/5' : 'text-white/40'}`}
                  >
                    <Ticket size={16} /> Ticketed
                  </button>
               </div>
            </div>

            {/* Continue Footer */}
            <div className="p-8 pb-12 bg-black/60 backdrop-blur-3xl border-t border-white/10">
               <button 
                onClick={handleContinue}
                className="w-full h-16 rounded-3xl bg-white text-black font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)]"
               >
                 Initialize Creation <ArrowRight size={18} />
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById('app-container') || document.body
  )
}
