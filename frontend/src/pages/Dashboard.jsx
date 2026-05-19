import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'

const COMPANIES = [
  { id: 'google',     name: 'Google',          tag: 'FAANG',   domain: 'google.com'    },
  { id: 'amazon',     name: 'Amazon',          tag: 'FAANG',   domain: 'amazon.com'    },
  { id: 'microsoft',  name: 'Microsoft',       tag: 'FAANG',   domain: 'microsoft.com' },
  { id: 'meta',       name: 'Meta',            tag: 'FAANG',   domain: 'meta.com'      },
  { id: 'apple',      name: 'Apple',           tag: 'FAANG',   domain: 'apple.com'     },
  { id: 'flipkart',   name: 'Flipkart',        tag: 'Product', domain: 'flipkart.com'  },
  { id: 'uber',       name: 'Uber',            tag: 'Product', domain: 'uber.com'      },
  { id: 'razorpay',   name: 'Razorpay',        tag: 'Product', domain: 'razorpay.com'  },
  { id: 'phonepe',    name: 'PhonePe',         tag: 'Product', domain: 'phonepe.com'   },
  { id: 'paytm',      name: 'Paytm',           tag: 'Product', domain: 'paytm.com'     },
  { id: 'swiggy',     name: 'Swiggy',          tag: 'Startup', domain: 'swiggy.com'    },
  { id: 'zepto',      name: 'Zepto',           tag: 'Startup', domain: 'zeptonow.com'  },
  { id: 'cred',       name: 'CRED',            tag: 'Startup', domain: 'cred.club'     },
  { id: 'meesho',     name: 'Meesho',          tag: 'Startup', domain: 'meesho.com'    },
  { id: 'groww',      name: 'Groww',           tag: 'Startup', domain: 'groww.in'      },
  { id: 'tcs',        name: 'TCS',             tag: 'Service', domain: 'tcs.com'       },
  { id: 'infosys',    name: 'Infosys',         tag: 'Service', domain: 'infosys.com'   },
  { id: 'wipro',      name: 'Wipro',           tag: 'Service', domain: 'wipro.com'     },
  { id: 'cognizant',  name: 'Cognizant',       tag: 'Service', domain: 'cognizant.com' },
  { id: 'accenture',  name: 'Accenture',       tag: 'Service', domain: 'accenture.com' },
  { id: 'startup',    name: 'Generic Startup', tag: 'Startup', domain: null            },
  { id: 'product',    name: 'Generic Product', tag: 'Product', domain: null            },
]

const ROUNDS = [
  { id: 'dsa',       name: 'DSA',       desc: 'Arrays, trees, graphs, DP'        },
  { id: 'technical', name: 'Technical', desc: 'CS fundamentals, OOP, DBMS, OS'   },
  { id: 'aptitude',  name: 'Aptitude',  desc: 'Quant, logical, verbal reasoning'  },
  { id: 'hr',        name: 'HR',        desc: 'Behavioural, culture fit'          },
]

const TAG_COLORS = {
  FAANG:   { bg: 'rgba(34,197,94,0.08)',   color: '#16a34a', border: 'rgba(34,197,94,0.2)'   },
  Product: { bg: 'rgba(99,102,241,0.08)',  color: '#6366f1', border: 'rgba(99,102,241,0.2)'  },
  Startup: { bg: 'rgba(249,115,22,0.08)',  color: '#ea580c', border: 'rgba(249,115,22,0.2)'  },
  Service: { bg: 'rgba(100,116,139,0.08)', color: '#64748b', border: 'rgba(100,116,139,0.2)' },
}

