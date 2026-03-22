import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { createTicket } from '../lib/services/ticketService'
import type { EventWithMeta, DbTicketType } from '../types'

const CATEGORY_AURA: Record<string, string> = {
  club: 'rgba(249,100,60,.5)',
  dj_night: 'rgba(249,100,60,.5)',
  house_party: 'rgba(232,60,160,.45)',
  comedy: 'rgba(255,200,60,.45)',
  open_mic: 'rgba(180,140,255,.45)',
  networking: 'rgba(60,230,180,.4)',
  sports: 'rgba(60,230,180,.45)',
  other: 'rgba(80,160,255,.45)',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).toUpperCase()
}

interface Props {
  event: EventWithMeta | null
  ticketType: DbTicketType | null
  open: boolean
  onClose: () => void
}

export function TicketBookingDialog({ event, ticketType, open, onClose }: Props) {
  const { user } = useAuth()
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(false)
  const [booked, setBooked] = useState(false)
  const [error, setError] = useState('')

  if (!event || !ticketType) return null

  const aura = CATEGORY_AURA[event.category] ?? 'rgba(180,140,255,.45)'
  const total = ticketType.price === 0 ? 'Free' : `₹${((ticketType.price * qty) / 100).toLocaleString('en-IN')}`

  const handleBook = async () => {
    if (!user) { setError('Please log in to book.'); return }
    setLoading(true)
    setError('')
    try {
      await createTicket({
        event_id: event.id,
        user_id: user.id,
        ticket_type_id: ticketType.id,
        quantity: qty,
      })
      setBooked(true)
    } catch (e: any) {
      setError(e.message ?? 'Booking failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setBooked(false)
    setQty(1)
    setError('')
    onClose()
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(12px)', zIndex: 9500 }}
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
              zIndex: 9501, overflow: 'hidden',
              fontFamily: "'Inter Tight','Inter',sans-serif",
            }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Aura */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <div style={{
                position: 'absolute', width: 300, height: 300,
                top: -100, left: -60,
                background: `radial-gradient(circle, ${aura} 0%, transparent 70%)`,
                filter: 'blur(20px)',
              }} />
            </div>

            <div style={{ position: 'relative', zIndex: 1, padding: '28px 24px 48px' }}>
              {/* Handle + close */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,.15)', margin: '0 auto' }} />
                <button onClick={handleClose} style={{
                  background: 'rgba(255,255,255,.07)', border: '0.5px solid rgba(255,255,255,.1)',
                  borderRadius: '50%', width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}>
                  <X size={16} color="rgba(255,255,255,.5)" />
                </button>
              </div>

              {!booked ? (
                <>
                  {/* Event info */}
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', color: 'rgba(255,255,255,.25)', marginBottom: 6 }}>
                      {event.category.replace('_', ' ').toUpperCase()}
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.1, marginBottom: 6 }}>
                      {event.title}
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,.35)' }}>
                      {event.address ?? event.city}
                    </div>
                  </div>

                  {/* Date / time row */}
                  <div style={{
                    background: 'rgba(255,255,255,.04)', border: '0.5px solid rgba(255,255,255,.07)',
                    borderRadius: 16, padding: '16px 20px', marginBottom: 16,
                    display: 'flex', justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.2)', letterSpacing: '0.1em', marginBottom: 4 }}>DATE</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{formatDate(event.start_time)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.2)', letterSpacing: '0.1em', marginBottom: 4 }}>TIME</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{formatTime(event.start_time)}</div>
                    </div>
                  </div>

                  {/* Ticket type + qty */}
                  <div style={{
                    background: 'rgba(255,255,255,.04)', border: '0.5px solid rgba(255,255,255,.07)',
                    borderRadius: 16, padding: '16px 20px', marginBottom: 24,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.2)', letterSpacing: '0.1em', marginBottom: 4 }}>TICKET</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{ticketType.name}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'rgba(255,255,255,.07)', border: '0.5px solid rgba(255,255,255,.1)',
                        color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>−</button>
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, minWidth: 16, textAlign: 'center' }}>{qty}</span>
                      <button onClick={() => setQty(q => Math.min(6, q + 1))} style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'rgba(255,255,255,.07)', border: '0.5px solid rgba(255,255,255,.1)',
                        color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>+</button>
                    </div>
                  </div>

                  {error && <p style={{ color: 'rgba(249,100,60,.9)', fontSize: 12, marginBottom: 12 }}>{error}</p>}

                  {/* CTA */}
                  <button
                    onClick={handleBook}
                    disabled={loading}
                    style={{
                      width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                      background: loading ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.97)',
                      color: loading ? 'rgba(255,255,255,.2)' : '#000',
                      fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit', position: 'relative', overflow: 'hidden',
                    }}
                  >
                    {loading ? 'Booking...' : `Confirm · ${total}`}
                  </button>
                </>
              ) : (
                /* Confirmation */
                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  style={{ textAlign: 'center', paddingTop: 16 }}
                >
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'rgba(60,230,180,.12)', border: '0.5px solid rgba(60,230,180,.3)',
                    margin: '0 auto 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28,
                  }}>✓</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 6 }}>
                    You're in.
                  </div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,.35)', marginBottom: 8 }}>
                    {event.title}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.25)', marginBottom: 32 }}>
                    {formatDate(event.start_time)} · {formatTime(event.start_time)}
                  </div>
                  <button onClick={handleClose} style={{
                    width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                    background: 'rgba(255,255,255,.97)', color: '#000',
                    fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    View in Tickets →
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
