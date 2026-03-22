import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Loader2, MapPin, Calendar, Clock, Search,
  Sparkles, ArrowRight, ArrowLeft, Building2,
  PartyPopper, Mic2, Music, Palette, Users,
  CheckCircle2, X, Upload, Info, Trophy, Ghost, Wine
} from 'lucide-react'
import { createEvent, uploadEventImage, createVenueBooking } from '../../lib/services/eventService'
import { useAuth } from '../../context/AuthContext'
import { DbVenue, EventCategory } from '../../types'
import { supabase } from '../../lib/supabase'

const STEPS = {
  VIBE: 0,
  LOCATION: 1,
  DETAILS: 2,
  TICKETS: 3,
}

const CATEGORIES: { id: EventCategory; label: string; icon: any; color: string }[] = [
  { id: 'club',        label: 'Clubbing',    icon: Wine,         color: '#f9643c' },
  { id: 'dj_night',    label: 'DJ Night',    icon: Music,        color: '#f9643c' },
  { id: 'house_party', label: 'House Party', icon: Ghost,        color: '#e83ca0' },
  { id: 'comedy',      label: 'Comedy',      icon: Mic2,         color: '#ffc83c' },
  { id: 'open_mic',    label: 'Open Mic',    icon: Palette,      color: '#b48cff' },
  { id: 'networking',  label: 'Networking',  icon: Users,        color: '#b48cff' },
  { id: 'sports',      label: 'Sports',      icon: Trophy,       color: '#3ce6b4' },
  { id: 'other',       label: 'Other',       icon: PartyPopper,  color: '#FFFFFF' },
]

const OLA_MAPS_API_KEY = (import.meta as any).env.VITE_OLA_MAPS_API_KEY

interface CreateEventWizardProps {
  open: boolean
  onClose: () => void
  eventType: 'casual' | 'ticketed'
  venues: DbVenue[]
  onEventCreated?: () => void
}

