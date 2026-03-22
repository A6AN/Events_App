import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Aura colors per vibe — used as ambient background glows
const AURA = {
  a: 'rgba(249,100,60,.18)',
  b: 'rgba(180,140,255,.14)',
  c: 'rgba(60,230,180,.12)',
}

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signIn, signInWithGoogle, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const redirect = searchParams.get('redirect') ?? '/'

  // Already logged in — redirect
  useEffect(() => {
    if (user) navigate(redirect, { replace: true })
  }, [user, navigate, redirect])

  const handleGoogle = async () => {
    setLoading(true)
    setError('')
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

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

        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#fff',
            marginBottom: 8,
            lineHeight: 1.1,
          }}>
            Ready to dive in?
          </h1>
          <p style={{
            fontSize: 14,
            color: 'rgba(255,255,255,.3)',
            marginBottom: 40,
            lineHeight: 1.5,
          }}>
            Connect with one tap. No passwords, just high-tier vibes.
          </p>

          {error && (
            <p style={{ color: 'rgba(249,100,60,.9)', fontSize: 12, marginBottom: 16 }}>
              {error}
            </p>
          )}

          {/* Email Login Form — Temp for Debug */}
          <form onSubmit={async (e) => {
            e.preventDefault()
            setLoading(true)
            setError('')
            const { error } = await signIn(email, password)
            if (error) {
              setError(error.message)
              setLoading(false)
            }
          }} style={{ marginBottom: 24 }}>
            <input 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="Email" 
              style={{ width: '100%', padding: '12px', marginBottom: 12, borderRadius: 8, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#fff' }} 
            />
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Password" 
              style={{ width: '100%', padding: '12px', marginBottom: 12, borderRadius: 8, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#fff' }} 
            />
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: 8, background: '#fff', color: '#000', fontWeight: 'bold' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Google Button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            style={{
              width: '100%',
              padding: '17px',
              borderRadius: 14,
              border: 'none',
              background: 'rgba(255,255,255,.97)',
              color: '#000',
              fontSize: 15,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              fontFamily: 'inherit',
              transition: 'background 0.2s',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at center, rgba(180,140,255,.2) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            
            {/* Google G icon */}
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" style={{ position: 'relative', zIndex: 1 }}>
              <path d="M15.36 8.18c0-.56-.05-1.1-.14-1.62H8v3.07h4.12a3.52 3.52 0 01-1.53 2.31v1.92h2.47c1.45-1.33 2.3-3.3 2.3-5.68z" fill="#4285F4"/>
              <path d="M8 16c2.07 0 3.8-.68 5.07-1.85l-2.47-1.92c-.69.46-1.56.73-2.6.73-2 0-3.7-1.35-4.3-3.17H1.15v1.98A7.99 7.99 0 008 16z" fill="#34A853"/>
              <path d="M3.7 9.79A4.82 4.82 0 013.45 8c0-.62.11-1.23.25-1.79V4.23H1.15A7.99 7.99 0 000 8c0 1.29.31 2.51.86 3.59l2.84-1.8z" fill="#FBBC05"/>
              <path d="M8 3.18c1.13 0 2.14.39 2.94 1.15l2.2-2.2A7.96 7.96 0 008 0 7.99 7.99 0 008 3.18z" fill="#EA4335"/>
            </svg>
            
            <span style={{ position: 'relative', zIndex: 1 }}>
              {loading ? 'Entering...' : 'Continue with Google'}
            </span>
          </button>
        </div>
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
