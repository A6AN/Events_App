import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useMyProfile, useUploadAvatar, useUpdateProfile } from '../hooks/useProfile'
import { useEventsByHost } from '../hooks/useEvents'
import { useMyTickets } from '../hooks/useTickets'
import { useMyFriends } from '../hooks/useFriends'
import { SettingsSheet } from './modals/SettingsSheet'
import { EditProfileSheet } from './modals/EditProfileSheet'
import type { DbEvent, TicketWithMeta } from '../types'

const TIER_CONFIG = {
  bronze: { label: 'Bronze', color: '#cd7f32', glow: 'rgba(205,127,50,.4)' },
  silver: { label: 'Silver', color: '#c0c0c0', glow: 'rgba(192,192,192,.4)' },
  gold:   { label: 'Gold',   color: '#ffc83c', glow: 'rgba(255,200,60,.4)' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function ProfileTab() {
  const { user, signOut, refreshProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<'hosted' | 'tickets' | 'about'>('hosted')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: profile, isLoading: profileLoading } = useMyProfile()
  const { data: hostedEvents = [] } = useEventsByHost(user?.id ?? null)
  const { data: tickets = [] } = useMyTickets()
  const { data: friends = [] } = useMyFriends()
  const uploadAvatar = useUploadAvatar()
  const updateProfile = useUpdateProfile()

  const displayName = profile?.display_name ?? profile?.username ?? 'You'
  const tier = profile?.rep_tier ?? 'bronze'
  const tierConf = TIER_CONFIG[tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.bronze

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadAvatar.mutateAsync(file)
    await refreshProfile()
  }

  if (profileLoading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter Tight','Inter',sans-serif",
      }}>
        <div style={{ color: 'rgba(255,255,255,.2)', fontSize: 13 }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      fontFamily: "'Inter Tight','Inter',sans-serif",
      paddingBottom: 100,
    }}>
      <input
        ref={fileInputRef} type="file" accept="image/*"
        style={{ display: 'none' }} onChange={handleFileChange}
      />

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '20px 22px 0',
      }}>
        <div style={{
          fontSize: 26, fontWeight: 800,
          letterSpacing: '-0.03em', color: '#fff',
        }}>
          profile
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <IconBtn onClick={async () => {
            if (navigator.share) {
              await navigator.share({
                title: displayName,
                text: `Check out ${displayName} on Milo`,
              })
            }
          }}>
            <ShareIcon />
          </IconBtn>
          <IconBtn onClick={() => setSettingsOpen(true)}>
            <SettingsIcon />
          </IconBtn>
        </div>
      </div>

      {/* ── IDENTITY BLOCK ── */}
      <div style={{
        padding: '28px 22px 24px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', position: 'relative',
      }}>
        {/* Aura behind avatar */}
        <div style={{
          position: 'absolute', width: 200, height: 200,
          top: 0, left: '50%', transform: 'translateX(-50%)',
          background: `radial-gradient(circle, ${tierConf.glow} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* Avatar */}
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(255,255,255,.06)',
            border: `1.5px solid ${tierConf.color}40`,
            overflow: 'hidden', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', zIndex: 1,
            flexShrink: 0,
            marginBottom: 14,
          }}
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{
              fontSize: 28, fontWeight: 800,
              color: 'rgba(255,255,255,.5)',
            }}>
              {displayName[0]?.toUpperCase()}
            </span>
          )}
          {uploadAvatar.isPending && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: 'rgba(255,255,255,.5)',
            }}>
              ...
            </div>
          )}
        </div>

        {/* Name */}
        <div style={{
          fontSize: 22, fontWeight: 800,
          letterSpacing: '-0.03em', color: '#fff',
          marginBottom: 4, position: 'relative', zIndex: 1,
        }}>
          {displayName}
        </div>

        {profile?.username && (
          <div style={{
            fontSize: 12, color: 'rgba(255,255,255,.3)',
            marginBottom: 12, position: 'relative', zIndex: 1,
          }}>
            @{profile.username}
          </div>
        )}

        {/* Tier badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: `${tierConf.color}15`,
          border: `0.5px solid ${tierConf.color}40`,
          borderRadius: 99, padding: '5px 14px',
          marginBottom: 24, position: 'relative', zIndex: 1,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: tierConf.color,
            boxShadow: `0 0 6px ${tierConf.glow}`,
          }} />
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: tierConf.color,
            letterSpacing: '0.08em',
          }}>
            {tierConf.label} · {profile?.rep_score ?? 0} rep
          </span>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex', gap: 0, width: '100%',
          background: 'rgba(255,255,255,.03)',
          border: '0.5px solid rgba(255,255,255,.07)',
          borderRadius: 16, overflow: 'hidden',
          marginBottom: 16, position: 'relative', zIndex: 1,
        }}>
          {[
            { label: 'Friends', value: friends.length },
            { label: 'Hosted', value: hostedEvents.length },
            { label: 'Tickets', value: tickets.length },
          ].map((stat, i) => (
            <div key={stat.label} style={{
              flex: 1, padding: '14px 0',
              textAlign: 'center',
              borderLeft: i > 0 ? '0.5px solid rgba(255,255,255,.07)' : 'none',
            }}>
              <div style={{
                fontSize: 20, fontWeight: 800,
                letterSpacing: '-0.03em', color: '#fff',
                lineHeight: 1,
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: 10, fontWeight: 500,
                color: 'rgba(255,255,255,.25)',
                letterSpacing: '0.08em',
                marginTop: 4,
                textTransform: 'uppercase',
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{
          display: 'flex', gap: 8, width: '100%',
          position: 'relative', zIndex: 1,
        }}>
          <button
            onClick={() => setEditProfileOpen(true)}
            style={{
              flex: 1, padding: '12px',
              borderRadius: 12,
              background: 'rgba(255,255,255,.06)',
              border: '0.5px solid rgba(255,255,255,.1)',
              color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              letterSpacing: '-0.01em',
            }}
          >
            Edit Profile
          </button>
          <button
            onClick={async () => {
              if (navigator.share) {
                await navigator.share({
                  title: displayName,
                  text: `Check out ${displayName} on Milo`,
                })
              }
            }}
            style={{
              flex: 1, padding: '12px',
              borderRadius: 12,
              background: 'rgba(255,255,255,.04)',
              border: '0.5px solid rgba(255,255,255,.07)',
              color: 'rgba(255,255,255,.5)', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              letterSpacing: '-0.01em',
            }}
          >
            Share
          </button>
        </div>
      </div>

      {/* ── REP PROGRESS ── */}
      {profile && (
        <div style={{ padding: '0 22px 24px' }}>
          <RepBar repScore={profile.rep_score} repTier={tier} />
        </div>
      )}

      {/* ── TABS ── */}
      <div style={{
        display: 'flex', padding: '0 22px',
        borderBottom: '0.5px solid rgba(255,255,255,.06)',
        marginBottom: 0,
      }}>
        {(['hosted', 'tickets', 'about'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            background: 'transparent', border: 'none',
            padding: '10px 0', marginRight: 24,
            fontSize: 13, fontWeight: activeTab === tab ? 700 : 400,
            color: activeTab === tab ? '#fff' : 'rgba(255,255,255,.25)',
            cursor: 'pointer', fontFamily: 'inherit',
            letterSpacing: '-0.01em', position: 'relative',
            textTransform: 'capitalize',
          }}>
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="profile-pip" style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: 1.5, background: '#fff', borderRadius: 99,
              }} />
            )}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <AnimatePresence mode="wait">
        {activeTab === 'hosted' && (
          <motion.div key="hosted"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}>
            <HostedGrid events={hostedEvents} />
          </motion.div>
        )}

        {activeTab === 'tickets' && (
          <motion.div key="tickets"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}>
            <TicketsList tickets={tickets} />
          </motion.div>
        )}

        {activeTab === 'about' && (
          <motion.div key="about"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}>
            <AboutTab profile={profile} signOut={signOut} />
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        profile={profile}
      />
      <EditProfileSheet
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        currentProfile={profile as any}
        onSaved={async () => { await refreshProfile() }}
      />
    </div>
  )
}

// ─── REP BAR ──────────────────────────────────────

function RepBar({ repScore, repTier }: { repScore: number; repTier: string }) {
  const thresholds = { bronze: [0, 500], silver: [501, 2000], gold: [2000, 3000] }
  const [min, max] = thresholds[repTier as keyof typeof thresholds] || [0, 500]
  const progress = Math.min((repScore - min) / (max - min), 1)
  const nextTier = repTier === 'bronze' ? 'Silver' : repTier === 'silver' ? 'Gold' : null
  const pointsLeft = nextTier ? max - repScore : 0
  const tierConf = TIER_CONFIG[repTier as keyof typeof TIER_CONFIG] || TIER_CONFIG.bronze

  return (
    <div style={{
      background: 'rgba(255,255,255,.03)',
      border: '0.5px solid rgba(255,255,255,.07)',
      borderRadius: 16, padding: '16px 18px',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: 12,
      }}>
        <div>
          <div style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,.2)',
            marginBottom: 2,
          }}>
            Your Frequency
          </div>
          <div style={{
            fontSize: 22, fontWeight: 800,
            letterSpacing: '-0.03em', color: '#fff',
          }}>
            {repScore.toLocaleString()} rep
          </div>
        </div>
        {nextTier && (
          <div style={{
            fontSize: 11, color: 'rgba(255,255,255,.25)',
            textAlign: 'right', paddingTop: 2,
          }}>
            {pointsLeft} to {nextTier}
          </div>
        )}
      </div>

      {/* Track */}
      <div style={{
        height: 2, background: 'rgba(255,255,255,.08)',
        borderRadius: 2, overflow: 'hidden',
      }}>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${tierConf.color}80, ${tierConf.color})`,
            transformOrigin: 'left', borderRadius: 2,
          }}
        />
      </div>
    </div>
  )
}

