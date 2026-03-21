import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import type { EventWithMeta, DbVenue } from '../types'
import { useEventSearch, useVenueSearch } from '../hooks/useEvents'

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
const DEFAULT_AURA: [string, string, string] = ['rgba(180,140,255,.4)','rgba(249,100,60,.3)','#b48cff']
function getAura(cat: string) { return CATEGORY_AURA[cat] ?? DEFAULT_AURA }

const EVENT_CATEGORIES = ['All','club','dj_night','house_party','comedy','open_mic','networking','sports','other']
const VENUE_AMENITIES = ['All','Rooftop','Dance Floor','Bar','Outdoor','Parking','Live Music']

function formatPrice(tickets: EventWithMeta['ticket_types']) {
  if (!tickets?.length) return 'Free'
  const min = Math.min(...tickets.map(t => t.price))
  return min === 0 ? 'Free' : `₹${(min / 100).toLocaleString('en-IN')}`
}
function formatDate(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  if (d.toDateString() === today.toDateString()) return 'Tonight'
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

interface ExploreTabProps {
  events: EventWithMeta[]
  venues: DbVenue[]
  onEventSelect: (event: EventWithMeta) => void
}

export function ExploreTab({ events, venues, onEventSelect }: ExploreTabProps) {
  const [view, setView] = useState<'events' | 'venues'>('events')
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeAmenity, setActiveAmenity] = useState('All')

  // DB-powered search — fires when query >= 2 chars
  const { data: searchedEvents = [] } = useEventSearch(query)
  const { data: searchedVenues = [] } = useVenueSearch(query)

  // Client-side category filter on top of fetched events
  const displayEvents = query.length >= 2
    ? searchedEvents as EventWithMeta[]
    : activeCategory === 'All'
    ? events
    : events.filter(e => e.category === activeCategory)

  const displayVenues = query.length >= 2
    ? searchedVenues as DbVenue[]
    : activeAmenity === 'All'
    ? venues
    : venues.filter(v =>
        v.amenities?.some(a => a.toLowerCase().includes(activeAmenity.toLowerCase()))
      )

  const isSearching = query.length >= 2

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
        position: 'sticky', top: 0,
        background: '#000',
        zIndex: 20,
      }}>
        <div style={{
          fontSize: 26, fontWeight: 800,
          letterSpacing: '-0.03em', color: '#fff',
          marginBottom: 16,
        }}>
          explore
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,.04)',
          border: '0.5px solid rgba(255,255,255,.08)',
          borderRadius: 14, padding: '12px 14px',
          marginBottom: 16,
        }}>
          <Search size={15} color="rgba(255,255,255,.25)" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={view === 'events' ? 'Search events...' : 'Search venues...'}
            style={{
              flex: 1, background: 'transparent', border: 'none',
              outline: 'none', color: '#fff', fontSize: 15, fontWeight: 500,
              fontFamily: 'inherit', letterSpacing: '-0.01em',
            }}
          />
          {query.length > 0 && (
            <button onClick={() => setQuery('')} style={{
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,.25)', cursor: 'pointer',
              fontSize: 16, lineHeight: 1, padding: 0,
            }}>×</button>
          )}
        </div>

        {/* View toggle */}
        <div style={{
          display: 'flex', gap: 0, marginBottom: 16,
        }}>
          {(['events', 'venues'] as const).map(tab => (
            <button key={tab} onClick={() => setView(tab)} style={{
              background: 'transparent', border: 'none',
              padding: '6px 0', marginRight: 24,
              fontSize: 13, fontWeight: view === tab ? 700 : 400,
              color: view === tab ? '#fff' : 'rgba(255,255,255,.25)',
              cursor: 'pointer', fontFamily: 'inherit',
              letterSpacing: '-0.01em', position: 'relative',
            }}>
              {tab === 'events' ? 'Events' : 'Venues'}
              {view === tab && (
                <motion.div layoutId="explore-pip" style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: 1.5, background: '#fff', borderRadius: 99,
                }} />
              )}
            </button>
          ))}
        </div>

        {/* Category / amenity filter pills */}
        {!isSearching && (
          <div style={{
            display: 'flex', gap: 6,
            overflowX: 'auto', scrollbarWidth: 'none',
            paddingBottom: 16, marginRight: -22,
            paddingRight: 22,
          }}>
            {(view === 'events' ? EVENT_CATEGORIES : VENUE_AMENITIES).map(cat => {
              const active = view === 'events'
                ? activeCategory === cat
                : activeAmenity === cat
              return (
                <button key={cat} onClick={() => {
                  view === 'events'
                    ? setActiveCategory(cat)
                    : setActiveAmenity(cat)
                }} style={{
                  flexShrink: 0, padding: '6px 14px',
                  borderRadius: 99, border: '0.5px solid',
                  borderColor: active ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.07)',
                  background: active ? 'rgba(255,255,255,.07)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,.3)',
                  fontSize: 11, fontWeight: active ? 600 : 400,
                  cursor: 'pointer', fontFamily: 'inherit',
                  letterSpacing: '0.02em',
                  transition: 'all 0.15s',
                  textTransform: cat === 'All' ? 'none' : 'capitalize',
                }}>
                  {cat.replace('_', ' ')}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {view === 'events' ? (
          <motion.div key="events"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}>
            <EventsList
              events={displayEvents}
              onSelect={onEventSelect}
              isSearching={isSearching}
              query={query}
            />
          </motion.div>
        ) : (
          <motion.div key="venues"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}>
            <VenuesList
              venues={displayVenues}
              isSearching={isSearching}
              query={query}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── EVENTS LIST ──────────────────────────────────

function EventsList({ events, onSelect, isSearching, query }: {
  events: EventWithMeta[]
  onSelect: (e: EventWithMeta) => void
  isSearching: boolean
  query: string
}) {
  if (events.length === 0) {
    return (
      <EmptyState
        message={isSearching
          ? `No events matching "${query}"`
          : 'No events in this category right now.'
        }
      />
    )
  }

  return (
    <div style={{
      padding: '8px 16px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      {events.map(event => (
        <ExploreEventCard key={event.id} event={event} onSelect={onSelect} />
      ))}
    </div>
  )
}

function ExploreEventCard({ event, onSelect }: {
  event: EventWithMeta
  onSelect: (e: EventWithMeta) => void
}) {
  const [a1, a2, accent] = getAura(event.category)
  const price = formatPrice(event.ticket_types)
  const spotsLeft = event.total_capacity
    ? event.total_capacity - (event.total_tickets_sold ?? 0)
    : null

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(event)}
      style={{
        background: '#000',
        border: '0.5px solid rgba(255,255,255,.07)',
        borderRadius: 20, overflow: 'hidden',
        cursor: 'pointer', position: 'relative',
      }}
    >
      {/* Aura */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', width: 260, height: 260,
          top: -80, left: -60,
          background: `radial-gradient(circle, ${a1} 0%, transparent 70%)`,
        }} />
        <div style={{
          position: 'absolute', width: 180, height: 180,
          bottom: -60, right: -40,
          background: `radial-gradient(circle, ${a2} 0%, transparent 70%)`,
        }} />
      </div>

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.82) 100%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        padding: '18px 18px 14px',
      }}>
        {/* Top row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', gap: 12, marginBottom: 10,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 9, fontWeight: 600,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: accent, marginBottom: 5,
            }}>
              {event.category.replace('_', ' ')} · {formatDate(event.start_time)}
            </div>
            <div style={{
              fontSize: 20, fontWeight: 800,
              letterSpacing: '-0.03em', lineHeight: 1.05,
              color: '#fff',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {event.title}
            </div>
          </div>

          {/* Price tag */}
          <div style={{
            background: 'rgba(255,255,255,.06)',
            border: '0.5px solid rgba(255,255,255,.1)',
            borderRadius: 8, padding: '6px 10px',
            fontSize: 13, fontWeight: 700,
            color: '#fff', flexShrink: 0,
            letterSpacing: '-0.01em',
          }}>
            {price}
          </div>
        </div>

        {/* Meta row */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{
            fontSize: 11, color: 'rgba(255,255,255,.35)',
          }}>
            {event.city} · {formatTime(event.start_time)}
            {event.host && (
              <span style={{ color: 'rgba(255,255,255,.2)' }}>
                {' '}· by {event.host.display_name ?? event.host.username}
              </span>
            )}
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {event.friends_attending_count > 0 && (
              <div style={{
                fontSize: 10, fontWeight: 600,
                color: accent, letterSpacing: '0.02em',
              }}>
                {event.friends_attending_count === 1
                  ? '1 friend going'
                  : `${event.friends_attending_count} friends`}
              </div>
            )}
            {spotsLeft !== null && spotsLeft <= 20 && spotsLeft > 0 && (
              <div style={{
                fontSize: 10, fontWeight: 600,
                color: 'rgba(255,200,60,.8)',
                letterSpacing: '0.02em',
              }}>
                {spotsLeft} left
              </div>
            )}
            {spotsLeft === 0 && (
              <div style={{
                fontSize: 10, fontWeight: 600,
                color: 'rgba(249,100,60,.8)',
              }}>
                Sold out
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── VENUES LIST ──────────────────────────────────

function VenuesList({ venues, isSearching, query }: {
  venues: DbVenue[]
  isSearching: boolean
  query: string
}) {
  const [selected, setSelected] = useState<DbVenue | null>(null)

  if (venues.length === 0) {
    return (
      <EmptyState
        message={isSearching
          ? `No venues matching "${query}"`
          : 'No venues listed yet.'
        }
      />
    )
  }

  return (
    <>
      <div style={{
        padding: '8px 16px 0',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {venues.map(venue => (
          <VenueCard key={venue.id} venue={venue} onTap={() => setSelected(venue)} />
        ))}
      </div>

      {/* Venue detail sheet */}
      <AnimatePresence>
        {selected && (
          <VenueSheet venue={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </>
  )
}

function VenueCard({ venue, onTap }: { venue: DbVenue; onTap: () => void }) {
  const pricePerHour = venue.price_per_hour
    ? `₹${(venue.price_per_hour / 100).toLocaleString('en-IN')}/hr`
    : null

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onTap}
      style={{
        background: 'rgba(255,255,255,.03)',
        border: '0.5px solid rgba(255,255,255,.07)',
        borderRadius: 20, overflow: 'hidden',
        cursor: 'pointer',
        padding: '18px 18px 16px',
      }}
    >
      {/* Top */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', gap: 12, marginBottom: 10,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 9, fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,.25)', marginBottom: 5,
          }}>
            {venue.categories?.[0] ?? 'Venue'} · {venue.city}
          </div>
          <div style={{
            fontSize: 18, fontWeight: 800,
            letterSpacing: '-0.03em', color: '#fff',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {venue.name}
          </div>
        </div>

        {pricePerHour && (
          <div style={{
            background: 'rgba(255,255,255,.05)',
            border: '0.5px solid rgba(255,255,255,.08)',
            borderRadius: 8, padding: '6px 10px',
            fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.6)',
            flexShrink: 0,
          }}>
            {pricePerHour}
          </div>
        )}
      </div>

      {/* Address */}
      {venue.address && (
        <div style={{
          fontSize: 11, color: 'rgba(255,255,255,.25)',
          marginBottom: 10,
        }}>
          {venue.address}
        </div>
      )}

      {/* Amenity pills */}
      {venue.amenities && venue.amenities.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {venue.amenities.slice(0, 4).map(a => (
            <div key={a} style={{
              padding: '3px 8px', borderRadius: 99,
              background: 'rgba(255,255,255,.05)',
              border: '0.5px solid rgba(255,255,255,.07)',
              fontSize: 10, fontWeight: 500,
              color: 'rgba(255,255,255,.3)',
            }}>
              {a}
            </div>
          ))}
          {venue.amenities.length > 4 && (
            <div style={{
              padding: '3px 8px', borderRadius: 99,
              fontSize: 10, color: 'rgba(255,255,255,.2)',
            }}>
              +{venue.amenities.length - 4}
            </div>
          )}
        </div>
      )}

      {/* Capacity */}
      {venue.capacity && (
        <div style={{
          marginTop: 10, fontSize: 10,
          color: 'rgba(255,255,255,.2)',
          letterSpacing: '0.04em',
        }}>
          UP TO {venue.capacity} PEOPLE
        </div>
      )}
    </motion.div>
  )
}

// ─── VENUE DETAIL SHEET ───────────────────────────

function VenueSheet({ venue, onClose }: { venue: DbVenue; onClose: () => void }) {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,.7)',
      }} />

      {/* Sheet */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: '#0a0a0a',
        border: '0.5px solid rgba(255,255,255,.08)',
        borderRadius: '20px 20px 0 0',
        padding: '20px 24px 52px',
        fontFamily: "'Inter Tight','Inter',sans-serif",
        maxWidth: 400, width: '100%', margin: '0 auto',
      }}>
        {/* Handle */}
        <div style={{
          width: 32, height: 3,
          background: 'rgba(255,255,255,.15)',
          borderRadius: 99, margin: '0 auto 20px',
        }} />

        <div style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,.2)',
          marginBottom: 6,
        }}>
          {venue.categories?.[0] ?? 'Venue'} · {venue.city}
        </div>

        <div style={{
          fontSize: 24, fontWeight: 800,
          letterSpacing: '-0.03em', color: '#fff', marginBottom: 6,
        }}>
          {venue.name}
        </div>

        {venue.address && (
          <div style={{
            fontSize: 13, color: 'rgba(255,255,255,.3)', marginBottom: 20,
          }}>
            {venue.address}
          </div>
        )}

        {venue.description && (
          <div style={{
            fontSize: 14, color: 'rgba(255,255,255,.5)',
            lineHeight: 1.6, marginBottom: 20,
          }}>
            {venue.description}
          </div>
        )}

        {/* Stats row */}
        <div style={{
          display: 'flex', gap: 12, marginBottom: 20,
        }}>
          {venue.capacity && (
            <StatPill label="Capacity" value={`${venue.capacity}`} />
          )}
          {venue.price_per_hour && (
            <StatPill
              label="Per hour"
              value={`₹${(venue.price_per_hour / 100).toLocaleString('en-IN')}`}
            />
          )}
        </div>

        {/* Amenities */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,.2)',
              marginBottom: 10,
            }}>
              Amenities
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {venue.amenities.map(a => (
                <div key={a} style={{
                  padding: '5px 12px', borderRadius: 99,
                  background: 'rgba(255,255,255,.05)',
                  border: '0.5px solid rgba(255,255,255,.09)',
                  fontSize: 12, fontWeight: 500,
                  color: 'rgba(255,255,255,.5)',
                }}>
                  {a}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <button style={{
          width: '100%', padding: '16px',
          borderRadius: 14, border: 'none',
          background: 'rgba(255,255,255,.97)',
          color: '#000', fontSize: 15, fontWeight: 800,
          cursor: 'pointer', fontFamily: 'inherit',
          letterSpacing: '0.01em',
        }}>
          Book this venue →
        </button>
      </div>
    </motion.div>
  )
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,.04)',
      border: '0.5px solid rgba(255,255,255,.07)',
      borderRadius: 10, padding: '10px 14px', flex: 1,
    }}>
      <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,.2)',
        marginBottom: 3,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 15, fontWeight: 700, color: '#fff',
      }}>
        {value}
      </div>
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ padding: '60px 24px', textAlign: 'center' }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: 'rgba(255,255,255,.04)',
        border: '0.5px solid rgba(255,255,255,.07)',
        margin: '0 auto 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Search size={16} color="rgba(255,255,255,.2)" />
      </div>
      <p style={{
        color: 'rgba(255,255,255,.25)', fontSize: 13, lineHeight: 1.6,
      }}>
        {message}
      </p>
    </div>
  )
}
