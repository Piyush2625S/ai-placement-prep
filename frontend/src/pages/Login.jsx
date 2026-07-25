import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api/axios'

const EyeIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>)
          : (<><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>)}
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

  // Reveal animation on mount
  useEffect(() => {
    document.querySelectorAll('.reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('in'), i * 80)
    })
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar */}
      <nav className="nav nav-pad">
        <div className="nav-logo">prep<span>AI</span></div>
        <Link to="/signup" className="btn btn-primary" style={{ padding: '9px 20px', fontSize: '13px' }}>
          Start free →
        </Link>
      </nav>

      <div className="auth-grid" style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        maxWidth: '1100px', margin: '0 auto', width: '100%',
        padding: 'clamp(32px, 6vw, 80px) clamp(16px, 4vw, 48px)',
        gap: '64px', alignItems: 'center',
      }}>

        {/* Left: Form */}
        <div className="auth-left reveal" style={{ maxWidth: '400px' }}>
          <div className="tag-pill" style={{ marginBottom: '24px' }}>
            🎯 Welcome back
          </div>
          <h1 style={{ marginBottom: '8px' }}>Sign in to prepAI</h1>
          <p style={{ fontSize: '14px', marginBottom: '32px' }}>
            No account?{' '}
            <Link to="/signup" style={{ color: 'var(--coral)', fontWeight: '600' }}>
              Create one free
            </Link>
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="field-label">Email</label>
              <input className="input" type="email" name="email"
                placeholder="you@college.edu"
                value={form.email} onChange={handleChange} required />
            </div>

            <div>
              <label className="field-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPassword ? 'text' : 'password'}
                  name="password" placeholder="••••••••"
                  value={form.password} onChange={handleChange} required
                  style={{ paddingRight: '44px' }} />
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
              style={{ width: '100%', padding: '13px', fontSize: '15px', borderRadius: '12px' }}>
              {loading ? 'Signing in...' : 'Continue →'}
            </button>
          </form>
        </div>

        {/* Right: Session card preview */}
        <div className="auth-right reveal" style={{ transitionDelay: '0.12s' }}>
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <span className="tag-pill">Amazon · Technical</span>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Question 3 of 5</span>
            </div>
            <p style={{
              fontFamily: 'Baloo 2, sans-serif', fontSize: '16px', fontWeight: '600',
              color: 'var(--ink)', lineHeight: 1.4, marginBottom: '16px',
            }}>
              "How would you design a rate limiter for an API?"
            </p>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
              {['done','done','active','',''].map((s,i) => (
                <div key={i} style={{
                  flex: 1, height: '5px', borderRadius: '99px',
                  background: s === 'done' ? 'var(--coral)' : s === 'active' ? 'var(--sky)' : 'var(--line)',
                }} />
              ))}
            </div>
            <div style={{
              fontSize: '13px', color: 'var(--ink)',
              background: '#FFF6F0', border: '1px solid #FFE3D6',
              borderRadius: '10px', padding: '12px 14px', lineHeight: 1.6,
            }}>
              <span style={{ color: 'var(--coral)', fontWeight: '700' }}>Score: 7/10 — </span>
              Good on token bucket logic, but you skipped what happens on distributed nodes.
            </div>
          </div>

          {/* Stats below card */}
          <div style={{ display: 'flex', gap: '24px', marginTop: '24px', padding: '0 4px' }}>
            {[
              { n: '20+', l: 'companies covered' },
              { n: '4',   l: 'rounds each'       },
              { n: 'Daily', l: 'progress tracked' },
            ].map(({ n, l }) => (
              <div key={n}>
                <div style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: '22px', fontWeight: '700', color: 'var(--indigo)' }}>{n}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--line)',
      padding: '32px clamp(16px, 4vw, 48px)',
      display: 'flex', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: '24px',
      background: 'var(--bg-card)',
    }}>
      <div>
        <div className="nav-logo" style={{ marginBottom: '6px' }}>prep<span style={{ color: 'var(--coral)' }}>AI</span></div>
        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>© 2026 prepAI. Built for placement season.</div>
      </div>
      <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
        {[
          { title: 'Product',  links: [{ l: 'Dashboard', h: '/dashboard' }, { l: 'Resume tips', h: '/resume' }] },
          { title: 'Contact',  links: [{ l: 'hello@prepai.app', h: 'mailto:hello@prepai.app' }, { l: 'Report an issue', h: '#' }] },
          { title: 'Legal',    links: [{ l: 'Privacy', h: '#' }, { l: 'Terms', h: '#' }] },
        ].map(col => (
          <div key={col.title}>
            <div style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: '13px', color: 'var(--indigo)', fontWeight: '600', marginBottom: '10px' }}>{col.title}</div>
            {col.links.map(({ l, h }) => (
              <a key={l} href={h} style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginBottom: '6px' }}
                onMouseEnter={e => e.target.style.color = 'var(--coral)'}
                onMouseLeave={e => e.target.style.color = 'var(--muted)'}>
                {l}
              </a>
            ))}
          </div>
        ))}
      </div>
    </footer>
  )
}

export { Footer }