import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api/axios'

const EyeIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open
      ? (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>)
      : (<><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>)}
  </svg>
)

function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ chars',    pass: password.length >= 8          },
    { label: 'Uppercase',   pass: /[A-Z]/.test(password)        },
    { label: 'Lowercase',   pass: /[a-z]/.test(password)        },
    { label: 'Number',      pass: /[0-9]/.test(password)        },
    { label: 'Special',     pass: /[^A-Za-z0-9]/.test(password) },
  ]
  const passed = checks.filter(c => c.pass).length
  const color  = passed <= 2 ? 'var(--coral)' : passed <= 3 ? '#f59e0b' : '#22C55E'
  const label  = passed <= 2 ? 'Weak' : passed <= 3 ? 'Medium' : passed <= 4 ? 'Strong' : 'Very strong'
  if (!password) return null
  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{
            flex: 1, height: '3px', borderRadius: '99px',
            background: i <= passed ? color : 'var(--line)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Strength</span>
        <span style={{ fontSize: '11px', fontWeight: '700', color, fontFamily: 'Baloo 2, sans-serif' }}>{label}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
        {checks.map(c => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '10px', color: c.pass ? '#22C55E' : 'var(--line)', transition: 'color 0.2s' }}>{c.pass ? '✓' : '○'}</span>
            <span style={{ fontSize: '11px', color: c.pass ? 'var(--ink)' : 'var(--muted)', transition: 'color 0.2s' }}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Journey steps shown on right panel
const JOURNEY = [
  { icon: '🎯', label: 'Pick a company + round' },
  { icon: '✍️', label: 'Answer like it\'s real'  },
  { icon: '📊', label: 'Get scored feedback'     },
  { icon: '📈', label: 'Track your progress'     },
]

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name:'', email:'', password:'', course:'', passingYear:'', college:'', targetRole:'' })
  const [showPassword, setShowPassword] = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const passwordValid = () => {
    const p = form.password
    return p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!passwordValid()) { setError('Password must be 8+ chars with uppercase, lowercase, number and special character.'); return }
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

  // Cycle through journey steps on right panel
  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s + 1) % JOURNEY.length), 2000)
    return () => clearInterval(t)
  }, [])

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i)

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }} className="auth-grid">

      {/* Left: Form */}
      <div className="auth-left" style={{
        display: 'flex', flexDirection: 'column',
        padding: '0',
        overflowY: 'auto',
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--line)',
      }}>
        {/* Top bar */}
        <div style={{ padding: '20px 40px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="nav-logo">prep<span>AI</span></div>
          <Link to="/login" style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: '500' }}>
            Already have an account? <span style={{ color: 'var(--coral)', fontWeight: '600' }}>Sign in</span>
          </Link>
        </div>

        <div style={{ flex: 1, padding: '40px 40px 32px', maxWidth: '460px', width: '100%', margin: '0 auto' }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '26px', marginBottom: '6px' }}>Create your account</h1>
            <p style={{ fontSize: '14px' }}>Start prepping for your placement interviews — free forever.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="field-label">Full name *</label>
              <input className="input" type="text" name="name" placeholder="Your full name"
                value={form.name} onChange={handleChange} required />
            </div>

            <div>
              <label className="field-label">Email *</label>
              <input className="input" type="email" name="email" placeholder="you@college.edu"
                value={form.email} onChange={handleChange} required />
            </div>

            <div>
              <label className="field-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPassword ? 'text' : 'password'}
                  name="password" placeholder="Min. 8 characters"
                  value={form.password} onChange={handleChange} required
                  style={{ paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPassword(s => !s)} style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: '4px',
                }}>
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="field-label">Course *</label>
                <select className="input" name="course" value={form.course} onChange={handleChange} required style={{ cursor: 'pointer' }}>
                  <option value="">Select</option>
                  {['B.Tech CSE','B.Tech CSE (AI)','B.Tech IT','B.Tech ECE','B.Tech Other','MCA','BCA','M.Tech','MBA','Other'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Passing year *</label>
                <select className="input" name="passingYear" value={form.passingYear} onChange={handleChange} required style={{ cursor: 'pointer' }}>
                  <option value="">Year</option>
                  {years.map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="field-label">College name</label>
              <input className="input" type="text" name="college" placeholder="e.g. VIT Vellore (optional)"
                value={form.college} onChange={handleChange} />
            </div>

            <div>
              <label className="field-label">Target role</label>
              <select className="input" name="targetRole" value={form.targetRole} onChange={handleChange} style={{ cursor: 'pointer' }}>
                <option value="">Select (optional)</option>
                {['SDE','SDE-2','Data Analyst','Data Scientist','DevOps Engineer','Product Manager','Frontend Developer','Backend Developer','Full Stack Developer','ML Engineer'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            {error && <div className="error-box">{error}</div>}

            <button className="btn btn-primary" type="submit"
              disabled={loading || !passwordValid()}
              style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: '12px', marginTop: '6px' }}>
              {loading ? 'Creating account...' : 'Get started →'}
            </button>

            <p style={{ fontSize: '11px', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6 }}>
              By signing up you agree to our{' '}
              <a href="#" style={{ color: 'var(--indigo-2)' }}>Terms</a> and{' '}
              <a href="#" style={{ color: 'var(--indigo-2)' }}>Privacy Policy</a>.
            </p>
          </form>
        </div>
      </div>

      {/* Right: Illustrated panel */}
      <div className="auth-right" style={{
        background: 'linear-gradient(160deg, var(--indigo) 0%, var(--indigo-2) 50%, #7C5FC2 100%)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '48px 40px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Background orbs */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(255,111,89,0.15)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(110,193,228,0.12)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '380px', width: '100%' }}>

          {/* Headline */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.7)',
              background: 'rgba(255,255,255,0.1)', padding: '5px 12px',
              borderRadius: '999px', marginBottom: '16px',
              fontFamily: 'Baloo 2, sans-serif', letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              🎯 The prep flow
            </div>
            <h2 style={{ fontFamily: 'Baloo 2, sans-serif', fontWeight: '800', fontSize: '28px', color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
              From zero to offer,<br />
              <span style={{ color: 'var(--sky)' }}>one session at a time.</span>
            </h2>
          </div>

          {/* Animated journey steps */}
          <div style={{ marginBottom: '36px' }}>
            {JOURNEY.map((step, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '12px 16px', marginBottom: '8px',
                borderRadius: '12px',
                background: activeStep === i ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${activeStep === i ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                transition: 'all 0.4s cubic-bezier(0.19,1,0.22,1)',
                transform: activeStep === i ? 'scale(1.02)' : 'scale(1)',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                  background: activeStep === i ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', transition: 'all 0.4s',
                }}>
                  {step.icon}
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Baloo 2, sans-serif' }}>
                    STEP {i + 1}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: activeStep === i ? '#fff' : 'rgba(255,255,255,0.7)', transition: 'color 0.3s' }}>
                    {step.label}
                  </div>
                </div>
                {activeStep === i && (
                  <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--coral)', flexShrink: 0 }} className="pulse" />
                )}
              </div>
            ))}
          </div>

          {/* Mock session card */}
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '14px', padding: '18px 20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.8)', fontFamily: 'Baloo 2, sans-serif' }}>
                TCS · DSA
              </span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>5/5 done</span>
            </div>
            <div style={{ display: 'flex', gap: '5px', marginBottom: '14px' }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ flex: 1, height: '4px', borderRadius: '99px', background: 'var(--coral)' }} />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                fontFamily: 'Baloo 2, sans-serif', fontSize: '28px', fontWeight: '800',
                color: '#22C55E',
              }}>
                38<span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)' }}>/50</span>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>Strong performance 💪</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>avg 7.6 / 10 per question</div>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            {[
              { init: 'P', text: 'Placed at Infosys', sub: 'B.Tech CSE 2025' },
              { init: 'A', text: 'Cracked TCS DSA', sub: 'B.Tech IT 2026' },
            ].map(({ init, text, sub }) => (
              <div key={init} style={{
                flex: 1, padding: '12px', background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--coral), var(--sky))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: '700', color: '#fff', fontFamily: 'Baloo 2, sans-serif',
                  }}>{init}</div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#fff' }}>{text}</div>
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}