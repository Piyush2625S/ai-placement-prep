import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import { Footer } from './Login'

const COMPANIES = [
  { id: 'google',    name: 'Google',          tag: 'FAANG',   domain: 'google.com'    },
  { id: 'amazon',    name: 'Amazon',          tag: 'FAANG',   domain: 'amazon.com'    },
  { id: 'microsoft', name: 'Microsoft',       tag: 'FAANG',   domain: 'microsoft.com' },
  { id: 'meta',      name: 'Meta',            tag: 'FAANG',   domain: 'meta.com'      },
  { id: 'apple',     name: 'Apple',           tag: 'FAANG',   domain: 'apple.com'     },
  { id: 'flipkart',  name: 'Flipkart',        tag: 'Product', domain: 'flipkart.com'  },
  { id: 'uber',      name: 'Uber',            tag: 'Product', domain: 'uber.com'      },
  { id: 'razorpay',  name: 'Razorpay',        tag: 'Product', domain: 'razorpay.com'  },
  { id: 'phonepe',   name: 'PhonePe',         tag: 'Product', domain: 'phonepe.com'   },
  { id: 'paytm',     name: 'Paytm',           tag: 'Product', domain: 'paytm.com'     },
  { id: 'swiggy',    name: 'Swiggy',          tag: 'Startup', domain: 'swiggy.com'    },
  { id: 'zepto',     name: 'Zepto',           tag: 'Startup', domain: 'zeptonow.com'  },
  { id: 'cred',      name: 'CRED',            tag: 'Startup', domain: 'cred.club'     },
  { id: 'meesho',    name: 'Meesho',          tag: 'Startup', domain: 'meesho.com'    },
  { id: 'groww',     name: 'Groww',           tag: 'Startup', domain: 'groww.in'      },
  { id: 'tcs',       name: 'TCS',             tag: 'Service', domain: 'tcs.com'       },
  { id: 'infosys',   name: 'Infosys',         tag: 'Service', domain: 'infosys.com'   },
  { id: 'wipro',     name: 'Wipro',           tag: 'Service', domain: 'wipro.com'     },
  { id: 'cognizant', name: 'Cognizant',       tag: 'Service', domain: 'cognizant.com' },
  { id: 'accenture', name: 'Accenture',       tag: 'Service', domain: 'accenture.com' },
  { id: 'startup',   name: 'Generic Startup', tag: 'Startup', domain: null            },
  { id: 'product',   name: 'Generic Product', tag: 'Product', domain: null            },
]

const ROUNDS = [
  { id: 'dsa',       name: 'DSA',       desc: 'Arrays, trees, graphs, DP'       },
  { id: 'technical', name: 'Technical', desc: 'CS fundamentals, OOP, DBMS, OS'  },
  { id: 'aptitude',  name: 'Aptitude',  desc: 'Quant, logical, verbal'          },
  { id: 'hr',        name: 'HR',        desc: 'Behavioural, culture fit'        },
]

const TAG_COLORS = {
  FAANG:   { bg: '#EFEAF9', color: '#4B3F72', border: '#D5CCEF' },
  Product: { bg: '#EAF4FB', color: '#2A7DA8', border: '#BFE0F0' },
  Startup: { bg: '#FFF1EE', color: '#C94B2A', border: '#FFCFC6' },
  Service: { bg: '#F0F0F0', color: '#555',    border: '#DCDCDC' },
}

