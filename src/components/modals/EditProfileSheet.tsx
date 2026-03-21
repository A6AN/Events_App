import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Camera, Loader2, Check, ChevronRight, MapPin,
  User, AlignLeft, Globe, Plus, Trash2, Sparkles, Languages
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { updateProfile, uploadAvatar, uploadBanner } from '../../lib/services/profileService'

interface EditProfileSheetProps {
  open: boolean
  onClose: () => void
  currentProfile: any
  onSaved: (updated?: any) => void
}

const COMMON_LANGUAGES = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Spanish', 'French', 'Arabic', 'Japanese', 'German']

export function EditProfileSheet({ open, onClose, currentProfile, onSaved }: EditProfileSheetProps) {
  const { user } = useAuth()

  const [displayName, setDisplayName] = useState(currentProfile?.display_name || '')
  const [username, setUsername] = useState(currentProfile?.username || '')
  const [bio, setBio] = useState(currentProfile?.bio || '')
  const [location, setLocation] = useState(currentProfile?.location || '')
  const [languages, setLanguages] = useState<string[]>(currentProfile?.languages || [])
  const [langInput, setLangInput] = useState('')
  const [showLangSuggestions, setShowLangSuggestions] = useState(false)

  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentProfile?.avatar_url || null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(currentProfile?.banner_url || null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const avatarRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setDisplayName(currentProfile?.display_name || '')
      setUsername(currentProfile?.username || '')
      setBio(currentProfile?.bio || '')
      setLocation(currentProfile?.location || '')
      setLanguages(currentProfile?.languages || [])
      setAvatarPreview(currentProfile?.avatar_url || null)
      setBannerPreview(currentProfile?.banner_url || null)
      setAvatarFile(null)
      setBannerFile(null)
      setError('')
      setSaved(false)
    }
  }, [open, currentProfile])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
  }

  const addLanguage = (lang: string) => {
    const trimmed = lang.trim()
    if (!trimmed || languages.includes(trimmed)) return
    setLanguages(prev => [...prev, trimmed])
    setLangInput('')
    setShowLangSuggestions(false)
  }

  const removeLanguage = (lang: string) => {
    setLanguages(prev => prev.filter(l => l !== lang))
  }

  const handleSave = async () => {
    if (!user?.id) return
    setError('')
    setSaving(true)

    try {
      let avatarUrl = currentProfile?.avatar_url
      let bannerUrl = currentProfile?.banner_url

      if (avatarFile) avatarUrl = await uploadAvatar(user.id, avatarFile)
      if (bannerFile) bannerUrl = await uploadBanner(user.id, bannerFile)

      const updated = await updateProfile(user.id, {
        display_name: displayName.trim(),
        username: username.trim().toLowerCase().replace(/\s+/g, '_'),
        bio: bio.trim(),
        location: location.trim(),
        languages,
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
      })

      setSaved(true)
      onSaved(updated)
      setTimeout(() => {
        setSaved(false)
        onClose()
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[4000] bg-black/80 backdrop-blur-md" onClick={onClose} />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[4001] h-[92vh] bg-[#0A0A0A] rounded-t-[40px] border-t border-white/10 flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="shrink-0 p-6 flex items-center justify-between border-b border-white/[0.05]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                  <User size={20} />
                </div>
                <div>
                   <h2 className="text-xl font-black text-white uppercase tracking-tight leading-none mb-1">Edit Profile</h2>
                   <div className="text-[10px] font-black uppercase tracking-widest text-white/30 truncate max-w-[150px]">
                     @{username || 'identity'}
                   </div>
                </div>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
                <X size={20} className="text-white/60" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
               {/* Banner Section */}
               <div className="relative h-40 group cursor-pointer" onClick={() => bannerRef.current?.click()}>
                 {bannerPreview ? (
                   <img src={bannerPreview} className="w-full h-full object-cover" alt="" />
                 ) : (
                   <div className="w-full h-full bg-white/[0.03] flex items-center justify-center border-b border-white/5">
                      <Camera size={24} className="text-white/10" />
                   </div>
                 )}
                 <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-widest text-white">Change Cover</div>
                 </div>
                 <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
               </div>

               {/* Avatar Overlap */}
               <div className="px-8 -mt-12 relative flex items-end gap-6 mb-10">
                  <div className="relative group cursor-pointer" onClick={() => avatarRef.current?.click()}>
                     <div className="w-32 h-32 rounded-[40px] bg-[#0A0A0A] p-1 shadow-2xl">
                        <div className="w-full h-full rounded-[36px] overflow-hidden border-2 border-white/10 group-hover:border-white/40 transition-colors">
                           {avatarPreview ? (
                             <img src={avatarPreview} className="w-full h-full object-cover" alt="" />
                           ) : (
                             <div className="w-full h-full bg-white/5 flex items-center justify-center text-3xl font-black text-white/20">
                               {displayName?.[0] || '?'}
                             </div>
                           )}
                        </div>
                     </div>
                     <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center shadow-xl border-4 border-[#0A0A0A]">
                        <Camera size={16} />
                     </div>
                     <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </div>
                  <div className="pb-4 flex-1">
                     <h3 className="text-white font-black text-xl tracking-tight leading-none mb-2">{displayName || 'Your Name'}</h3>
                     <p className="text-white/30 text-xs font-bold uppercase tracking-widest leading-none">Identity Core</p>
                  </div>
               </div>

               {/* Form Fields */}
               <div className="px-6 space-y-6 pb-20">
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[10px] text-white/30 font-black uppercase tracking-widest pl-2">Display Name</label>
                        <div className="flex items-center gap-4 px-5 py-4 rounded-3xl bg-white/[0.03] border border-white/[0.06] focus-within:border-white/20 transition-all group">
                           <User size={18} className="text-white/20 group-focus-within:text-white/60" />
                           <input 
                            value={displayName} onChange={e => setDisplayName(e.target.value)}
                            placeholder="Display Name" className="bg-transparent border-none text-white text-sm focus:outline-none flex-1" 
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] text-white/30 font-black uppercase tracking-widest pl-2">Username</label>
                        <div className="flex items-center gap-4 px-5 py-4 rounded-3xl bg-white/[0.03] border border-white/[0.06] focus-within:border-white/20 transition-all group">
                           <span className="text-white/20 font-black text-lg pb-1 group-focus-within:text-white/60">@</span>
                           <input 
                            value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, '_'))}
                            placeholder="username" className="bg-transparent border-none text-white text-sm focus:outline-none flex-1" 
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] text-white/30 font-black uppercase tracking-widest pl-2">Bio</label>
                        <div className="flex items-start gap-4 px-5 py-4 rounded-3xl bg-white/[0.03] border border-white/[0.06] focus-within:border-white/20 transition-all group">
                           <AlignLeft size={18} className="text-white/20 mt-1" />
                           <textarea 
                            value={bio} onChange={e => setBio(e.target.value)} rows={3}
                            placeholder="A short pulse of who you are..." className="bg-transparent border-none text-white text-sm focus:outline-none flex-1 resize-none no-scrollbar" 
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] text-white/30 font-black uppercase tracking-widest pl-2">Location</label>
                        <div className="flex items-center gap-4 px-5 py-4 rounded-3xl bg-white/[0.03] border border-white/[0.06] focus-within:border-white/20 transition-all group">
                           <MapPin size={18} className="text-white/20 group-focus-within:text-white/60" />
                           <input 
                            value={location} onChange={e => setLocation(e.target.value)}
                            placeholder="City, Network" className="bg-transparent border-none text-white text-sm focus:outline-none flex-1" 
                           />
                        </div>
                     </div>

                     {/* Languages Section */}
                     <div className="space-y-2 pt-2">
                        <label className="text-[10px] text-white/30 font-black uppercase tracking-widest pl-2 flex justify-between items-center">
                           Languages
                           <span className="text-[9px] opacity-60 normal-case font-medium">{languages.length} listed</span>
                        </label>
                        <div className="p-4 rounded-[32px] bg-white/[0.03] border border-white/[0.06]">
                           <div className="flex flex-wrap gap-2 mb-4">
                              {languages.map(lang => (
                                <div key={lang} className="pl-3 pr-2 py-1.5 rounded-full bg-white text-black font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                   {lang}
                                   <button onClick={() => removeLanguage(lang)} className="p-1 rounded-full bg-black/5 hover:bg-black/10 transition-colors"><X size={10} /></button>
                                </div>
                              ))}
                              {languages.length === 0 && <div className="text-[11px] font-medium text-white/20 py-1.5 px-2 tracking-wide">No languages added yet...</div>}
                           </div>
                           <div className="relative">
                              <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                              <input 
                                value={langInput} 
                                onChange={e => { setLangInput(e.target.value); setShowLangSuggestions(true); }}
                                onFocus={() => setShowLangSuggestions(true)}
                                placeholder="Add Language..." 
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-white text-xs focus:outline-none focus:border-white/20 outline-none" 
                              />
                              {showLangSuggestions && langInput && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden z-20 shadow-2xl">
                                   {COMMON_LANGUAGES.filter(l => l.toLowerCase().includes(langInput.toLowerCase())).slice(0, 5).map(l => (
                                     <button key={l} onClick={() => addLanguage(l)} className="w-full px-5 py-3 text-left text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5 last:border-none uppercase font-black tracking-widest">{l}</button>
                                   ))}
                                   <button onClick={() => addLanguage(langInput)} className="w-full px-5 py-3 text-left text-xs text-white uppercase font-black tracking-widest bg-white/5">Add "{langInput}"</button>
                                </div>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>

                  {error && <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-bold text-center tracking-wide">{error}</div>}
               </div>
            </div>

            {/* Footer Save Button */}
            <div className="shrink-0 p-8 pb-12 bg-black/60 backdrop-blur-3xl border-t border-white/10">
               <button 
                onClick={handleSave}
                disabled={saving || saved || !displayName}
                className="w-full h-16 rounded-3xl bg-white text-black font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-30 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)]"
               >
                 {saving ? <Loader2 size={24} className="animate-spin" /> : 
                  saved ? <>Identity Verified <Check size={20} /></> : <>Save Changes <Sparkles size={18} /></>}
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