// ─── HOSTED GRID ──────────────────────────────────

function HostedGrid({ events }: { events: DbEvent[] }) {
  if (events.length === 0) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(255,255,255,.04)',
          border: '0.5px solid rgba(255,255,255,.07)',
          margin: '0 auto 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 18, height: 18,
            border: '1.5px solid rgba(255,255,255,.2)',
            borderRadius: 4,
          }} />
        </div>
        <p style={{
          color: 'rgba(255,255,255,.25)', fontSize: 13, lineHeight: 1.6,
        }}>
          No events hosted yet.<br />Tap + to create your first event.
        </p>
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8, padding: '16px 16px 0',
    }}>
      {events.map(event => (
        <div key={event.id} style={{
          background: 'rgba(255,255,255,.03)',
          border: '0.5px solid rgba(255,255,255,.07)',
          borderRadius: 14, overflow: 'hidden',
          position: 'relative', aspectRatio: '1',
        }}>
          {event.cover_url ? (
            <img src={event.cover_url}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: 'rgba(255,255,255,.03)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                fontSize: 24, fontWeight: 800,
                color: 'rgba(255,255,255,.1)',
                letterSpacing: '-0.03em',
              }}>
                {event.title[0]}
              </div>
            </div>
          )}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,.85) 0%, transparent 60%)',
            padding: '0 10px 10px',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          }}>
            <div style={{
              fontSize: 12, fontWeight: 700,
              letterSpacing: '-0.02em', color: '#fff',
              marginBottom: 2,
            }}>
              {event.title}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>
              {formatDate(event.start_time)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── TICKETS LIST ─────────────────────────────────

function TicketsList({ tickets }: { tickets: TicketWithMeta[] }) {
  if (tickets.length === 0) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,.25)', fontSize: 13, lineHeight: 1.6 }}>
          No tickets yet.<br />Explore events to book one.
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {tickets.map(ticket => (
        <div key={ticket.id} style={{
          background: 'rgba(255,255,255,.03)',
          border: '0.5px solid rgba(255,255,255,.07)',
          borderRadius: 14, padding: '14px 16px',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', gap: 12,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 14, fontWeight: 700,
              letterSpacing: '-0.02em', color: '#fff',
              marginBottom: 3,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {ticket.event.title}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>
              {formatDate(ticket.event.start_time)} · {ticket.ticket_type.name}
            </div>
          </div>
          <div style={{
            fontSize: 10, fontWeight: 700,
            letterSpacing: '0.08em',
            color: ticket.status === 'scanned'
              ? 'rgba(60,230,180,.7)'
              : 'rgba(255,255,255,.3)',
            textTransform: 'uppercase', flexShrink: 0,
          }}>
            {ticket.status === 'scanned' ? '✓ Used' : 'Active'}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── ABOUT TAB ────────────────────────────────────

function AboutTab({ profile, signOut }: { profile: any; signOut: () => void }) {
  return (
    <div style={{ padding: '20px 16px 0' }}>
      {/* Bio */}
      <div style={{
        background: 'rgba(255,255,255,.03)',
        border: '0.5px solid rgba(255,255,255,.07)',
        borderRadius: 14, padding: '16px',
        marginBottom: 10,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,.2)',
          marginBottom: 8,
        }}>
          Bio
        </div>
        <p style={{
          fontSize: 13, color: 'rgba(255,255,255,.45)',
          lineHeight: 1.6, margin: 0,
        }}>
          {profile?.bio ?? 'No bio yet. Tap Edit Profile to add one.'}
        </p>
      </div>

      {/* University / City */}
      <div style={{
        background: 'rgba(255,255,255,.03)',
        border: '0.5px solid rgba(255,255,255,.07)',
        borderRadius: 14, padding: '16px',
        marginBottom: 10,
      }}>
        {[
          { label: 'University', value: profile?.university === 'independent' ? 'Independent' : profile?.university },
          { label: 'City', value: profile?.city },
        ].filter(r => r.value).map((row, i) => (
          <div key={row.label} style={{
            display: 'flex', justifyContent: 'space-between',
            paddingBottom: i === 0 ? 10 : 0,
            marginBottom: i === 0 ? 10 : 0,
            borderBottom: i === 0 ? '0.5px solid rgba(255,255,255,.06)' : 'none',
          }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.25)' }}>{row.label}</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', fontWeight: 500 }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Sign out */}
      <button
        onClick={signOut}
        style={{
          width: '100%', padding: '14px',
          borderRadius: 14,
          background: 'transparent',
          border: '0.5px solid rgba(249,100,60,.2)',
          color: 'rgba(249,100,60,.7)',
          fontSize: 13, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
          letterSpacing: '0.02em', marginBottom: 8,
          marginTop: 8,
        }}
      >
        Sign Out
      </button>

      <div style={{
        textAlign: 'center', fontSize: 10,
        color: 'rgba(255,255,255,.15)',
        paddingTop: 8, paddingBottom: 20,
        letterSpacing: '0.06em',
      }}>
        MILO · VERSION 1.0.0
      </div>
    </div>
  )
}

// ─── ICON COMPONENTS ─────────────────────────────

function IconBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      width: 34, height: 34, borderRadius: '50%',
      background: 'rgba(255,255,255,.05)',
      border: '0.5px solid rgba(255,255,255,.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
    }}>
      {children}
    </button>
  )
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="11" cy="2.5" r="1.5" stroke="rgba(255,255,255,.5)" strokeWidth="1.1"/>
      <circle cx="11" cy="11.5" r="1.5" stroke="rgba(255,255,255,.5)" strokeWidth="1.1"/>
      <circle cx="3" cy="7" r="1.5" stroke="rgba(255,255,255,.5)" strokeWidth="1.1"/>
      <line x1="4.4" y1="6.2" x2="9.6" y2="3.3" stroke="rgba(255,255,255,.5)" strokeWidth="1.1"/>
      <line x1="4.4" y1="7.8" x2="9.6" y2="10.7" stroke="rgba(255,255,255,.5)" strokeWidth="1.1"/>
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2" stroke="rgba(255,255,255,.5)" strokeWidth="1.1"/>
      <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.6 2.6l1.1 1.1M10.3 10.3l1.1 1.1M2.6 11.4l1.1-1.1M10.3 3.7l1.1-1.1"
        stroke="rgba(255,255,255,.5)" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  )
}