function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const initial = user.name?.[0]?.toUpperCase() || '?'
  const fields = [
    { label: 'Course',       value: user.course      },
    { label: 'College',      value: user.college     },
    { label: 'Passing year', value: user.passingYear },
    { label: 'Target role',  value: user.targetRole  },
  ].filter(f => f.value)

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '36px', height: '36px', borderRadius: '50%',
        background: open ? 'var(--indigo)' : '#EFEAF9',
        border: `1.5px solid ${open ? 'var(--indigo)' : 'var(--line)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', fontSize: '13px', fontWeight: '700',
        color: open ? '#fff' : 'var(--indigo)',
        fontFamily: 'Baloo 2, sans-serif',
        transition: 'all 0.15s',
      }}>
        {initial}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '44px', right: 0, width: '240px',
          background: 'var(--bg-card)', border: '1px solid var(--line)',
          borderRadius: 'var(--radius)', boxShadow: '0 8px 28px rgba(75,63,114,0.14)',
          overflow: 'hidden', zIndex: 200,
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--line)', background: '#FAFAF8' }}>
            <div style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: '15px', fontWeight: '700', color: 'var(--indigo)' }}>{user.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{user.email}</div>
          </div>
          {fields.length > 0 && (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
              {fields.map(f => (
                <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{f.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--ink)' }}>{f.value}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ padding: '8px' }}>
            <button onClick={onLogout} style={{
              width: '100%', padding: '8px 10px', background: 'none', border: 'none',
              borderRadius: '8px', textAlign: 'left', cursor: 'pointer',
              fontSize: '13px', color: 'var(--coral)', fontFamily: 'Inter, sans-serif', fontWeight: '500',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#FFF1EE'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function CompanyCard({ company, sessions, onStart }) {
  const [expanded,      setExpanded]      = useState(false)
  const [selectedRound, setSelectedRound] = useState(null)
  const tc            = TAG_COLORS[company.tag]
  const totalSessions = Object.values(sessions).reduce((a, b) => a + b, 0)

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1.5px solid ${expanded ? 'var(--indigo-2)' : 'var(--line)'}`,
      borderRadius: 'var(--radius)', overflow: 'hidden',
      transition: 'border-color 0.15s, box-shadow 0.15s',
      boxShadow: expanded ? '0 8px 28px rgba(75,63,114,0.12)' : '0 1px 4px rgba(75,63,114,0.06)',
    }}>
      <button onClick={() => { setExpanded(e => !e); setSelectedRound(null) }} style={{
        width: '100%', padding: '16px 18px', background: 'none', border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: tc.bg, border: `1px solid ${tc.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, overflow: 'hidden',
          }}>
            {company.domain ? (
              <img src={`https://www.google.com/s2/favicons?domain=${company.domain}&sz=64`}
                alt={company.name} width={20} height={20} style={{ objectFit: 'contain' }}
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
            ) : null}
            <span style={{
              display: company.domain ? 'none' : 'flex',
              alignItems: 'center', justifyContent: 'center',
              width: '100%', height: '100%',
              fontSize: '11px', fontWeight: '700', color: tc.color,
              fontFamily: 'Baloo 2, sans-serif',
            }}>
              {company.name[0]}
            </span>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ink)', fontFamily: 'Baloo 2, sans-serif' }}>
              {company.name}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '1px' }}>
              {totalSessions > 0 ? `${totalSessions} session${totalSessions > 1 ? 's' : ''} done` : 'Not started'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            padding: '3px 10px', background: tc.bg, color: tc.color,
            border: `1px solid ${tc.border}`, borderRadius: '999px',
            fontSize: '10px', fontWeight: '700', fontFamily: 'Baloo 2, sans-serif',
            letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            {company.tag}
          </span>
          <span style={{
            fontSize: '14px', color: 'var(--muted)',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s', display: 'inline-block',
          }}>↓</span>
        </div>
      </button>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--line)', padding: '16px 18px' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', fontFamily: 'Baloo 2, sans-serif' }}>
            Progress
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '16px' }}>
            {ROUNDS.map(r => {
              const count      = sessions[r.id] || 0
              const isSelected = selectedRound?.id === r.id
              return (
                <button key={r.id} onClick={() => setSelectedRound(isSelected ? null : r)} style={{
                  padding: '10px 6px',
                  background: isSelected ? 'var(--indigo)' : count > 0 ? '#EFEAF9' : 'var(--bg)',
                  border: `1.5px solid ${isSelected ? 'var(--indigo)' : count > 0 ? 'var(--indigo-2)' : 'var(--line)'}`,
                  borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
                  fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
                }}>
                  <div style={{
                    fontSize: '17px', fontWeight: '700', lineHeight: 1,
                    fontFamily: 'Baloo 2, sans-serif',
                    color: isSelected ? '#fff' : count > 0 ? 'var(--indigo)' : 'var(--ink)',
                  }}>
                    {count}
                  </div>
                  <div style={{
                    fontSize: '9px', fontWeight: '600', marginTop: '4px',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--muted)',
                  }}>
                    {r.name}
                  </div>
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid var(--line)' }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              {selectedRound ? `${selectedRound.name} · ${selectedRound.desc}` : 'Select a round above'}
            </p>
            <button className="btn btn-primary"
              disabled={!selectedRound}
              onClick={() => onStart(company, selectedRound)}
              style={{ padding: '9px 20px', fontSize: '13px', borderRadius: '999px' }}>
              Start →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const user     = JSON.parse(localStorage.getItem('user') || '{}')

  const [filterTag,   setFilterTag]   = useState('All')
  const [summary,     setSummary]     = useState({})
  const [stats,       setStats]       = useState({ totalSessions: 0, roundsPracticed: 0, companiesTried: 0 })
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    API.get('/sessions/summary')
      .then(({ data }) => { setSummary(data.summary || {}); setStats(data.stats || {}) })
      .catch(err => console.error('Summary fetch failed:', err.message))
      .finally(() => setLoadingData(false))
  }, [])

  // Reveal on scroll
  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => e.target.classList.toggle('in', e.isIntersecting))
    }, { threshold: 0.15 })
    document.querySelectorAll('.reveal').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [loadingData])

  const logout      = () => { localStorage.clear(); navigate('/login') }
  const handleStart = (company, round) => {
    navigate(`/session?company=${company.id}&companyName=${company.name}&round=${round.id}&roundName=${round.name}`)
  }

  const firstName = user.name?.split(' ')[0] || 'there'
  const firstName2 = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const tags      = ['All', 'FAANG', 'Product', 'Startup', 'Service']
  const filtered  = filterTag === 'All' ? COMPANIES : COMPANIES.filter(c => c.tag === filterTag)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Readiness meter */}
      <div className="meter-rail">
        <span className="meter-label">READINESS</span>
        <div className="meter-track">
          <div className="meter-fill" id="meterFill" />
        </div>
      </div>

      {/* Navbar */}
      <nav className="nav nav-pad">
        <div className="nav-logo">prep<span>AI</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/resume')} style={{
            background: 'none', border: 'none', fontSize: '14px', fontWeight: '500',
            color: 'var(--muted)', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}>
            Resume tips
          </button>
          <ProfileDropdown user={user} onLogout={logout} />
        </div>
      </nav>

      <main style={{ flex: 1, maxWidth: '1000px', margin: '0 auto', width: '100%', padding: 'clamp(32px, 5vw, 60px) clamp(16px, 4vw, 48px)' }}
        className="main-pad">

        {/* Greeting */}
        <div className="reveal" style={{ marginBottom: '36px' }}>
          <h1 style={{ marginBottom: '6px' }}>
            {greeting}, {firstName2}.
          </h1>
          <p style={{ fontSize: '14px' }}>
            {user.course && user.passingYear
              ? `${user.course} · ${user.college || 'College'} · Class of ${user.passingYear}`
              : 'Pick a company and round to start prepping.'}
          </p>
          {!loadingData && stats.totalSessions > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              marginTop: '12px', padding: '6px 14px',
              background: '#FFF1EE', border: '1px solid #FFCFC6',
              borderRadius: '999px',
            }}>
              <span style={{ fontSize: '13px', color: 'var(--coral)', fontWeight: '600', fontFamily: 'Baloo 2, sans-serif' }}>
                🔥 {stats.totalSessions} session{stats.totalSessions > 1 ? 's' : ''} done — keep going
              </span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="stats-grid reveal" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
          gap: '12px', marginBottom: '40px',
        }}>
          {[
            { label: 'Sessions done',    value: loadingData ? '—' : stats.totalSessions,   bg: '#EFEAF9', color: 'var(--indigo)' },
            { label: 'Rounds practiced', value: loadingData ? '—' : stats.roundsPracticed, bg: '#FFF1EE', color: 'var(--coral)'  },
            { label: 'Companies tried',  value: loadingData ? '—' : stats.companiesTried,  bg: '#EAF4FB', color: '#2A7DA8'       },
          ].map(s => (
            <div key={s.label} style={{
              padding: '20px 22px', background: 'var(--bg-card)',
              border: '1px solid var(--line)', borderRadius: 'var(--radius)',
              boxShadow: '0 2px 8px rgba(75,63,114,0.06)',
            }}>
              <div style={{
                fontFamily: 'Baloo 2, sans-serif', fontSize: '32px', fontWeight: '800',
                color: s.color, lineHeight: 1,
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Companies header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '18px' }}>Companies</h2>
          <div className="filter-scroll" style={{ display: 'flex', gap: '6px' }}>
            {tags.map(t => (
              <button key={t} onClick={() => setFilterTag(t)} style={{
                padding: '5px 14px',
                background: filterTag === t ? 'var(--indigo)' : 'transparent',
                color: filterTag === t ? '#fff' : 'var(--muted)',
                border: `1.5px solid ${filterTag === t ? 'var(--indigo)' : 'var(--line)'}`,
                borderRadius: '999px', fontSize: '12px', fontWeight: '600',
                cursor: 'pointer', fontFamily: 'Baloo 2, sans-serif',
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Company grid */}
        <div className="company-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {filtered.map((company, i) => (
            <div key={company.id} className="reveal" style={{ transitionDelay: `${i * 0.04}s` }}>
              <CompanyCard
                company={company}
                sessions={summary[company.id] || { dsa: 0, technical: 0, aptitude: 0, hr: 0 }}
                onStart={handleStart}
              />
            </div>
          ))}
        </div>

      </main>

      <Footer />

      {/* Readiness meter script */}
      <MeterScript />
    </div>
  )
}

function MeterScript() {
  useEffect(() => {
    const fill = document.getElementById('meterFill')
    if (!fill) return
    const update = () => {
      const scrolled = window.scrollY
      const max = document.body.scrollHeight - window.innerHeight
      fill.style.height = max > 0 ? Math.min(100, (scrolled / max) * 100) + '%' : '0%'
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])
  return null
}