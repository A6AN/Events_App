import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type Screen = 'phone' | 'otp'

// Aura colors per vibe — used as ambient background glows
const AURA = {
  a: 'rgba(249,100,60,.18)',
  b: 'rgba(180,140,255,.14)',
  c: 'rgba(60,230,180,.12)',
}

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signInWithPhone, verifyOtp, signInWithGoogle, user } = useAuth()

  const [screen, setScreen] = useState<Screen>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const redirect = searchParams.get('redirect') ?? '/'

  // Already logged in — redirect
  useEffect(() => {
    if (user) navigate(redirect, { replace: true })
  }, [user, navigate, redirect])

  // ─── PHONE SUBMIT ──────────────────────────────

  const handlePhoneSubmit = async () => {
    const cleaned = phone.replace(/\s/g, '')
    if (cleaned.length < 10) {
      setError('Enter a valid phone number')
      return
    }
    setError('')
    setLoading(true)
    const formatted = cleaned.startsWith('+') ? cleaned : `+91${cleaned}`
    const { error } = await signInWithPhone(formatted)
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setScreen('otp')
    }
  }

  // ─── OTP INPUT ─────────────────────────────────

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
    // Auto-submit when all 6 digits filled
    if (next.every(d => d) && next.join('').length === 6) {
      handleOtpSubmit(next.join(''))
    }
  }

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus()
    }
  }

  const handleOtpSubmit = async (code?: string) => {
    const token = code ?? otp.join('')
    if (token.length < 6) return
    setError('')
    setLoading(true)
    const cleaned = phone.replace(/\s/g, '')
    const formatted = cleaned.startsWith('+') ? cleaned : `+91${cleaned}`
    const { error } = await verifyOtp(formatted, token)
    setLoading(false)
    if (error) {
      setError(error.message)
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    }
    // Success — useEffect handles redirect via user state change
  }

  const handleGoogle = async () => {
    setLoading(true)
    setError('')
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  // ─── RENDER ────────────────────────────────────

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      fontFamily: "'Inter Tight', 'Inter', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      maxWidth: 400,
      margin: '0 auto',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Ambient aura glows */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute',
          width: 320, height: 320,
          top: -80, left: -80,
          background: `radial-gradient(circle, ${AURA.b} 0%, transparent 70%)`,
        }} />
        <div style={{
          position: 'absolute',
          width: 280, height: 280,
          bottom: 60, right: -80,
          background: `radial-gradient(circle, ${AURA.a} 0%, transparent 70%)`,
        }} />
        <div style={{
          position: 'absolute',
          width: 200, height: 200,
          bottom: -40, left: '30%',
          background: `radial-gradient(circle, ${AURA.c} 0%, transparent 70%)`,
        }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 24px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ paddingTop: 72, paddingBottom: 64 }}>
          <div style={{
            fontSize: 42,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#fff',
            lineHeight: 1,
          }}>
            milo
          </div>
          <div style={{
            fontSize: 13,
            fontWeight: 400,
            color: 'rgba(255,255,255,.25)',
            marginTop: 6,
            letterSpacing: '0.04em',
          }}>
            find your frequency.
          </div>
        </div>

        {screen === 'phone' ? (
          <PhoneScreen
            phone={phone}
            setPhone={setPhone}
            error={error}
            loading={loading}
            onSubmit={handlePhoneSubmit}
            onGoogle={handleGoogle}
          />
        ) : (
          <OtpScreen
            phone={phone}
            otp={otp}
            otpRefs={otpRefs}
            error={error}
            loading={loading}
            onChange={handleOtpChange}
            onKeyDown={handleOtpKeyDown}
            onSubmit={() => handleOtpSubmit()}
            onBack={() => {
              setScreen('phone')
              setOtp(['', '', '', '', '', ''])
              setError('')
            }}
          />
        )}
      </div>

      {/* Bottom legal */}
      <div style={{
        padding: '16px 24px 40px',
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 11,
          color: 'rgba(255,255,255,.15)',
          lineHeight: 1.6,
        }}>
          By continuing you agree to our Terms of Use and Privacy Policy.
          You must be 18+ to use Milo.
        </p>
      </div>
    </div>
  )
}

