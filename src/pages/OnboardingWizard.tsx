import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Camera, Check, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCompleteOnboarding, useUploadAvatar } from '../hooks/useProfile'
import { useFriendSuggestions, useSendFriendRequest } from '../hooks/useFriends'
import { supabase } from '../lib/supabase'

const UNIVERSITIES = [
  'Delhi University', 'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'IIT Kharagpur',
  'BITS Pilani', 'Jamia Millia Islamia', 'Jawaharlal Nehru University',
  'Ambedkar University Delhi', 'IP University', 'NSUT', 'DTU', 'GGSIPU',
  'Shiv Nadar University', 'Ashoka University', 'O.P. Jindal Global University',
  'Christ University', 'Manipal Academy', 'VIT University', 'SRM University',
  'Amity University', 'Bennett University', 'UPES Dehradun', 'Symbiosis',
  'Pune University', 'Mumbai University', 'Anna University', 'Osmania University',
]

const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata']

const SLIDE = {
  initial: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
  transition: { duration: 0.2, ease: 'easeInOut' },
}

// Aura per step — ambient background shifts as user progresses
const STEP_AURA = [
  { a: 'rgba(180,140,255,.15)', b: 'rgba(249,100,60,.08)' },
  { a: 'rgba(60,230,180,.12)', b: 'rgba(180,140,255,.10)' },
  { a: 'rgba(249,100,60,.12)', b: 'rgba(60,230,180,.08)' },
  { a: 'rgba(180,140,255,.14)', b: 'rgba(60,230,180,.10)' },
]

interface StepData {
  display_name: string
  username: string
  avatar_url: string
  university: string
  city: string
  date_of_birth: string
  referral_code: string
}

