import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Users, Clock, Navigation2, ChevronRight } from 'lucide-react'
import type { DbEvent } from '../../types'

interface NearbyEventsSheetProps {
  isOpen: boolean
  onClose: () => void
  events: DbEvent[]
  userLocation: { lat: number; lng: number } | null
  onEventClick: (event: DbEvent) => void
}

const RANGE_OPTIONS = [
  { label: '1km', value: 1 },
  { label: '5km', value: 5 },
  { label: '10km', value: 10 },
  { label: '25km', value: 25 },
]

// Calculate distance between two points (Haversine)
const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371 // km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function NearbyEventsSheet({
  isOpen,
  onClose,
  events,
  userLocation,
  onEventClick
}: NearbyEventsSheetProps) {
  const [selectedRange, setSelectedRange] = useState(5)

  const nearbyEvents = useMemo(() => {
    if (!userLocation) return events
    return events
      .map(event => ({
        ...event,
        distance: getDistance(userLocation.lat, userLocation.lng, event.lat || 0, event.lng || 0)
      }))
      .filter(event => event.distance <= selectedRange)
      .sort((a, b) => a.distance - b.distance)
  }, [events, userLocation, selectedRange])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[1001] max-h-[85vh] flex flex-col"
          >
            <div 
              className="flex-1 flex flex-col bg-[#0A0A0A] border-t border-white/10 rounded-t-[40px] overflow-hidden shadow-[0_-20px_40px_rgba(0,0,0,0.5)]"
              style={{
                background: 'rgba(10, 10, 10, 0.85)',
                backdropFilter: 'blur(40px) saturate(150%)',
                WebkitBackdropFilter: 'blur(40px) saturate(150%)',
              }}
            >
              {/* Handle */}
              <div className="flex justify-center py-4">
                <div className="w-12 h-1.5 bg-white/10 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-6 pb-6 border-b border-white/[0.05]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-2">
                       Nearby
                      <span className="text-white/20 text-lg uppercase tracking-widest font-bold">Events</span>
                    </h2>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-wider mt-1">
                      {nearbyEvents.length} found within {selectedRange}km
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
                  >
                    <X size={20} className="text-white/60" />
                  </button>
                </div>

                {/* Range Filter Pill List */}
                <div className="flex gap-2 p-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-x-auto no-scrollbar">
                  {RANGE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedRange(opt.value)}
                      className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                        selectedRange === opt.value
                          ? 'bg-white text-black'
                          : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Events List */}
              <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
                {!userLocation ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                    <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                      <Navigation2 size={24} className="text-white/20" />
                    </div>
                    <p className="text-white font-bold mb-2">Location Missing</p>
                    <p className="text-white/40 text-sm">Please enable location access to see events around you.</p>
                  </div>
                ) : nearbyEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                    <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                      <MapPin size={24} className="text-white/20" />
                    </div>
                    <p className="text-white font-bold mb-2">None Nearby</p>
                    <p className="text-white/40 text-sm">No events found in this range. Try expanding your search area.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {nearbyEvents.map((event, i) => (
                      <motion.button
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => { onEventClick(event); onClose(); }}
                        className="w-full group relative flex items-center gap-4 p-3 rounded-[24px] bg-white/[0.03] border border-white/[0.06] active:scale-[0.98] transition-all overflow-hidden text-left"
                      >
                        {/* Hover Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Image */}
                        <div className="relative w-20 h-20 rounded-[18px] overflow-hidden shrink-0 shadow-xl">
                          <img
                            src={event.cover_url || ''}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/10" />
                          
                          {/* Distance Label */}
                          {'distance' in event && (
                            <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-white/10">
                              <span className="text-[9px] text-white font-black tracking-tighter">
                                {(event.distance as number).toFixed(1)}KM
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="text-white font-bold text-base truncate mb-1">
                            {event.title}
                          </h3>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3 text-white/40">
                              <div className="flex items-center gap-1.5">
                                <Clock size={12} />
                                <span className="text-[11px] font-bold uppercase tracking-tight">Today • 20:00</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Users size={12} />
                                <span className="text-[11px] font-bold uppercase tracking-tight">
                                  {Math.floor(Math.random() * 40) + 12} GOING
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-white/30 truncate">
                              <MapPin size={12} />
                              <span className="text-[11px] font-medium truncate uppercase tracking-tighter">
                                {event.address || 'TBD'} • {event.city}
                              </span>
                            </div>
                          </div>
                        </div>

                        <ChevronRight size={18} className="text-white/10 group-hover:text-white/30 transition-colors mr-2 shrink-0" />
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
