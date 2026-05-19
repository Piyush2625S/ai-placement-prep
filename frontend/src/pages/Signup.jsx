import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api/axios'

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

function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters',     pass: password.length >= 8          },
    { label: 'Uppercase letter',  pass: /[A-Z]/.test(password)        },
    { label: 'Lowercase letter',  pass: /[a-z]/.test(password)        },
    { label: 'Number',            pass: /[0-9]/.test(password)        },
    { label: 'Special character', pass: /[^A-Za-z0-9]/.test(password) },
  ]
  const passed = checks.filter(c => c.pass).length
  const color  = passed <= 2 ? '#ef4444' : passed <= 3 ? '#f59e0b' : '#22C55E'
  const label  = passed <= 2 ? 'Weak' : passed <= 3 ? 'Medium' : passed <= 4 ? 'Strong' : 'Very strong'

  if (!password) return null

  return (
    <div style={{ marginTop: '8px' }}>
      {/* Bar */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{
            flex: 1, height: '3px', borderRadius: '99px',
            background: i <= passed ? color : 'var(--line)',
            transition: 'background 0.2s',
          }} />
        ))}
      </div>
      {/* Label */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Password strength</span>
        <span style={{ fontSize: '11px', fontWeight: '600', color }}>{label}</span>
      </div>
      {/* Checks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
        {checks.map(c => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: c.pass ? '#22C55E' : 'var(--muted)' }}>
              {c.pass ? '✓' : '○'}
            </span>
            <span style={{ fontSize: '11px', color: c.pass ? '#18181B' : 'var(--muted)' }}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    course: '', passingYear: '', college: '', targetRole: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const passwordValid = () => {
    const p = form.password
    return p.length >= 8 &&
      /[A-Z]/.test(p) && /[a-z]/.test(p) &&
      /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!passwordValid()) {
      setError('Password must be 8+ characters with uppercase, lowercase, number and special character.')
      return
    }
    setLoading(true)
    try {
      const { data } = await API.post('/auth/signup', form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i)

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

      {/* Left: Form */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '48px 64px',
        borderRight: '1px solid var(--line)', overflowY: 'auto',
      }}>
        <div style={{
          fontFamily: 'var(--font-head)', fontSize: '17px',
          fontWeight: '700', letterSpacing: '-0.03em', color: '#18181B',
        }}>
          prep<span style={{ color: 'var(--green)' }}>AI</span>
        </div>

        <div style={{ maxWidth: '360px', width: '100%', padding: '40px 0' }}>
          <p style={{
            fontFamily: 'var(--font-head)', fontSize: '26px', fontWeight: '700',
            letterSpacing: '-0.03em', color: '#18181B', marginBottom: '6px', lineHeight: 1.2,
          }}>
            Create account
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '28px' }}>
            Already have one?{' '}
            <Link to="/login" style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: '500' }}>
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            <div>
              <label className="field-label">Full name *</label>
              <input className="input" type="text" name="name"
                placeholder="Pushpender Prajapati"
                value={form.name} onChange={handleChange} required />
            </div>

            <div>
              <label className="field-label">Email *</label>
              <input className="input" type="email" name="email"
                placeholder="you@college.edu"
                value={form.email} onChange={handleChange} required />
            </div>

            <div>
              <label className="field-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Min. 8 characters"
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
              <PasswordStrength password={form.password} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="field-label">Course *</label>
                <select className="input" name="course"
                  value={form.course} onChange={handleChange} required
                  style={{ cursor: 'pointer' }}>
                  <option value="">Select</option>
                  <option>B.Tech CSE</option>
                  <option>B.Tech CSE (AI)</option>
                  <option>B.Tech IT</option>
                  <option>B.Tech ECE</option>
                  <option>B.Tech Other</option>
                  <option>MCA</option>
                  <option>BCA</option>
                  <option>M.Tech</option>
                  <option>MBA</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="field-label">Passing year *</label>
                <select className="input" name="passingYear"
                  value={form.passingYear} onChange={handleChange} required
                  style={{ cursor: 'pointer' }}>
                  <option value="">Year</option>
                  {years.map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="field-label">College name</label>
              <input className="input" type="text" name="college"
                placeholder="e.g. VIT Vellore (optional)"
                value={form.college} onChange={handleChange} />
            </div>

            <div>
              <label className="field-label">Target role</label>
              <select className="input" name="targetRole"
                value={form.targetRole} onChange={handleChange}
                style={{ cursor: 'pointer' }}>
                <option value="">Select (optional)</option>
                <option>SDE</option>
                <option>SDE-2</option>
                <option>Data Analyst</option>
                <option>Data Scientist</option>
                <option>DevOps Engineer</option>
                <option>Product Manager</option>
                <option>Frontend Developer</option>
                <option>Backend Developer</option>
                <option>Full Stack Developer</option>
                <option>ML Engineer</option>
              </select>
            </div>

            {error && <div className="error-box">{error}</div>}

            <button className="btn btn-primary" type="submit"
              disabled={loading || !passwordValid()}
              style={{ width: '100%', padding: '12px', marginTop: '4px', fontSize: '14px' }}>
              {loading ? 'Creating account...' : 'Get started →'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

          </form>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--muted)' }}>© 2025 PrepAI</p>
      </div>

      {/* Right: Editorial panel */}
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
            Free to start
          </span>
          <p style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: '800',
            letterSpacing: '-0.03em', lineHeight: 1.1, color: '#14532D', marginTop: '14px',
          }}>
            Your offer<br />starts with<br />
            <span style={{ color: 'var(--green)' }}>one session.</span>
          </p>
          <p style={{ marginTop: '20px', fontSize: '15px', lineHeight: '1.7', color: '#166534', maxWidth: '320px' }}>
            Pick a company. Pick a round. Get questions, answer them, get real feedback. Track progress over days.
          </p>
          <div style={{
            display: 'flex', gap: '32px', marginTop: '40px',
            paddingTop: '32px', borderTop: '1px solid rgba(0,0,0,0.08)',
          }}>
            {[
              { n: '4 rounds',       label: 'DSA · Tech · Aptitude · HR' },
              { n: '20+ companies',  label: 'Real interview patterns'     },
              { n: 'AI feedback',    label: 'On every answer'             },
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