export const CreateEventWizard: React.FC<CreateEventWizardProps> = ({ open, onClose, eventType, venues, onEventCreated }) => {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(STEPS.VIBE)
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [locationQuery, setLocationQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    locationType: 'custom' as 'custom' | 'venue',
    selectedVenueId: '',
    location_name: '',
    lat: 28.6139,
    lng: 77.2090,
    price: 0,
    category: '' as EventCategory | '',
    mood: '',
    capacity: 100,
    visibility: 'public' as 'public' | 'friends_only' | 'invite_only',
    ticketName: 'General Admission',
    ticketPrice: 0,
    ticketCapacity: 100,
    endTime: '',
  })

  useEffect(() => {
    if (!open) {
      setCurrentStep(STEPS.VIBE)
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        locationType: 'custom',
        selectedVenueId: '',
        location_name: '',
        lat: 28.6139,
        lng: 77.2090,
        price: 0,
        category: '',
        mood: '',
        capacity: 100,
        visibility: 'public',
        ticketName: 'General Admission',
        ticketPrice: 0,
        ticketCapacity: 100,
        endTime: '',
      })
      setImageFile(null)
      setImagePreview(null)
      setLocationQuery('')
      setSearchResults([])
    }
  }, [open])

  const searchLocation = useCallback(async (query: string) => {
    if (!query || query.length < 3 || !OLA_MAPS_API_KEY) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      const res = await fetch(`https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(query)}&api_key=${OLA_MAPS_API_KEY}`)
      const data = await res.json()
      setSearchResults(data.predictions || [])
    } catch {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleLocationQueryChange = (value: string) => {
    setLocationQuery(value)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => searchLocation(value), 400)
  }

  const handleLocationSelect = async (result: any) => {
    const mainText = result.structured_formatting?.main_text || result.description
    setFormData(prev => ({ ...prev, location_name: mainText }))
    setLocationQuery(mainText)
    setSearchResults([])

    if (result.place_id && OLA_MAPS_API_KEY) {
      try {
        const res = await fetch(`https://api.olamaps.io/places/v1/details?place_id=${result.place_id}&api_key=${OLA_MAPS_API_KEY}`)
        const data = await res.json()
        const geo = data.result?.geometry?.location
        if (geo) setFormData(prev => ({ ...prev, lat: geo.lat, lng: geo.lng }))
      } catch (err) { console.error(err) }
    }
  }

  const handleNext = () => {
    if (currentStep < STEPS.TICKETS) setCurrentStep(prev => prev + 1)
    else handleSubmit()
  }

  const handleBack = () => {
    if (currentStep > STEPS.VIBE) setCurrentStep(prev => prev - 1)
  }

  const handleVenueSelect = (venue: DbVenue) => {
    setFormData(prev => ({
      ...prev,
      locationType: 'venue',
      selectedVenueId: venue.id,
      location_name: venue.name,
      capacity: venue.capacity || 100,
      price: (venue.price_per_hour || 0) * 4
    }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) return alert('File size > 5MB')
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      let imageUrl = null
      if (imageFile) imageUrl = await uploadEventImage(imageFile)

      if (formData.locationType === 'venue' && formData.selectedVenueId) {
        const venue = venues.find(v => v.id === formData.selectedVenueId)
        if (venue) {
           const [h, m] = formData.time.split(':').map(Number)
           const end = new Date(); end.setHours(h + 3, m)
           await createVenueBooking({
             venue_id: venue.id, user_id: user.id, booking_date: formData.date,
             start_time: formData.time, end_time: end.toTimeString().slice(0, 5),
             total_price: (venue.price_per_hour || 1000) * 3, notes: `Event: ${formData.title}`
           })
        }
      }

      const createdEvent = await createEvent({
        title: formData.title,
        description: formData.description,
        start_time: new Date(`${formData.date}T${formData.time}`).toISOString(),
        end_time: formData.endTime 
          ? new Date(`${formData.date}T${formData.endTime}`).toISOString()
          : new Date(new Date(`${formData.date}T${formData.time}`).getTime() + 3 * 60 * 60 * 1000).toISOString(),
        address: formData.location_name,
        lat: formData.lat,
        lng: formData.lng,
        cover_url: imageUrl,
        host_id: user.id,
        category: formData.category as EventCategory,
        city: 'Delhi',
        status: 'published',
        visibility: formData.visibility,
        total_capacity: formData.ticketCapacity,
        is_free: eventType === 'casual',
        event_type: 'standard',
        min_age: 0,
        is_sponsored: false,
        is_staff_pick: false,
        fomo_score: 0,
      })
      console.log('[createEvent result]', JSON.stringify(createdEvent))

      if (eventType === 'ticketed') {
        const { error: ttError } = await supabase
          .from('ticket_types')
          .insert({
            event_id: createdEvent.id,
            name: formData.ticketName,
            price: formData.ticketPrice * 100,
            capacity: formData.ticketCapacity,
            sort_order: 0,
          })
        if (ttError) throw ttError
      }
      onClose()
      onEventCreated?.()
    } catch (error: any) {
      alert(`Error: ${error.message || 'Failed'}`)
    } finally { setIsLoading(false) }
  }

  const TITLES = ["The Vibe", "The Spot", "The Details", "The Tickets"]

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[5000] bg-black/80 backdrop-blur-md" onClick={onClose} />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[5001] h-[92vh] bg-[#0A0A0A] rounded-t-[40px] border-t border-white/10 flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="shrink-0 p-6 flex items-center justify-between border-b border-white/[0.05]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                  <Sparkles size={20} />
                </div>
                <div>
                   <h2 className="text-xl font-black text-white uppercase tracking-tight leading-none mb-1">{TITLES[currentStep]}</h2>
                   <div className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                     {eventType} • Step {currentStep + 1}
                     <div className="w-1 h-1 rounded-full bg-white/10" />
                     {Math.round(((currentStep + 1) / 4) * 100)}%
                   </div>
                </div>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
                <X size={20} className="text-white/60" />
              </button>
            </div>

            {/* Progress Bar (Neon line) */}
            <div className="h-[2px] w-full bg-white/5">
               <motion.div 
                className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                animate={{ width: `${((currentStep + 1) / 4) * 100}%` }}
               />
            </div>

            {/* Content Scroller */}
            <div className="flex-1 overflow-y-auto px-6 py-8 no-scrollbar">
               <AnimatePresence mode="wait">
                 {currentStep === STEPS.VIBE && (
                   <motion.div key="vibe" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <div className="grid grid-cols-2 gap-3 mb-8">
                        {CATEGORIES.map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                            className={`p-4 rounded-3xl border transition-all flex flex-col gap-3 group active:scale-[0.98] ${
                              formData.category === cat.id 
                              ? 'bg-white border-white' 
                              : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                              formData.category === cat.id ? 'bg-black text-white' : 'bg-white/5 text-white/40'
                            }`}>
                              <cat.icon size={20} />
                            </div>
                            <span className={`text-xs font-black uppercase tracking-widest ${
                              formData.category === cat.id ? 'text-black' : 'text-white/40'
                            }`}>{cat.label}</span>
                          </button>
                        ))}
                      </div>

                      <div className="space-y-6">
                         <div className="space-y-2 px-2">
                            <label className="text-[10px] text-white/30 font-black uppercase tracking-widest">Atmosphere / Mood</label>
                            <input 
                              placeholder="e.g. Neon, Underground, Sunset"
                              value={formData.mood}
                              onChange={e => setFormData(prev => ({ ...prev, mood: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                            />
                         </div>
                      </div>
                   </motion.div>
                 )}

                 {currentStep === STEPS.LOCATION && (
                   <motion.div key="loc" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <div className="flex gap-2 p-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl mb-8">
                        <button 
                          onClick={() => setFormData(prev => ({ ...prev, locationType: 'custom' }))}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                            formData.locationType === 'custom' ? 'bg-white text-black shadow-lg' : 'text-white/40'
                          }`}
                        >
                          <MapPin size={14} /> Custom
                        </button>
                        <button 
                          onClick={() => setFormData(prev => ({ ...prev, locationType: 'venue' }))}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                            formData.locationType === 'venue' ? 'bg-white text-black shadow-lg' : 'text-white/40'
                          }`}
                        >
                          <Building2 size={14} /> Venues
                        </button>
                      </div>

                      {formData.locationType === 'custom' ? (
                        <div className="space-y-6">
                          <div className="relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                            <input 
                              placeholder="Search with Ola Maps..."
                              value={locationQuery}
                              onChange={e => handleLocationQueryChange(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                            />
                          </div>
                          
                          <div className="space-y-2 max-h-[40vh] overflow-y-auto no-scrollbar">
                           {isSearching ? <div className="p-10 text-center text-white/20 text-xs font-bold uppercase animate-pulse">Searching...</div> : 
                            searchResults.map((r, i) => (
                              <button key={i} onClick={() => handleLocationSelect(r)} className="w-full flex items-center gap-4 p-4 rounded-3xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all group text-left">
                                <MapPin size={18} className="text-white/20 group-hover:text-white/60" />
                                <div className="flex-1 truncate">
                                  <div className="text-sm font-bold text-white truncate">{r.structured_formatting?.main_text || r.description}</div>
                                  <div className="text-[10px] text-white/30 truncate uppercase">{r.structured_formatting?.secondary_text}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                          {formData.location_name && !isSearching && searchResults.length === 0 && (
                            <div className="p-6 rounded-[32px] bg-green-500/5 border border-green-500/20 flex items-center gap-4">
                              <CheckCircle2 size={24} className="text-green-500" />
                              <div className="flex-1 truncate">
                                <div className="text-sm font-bold text-white truncate">{formData.location_name}</div>
                                <div className="text-[10px] text-green-500/60 font-black tracking-widest uppercase">Verified Destination</div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {venues.slice(0, 10).map(v => (
                            <button 
                              key={v.id} onClick={() => handleVenueSelect(v)}
                              className={`w-full flex items-center gap-4 p-3 rounded-[28px] border transition-all active:scale-[0.98] text-left ${
                                formData.selectedVenueId === v.id ? 'bg-white border-white' : 'bg-white/[0.03] border-white/[0.06]'
                              }`}
                            >
                              <img src={v.cover_url || ''} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                              <div className="flex-1 min-w-0 pr-2">
                                <div className={`text-sm font-bold truncate ${formData.selectedVenueId === v.id ? 'text-black' : 'text-white'}`}>{v.name}</div>
                                <div className={`text-[10px] font-medium truncate uppercase tracking-tighter ${formData.selectedVenueId === v.id ? 'text-black/60' : 'text-white/30'}`}>{v.address}</div>
                              </div>
                              {formData.selectedVenueId === v.id && <CheckCircle2 size={24} className="text-black mr-2" />}
                            </button>
                          ))}
                        </div>
                      )}
                   </motion.div>
                 )}

                 {currentStep === STEPS.DETAILS && (
                   <motion.div key="det" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      {/* Image Picker */}
                      <label className="block relative aspect-video rounded-[32px] bg-white/5 border border-white/10 overflow-hidden cursor-pointer group transition-colors hover:border-white/20">
                         {imagePreview ? (
                           <img src={imagePreview} className="w-full h-full object-cover" alt="" />
                         ) : (
                           <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                              <Upload size={32} className="text-white/20 group-hover:text-white/40 transition-colors" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Add Cover Art</span>
                           </div>
                         )}
                         {imagePreview && <button onClick={e => { e.preventDefault(); setImagePreview(null); setImageFile(null); }} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center"><X size={16} className="text-white" /></button>}
                         <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                      </label>

                      <div className="space-y-6">
                        <div className="space-y-2 px-2">
                          <label className="text-[10px] text-white/30 font-black uppercase tracking-widest pl-1">Event Title</label>
                          <input 
                            placeholder="A Bold Catchy Name" 
                            value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                          />
                        </div>

                        <div className="flex gap-4">
                          <div className="flex-1 space-y-2 px-2">
                            <label className="text-[10px] text-white/30 font-black uppercase tracking-widest pl-1">Date</label>
                            <input type="date" value={formData.date} onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none [color-scheme:dark]" />
                          </div>
                          <div className="flex-1 space-y-2 px-2">
                            <label className="text-[10px] text-white/30 font-black uppercase tracking-widest pl-1">Time</label>
                            <input type="time" value={formData.time} onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none [color-scheme:dark]" />
                          </div>
                        </div>

                        {eventType === 'ticketed' && (
                          <div className="space-y-2 px-2">
                            <label className="text-[10px] text-white/30 font-black uppercase tracking-widest pl-1">Ticket Price (₹)</label>
                            <div className="relative">
                              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 font-bold">₹</div>
                              <input placeholder="0" type="number" value={formData.price || ''} onChange={e => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))} className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-5 py-4 text-white text-sm focus:outline-none" />
                            </div>
                          </div>
                        )}

                        <div className="space-y-2 px-2">
                          <label className="text-[10px] text-white/30 font-black uppercase tracking-widest pl-1">Description</label>
                          <textarea 
                            rows={3} placeholder="Tell us the story..." value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-white/30 transition-colors no-scrollbar"
                          />
                        </div>
                      </div>
                   </motion.div>
                 )}

                 {currentStep === STEPS.TICKETS && (
                   <motion.div key="tickets" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                     
                     {/* Visibility */}
                     <div className="space-y-3">
                       <label className="text-[10px] text-white/30 font-black uppercase tracking-widest px-2">Who can see this?</label>
                       {([
                         { value: 'public', label: 'Everyone', sub: 'Visible to all Milo users' },
                         { value: 'friends_only', label: 'Friends Only', sub: 'Only your connections' },
                         { value: 'invite_only', label: 'Invite Only', sub: 'Only people you invite' },
                       ] as const).map(opt => (
                         <button
                           key={opt.value}
                           onClick={() => setFormData(prev => ({ ...prev, visibility: opt.value }))}
                           className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                             formData.visibility === opt.value ? 'bg-white border-white' : 'bg-white/[0.03] border-white/[0.06]'
                           }`}
                         >
                           <div>
                             <div className={`text-sm font-black uppercase tracking-widest ${formData.visibility === opt.value ? 'text-black' : 'text-white'}`}>{opt.label}</div>
                             <div className={`text-[10px] mt-0.5 ${formData.visibility === opt.value ? 'text-black/50' : 'text-white/30'}`}>{opt.sub}</div>
                           </div>
                           {formData.visibility === opt.value && <CheckCircle2 size={20} className="text-black" />}
                         </button>
                       ))}
                     </div>

                     {/* Ticket type — only for ticketed events */}
                     {eventType === 'ticketed' && (
                       <div className="space-y-4">
                         <label className="text-[10px] text-white/30 font-black uppercase tracking-widest px-2">Ticket Type</label>
                         
                         <div className="space-y-2 px-2">
                           <label className="text-[10px] text-white/20 uppercase tracking-widest">Ticket Name</label>
                           <input
                             placeholder="e.g. General Admission, VIP"
                             value={formData.ticketName}
                             onChange={e => setFormData(prev => ({ ...prev, ticketName: e.target.value }))}
                             className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-white/30"
                           />
                         </div>

                         <div className="flex gap-4">
                           <div className="flex-1 space-y-2 px-2">
                             <label className="text-[10px] text-white/20 uppercase tracking-widest">Price (₹)</label>
                             <input
                               type="number"
                               placeholder="0"
                               value={formData.ticketPrice || ''}
                               onChange={e => setFormData(prev => ({ ...prev, ticketPrice: parseInt(e.target.value) || 0 }))}
                               className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none"
                             />
                           </div>
                           <div className="flex-1 space-y-2 px-2">
                             <label className="text-[10px] text-white/20 uppercase tracking-widest">Capacity</label>
                             <input
                               type="number"
                               placeholder="100"
                               value={formData.ticketCapacity || ''}
                               onChange={e => setFormData(prev => ({ ...prev, ticketCapacity: parseInt(e.target.value) || 100 }))}
                               className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none"
                             />
                           </div>
                         </div>
                       </div>
                     )}

                     {/* End time */}
                     <div className="space-y-2 px-2">
                       <label className="text-[10px] text-white/30 font-black uppercase tracking-widest">End Time · optional</label>
                       <input
                         type="time"
                         value={formData.endTime}
                         onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none [color-scheme:dark]"
                       />
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="shrink-0 p-6 pb-12 bg-black/60 backdrop-blur-3xl border-t border-white/10 flex gap-4">
               {currentStep > 0 && (
                 <button onClick={handleBack} disabled={isLoading} className="w-16 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-all">
                    <ArrowLeft size={20} className="text-white/60" />
                 </button>
               )}
               <button 
                onClick={handleNext}
                disabled={isLoading || (currentStep === 0 && !formData.category) || (currentStep === 1 && !formData.location_name) || (currentStep === STEPS.TICKETS && eventType === 'ticketed' && !formData.ticketName)}
                className="flex-1 h-14 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
               >
                 {isLoading ? <Loader2 size={24} className="animate-spin" /> : 
                  currentStep === STEPS.TICKETS ? <>Go Live <Sparkles size={18} /></> : <>Next Step <ArrowRight size={18} /></>}
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.getElementById('app-container') || document.body
  )
}
