import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, IndianRupee } from 'lucide-react'
import type { DbVenue } from '../types'

interface Props {
  venue: DbVenue | null
  open: boolean
  onClose: () => void
}

export function VenueBookingDialog({ venue, open, onClose }: Props) {
  const [hours, setHours] = useState(4)
  const [booked, setBooked] = useState(false)

  if (!venue) return null

  const pricePerHour = venue.price_per_hour ?? 0
  const total = pricePerHour * hours
  const totalDisplay = total === 0 ? 'Free' : `₹${total.toLocaleString('en-IN')}`

  const handleClose = () => {
    setBooked(false)
    setHours(4)
    onClose()
  }

  const FF = "'Inter Tight','Inter',sans-serif"

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(12px)', zIndex: 40 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={!booked ? handleClose : undefined}
          />

          <motion.div
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              maxWidth: 400, margin: '0 auto',
              background: '#000',
              border: '0.5px solid rgba(255,255,255,.08)',
              borderRadius: '24px 24px 0 0',
              zIndex: 50, overflow: 'hidden',
              fontFamily: FF,
            }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Aura */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <div style={{
                position: 'absolute', width: 300, height: 300, top: -100, right: -60,
                background: 'radial-gradient(circle, rgba(80,160,255,.4) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }} />
            </div>

            <div style={{ position: 'relative', zIndex: 1, padding: '28px 24px 48px' }}>
              {/* Handle + close */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,.15)' }} />
                <button onClick={handleClose} style={{
                  background: 'rgba(255,255,255,.07)', border: '0.5px solid rgba(255,255,255,.1)',
                  borderRadius: '50%', width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}>
                  <X size={16} color="rgba(255,255,255,.5)" />
                </button>
              </div>

              {!booked ? (
                <>
                  {/* Venue info */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', color: 'rgba(255,255,255,.25)', marginBottom: 6 }}>
                      {(venue.categories?.[0] ?? 'VENUE').toUpperCase()}
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.1, marginBottom: 6 }}>
                      {venue.name}
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,.35)' }}>
                      {venue.address ?? venue.city}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                    {[
                      { icon: <Users size={14} />, label: 'CAPACITY', value: `${venue.capacity ?? '—'} people` },
                      { icon: <IndianRupee size={14} />, label: 'PER HOUR', value: pricePerHour === 0 ? 'Free' : `₹${(pricePerHour / 100).toLocaleString('en-IN')}` },
                    ].map(({ icon, label, value }) => (
                      <div key={label} style={{
                        flex: 1, background: 'rgba(255,255,255,.04)',
                        border: '0.5px solid rgba(255,255,255,.07)',
                        borderRadius: 14, padding: '14px 16px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,.25)', marginBottom: 6 }}>
                          {icon}
                          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em' }}>{label}</span>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Amenities */}
                  {(venue.amenities ?? []).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                      {(venue.amenities ?? []).map((a, i) => (
                        <div key={i} style={{
                          padding: '5px 12px', borderRadius: 99,
                          background: 'rgba(255,255,255,.04)',
                          border: '0.5px solid rgba(255,255,255,.08)',
                          fontSize: 11, color: 'rgba(255,255,255,.45)',
                        }}>{a}</div>
                      ))}
                    </div>
                  )}

                  {/* Hours stepper */}
                  <div style={{
                    background: 'rgba(255,255,255,.04)', border: '0.5px solid rgba(255,255,255,.07)',
                    borderRadius: 16, padding: '16px 20px', marginBottom: 24,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.2)', letterSpacing: '0.1em', marginBottom: 4 }}>DURATION</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{hours} hours</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {[{ label: '−', action: () => setHours(h => Math.max(2, h - 1)) }, { label: '+', action: () => setHours(h => Math.min(12, h + 1)) }].map(({ label, action }) => (
                        <button key={label} onClick={action} style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'rgba(255,255,255,.07)', border: '0.5px solid rgba(255,255,255,.1)',
                          color: '#fff', fontSize: 18, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>{label}</button>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => setBooked(true)}
                    style={{
                      width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                      background: 'rgba(255,255,255,.97)', color: '#000',
                      fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: FF,
                    }}
                  >
                    Book · {totalDisplay}
                  </button>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  style={{ textAlign: 'center', paddingTop: 16 }}
                >
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'rgba(80,160,255,.12)', border: '0.5px solid rgba(80,160,255,.3)',
                    margin: '0 auto 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                  }}>✓</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 6 }}>
                    Venue booked.
                  </div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,.35)', marginBottom: 4 }}>{venue.name}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.25)', marginBottom: 32 }}>
                    {hours} hours · {totalDisplay}
                  </div>
                  <button onClick={handleClose} style={{
                    width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                    background: 'rgba(255,255,255,.97)', color: '#000',
                    fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: FF,
                  }}>
                    Done →
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
