import { useState, useEffect, useRef } from 'react'
import { EventWithMeta } from '../types'
import { EventDetailsSheet } from './modals/EventDetailsSheet'
import { NearbyEventsSheet } from './map/NearbyEventsSheet'
import { OlaMaps } from 'olamaps-web-sdk'
import '../styles/leaflet-custom.css'

const OLA_MAPS_API_KEY = (import.meta as any).env.VITE_OLA_MAPS_API_KEY

// ─── DOT COLORS PER CATEGORY ─────────────────────
// brain.md §15.1 — events as glowing colored orbs
const CATEGORY_DOT: Record<string, { color: string; glow: string }> = {
  club:        { color: '#f9643c', glow: 'rgba(249,100,60,.6)' },
  dj_night:    { color: '#f9643c', glow: 'rgba(249,100,60,.6)' },
  house_party: { color: '#e83ca0', glow: 'rgba(232,60,160,.6)' },
  comedy:      { color: '#ffc83c', glow: 'rgba(255,200,60,.6)' },
  open_mic:    { color: '#b48cff', glow: 'rgba(180,140,255,.6)' },
  networking:  { color: '#b48cff', glow: 'rgba(180,140,255,.6)' },
  sports:      { color: '#3ce6b4', glow: 'rgba(60,230,180,.6)' },
  other:       { color: '#50a0ff', glow: 'rgba(80,160,255,.6)' },
}
const DEFAULT_DOT = { color: 'rgba(255,255,255,.6)', glow: 'rgba(255,255,255,.3)' }

function getDot(category: string) {
  return CATEGORY_DOT[category] ?? DEFAULT_DOT
}

function isHappeningNow(event: EventWithMeta) {
  const now = Date.now()
  return new Date(event.start_time).getTime() <= now
    && new Date(event.end_time).getTime() >= now
}

