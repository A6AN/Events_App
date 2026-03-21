import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMyTickets } from '../hooks/useTickets'
import { supabase } from '../lib/supabase'
import type { TicketWithMeta } from '../types'

// ─── AURA PER CATEGORY ────────────────────────────
const CATEGORY_AURA: Record<string, [string, string]> = {
  club:        ['rgba(249,100,60,.55)',  'rgba(232,60,160,.4)'],
  dj_night:    ['rgba(249,100,60,.55)',  'rgba(232,60,160,.4)'],
  house_party: ['rgba(232,60,160,.5)',   'rgba(180,140,255,.4)'],
  comedy:      ['rgba(255,200,60,.5)',   'rgba(249,100,60,.35)'],
  open_mic:    ['rgba(180,140,255,.5)',  'rgba(240,180,130,.35)'],
  networking:  ['rgba(180,140,255,.5)',  'rgba(60,230,180,.35)'],
  sports:      ['rgba(60,230,180,.5)',   'rgba(80,160,255,.4)'],
  other:       ['rgba(80,160,255,.5)',   'rgba(60,230,180,.4)'],
}
const DEFAULT_AURA: [string, string] = ['rgba(180,140,255,.5)', 'rgba(249,100,60,.35)']

function getAura(category: string) {
  return CATEGORY_AURA[category] ?? DEFAULT_AURA
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  }).toUpperCase()
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).toUpperCase()
}