// ─── PHONE SCREEN ─────────────────────────────────

function PhoneScreen({ phone, setPhone, error, loading, onSubmit, onGoogle }: {
  phone: string
  setPhone: (v: string) => void
  error: string
  loading: boolean
  onSubmit: () => void
  onGoogle: () => void
}) {
  return (
    <div style={{ flex: 1 }}>
      <h1 style={{
        fontSize: 28,
        fontWeight: 800,
        letterSpacing: '-0.03em',
        color: '#fff',
        marginBottom: 8,
        lineHeight: 1.1,
      }}>
        What's your number?
      </h1>
      <p style={{
        fontSize: 14,
        color: 'rgba(255,255,255,.3)',
        marginBottom: 40,
        lineHeight: 1.5,
      }}>
        We'll send a one-time code. No passwords, ever.
      </p>

      {/* Phone input */}
      <div style={{
        background: 'rgba(255,255,255,.04)',
        border: `0.5px solid ${error ? 'rgba(249,100,60,.5)' : 'rgba(255,255,255,.08)'}`,
        borderRadius: 16,
        display: 'flex',
        alignItems: 'center',
        padding: '0 18px',
        marginBottom: 12,
        transition: 'border-color 0.2s',
      }}>
        <span style={{
          fontSize: 15,
          fontWeight: 600,
          color: 'rgba(255,255,255,.35)',
          marginRight: 10,
          letterSpacing: '0.02em',
        }}>
          +91
        </span>
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          onKeyDown={e => e.key === 'Enter' && onSubmit()}
          placeholder="00000 00000"
          autoFocus
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: '#fff',
            padding: '18px 0',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {error && (
        <p style={{ color: 'rgba(249,100,60,.9)', fontSize: 12, marginBottom: 16 }}>
          {error}
        </p>
      )}

      {/* Send OTP CTA */}
      <button
        onClick={onSubmit}
        disabled={loading || phone.length < 10}
        style={{
          width: '100%',
          padding: '17px',
          borderRadius: 14,
          border: 'none',
          background: phone.length >= 10 && !loading
            ? 'rgba(255,255,255,.97)'
            : 'rgba(255,255,255,.08)',
          color: phone.length >= 10 && !loading ? '#000' : 'rgba(255,255,255,.2)',
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: '0.02em',
          cursor: phone.length >= 10 ? 'pointer' : 'not-allowed',
          transition: 'background 0.2s, color 0.2s',
          fontFamily: 'inherit',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Aura glow on active button */}
        {phone.length >= 10 && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, rgba(180,140,255,.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
        )}
        <span style={{ position: 'relative', zIndex: 1 }}>
          {loading ? 'Sending...' : 'Get Code →'}
        </span>
      </button>

      {/* Divider */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        margin: '28px 0',
      }}>
        <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,.07)' }} />
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.2)', letterSpacing: '0.08em' }}>OR</span>
        <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,.07)' }} />
      </div>

      {/* Google */}
      <button
        onClick={onGoogle}
        disabled={loading}
        style={{
          width: '100%',
          padding: '15px',
          borderRadius: 14,
          border: '0.5px solid rgba(255,255,255,.08)',
          background: 'rgba(255,255,255,.03)',
          color: 'rgba(255,255,255,.6)',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          fontFamily: 'inherit',
          transition: 'background 0.15s',
        }}
        onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,.06)')}
        onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,.03)')}
      >
        {/* Google G icon */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M15.36 8.18c0-.56-.05-1.1-.14-1.62H8v3.07h4.12a3.52 3.52 0 01-1.53 2.31v1.92h2.47c1.45-1.33 2.3-3.3 2.3-5.68z" fill="rgba(255,255,255,.5)"/>
          <path d="M8 16c2.07 0 3.8-.68 5.07-1.85l-2.47-1.92c-.69.46-1.56.73-2.6.73-2 0-3.7-1.35-4.3-3.17H1.15v1.98A7.99 7.99 0 008 16z" fill="rgba(255,255,255,.4)"/>
          <path d="M3.7 9.79A4.82 4.82 0 013.45 8c0-.62.11-1.23.25-1.79V4.23H1.15A7.99 7.99 0 000 8c0 1.29.31 2.51.86 3.59l2.84-1.8z" fill="rgba(255,255,255,.3)"/>
          <path d="M8 3.18c1.13 0 2.14.39 2.94 1.15l2.2-2.2A7.96 7.96 0 008 0 7.99 7.99 0 001.15 4.23L4 6.21C4.6 4.38 6.3 3.18 8 3.18z" fill="rgba(255,255,255,.45)"/>
        </svg>
        Continue with Google
      </button>
    </div>
  )
}

