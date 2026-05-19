import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api/axios'

// ── Must be outside the Login function ──
const EyeIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
)

export default function Login() {
  const navigate = useNavigate()
  const [form,         setForm]         = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await API.post('/auth/login', form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

      {/* ── Left: Form ── */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 64px',
        borderRight: '1px solid var(--line)',
      }}>
        <div style={{
          fontFamily: 'var(--font-head)', fontSize: '17px',
          fontWeight: '700', letterSpacing: '-0.03em', color: '#18181B',
        }}>
          prep<span style={{ color: 'var(--green)' }}>AI</span>
        </div>

        <div style={{ maxWidth: '340px', width: '100%' }}>
          <p style={{
            fontFamily: 'var(--font-head)', fontSize: '28px', fontWeight: '700',
            letterSpacing: '-0.03em', color: '#18181B', marginBottom: '6px', lineHeight: 1.2,
          }}>
            Sign in
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '32px' }}>
            No account?{' '}
            <Link to="/signup" style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: '500' }}>
              Create one free
            </Link>
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            <div>
              <label className="field-label">Email</label>
              <input className="input" type="email" name="email"
                placeholder="you@college.edu"
                value={form.email} onChange={handleChange} required />
            </div>

            <div>
              <label className="field-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={{ paddingRight: '44px' }}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)} style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--muted)', display: 'flex', padding: '4px',
                }}>
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {error && <div className="error-box">{error}</div>}

            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', padding: '12px', marginTop: '6px', fontSize: '14px' }}>
              {loading ? 'Signing in...' : 'Continue →'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
            </div>

            <button type="button" className="btn btn-ghost"
              style={{ width: '100%', padding: '11px', gap: '10px', color: '#18181B' }}
              onClick={() => alert('Google OAuth — coming after deployment')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <button type="button" className="btn btn-ghost"
              style={{ width: '100%', padding: '11px', gap: '10px', color: '#18181B' }}
              onClick={() => alert('LinkedIn OAuth — coming after deployment')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Continue with LinkedIn
            </button>

          </form>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--muted)' }}>© 2025 PrepAI</p>
      </div>

      {/* ── Right: Editorial panel ── */}
<div style={{
  background: 'linear-gradient(160deg, #F0FDF4 0%, #DCFCE7 50%, #BBF7D0 100%)',
  padding: '48px 64px', display: 'flex', flexDirection: 'column',
  justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
}}>
  <div style={{
    position: 'absolute', top: '-80px', right: '-80px',
    width: '360px', height: '360px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(34,197,94,0.25) 0%, transparent 70%)',
    pointerEvents: 'none',
  }} />
  <div />
  <div style={{ position: 'relative', zIndex: 1 }}>
    <span className="tag" style={{ marginBottom: '28px', display: 'inline-block' }}>
      Placement prep
    </span>
    <p style={{
      fontFamily: 'var(--font-head)',
      fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: '800',
      letterSpacing: '-0.03em', lineHeight: 1.1,
      color: '#14532D', marginTop: '14px',
    }}>
      Practice like<br />it's the<br />
      <span style={{ color: 'var(--green)' }}>real interview.</span>
    </p>
    <p style={{
      marginTop: '20px', fontSize: '15px', lineHeight: '1.7',
      color: '#166534', maxWidth: '320px',
    }}>
      AI questions from real company patterns. Feedback that tells you exactly what to fix.
    </p>
    <div style={{
      display: 'flex', gap: '32px', marginTop: '40px',
      paddingTop: '32px', borderTop: '1px solid rgba(0,0,0,0.08)',
    }}>
      {[
        { n: '4 rounds',      label: 'DSA · Tech · HR · Aptitude' },
        { n: '20+ companies', label: 'Real interview patterns'     },
        { n: 'AI feedback',   label: 'On every answer'             },
      ].map(({ n, label }) => (
        <div key={n}>
          <div style={{
            fontFamily: 'var(--font-head)', fontSize: '18px',
            fontWeight: '700', color: '#14532D', letterSpacing: '-0.02em',
          }}>{n}</div>
          <div style={{ fontSize: '12px', color: '#166534', marginTop: '3px' }}>{label}</div>
        </div>
      ))}
    </div>
  </div>
  <p style={{ fontSize: '12px', color: '#166534', position: 'relative', zIndex: 1 }}>
    No credit card · No nonsense
  </p>
</div>

    </div>
  )
}