// ─── QR PATTERN GENERATOR ─────────────────────────
// Generates a deterministic visual QR-like pattern from ticket ID
function QRPattern({ ticketId }: { ticketId: string }) {
  // Seed a simple grid from ticketId characters
  const seed = ticketId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const size = 9
  const cells = Array.from({ length: size * size }, (_, i) => {
    // Corner finders — always filled
    const row = Math.floor(i / size)
    const col = i % size
    const inTopLeft = row < 3 && col < 3
    const inTopRight = row < 3 && col >= size - 3
    const inBottomLeft = row >= size - 3 && col < 3
    if (inTopLeft || inTopRight || inBottomLeft) return true
    // Data cells — pseudo-random from seed
    return ((seed * (i + 7) * 2654435761) >>> 0) % 3 !== 0
  })

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${size}, 1fr)`,
      gap: 2.5,
      width: '100%',
      height: '100%',
    }}>
      {cells.map((filled, i) => (
        <div key={i} style={{
          borderRadius: 0.5,
          background: filled ? '#000' : 'transparent',
        }} />
      ))}
    </div>
  )
}

// ─── MAIN TAB ─────────────────────────────────────

interface TicketsTabProps {
  tickets: TicketWithMeta[]
}

export function TicketsTab({ tickets }: TicketsTabProps) {
  const [selected, setSelected] = useState<TicketWithMeta | null>(null)

  const upcoming = tickets.filter(t =>
    new Date(t.event.end_time).getTime() > Date.now()
  )
  const past = tickets.filter(t =>
    new Date(t.event.end_time).getTime() <= Date.now()
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      fontFamily: "'Inter Tight','Inter',sans-serif",
      paddingBottom: 100,
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 22px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{
          fontSize: 26, fontWeight: 800,
          letterSpacing: '-0.03em', color: '#fff',
        }}>
          tickets
        </div>
        {tickets.length > 0 && (
          <div style={{
            fontSize: 11, color: 'rgba(255,255,255,.2)',
            letterSpacing: '0.06em',
          }}>
            {upcoming.length} UPCOMING
          </div>
        )}
      </div>

      {/* Empty state */}
      {tickets.length === 0 && (
        <div style={{ padding: '80px 24px', textAlign: 'center' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(255,255,255,.04)',
            border: '0.5px solid rgba(255,255,255,.07)',
            margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Ticket icon — CSS only */}
            <div style={{
              width: 20, height: 14,
              background: 'rgba(255,255,255,.2)',
              borderRadius: 3,
            }} />
          </div>
          <p style={{
            color: 'rgba(255,255,255,.25)',
            fontSize: 14, lineHeight: 1.6,
          }}>
            No tickets yet.<br />Find something happening tonight.
          </p>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div style={{ paddingTop: 32 }}>
          <SectionLabel label="Upcoming" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 16px' }}>
            {upcoming.map(ticket => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onTap={() => setSelected(ticket)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div style={{ paddingTop: 32 }}>
          <SectionLabel label="Past" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 16px' }}>
            {past.map(ticket => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onTap={() => setSelected(ticket)}
                dimmed
              />
            ))}
          </div>
        </div>
      )}

      {/* Full-screen ticket overlay */}
      <AnimatePresence>
        {selected && (
          <HeroTicket
            ticket={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 600,
      letterSpacing: '0.16em',
      color: 'rgba(255,255,255,.2)',
      padding: '0 22px',
      textTransform: 'uppercase',
      marginBottom: 14,
    }}>
      {label}
    </div>
  )
}

// ─── TICKET CARD (wallet list) ─────────────────────

function TicketCard({ ticket, onTap, dimmed }: {
  ticket: TicketWithMeta
  onTap: () => void
  dimmed?: boolean
}) {
  if (!ticket.ticket_type) return null
  const [a1, a2] = getAura(ticket.event.category)

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onTap}
      style={{
        background: '#000',
        border: '0.5px solid rgba(255,255,255,.08)',
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        opacity: dimmed ? 0.45 : 1,
      }}
    >
      {/* Aura glow */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute',
          width: 240, height: 240,
          top: -80, left: -60,
          background: `radial-gradient(circle, ${a1} 0%, transparent 70%)`,
        }} />
        <div style={{
          position: 'absolute',
          width: 180, height: 180,
          bottom: -60, right: -40,
          background: `radial-gradient(circle, ${a2} 0%, transparent 70%)`,
        }} />
      </div>

      {/* Bottom gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,.8) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1,
        padding: '20px 20px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Status */}
          <div style={{
            fontSize: 9, fontWeight: 600,
            letterSpacing: '0.14em',
            color: ticket.status === 'scanned'
              ? 'rgba(60,230,180,.7)'
              : 'rgba(255,255,255,.25)',
            marginBottom: 6,
            textTransform: 'uppercase',
          }}>
            {ticket.status === 'scanned' ? '✓ Used' : ticket.ticket_type.name}
          </div>

          {/* Event title */}
          <div style={{
            fontSize: 20, fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#fff', lineHeight: 1.05,
            marginBottom: 6,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {ticket.event.title}
          </div>

          {/* Meta */}
          <div style={{
            fontSize: 11,
            color: 'rgba(255,255,255,.35)',
          }}>
            {ticket.event.city} · {formatDate(ticket.event.start_time)} · {formatTime(ticket.event.start_time)}
          </div>
        </div>

        {/* Mini QR preview */}
        <div style={{
          width: 52, height: 52,
          background: 'rgba(255,255,255,.95)',
          borderRadius: 8,
          padding: 6,
          flexShrink: 0,
          opacity: ticket.status === 'scanned' ? 0.3 : 1,
        }}>
          <QRPattern ticketId={ticket.id} />
        </div>
      </div>

      {/* Ticket bottom strip */}
      <div style={{
        borderTop: '0.5px dashed rgba(255,255,255,.08)',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 500,
          letterSpacing: '0.08em',
          color: 'rgba(255,255,255,.2)',
        }}>
          {ticket.event.address ?? ticket.event.city}
        </div>
        <div style={{
          fontSize: 10, fontWeight: 700,
          color: 'rgba(255,255,255,.3)',
          letterSpacing: '0.06em',
        }}>
          TAP TO OPEN →
        </div>
      </div>
    </motion.div>
  )
}

// ─── HERO TICKET (full-screen QR view) ────────────

function HeroTicket({ ticket, onClose }: {
  ticket: TicketWithMeta
  onClose: () => void
}) {
  if (!ticket.ticket_type) return null
  const [a1, a2] = getAura(ticket.event.category)
  const isUsed = ticket.status === 'scanned'

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter Tight','Inter',sans-serif",
        maxWidth: 400,
        margin: '0 auto',
      }}
    >
      {/* Ambient aura — fills entire screen */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute',
          width: '140%', height: '60%',
          top: '15%', left: '-20%',
          background: `radial-gradient(ellipse, ${a1} 0%, transparent 65%)`,
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute',
          width: '100%', height: '50%',
          bottom: '5%', right: '-20%',
          background: `radial-gradient(ellipse, ${a2} 0%, transparent 65%)`,
          filter: 'blur(50px)',
        }} />
      </div>

      {/* Top bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '52px 24px 0',
        position: 'relative', zIndex: 1,
      }}>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,.07)',
          border: '0.5px solid rgba(255,255,255,.1)',
          borderRadius: 99, padding: '8px 16px',
          color: 'rgba(255,255,255,.5)',
          fontSize: 13, fontWeight: 500,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          ← back
        </button>

        {isUsed && (
          <div style={{
            background: 'rgba(60,230,180,.1)',
            border: '0.5px solid rgba(60,230,180,.3)',
            borderRadius: 99, padding: '6px 14px',
            fontSize: 11, fontWeight: 700,
            color: 'rgba(60,230,180,.9)',
            letterSpacing: '0.06em',
          }}>
            ✓ USED
          </div>
        )}
      </div>

      {/* Main content — centered */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 32px',
        position: 'relative', zIndex: 1,
      }}>

        {/* Hero QR */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.08, duration: 0.3, ease: 'easeOut' }}
          style={{
            background: 'rgba(255,255,255,.97)',
            borderRadius: 16,
            padding: 18,
            width: 200, height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
            opacity: isUsed ? 0.35 : 1,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <QRPattern ticketId={ticket.id} />
        </motion.div>

        {/* Event info */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{
            fontSize: 26, fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#fff', lineHeight: 1.1,
            marginBottom: 6,
          }}>
            {ticket.event.title}
          </div>

          <div style={{
            fontSize: 13, color: 'rgba(255,255,255,.35)',
            marginBottom: 4,
          }}>
            {ticket.event.address ?? ticket.event.city}
          </div>

          <div style={{
            fontSize: 13, fontWeight: 600,
            color: 'rgba(255,255,255,.6)',
            letterSpacing: '0.04em',
          }}>
            {formatDate(ticket.event.start_time)} · {formatTime(ticket.event.start_time)}
          </div>
        </motion.div>
      </div>

      {/* Bottom strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          padding: '20px 32px 52px',
          position: 'relative', zIndex: 1,
          borderTop: '0.5px solid rgba(255,255,255,.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{
            fontSize: 10, fontWeight: 600,
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,.2)',
            marginBottom: 3,
            textTransform: 'uppercase',
          }}>
            Ticket Type
          </div>
          <div style={{
            fontSize: 14, fontWeight: 700,
            color: 'rgba(255,255,255,.7)',
          }}>
            {ticket.ticket_type.name}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: 10, fontWeight: 600,
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,.2)',
            marginBottom: 3,
            textTransform: 'uppercase',
          }}>
            Paid
          </div>
          <div style={{
            fontSize: 14, fontWeight: 700,
            color: 'rgba(255,255,255,.7)',
          }}>
            {ticket.ticket_type.price === 0
              ? 'Free'
              : `₹${(ticket.ticket_type.price / 100).toLocaleString('en-IN')}`
            }
          </div>
        </div>
      </motion.div>

      {/* Offline indicator — shown if no network */}
      <OfflineBadge />
    </motion.div>
  )
}

// ─── OFFLINE INDICATOR ────────────────────────────

function OfflineBadge() {
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (!offline) return null

  return (
    <div style={{
      position: 'absolute',
      top: 52, left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(255,200,60,.12)',
      border: '0.5px solid rgba(255,200,60,.25)',
      borderRadius: 99, padding: '5px 14px',
      fontSize: 11, fontWeight: 600,
      color: 'rgba(255,200,60,.8)',
      letterSpacing: '0.06em',
      zIndex: 10,
      whiteSpace: 'nowrap',
    }}>
      OFFLINE · CACHED TICKET
    </div>
  )
}