// ─── OTP SCREEN ───────────────────────────────────

function OtpScreen({ phone, otp, otpRefs, error, loading, onChange, onKeyDown, onSubmit, onBack }: {
  phone: string
  otp: string[]
  otpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>
  error: string
  loading: boolean
  onChange: (i: number, v: string) => void
  onKeyDown: (i: number, e: React.KeyboardEvent) => void
  onSubmit: () => void
  onBack: () => void
}) {
  // Focus first input on mount
  useEffect(() => {
    setTimeout(() => otpRefs.current[0]?.focus(), 100)
  }, [])

  const formatted = phone.startsWith('+91') ? phone : `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`

  return (
    <div style={{ flex: 1 }}>
      {/* Back */}
      <button
        onClick={onBack}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'rgba(255,255,255,.3)',
          fontSize: 13,
          cursor: 'pointer',
          padding: '0 0 32px',
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        ← back
      </button>

      <h1 style={{
        fontSize: 28,
        fontWeight: 800,
        letterSpacing: '-0.03em',
        color: '#fff',
        marginBottom: 8,
        lineHeight: 1.1,
      }}>
        Check your messages.
      </h1>
      <p style={{
        fontSize: 14,
        color: 'rgba(255,255,255,.3)',
        marginBottom: 48,
        lineHeight: 1.5,
      }}>
        Code sent to {formatted}
      </p>

      {/* OTP inputs */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 12,
        justifyContent: 'space-between',
      }}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={el => { otpRefs.current[i] = el }}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => onChange(i, e.target.value)}
            onKeyDown={e => onKeyDown(i, e)}
            style={{
              width: 48,
              height: 58,
              background: digit
                ? 'rgba(255,255,255,.06)'
                : 'rgba(255,255,255,.03)',
              border: `0.5px solid ${
                error
                  ? 'rgba(249,100,60,.4)'
                  : digit
                  ? 'rgba(255,255,255,.15)'
                  : 'rgba(255,255,255,.07)'
              }`,
              borderRadius: 12,
              textAlign: 'center',
              fontSize: 24,
              fontWeight: 800,
              color: '#fff',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s, background 0.15s',
              letterSpacing: '-0.02em',
            }}
          />
        ))}
      </div>

      {error && (
        <p style={{ color: 'rgba(249,100,60,.9)', fontSize: 12, marginBottom: 16 }}>
          {error}
        </p>
      )}

      {/* Verify CTA */}
      <button
        onClick={onSubmit}
        disabled={loading || otp.some(d => !d)}
        style={{
          width: '100%',
          marginTop: 8,
          padding: '17px',
          borderRadius: 14,
          border: 'none',
          background: otp.every(d => d) && !loading
            ? 'rgba(255,255,255,.97)'
            : 'rgba(255,255,255,.08)',
          color: otp.every(d => d) && !loading
            ? '#000'
            : 'rgba(255,255,255,.2)',
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: '0.02em',
          cursor: otp.every(d => d) ? 'pointer' : 'not-allowed',
          transition: 'background 0.2s, color 0.2s',
          fontFamily: 'inherit',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {otp.every(d => d) && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, rgba(60,230,180,.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
        )}
        <span style={{ position: 'relative', zIndex: 1 }}>
          {loading ? 'Verifying...' : 'Verify →'}
        </span>
      </button>

      {/* Resend */}
      <p style={{
        fontSize: 13,
        color: 'rgba(255,255,255,.2)',
        textAlign: 'center',
        marginTop: 28,
      }}>
        Didn't get it?{' '}
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,.45)',
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: 'inherit',
            padding: 0,
            textDecoration: 'underline',
            textDecorationColor: 'rgba(255,255,255,.2)',
          }}
        >
          Try again
        </button>
      </p>
    </div>
  )
}
