import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, ChevronRight, Moon, Sun, Eye, EyeOff, Trash2, LogOut,
  User, Palette, BadgeCheck, Lock, Ticket, CreditCard, Star, Bell,
  Activity, Map, Shield, LifeBuoy, Wrench, ArrowLeft, Info,
  Smartphone, Share2, Globe, Heart
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

interface SettingsSheetProps {
  open: boolean
  onClose: () => void
  profile?: any
}

type View = 
  | 'main' 
  | 'profile-appearance'
  | 'personal-details'
  | 'milo-verified'
  | 'attendance-visibility'
  | 'bookings-hub'
  | 'payments-transactions'
  | 'your-reviews'
  | 'reminders'
  | 'pass-security'
  | 'activity-controls'
  | 'discovery-experience'
  | 'creator-tools'
  | 'support-info'

export function SettingsSheet({ open, onClose, profile }: SettingsSheetProps) {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [view, setView] = useState<View>('main')

  const handleClose = () => {
    setView('main')
    onClose()
  }

  const renderHeader = (title: string) => (
    <div className="flex items-center gap-4 mb-8">
      <button 
        onClick={() => setView('main')}
        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform"
      >
        <ArrowLeft size={18} className="text-white/60" />
      </button>
      <h2 className="text-xl font-black text-white uppercase tracking-tight">{title}</h2>
    </div>
  )

  const renderRow = (icon: any, title: string, sub: string, target?: View, color = 'rgba(255,255,255,0.4)') => (
    <button 
      onClick={() => target && setView(target)}
      className="w-full flex items-center gap-4 p-4 rounded-3xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] active:scale-[0.98] transition-all group mb-3"
    >
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-white/20 transition-colors">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <div className="text-sm font-bold text-white mb-0.5">{title}</div>
        <div className="text-[11px] font-medium text-white/30 uppercase tracking-wider">{sub}</div>
      </div>
      {target && <ChevronRight size={16} className="text-white/10 group-hover:text-white/40 transition-colors" />}
    </button>
  )

  const renderPlaceholder = (title: string, desc: string) => (
    <motion.div 
      initial={{ x: 20, opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }} 
      exit={{ x: -20, opacity: 0 }}
      className="flex flex-col h-full"
    >
      {renderHeader(title)}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <Wrench size={32} className="text-white/20" />
        </div>
        <h3 className="text-white font-bold mb-2">{title}</h3>
        <p className="text-white/40 text-sm leading-relaxed mb-8">{desc}</p>
        <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase text-white/20 tracking-widest">
          Coming in Beta 2.1
        </div>
      </div>
    </motion.div>
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[2001] h-[92vh] flex flex-col"
          >
            <div 
              className="flex-1 overflow-hidden bg-[#0A0A0A] border-t border-white/10 rounded-t-[40px] flex flex-col"
              style={{
                background: 'rgba(10, 10, 10, 0.95)',
                backdropFilter: 'blur(40px) saturate(150%)',
                WebkitBackdropFilter: 'blur(40px) saturate(150%)',
              }}
            >
              {/* Handle */}
              <div className="flex justify-center p-4 shrink-0">
                <div className="w-12 h-1.5 bg-white/10 rounded-full" />
              </div>

              {/* Close Button */}
              <button 
                onClick={handleClose}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform z-10"
              >
                <X size={20} className="text-white/60" />
              </button>

              <div className="flex-1 overflow-y-auto px-6 pb-12 no-scrollbar">
                <AnimatePresence mode="wait">
                  {view === 'main' && (
                    <motion.div 
                      key="main"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h2 className="text-[40px] font-black text-white leading-tight mb-8 mt-4 tracking-tighter">
                        Settings
                      </h2>

                      {/* AREA 1: ACCOUNT */}
                      <div className="mb-8">
                        <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-4 px-2">Account Identity</div>
                        {renderRow(<Palette size={20} className="text-purple-400" />, "Appearance", "Themes & Dark Mode", "profile-appearance")}
                        {renderRow(<User size={20} className="text-blue-400" />, "Personal Details", "Contact & Birth Date", "personal-details")}
                        {renderRow(<BadgeCheck size={20} className="text-yellow-400" />, "Milo Verified", "Student Verification", "milo-verified")}
                        {renderRow(<Eye size={20} className="text-green-400" />, "Privacy Controls", "Attendance Visibility", "attendance-visibility")}
                      </div>

                      {/* AREA 2: ASSETS */}
                      <div className="mb-8">
                        <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-4 px-2">Your Assets</div>
                        {renderRow(<Ticket size={20} className="text-orange-400" />, "Bookings Hub", "Tickets & Reservations", "bookings-hub")}
                        {renderRow(<CreditCard size={20} className="text-emerald-400" />, "Payments", "UPI & Saved Cards", "payments-transactions")}
                        {renderRow(<Star size={20} className="text-pink-400" />, "Reviews", "Feedback History", "your-reviews")}
                      </div>

                      {/* AREA 3: PREFERENCES */}
                      <div className="mb-10">
                        <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-4 px-2">Preferences</div>
                        {renderRow(<Shield size={20} className="text-indigo-400" />, "Security", "Password & 2FA", "pass-security")}
                        {renderRow(<Bell size={20} className="text-purple-400" />, "Notifications", "Haptics & Alerts", "reminders")}
                        {renderRow(<Globe size={20} className="text-cyan-400" />, "Discovery", "Radius & Feed Mutes", "discovery-experience")}
                      </div>

                      {/* Danger Zone */}
                      <button 
                         onClick={signOut}
                         className="w-full flex items-center justify-center gap-3 p-5 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold active:scale-95 transition-all text-sm mb-4"
                      >
                         <LogOut size={18} />
                         Sign Out
                      </button>

                      <div className="text-center">
                         <div className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em] mb-4">Milo v2.0.4 - Canary Build</div>
                         <div className="flex justify-center gap-6 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                            <button className="hover:text-white transition-colors">Privacy</button>
                            <button className="hover:text-white transition-colors">Terms</button>
                            <button className="hover:text-white transition-colors">Help</button>
                         </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ─── SUB-PAGES ────────────────────────────── */}

                  {view === 'profile-appearance' && (
                    <motion.div key="pa" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                      {renderHeader('Appearance')}
                      <div className="p-6 rounded-[32px] bg-white/[0.03] border border-white/[0.06] flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            {theme === 'dark' ? <Moon size={20} className="text-white" /> : <Sun size={20} className="text-yellow-400" />}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">OLED Mode</div>
                            <div className="text-[11px] font-medium text-white/30 uppercase tracking-widest">Pure Black Interface</div>
                          </div>
                        </div>
                        <button 
                          onClick={toggleTheme}
                          className={`w-14 h-8 rounded-full border border-white/10 p-1 transition-colors duration-500 ${theme === 'dark' ? 'bg-white' : 'bg-white/5'}`}
                        >
                          <motion.div 
                            animate={{ x: theme === 'dark' ? 24 : 0 }}
                            className={`w-6 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-black' : 'bg-white/20'}`}
                          />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {view === 'pass-security' && (
                    <motion.div key="ps" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                      {renderHeader('Security')}
                      
                      <div className="space-y-4 mb-10">
                        <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-2 px-2">Update Password</div>
                        <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/[0.06]">
                           <input type="password" placeholder="New Password" className="w-full bg-transparent border-none text-white text-sm focus:outline-none mb-4" />
                           <div className="h-[1px] bg-white/[0.05] mb-4" />
                           <input type="password" placeholder="Confirm Password" className="w-full bg-transparent border-none text-white text-sm focus:outline-none" />
                        </div>
                        <button className="w-full py-4 rounded-3xl bg-white text-black font-black text-sm uppercase tracking-widest active:scale-95 transition-transform">
                          Update Password
                        </button>
                      </div>

                      <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-4 px-2">Devices</div>
                      {renderRow(<Smartphone size={20} className="text-white/60" />, "Pixel 8 Pro", "Active Now · Bengaluru, IN")}
                      
                      <div className="mt-12 p-8 rounded-[40px] bg-red-500/5 border border-red-500/10 text-center">
                        <Trash2 size={32} className="text-red-500/20 mx-auto mb-4" />
                        <h4 className="text-red-500 font-bold mb-2">Delete Account</h4>
                        <p className="text-white/30 text-xs mb-6 px-4">This will permanently wipe your RSVPs, Tickets, and Profile. This cannot be undone.</p>
                        <button className="text-red-500 text-xs font-black uppercase tracking-[0.2em] border-b border-red-500/20 pb-1">Begin Deletion</button>
                      </div>
                    </motion.div>
                  )}

                  {/* Placeholders for other views */}
                  {view === 'personal-details' && renderPlaceholder('Personal Details', 'Manage your email, phone number, and account verification documents.')}
                  {view === 'milo-verified' && renderPlaceholder('Milo Verified', 'Submit student ID for instant premium verification and host perks.')}
                  {view === 'attendance-visibility' && renderPlaceholder('Visibility', 'Control who can see your past attendance history and mutual friends.')}
                  {view === 'bookings-hub' && renderPlaceholder('Bookings', 'View all upcoming tickets, table bookings, and music guestlist entries.')}
                  {view === 'payments-transactions' && renderPlaceholder('Payments', 'Manage saved cards, UPI IDs, and view detailed transaction logs.')}
                  {view === 'your-reviews' && renderPlaceholder('Reviews', 'Manage feedback you have provided to hosts and venues.')}
                  {view === 'reminders' && renderPlaceholder('Reminders', 'Configure push notifications and SMS alerts for upcoming events.')}
                  {view === 'discovery-experience' && renderPlaceholder('Discovery', 'Set your local search radius and filter categories from your feed.')}
                  {view === 'creator-tools' && renderPlaceholder('Creator Tools', 'Access your host dashboard, rep scores, and payout settlements.')}
                  {view === 'support-info' && renderPlaceholder('Support', 'Contact our waitlist helpdesk or read the latest privacy updates.')}

                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
