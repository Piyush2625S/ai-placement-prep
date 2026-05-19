import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'

export default function Resume() {
  const navigate  = useNavigate()
  const [resume,  setResume]  = useState('')
  const [tips,    setTips]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const analyze = async () => {
    if (!resume.trim()) return
    setLoading(true)
    setError('')
    setTips(null)
    try {
      const { data } = await API.post('/questions/resume', { resume })
      setTips(data)
    } catch (_err) {
      setError('Failed to analyze resume. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: 'var(--font-body)' }}>

      {/* Navbar */}
      <nav style={{
        height: '56px', borderBottom: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', padding: '0 40px',
        justifyContent: 'space-between', background: '#fff',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{
          fontFamily: 'var(--font-head)', fontSize: '16px',
          fontWeight: '700', letterSpacing: '-0.03em', color: '#18181B',
        }}>
          prep<span style={{ color: 'var(--green)' }}>AI</span>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}
          style={{ fontSize: '13px', padding: '7px 16px' }}>
          ← Dashboard
        </button>
      </nav>

      <main style={{ maxWidth: '780px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <span style={{
            display: 'inline-block', padding: '3px 10px',
            background: 'rgba(34,197,94,0.08)', color: 'var(--green)',
            border: '1px solid rgba(34,197,94,0.2)', borderRadius: '3px',
            fontSize: '11px', fontWeight: '600', letterSpacing: '0.07em',
            textTransform: 'uppercase', marginBottom: '14px',
          }}>
            Resume analyzer
          </span>
          <h1 style={{
            fontFamily: 'var(--font-head)', fontSize: '26px',
            fontWeight: '700', letterSpacing: '-0.03em', color: '#18181B',
          }}>
            Get AI feedback on your resume
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '6px' }}>
            Paste your resume text below. Get specific suggestions to improve it for tech placements.
          </p>
        </div>

        {/* Input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block', fontSize: '11px', fontWeight: '600',
            color: 'var(--muted)', textTransform: 'uppercase',
            letterSpacing: '0.07em', marginBottom: '10px',
          }}>
            Your resume
          </label>
          <textarea
            value={resume}
            onChange={e => setResume(e.target.value)}
            placeholder="Paste your resume text here — education, skills, projects, experience..."
            rows={14}
            style={{
              width: '100%', padding: '16px',
              background: '#fff', border: '1px solid var(--line)',
              borderRadius: '8px', color: '#18181B',
              fontFamily: 'var(--font-body)', fontSize: '14px',
              lineHeight: '1.6', resize: 'vertical', outline: 'none',
              transition: 'border-color 0.15s',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--green)'}
            onBlur={e  => e.target.style.borderColor = 'var(--line)'}
          />
        </div>

        {error && <div className="error-box" style={{ marginBottom: '16px' }}>{error}</div>}

        <button className="btn btn-primary" onClick={analyze}
          disabled={!resume.trim() || loading}
          style={{ width: '100%', padding: '13px', fontSize: '14px', marginBottom: '32px' }}>
          {loading ? 'Analyzing...' : 'Analyze resume →'}
        </button>

        {/* Loading spinner */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              border: '3px solid var(--line)',
              borderTop: '3px solid var(--green)',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 12px',
            }} />
            <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
              Analyzing your resume...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {/* Results */}
        {tips && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Overall score */}
            <div style={{
              padding: '24px', background: '#fff',
              border: '1px solid var(--line)', borderRadius: '8px',
              display: 'flex', alignItems: 'center', gap: '20px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: tips.score >= 7 ? 'rgba(34,197,94,0.1)' : tips.score >= 4 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                border: `2px solid ${tips.score >= 7 ? 'var(--green)' : tips.score >= 4 ? '#f59e0b' : '#ef4444'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{
                  fontSize: '20px', fontWeight: '700',
                  color: tips.score >= 7 ? 'var(--green)' : tips.score >= 4 ? '#f59e0b' : '#ef4444',
                  fontFamily: 'var(--font-head)',
                }}>
                  {tips.score}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#18181B', marginBottom: '4px' }}>
                  Overall score: {tips.score}/10
                </div>
                <p style={{ fontSize: '13px', color: '#52525B', lineHeight: 1.6 }}>
                  {tips.summary}
                </p>
              </div>
            </div>

            {/* Strengths */}
            {tips.strengths?.length > 0 && (
              <div style={{
                padding: '20px', background: 'rgba(34,197,94,0.04)',
                border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px',
              }}>
                <p style={{
                  fontSize: '11px', fontWeight: '600', color: 'var(--green)',
                  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px',
                }}>
                  Strengths
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tips.strengths.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--green)', fontWeight: '700', flexShrink: 0 }}>✓</span>
                      <p style={{ fontSize: '13px', color: '#18181B', lineHeight: 1.6 }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvements */}
            {tips.improvements?.length > 0 && (
              <div style={{
                padding: '20px', background: 'rgba(239,68,68,0.04)',
                border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px',
              }}>
                <p style={{
                  fontSize: '11px', fontWeight: '600', color: '#dc2626',
                  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px',
                }}>
                  Needs improvement
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tips.improvements.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ color: '#dc2626', fontWeight: '700', flexShrink: 0 }}>✗</span>
                      <p style={{ fontSize: '13px', color: '#18181B', lineHeight: 1.6 }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action items */}
            {tips.actionItems?.length > 0 && (
              <div style={{
                padding: '20px', background: '#fff',
                border: '1px solid var(--line)', borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}>
                <p style={{
                  fontSize: '11px', fontWeight: '600', color: 'var(--muted)',
                  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px',
                }}>
                  Action items
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tips.actionItems.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{
                        background: '#18181B', color: '#fff',
                        borderRadius: '50%', width: '18px', height: '18px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', fontWeight: '700', flexShrink: 0, marginTop: '1px',
                      }}>
                        {i + 1}
                      </span>
                      <p style={{ fontSize: '13px', color: '#18181B', lineHeight: 1.6 }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  )
}