function createDotMarker(event: EventWithMeta): HTMLElement {
  const { color, glow } = getDot(event.category)
  const now = isHappeningNow(event)

  const wrapper = document.createElement('div')
  wrapper.style.cssText = `
    position: relative;
    width: ${now ? '16px' : '12px'};
    height: ${now ? '16px' : '12px'};
    cursor: pointer;
  `

  // Outer glow ring
  const ring = document.createElement('div')
  ring.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: ${glow};
    animation: ${now ? 'dot-active 2s ease-in-out infinite' : 'dot-glow 2.5s ease-in-out infinite'};
    ${now
      ? 'width: 40px; height: 40px; top: -12px; left: -12px;'
      : 'width: 28px; height: 28px; top: -8px; left: -8px;'
    }
  `
  wrapper.appendChild(ring)

  // Core dot
  const dot = document.createElement('div')
  dot.style.cssText = `
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: ${color};
    box-shadow: 0 0 ${now ? '14px' : '8px'} ${glow};
    z-index: 1;
  `
  wrapper.appendChild(dot)

  return wrapper
}

interface MapTabProps {
  events: EventWithMeta[]
}

export function MapTab({ events }: MapTabProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const olaMapsRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const userMarkerRef = useRef<any>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<EventWithMeta | null>(null)
  const [isEventSheetOpen, setIsEventSheetOpen] = useState(false)
  const [isNearbySheetOpen, setIsNearbySheetOpen] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [radiusKm, setRadiusKm] = useState<number | null>(null)

  // ─── INJECT DOT ANIMATION CSS ─────────────────

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes dot-glow {
        0%, 100% { opacity: .5; transform: scale(1); }
        50% { opacity: 0; transform: scale(2.5); }
      }
      @keyframes dot-active {
        0%, 100% { opacity: .7; transform: scale(1); }
        50% { opacity: 0; transform: scale(2.8); }
      }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  // ─── INIT OLA MAPS ────────────────────────────

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    try {
      olaMapsRef.current = new OlaMaps({ apiKey: OLA_MAPS_API_KEY })

      const myMap = olaMapsRef.current.init({
        style: 'https://api.olamaps.io/tiles/vector/v1/styles/default-dark-standard/style.json',
        container: mapContainerRef.current,
        center: [77.2090, 28.6139], // Delhi
        zoom: 12,
      })

      mapInstanceRef.current = myMap

      myMap.on('load', () => {
        setMapLoaded(true)

        // Mute POI/landmark labels — keep roads clean
        try {
          const layers = myMap.getStyle().layers
          if (layers) {
            layers.forEach((layer: any) => {
              if (
                layer.id.includes('poi') ||
                layer.id.includes('landmark') ||
                (layer.id.includes('label') && !layer.id.includes('road'))
              ) {
                if (layer.paint?.['text-color'])
                  myMap.setPaintProperty(layer.id, 'text-color', '#444')
                if (layer.paint?.['icon-color'])
                  myMap.setPaintProperty(layer.id, 'icon-color', '#444')
                if (layer.type === 'symbol') {
                  myMap.setPaintProperty(layer.id, 'text-opacity', 0.4)
                  myMap.setPaintProperty(layer.id, 'icon-opacity', 0.4)
                }
              }
            })
          }
        } catch (_) {}
      })
    } catch (_) {}

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // ─── USER LOCATION ────────────────────────────

  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const { latitude: lat, longitude: lng } = coords
      setUserLocation({ lat, lng })

      if (mapInstanceRef.current && olaMapsRef.current) {
        if (userMarkerRef.current) {
          userMarkerRef.current.setLngLat([lng, lat])
        } else {
          // Clean white dot for user location
          const el = document.createElement('div')
          el.style.cssText = `
            width: 14px; height: 14px;
            border-radius: 50%;
            background: #fff;
            border: 2.5px solid rgba(255,255,255,.4);
            box-shadow: 0 0 16px rgba(255,255,255,.5);
          `
          userMarkerRef.current = olaMapsRef.current
            .addMarker({ element: el })
            .setLngLat([lng, lat])
            .addTo(mapInstanceRef.current)
        }

        mapInstanceRef.current.flyTo({ center: [lng, lat], zoom: 14 })
      }
    })
  }, [])

  // ─── RENDER DOT MARKERS ───────────────────────

  const renderMarkers = () => {
    if (!mapInstanceRef.current || !olaMapsRef.current) return

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const filtered = events.filter(event => {
      if (!event.lat || !event.lng) return false

      if (radiusKm && userLocation) {
        const R = 6371
        const dLat = (event.lat - userLocation.lat) * Math.PI / 180
        const dLon = (event.lng - userLocation.lng) * Math.PI / 180
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(userLocation.lat * Math.PI / 180) *
          Math.cos(event.lat * Math.PI / 180) *
          Math.sin(dLon / 2) ** 2
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        if (dist > radiusKm) return false
      }

      return true
    })

    filtered.forEach(event => {
      const el = createDotMarker(event)

      el.addEventListener('click', () => {
        setSelectedEvent(event)
        setIsEventSheetOpen(true)
      })

      const marker = olaMapsRef.current
        .addMarker({ element: el })
        .setLngLat([event.lng!, event.lat!])
        .addTo(mapInstanceRef.current)

      markersRef.current.push(marker)
    })
  }

  useEffect(() => {
    if (mapLoaded) renderMarkers()
  }, [events, radiusKm, userLocation, mapLoaded])

  // ─── GEOCODING SEARCH ─────────────────────────

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

    if (searchQuery.trim().length < 3) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(searchQuery)}&api_key=${OLA_MAPS_API_KEY}`
        )
        const data = await res.json()
        setSearchResults(
          Array.isArray(data.predictions) ? data.predictions.slice(0, 5) : []
        )
      } catch (_) {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 500)

    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current) }
  }, [searchQuery])

  const handleSearchResultClick = async (result: any) => {
    try {
      const res = await fetch(
        `https://api.olamaps.io/places/v1/details?place_id=${result.place_id}&api_key=${OLA_MAPS_API_KEY}`
      )
      const data = await res.json()
      const geometry = data.result?.geometry || data.geometry
      const location = geometry?.location

      if (location && mapInstanceRef.current) {
        const lat = typeof location.lat === 'function' ? location.lat() : parseFloat(location.lat)
        const lng = typeof location.lng === 'function' ? location.lng() : parseFloat(location.lng)
        if (!isNaN(lat) && !isNaN(lng)) {
          mapInstanceRef.current.flyTo({ center: [lng, lat], zoom: 15, duration: 2000 })
          olaMapsRef.current.addMarker({}).setLngLat([lng, lat]).addTo(mapInstanceRef.current)
        }
      }
    } catch (_) {}

    setSearchQuery('')
    setSearchResults([])
  }

  const handleLocateMe = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 15,
      })
    }
  }

  const happeningNowCount = events.filter(isHappeningNow).length

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>

      {/* Map */}
      <div ref={mapContainerRef} style={{ width: '100%', minHeight: '100vh' }} />

      {/* ── SEARCH BAR ── */}
      <div style={{
        position: 'absolute', top: 52, left: 16, right: 16,
        zIndex: 400,
        fontFamily: "'Inter Tight','Inter',sans-serif",
      }}>
        <div style={{
          background: 'rgba(0,0,0,.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '0.5px solid rgba(255,255,255,.1)',
          borderRadius: 14,
          display: 'flex', alignItems: 'center',
          padding: '10px 14px', gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="rgba(255,255,255,.3)" strokeWidth="1.2"/>
            <line x1="9.5" y1="9.5" x2="12.5" y2="12.5" stroke="rgba(255,255,255,.3)" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search a place..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#fff', fontSize: 14, fontWeight: 500,
              fontFamily: 'inherit', letterSpacing: '-0.01em',
            }}
          />
          {isSearching && (
            <div style={{ color: 'rgba(255,255,255,.3)', fontSize: 11 }}>...</div>
          )}
          {searchQuery.length > 0 && !isSearching && (
            <button onClick={() => { setSearchQuery(''); setSearchResults([]) }}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.3)',
                cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}>
              ×
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        {searchResults.length > 0 && (
          <div style={{
            marginTop: 4,
            background: 'rgba(0,0,0,.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '0.5px solid rgba(255,255,255,.08)',
            borderRadius: 12, overflow: 'hidden',
          }}>
            {searchResults.map((r, i) => (
              <button key={i} onClick={() => handleSearchResultClick(r)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '11px 14px', background: 'transparent', border: 'none',
                  borderBottom: i < searchResults.length - 1
                    ? '0.5px solid rgba(255,255,255,.05)' : 'none',
                  color: 'rgba(255,255,255,.7)', fontSize: 13,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                {r.description ?? r.structured_formatting?.main_text ?? 'Place'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── RADIUS FILTER PILLS ── */}
      <div style={{
        position: 'absolute', top: 116, left: 16, right: 16,
        zIndex: 400,
        display: 'flex', gap: 6,
        fontFamily: "'Inter Tight','Inter',sans-serif",
      }}>
        {[null, 2, 5, 10].map(km => {
          const active = radiusKm === km
          return (
            <button key={km ?? 'all'} onClick={() => setRadiusKm(km)}
              style={{
                padding: '6px 12px', borderRadius: 99,
                border: '0.5px solid',
                borderColor: active ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.1)',
                background: active
                  ? 'rgba(255,255,255,.1)'
                  : 'rgba(0,0,0,.7)',
                backdropFilter: 'blur(12px)',
                color: active ? '#fff' : 'rgba(255,255,255,.4)',
                fontSize: 11, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s',
                letterSpacing: '0.02em',
              }}>
              {km === null ? 'All' : `${km} km`}
            </button>
          )
        })}
      </div>

      {/* ── DOT LEGEND ── */}
      <div style={{
        position: 'absolute', bottom: 110, left: 16,
        zIndex: 400,
        background: 'rgba(0,0,0,.8)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '0.5px solid rgba(255,255,255,.08)',
        borderRadius: 12,
        padding: '8px 12px',
        fontFamily: "'Inter Tight','Inter',sans-serif",
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        {/* Dot examples */}
        {[
          { color: '#f9643c', label: 'Party' },
          { color: '#b48cff', label: 'Chill' },
          { color: '#3ce6b4', label: 'Other' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: color,
              boxShadow: `0 0 6px ${color}`,
            }} />
            <span style={{
              fontSize: 10, color: 'rgba(255,255,255,.3)',
              letterSpacing: '0.04em',
            }}>
              {label}
            </span>
          </div>
        ))}

        {happeningNowCount > 0 && (
          <>
            <div style={{ width: '0.5px', height: 12, background: 'rgba(255,255,255,.1)' }} />
            <div style={{
              fontSize: 10, fontWeight: 600,
              color: 'rgba(249,100,60,.8)',
              letterSpacing: '0.04em',
            }}>
              {happeningNowCount} LIVE
            </div>
          </>
        )}
      </div>

      {/* ── RIGHT CONTROLS ── */}
      <div style={{
        position: 'absolute', bottom: 110, right: 16,
        zIndex: 400,
        display: 'flex', flexDirection: 'column', gap: 8,
        fontFamily: "'Inter Tight','Inter',sans-serif",
      }}>
        {/* Locate me */}
        <button onClick={handleLocateMe} style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(0,0,0,.8)',
          backdropFilter: 'blur(16px)',
          border: '0.5px solid rgba(255,255,255,.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="3"
              stroke={userLocation ? '#fff' : 'rgba(255,255,255,.4)'}
              strokeWidth="1.5"/>
            <line x1="8" y1="1" x2="8" y2="4"
              stroke={userLocation ? '#fff' : 'rgba(255,255,255,.4)'}
              strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="8" y1="12" x2="8" y2="15"
              stroke={userLocation ? '#fff' : 'rgba(255,255,255,.4)'}
              strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="1" y1="8" x2="4" y2="8"
              stroke={userLocation ? '#fff' : 'rgba(255,255,255,.4)'}
              strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="12" y1="8" x2="15" y2="8"
              stroke={userLocation ? '#fff' : 'rgba(255,255,255,.4)'}
              strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Nearby events */}
        <button onClick={() => setIsNearbySheetOpen(true)} style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(0,0,0,.8)',
          backdropFilter: 'blur(16px)',
          border: '0.5px solid rgba(255,255,255,.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <line x1="3" y1="5" x2="13" y2="5" stroke="rgba(255,255,255,.6)" strokeWidth="1.3" strokeLinecap="round"/>
            <line x1="5" y1="8" x2="11" y2="8" stroke="rgba(255,255,255,.6)" strokeWidth="1.3" strokeLinecap="round"/>
            <line x1="7" y1="11" x2="9" y2="11" stroke="rgba(255,255,255,.6)" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          {events.length > 0 && (
            <div style={{
              position: 'absolute', top: -3, right: -3,
              width: 14, height: 14, borderRadius: '50%',
              background: '#f9643c',
              fontSize: 8, fontWeight: 700, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {events.length > 9 ? '9+' : events.length}
            </div>
          )}
        </button>
      </div>

      {/* Sheets */}
      <EventDetailsSheet
        event={selectedEvent}
        open={isEventSheetOpen}
        onClose={() => setIsEventSheetOpen(false)}
        onBook={() => {}}
      />

      <NearbyEventsSheet
        isOpen={isNearbySheetOpen}
        onClose={() => setIsNearbySheetOpen(false)}
        events={events}
        userLocation={userLocation}
        onEventClick={(event) => {
          setSelectedEvent(event as EventWithMeta)
          setIsEventSheetOpen(true)
        }}
      />
    </div>
  )
}