function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
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
        width: '34px', height: '34px', borderRadius: '50%',
        background: open ? '#18181B' : '#F4F4F5',
        border: `1px solid ${open ? '#18181B' : 'var(--line)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', fontSize: '13px', fontWeight: '700',
        color: open ? '#fff' : '#18181B',
        transition: 'all 0.15s', fontFamily: 'var(--font-body)',
      }}>
        {initial}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '42px', right: 0, width: '240px',
          background: '#fff', border: '1px solid var(--line)',
          borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          overflow: 'hidden', zIndex: 100,
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--line)', background: '#FAFAFA' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#18181B' }}>{user.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{user.email}</div>
          </div>
          {fields.length > 0 && (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
              {fields.map(f => (
                <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{f.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: '500', color: '#18181B' }}>{f.value}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ padding: '8px' }}>
            <button onClick={onLogout} style={{
              width: '100%', padding: '8px 10px', background: 'none',
              border: 'none', borderRadius: '6px', textAlign: 'left',
              cursor: 'pointer', fontSize: '13px', color: '#ef4444',
              fontFamily: 'var(--font-body)', fontWeight: '500',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
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
      background: '#fff',
      border: `1px solid ${expanded ? '#18181B' : 'var(--line)'}`,
      borderRadius: '8px', overflow: 'hidden', transition: 'border-color 0.15s',
      boxShadow: expanded ? '0 4px 16px rgba(0,0,0,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
    }}>
      <button onClick={() => { setExpanded(e => !e); setSelectedRound(null) }} style={{
        width: '100%', padding: '14px 16px', background: 'none', border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '6px',
            background: tc.bg, border: `1px solid ${tc.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, overflow: 'hidden',
          }}>
            {company.domain ? (
              <img
                src={`https://www.google.com/s2/favicons?domain=${company.domain}&sz=64`}
                alt={company.name} width={20} height={20}
                style={{ objectFit: 'contain' }}
                onError={e => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
            ) : null}
            <span style={{
              display: company.domain ? 'none' : 'flex',
              alignItems: 'center', justifyContent: 'center',
              width: '100%', height: '100%',
              fontSize: '10px', fontWeight: '700', color: tc.color,
            }}>
              {company.name[0]}
            </span>
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#18181B', letterSpacing: '-0.01em' }}>
              {company.name}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '1px' }}>
              {totalSessions > 0
                ? `${totalSessions} session${totalSessions > 1 ? 's' : ''} done`
                : 'Not started'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            padding: '2px 8px', background: tc.bg, color: tc.color,
            border: `1px solid ${tc.border}`, borderRadius: '3px',
            fontSize: '10px', fontWeight: '600',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            {company.tag}
          </span>
          <span style={{
            fontSize: '16px', color: 'var(--muted)',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s', display: 'inline-block', lineHeight: 1,
          }}>↓</span>
        </div>
      </button>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--line)', padding: '16px' }}>
          <p style={{
            fontSize: '11px', fontWeight: '600', color: 'var(--muted)',
            textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px',
          }}>
            Progress
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '16px' }}>
            {ROUNDS.map(r => {
              const count      = sessions[r.id] || 0
              const isSelected = selectedRound?.id === r.id
              return (
                <button key={r.id} onClick={() => setSelectedRound(isSelected ? null : r)} style={{
                  padding: '10px 8px',
                  background: isSelected ? '#18181B' : count > 0 ? 'rgba(34,197,94,0.06)' : '#FAFAFA',
                  border: `1px solid ${isSelected ? '#18181B' : count > 0 ? 'rgba(34,197,94,0.25)' : 'var(--line)'}`,
                  borderRadius: '6px', cursor: 'pointer',
                  textAlign: 'center', fontFamily: 'var(--font-body)', transition: 'all 0.15s',
                }}>
                  <div style={{
                    fontSize: '16px', fontWeight: '700', lineHeight: 1,
                    color: isSelected ? '#fff' : count > 0 ? 'var(--green)' : '#18181B',
                  }}>
                    {count}
                  </div>
                  <div style={{
                    fontSize: '10px', fontWeight: '500', marginTop: '4px',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    color: isSelected ? 'rgba(255,255,255,0.6)' : 'var(--muted)',
                  }}>
                    {r.name}
                  </div>
                </button>
              )
            })}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: '14px', borderTop: '1px solid var(--line)',
          }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              {selectedRound ? `${selectedRound.name} · ${selectedRound.desc}` : 'Select a round above'}
            </p>
            <button className="btn btn-primary"
              disabled={!selectedRound}
              onClick={() => onStart(company, selectedRound)}
              style={{ padding: '9px 20px', fontSize: '13px' }}>
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

  const [filterTag,    setFilterTag]    = useState('All')
  const [summary,      setSummary]      = useState({})
  const [stats,        setStats]        = useState({ totalSessions: 0, roundsPracticed: 0, companiesTried: 0 })
  const [loadingData,  setLoadingData]  = useState(true)

  useEffect(() => {
    setLoadingData(true)
    API.get('/sessions/summary')
      .then(({ data }) => {
        setSummary(data.summary || {})
        setStats(data.stats   || {})
      })
      .catch(err => console.error('Summary fetch failed:', err.message))
      .finally(() => setLoadingData(false))
  }, [])

  const logout      = () => { localStorage.clear(); navigate('/login') }
  const handleStart = (company, round) => {
    navigate(`/session?company=${company.id}&companyName=${company.name}&round=${round.id}&roundName=${round.name}`)
  }

  const firstName = user.name?.split(' ')[0] || 'there'
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const tags      = ['All', 'FAANG', 'Product', 'Startup', 'Service']
  const filtered  = filterTag === 'All' ? COMPANIES : COMPANIES.filter(c => c.tag === filterTag)

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: 'var(--font-body)' }}>

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(250,250,250,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--line)', padding: '0 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px',
      }}>
        <div style={{
          fontFamily: 'var(--font-head)', fontSize: '16px',
          fontWeight: '700', letterSpacing: '-0.03em', color: '#18181B',
        }}>
          prep<span style={{ color: 'var(--green)' }}>AI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/resume')} style={{
            background: 'none', border: 'none', fontSize: '13px',
            color: 'var(--muted)', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontWeight: '500', padding: '4px 0',
          }}>
            Resume tips
          </button>
          <ProfileDropdown user={user} onLogout={logout} />
        </div>
      </nav>

      {/* Main */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Greeting — only once */}
        <div style={{ marginBottom: '36px' }}>
          <h1 style={{
            fontFamily: 'var(--font-head)', fontSize: '28px', fontWeight: '700',
            letterSpacing: '-0.03em', color: '#18181B', lineHeight: 1.2,
          }}>
            {greeting}, {firstName}.
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '5px' }}>
            {user.course && user.passingYear
              ? `${user.course} · ${user.college || 'College'} · Class of ${user.passingYear}`
              : 'Pick a company and round to start prepping.'}
          </p>
          {!loadingData && stats.totalSessions > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              marginTop: '12px', padding: '6px 14px',
              background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: '99px',
            }}>
              <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: '500' }}>
                🔥 {stats.totalSessions} session{stats.totalSessions > 1 ? 's' : ''} completed — keep going
              </span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '40px' }}>
          {[
            { label: 'Sessions done',    value: loadingData ? '—' : stats.totalSessions,   icon: '▷', color: 'rgba(34,197,94,0.1)',  iconColor: 'var(--green)' },
            { label: 'Rounds practiced', value: loadingData ? '—' : stats.roundsPracticed, icon: '◎', color: 'rgba(99,102,241,0.1)', iconColor: '#6366f1'      },
            { label: 'Companies tried',  value: loadingData ? '—' : stats.companiesTried,  icon: '⬡', color: 'rgba(249,115,22,0.1)', iconColor: '#ea580c'      },
          ].map(s => (
            <div key={s.label} style={{
              padding: '20px 24px', background: '#fff',
              border: '1px solid var(--line)', borderRadius: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '10px',
                background: s.color, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '20px', color: s.iconColor, flexShrink: 0,
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-head)', fontSize: '28px', fontWeight: '700',
                  color: '#18181B', letterSpacing: '-0.03em', lineHeight: 1,
                }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Companies header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#18181B', letterSpacing: '-0.01em' }}>
            Companies
          </h2>
          <div style={{ display: 'flex', gap: '6px' }}>
            {tags.map(t => (
              <button key={t} onClick={() => setFilterTag(t)} style={{
                padding: '4px 12px',
                background: filterTag === t ? '#18181B' : 'transparent',
                color: filterTag === t ? '#fff' : 'var(--muted)',
                border: `1px solid ${filterTag === t ? '#18181B' : 'var(--line)'}`,
                borderRadius: '99px', fontSize: '12px', fontWeight: '500',
                cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s',
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Company grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {filtered.map(company => (
            <CompanyCard
              key={company.id}
              company={company}
              sessions={summary[company.id] || { dsa: 0, technical: 0, aptitude: 0, hr: 0 }}
              onStart={handleStart}
            />
          ))}
        </div>

      </main>
    </div>
  )
}