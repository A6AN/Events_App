import { motion, AnimatePresence } from 'framer-motion'
import { Map, User, Plus, Compass, ShoppingBag, LayoutGrid } from 'lucide-react'

interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onPlusClick: () => void
}

const TABS = [
  { id: 'feed',    icon: LayoutGrid, label: 'Feed' },
  { id: 'explore', icon: Compass,    label: 'Explore' },
  { id: 'map',     icon: Map,        label: 'Map' },
  { id: 'tickets', icon: ShoppingBag, label: 'Tickets' },
  { id: 'profile', icon: User,       label: 'Profile' },
]

export function BottomNav({ activeTab, onTabChange, onPlusClick }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-8 pointer-events-none flex flex-col items-center">
      
      {/* ─── CREATE BUTTON (FAB) ─────────────────────── */}
      <motion.button
        onClick={onPlusClick}
        className="mb-4 w-14 h-14 rounded-full flex items-center justify-center pointer-events-auto relative group active:scale-95 transition-transform"
        style={{
          background: '#FFFFFF',
          boxShadow: '0 0 20px rgba(255,255,255,0.2), 0 10px 30px rgba(0,0,0,0.5)',
        }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ y: -4 }}
      >
        <Plus className="w-6 h-6 text-black" strokeWidth={2.5} />
        
        {/* Ring Glow */}
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            boxShadow: '0 0 30px rgba(255,255,255,0.4)',
          }}
        />
      </motion.button>

      {/* ─── MAIN DOCK ───────────────────────────────── */}
      <motion.nav
        className="w-full max-w-[400px] h-[68px] rounded-[32px] pointer-events-auto flex items-center justify-between px-2 relative"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        style={{
          background: 'rgba(15, 15, 15, 0.75)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.05)',
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex-1 h-full flex flex-col items-center justify-center gap-1 group overflow-hidden"
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute inset-x-1 inset-y-2 rounded-[24px]"
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                    }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </AnimatePresence>

              <motion.div
                animate={{ 
                  y: isActive ? -2 : 0,
                  scale: isActive ? 1.05 : 1
                }}
                className="relative z-10"
              >
                <Icon 
                  size={22} 
                  strokeWidth={isActive ? 2.2 : 1.8}
                  style={{
                    color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.35)',
                    filter: isActive ? 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' : 'none',
                    transition: 'color 0.3s ease, filter 0.3s ease'
                  }}
                />
              </motion.div>

              <span 
                className="text-[10px] font-bold tracking-tight relative z-10"
                style={{
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)',
                  opacity: isActive ? 1 : 0.8,
                  transition: 'color 0.3s ease'
                }}
              >
                {tab.label}
              </span>

              {/* Indicator Dot */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute bottom-1 w-1 h-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  />
                )}
              </AnimatePresence>
            </button>
          )
        })}
      </motion.nav>
    </div>
  )
}