export function OnboardingWizard() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const completeOnboarding = useCompleteOnboarding()
  const uploadAvatar = useUploadAvatar()

  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [data, setData] = useState<StepData>({
    display_name: '', username: '', avatar_url: '',
    university: '', city: 'Delhi', date_of_birth: '', referral_code: '',
  })
  const [usernameError, setUsernameError] = useState('')
  const [usernameOk, setUsernameOk] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const go = (next: number) => {
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  const checkUsername = async (value: string) => {
    setUsernameOk(false)
    setUsernameError('')
    if (!value) return
    if (!/^[a-z0-9_.]{3,20}$/.test(value)) {
      setUsernameError('3–20 chars. letters, numbers, _ or . only')
      return
    }
    setCheckingUsername(true)
    const { data: existing } = await supabase
      .from('profiles').select('id').eq('username', value).maybeSingle()
    setCheckingUsername(false)
    if (existing) setUsernameError('Already taken')
    else setUsernameOk(true)
  }

  const handleAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadAvatar.mutateAsync(file)
    setData(d => ({ ...d, avatar_url: url }))
  }

  const handleFinish = async () => {
    await completeOnboarding.mutateAsync({
      display_name: data.display_name,
      username: data.username,
      university: data.university,
      city: data.city,
      date_of_birth: data.date_of_birth,
      avatar_url: data.avatar_url || undefined,
      referral_code: data.referral_code || undefined,
    })
    await refreshProfile()
    navigate('/', { replace: true })
  }

  const step1Valid = data.display_name.trim().length >= 2
    && data.username.trim().length >= 3 && usernameOk
  const step2Valid = !!data.city && !!data.date_of_birth
  const canNext = [step1Valid, step2Valid, true, true][step]
  const totalSteps = 4
  const aura = STEP_AURA[step]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      fontFamily: "'Inter Tight','Inter',sans-serif",
      display: 'flex',
      flexDirection: 'column',
      maxWidth: 400,
      margin: '0 auto',
      padding: '0 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*"
        style={{ display: 'none' }} onChange={handleAvatarPick} />

      {/* Ambient aura — transitions with step */}
      <motion.div
        key={step}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <div style={{
          position: 'absolute', width: 340, height: 340,
          top: -100, left: -80,
          background: `radial-gradient(circle, ${aura.a} 0%, transparent 70%)`,
        }} />
        <div style={{
          position: 'absolute', width: 280, height: 280,
          bottom: 80, right: -80,
          background: `radial-gradient(circle, ${aura.b} 0%, transparent 70%)`,
        }} />
      </motion.div>

      {/* Top bar — logo + progress */}
      <div style={{ paddingTop: 56, paddingBottom: 40, position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff' }}>
            milo
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.2)', letterSpacing: '0.06em' }}>
            {step + 1} / {totalSteps}
          </div>
        </div>

        {/* Progress track */}
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 2, borderRadius: 99, overflow: 'hidden',
              background: 'rgba(255,255,255,.07)' }}>
              <motion.div
                animate={{ scaleX: i < step ? 1 : i === step ? 1 : 0 }}
                initial={{ scaleX: 0 }}
                style={{
                  height: '100%',
                  background: i < step
                    ? 'rgba(255,255,255,.4)'
                    : 'rgba(255,255,255,.9)',
                  transformOrigin: 'left',
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={step} custom={dir}
            variants={SLIDE} initial="initial" animate="animate" exit="exit">
            {step === 0 && (
              <Step1Profile
                data={data} setData={setData}
                usernameError={usernameError} usernameOk={usernameOk}
                checkingUsername={checkingUsername}
                onCheckUsername={checkUsername}
                onAvatarClick={() => fileRef.current?.click()}
                uploadAvatar={uploadAvatar}
                aura={aura}
              />
            )}
            {step === 1 && <Step2University data={data} setData={setData} />}
            {step === 2 && <Step3Permissions />}
            {step === 3 && <Step4Friends university={data.university} city={data.city} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div style={{
        paddingBottom: 48, paddingTop: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'relative', zIndex: 1,
      }}>
        {step > 0 ? (
          <button onClick={() => go(step - 1)} style={{
            background: 'transparent',
            border: '0.5px solid rgba(255,255,255,.08)',
            borderRadius: 12, padding: '12px 20px',
            color: 'rgba(255,255,255,.3)', cursor: 'pointer',
            fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
          }}>
            ← back
          </button>
        ) : <div />}

        {step < totalSteps - 1 ? (
          <button
            onClick={() => canNext && go(step + 1)}
            disabled={!canNext}
            style={{
              border: 'none', borderRadius: 14,
              padding: '14px 32px',
              background: canNext ? 'rgba(255,255,255,.97)' : 'rgba(255,255,255,.06)',
              color: canNext ? '#000' : 'rgba(255,255,255,.2)',
              fontSize: 15, fontWeight: 800,
              cursor: canNext ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              transition: 'background 0.2s, color 0.2s',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {canNext && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at center, rgba(180,140,255,.2) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
            )}
            <span style={{ position: 'relative', zIndex: 1 }}>Continue →</span>
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={completeOnboarding.isPending}
            style={{
              border: 'none', borderRadius: 14,
              padding: '14px 32px',
              background: 'rgba(255,255,255,.97)',
              color: '#000', fontSize: 15, fontWeight: 800,
              cursor: 'pointer', fontFamily: 'inherit',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at center, rgba(60,230,180,.2) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <span style={{ position: 'relative', zIndex: 1 }}>
              {completeOnboarding.isPending ? 'Setting up...' : "Let's go →"}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

// ─── STEP 1: PROFILE ──────────────────────────────

function Step1Profile({ data, setData, usernameError, usernameOk,
  checkingUsername, onCheckUsername, onAvatarClick, uploadAvatar, aura }: any) {
  return (
    <div>
      <h1 style={headingStyle}>Who are you?</h1>
      <p style={subStyle}>This is how people find you on Milo.</p>

      {/* Avatar */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '32px 0' }}>
        <button onClick={onAvatarClick} style={{
          width: 96, height: 96, borderRadius: '50%',
          background: 'rgba(255,255,255,.04)',
          border: `0.5px dashed ${data.avatar_url ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.1)'}`,
          cursor: 'pointer', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 32px ${aura.a}`,
        }}>
          {data.avatar_url
            ? <img src={data.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : uploadAvatar.isPending
            ? <div style={{ color: 'rgba(255,255,255,.2)', fontSize: 11 }}>...</div>
            : <Camera size={24} color="rgba(255,255,255,.2)" />
          }
        </button>
      </div>

      {/* Display name */}
      <div style={fieldStyle}>
        <div style={fieldLabelStyle}>DISPLAY NAME</div>
        <input
          value={data.display_name}
          onChange={e => setData((d: StepData) => ({ ...d, display_name: e.target.value }))}
          placeholder="What do your friends call you?"
          style={inputStyle}
        />
      </div>

      {/* Username */}
      <div style={{ ...fieldStyle, marginTop: 0 }}>
        <div style={fieldLabelStyle}>USERNAME</div>
        <div style={{ position: 'relative' }}>
          <input
            value={data.username}
            onChange={e => {
              const v = e.target.value.toLowerCase()
              setData((d: StepData) => ({ ...d, username: v }))
              onCheckUsername(v)
            }}
            placeholder="yourhandle"
            style={{
              ...inputStyle,
              paddingRight: 36,
              borderColor: usernameError
                ? 'rgba(249,100,60,.4)'
                : usernameOk
                ? 'rgba(60,230,180,.4)'
                : 'rgba(255,255,255,.07)',
            }}
          />
          {checkingUsername && (
            <span style={{ position: 'absolute', right: 14, top: '50%',
              transform: 'translateY(-50%)', color: 'rgba(255,255,255,.2)', fontSize: 11 }}>
              ...
            </span>
          )}
          {usernameOk && !checkingUsername && (
            <Check size={14} color="rgba(60,230,180,.8)"
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }} />
          )}
        </div>
        {usernameError && (
          <p style={{ color: 'rgba(249,100,60,.8)', fontSize: 11, marginTop: 4 }}>
            {usernameError}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── STEP 2: UNIVERSITY ───────────────────────────

function Step2University({ data, setData }: { data: StepData; setData: any }) {
  const [search, setSearch] = useState('')
  const filtered = UNIVERSITIES.filter(u => u.toLowerCase().includes(search.toLowerCase()))
  const maxDob = new Date(
    new Date().getFullYear() - 18,
    new Date().getMonth(),
    new Date().getDate()
  ).toISOString().split('T')[0]

  return (
    <div>
      <h1 style={headingStyle}>Where do you go?</h1>
      <p style={subStyle}>We'll connect you with people from your campus.</p>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {['Student', 'Not a student'].map(type => (
          <button
            key={type}
            onClick={() => {
              if (type === 'Not a student') {
                setData((d: StepData) => ({ ...d, university: 'independent' }))
                setSearch('')
              } else if (data.university === 'independent') {
                setData((d: StepData) => ({ ...d, university: '' }))
              }
            }}
            style={{
              padding: '7px 16px', borderRadius: 99,
              border: '0.5px solid',
              borderColor: (type === 'Not a student' && data.university === 'independent') ||
                (type === 'Student' && data.university !== 'independent')
                ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.07)',
              background: (type === 'Not a student' && data.university === 'independent') ||
                (type === 'Student' && data.university !== 'independent')
                ? 'rgba(255,255,255,.06)' : 'transparent',
              color: (type === 'Not a student' && data.university === 'independent') ||
                (type === 'Student' && data.university !== 'independent')
                ? '#fff' : 'rgba(255,255,255,.3)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {data.university !== 'independent' && (
        <div style={fieldStyle}>
          <div style={fieldLabelStyle}>YOUR UNIVERSITY</div>
          <div style={{ position: 'relative' }}>
            <Search size={13} color="rgba(255,255,255,.2)"
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search || data.university}
              onChange={e => {
                setSearch(e.target.value)
                setData((d: StepData) => ({ ...d, university: e.target.value }))
              }}
              placeholder="Search..."
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>
          {search.length >= 2 && filtered.length > 0 && (
            <div style={{
              background: 'rgba(255,255,255,.03)',
              border: '0.5px solid rgba(255,255,255,.07)',
              borderRadius: 12, marginTop: 4,
              maxHeight: 160, overflowY: 'auto',
            }}>
              {filtered.slice(0, 6).map(u => (
                <button key={u} onClick={() => {
                  setData((d: StepData) => ({ ...d, university: u }))
                  setSearch('')
                }} style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '10px 14px', background: 'transparent', border: 'none',
                  borderBottom: '0.5px solid rgba(255,255,255,.04)',
                  color: data.university === u ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.4)',
                  fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  {u}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* City pills */}
      <div style={fieldStyle}>
        <div style={fieldLabelStyle}>YOUR CITY</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CITIES.map(c => (
            <button key={c} onClick={() => setData((d: StepData) => ({ ...d, city: c }))}
              style={{
                padding: '7px 14px', borderRadius: 99,
                border: '0.5px solid',
                borderColor: data.city === c ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.07)',
                background: data.city === c ? 'rgba(255,255,255,.06)' : 'transparent',
                color: data.city === c ? '#fff' : 'rgba(255,255,255,.3)',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.15s',
              }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* DOB */}
      <div style={fieldStyle}>
        <div style={fieldLabelStyle}>DATE OF BIRTH</div>
        <input type="date" value={data.date_of_birth} max={maxDob}
          onChange={e => setData((d: StepData) => ({ ...d, date_of_birth: e.target.value }))}
          style={{ ...inputStyle, colorScheme: 'dark' }} />
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,.15)', marginTop: 4 }}>
          18+ only. Required for age-gated events.
        </p>
      </div>

      {/* Referral */}
      <div style={fieldStyle}>
        <div style={fieldLabelStyle}>REFERRAL CODE · optional</div>
        <input
          value={data.referral_code}
          onChange={e => setData((d: StepData) => ({ ...d, referral_code: e.target.value }))}
          placeholder="A friend's username"
          style={inputStyle}
        />
      </div>
    </div>
  )
}

// ─── STEP 3: PERMISSIONS ──────────────────────────

function Step3Permissions() {
  const [locationGranted, setLocationGranted] = useState(false)
  const [notifGranted, setNotifGranted] = useState(false)

  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      () => setLocationGranted(true),
      () => setLocationGranted(false)
    )
  }

  const requestNotifications = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission()
      setNotifGranted(result === 'granted')
    }
  }

  return (
    <div>
      <h1 style={headingStyle}>Two quick things.</h1>
      <p style={subStyle}>Milo works best with these on.</p>

      <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <PermissionRow
          title="Location"
          description="Find events happening near you."
          granted={locationGranted}
          onRequest={requestLocation}
        />
        <PermissionRow
          title="Notifications"
          description="Know when friends book tonight."
          granted={notifGranted}
          onRequest={requestNotifications}
        />
      </div>

      <p style={{ fontSize: 11, color: 'rgba(255,255,255,.15)', marginTop: 24 }}>
        You can change these anytime in Settings.
      </p>
    </div>
  )
}

function PermissionRow({ title, description, granted, onRequest }: {
  title: string; description: string; granted: boolean; onRequest: () => void
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,.03)',
      border: '0.5px solid rgba(255,255,255,.07)',
      borderLeft: '2px solid rgba(180,140,255,.4)',
      borderRadius: 16, padding: '18px 20px',
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', gap: 16,
    }}>
      <div>
        <p style={{ color: '#fff', fontSize: 14, fontWeight: 700,
          letterSpacing: '-0.02em', margin: 0 }}>{title}</p>
        <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 12,
          margin: '3px 0 0' }}>{description}</p>
      </div>
      <button onClick={onRequest} disabled={granted} style={{
        flexShrink: 0, padding: '8px 16px', borderRadius: 99,
        border: granted ? '0.5px solid rgba(60,230,180,.3)' : 'none',
        background: granted ? 'transparent' : 'rgba(255,255,255,.97)',
        color: granted ? 'rgba(60,230,180,.8)' : '#000',
        fontSize: 12, fontWeight: 700, cursor: granted ? 'default' : 'pointer',
        fontFamily: 'inherit', whiteSpace: 'nowrap',
      }}>
        {granted ? '✓ On' : 'Allow'}
      </button>
    </div>
  )
}

// ─── STEP 4: FRIENDS ──────────────────────────────

function Step4Friends({ university, city }: { university: string; city: string }) {
  const { data: suggestions = [] } = useFriendSuggestions(university, city)
  const sendRequest = useSendFriendRequest()
  const [sent, setSent] = useState<Set<string>>(new Set())

  const handleAdd = async (userId: string) => {
    await sendRequest.mutateAsync(userId)
    setSent(s => new Set(s).add(userId))
  }

  return (
    <div>
      <h1 style={headingStyle}>People you might know.</h1>
      <p style={subStyle}>From {university || 'your campus'}.</p>

      <div style={{ marginTop: 32 }}>
        {suggestions.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,.02)',
            border: '0.5px solid rgba(255,255,255,.06)',
            borderRadius: 16, padding: '28px 20px',
            textAlign: 'center',
            color: 'rgba(255,255,255,.2)', fontSize: 13,
          }}>
            Drop your referral code — be the one who brought the wave.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {suggestions.map((s: any) => (
              <div key={s.id} style={{
                background: 'rgba(255,255,255,.03)',
                border: '0.5px solid rgba(255,255,255,.07)',
                borderRadius: 14, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'rgba(255,255,255,.06)',
                  overflow: 'hidden', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,.4)', fontSize: 15, fontWeight: 700,
                }}>
                  {s.avatar_url
                    ? <img src={s.avatar_url}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (s.display_name?.[0] ?? '?').toUpperCase()
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#fff', fontSize: 14, fontWeight: 700,
                    letterSpacing: '-0.02em', margin: 0 }}>
                    {s.display_name ?? s.username}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,.25)', fontSize: 11, margin: '2px 0 0' }}>
                    @{s.username}
                  </p>
                </div>
                <button
                  onClick={() => !sent.has(s.id) && handleAdd(s.id)}
                  disabled={sent.has(s.id)}
                  style={{
                    flexShrink: 0, padding: '7px 14px', borderRadius: 99,
                    border: sent.has(s.id)
                      ? '0.5px solid rgba(255,255,255,.08)'
                      : 'none',
                    background: sent.has(s.id) ? 'transparent' : 'rgba(255,255,255,.97)',
                    color: sent.has(s.id) ? 'rgba(255,255,255,.2)' : '#000',
                    fontSize: 12, fontWeight: 700,
                    cursor: sent.has(s.id) ? 'default' : 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {sent.has(s.id) ? 'Sent' : 'Add'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── SHARED STYLES ────────────────────────────────

const headingStyle: React.CSSProperties = {
  fontSize: 44, fontWeight: 800, letterSpacing: '-0.04em',
  color: '#fff', lineHeight: 1.05, marginBottom: 8,
}

const subStyle: React.CSSProperties = {
  fontSize: 14, color: 'rgba(255,255,255,.3)',
  lineHeight: 1.5, marginBottom: 0,
}

const fieldStyle: React.CSSProperties = {
  marginBottom: 20,
}

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 600,
  letterSpacing: '0.14em', color: 'rgba(255,255,255,.2)',
  marginBottom: 8, textTransform: 'uppercase' as const,
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,.04)',
  border: '0.5px solid rgba(255,255,255,.07)',
  borderRadius: 12, padding: '14px 14px',
  color: '#fff', fontSize: 16, fontWeight: 500,
  outline: 'none', boxSizing: 'border-box' as const,
  fontFamily: "'Inter Tight','Inter',sans-serif",
  letterSpacing: '-0.01em',
}
