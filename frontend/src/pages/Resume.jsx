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
    } catch {
      setError('Failed to analyze resume. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar */}
      <nav className="nav">
        <div className="nav-logo">prep<span>AI</span></div>
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}
          style={{ fontSize: '13px', padding: '8px 18px' }}>
          ← Dashboard
        </button>
      </nav>

      <main style={{ flex: 1, maxWidth: '780px', margin: '0 auto', width: '100%', padding: 'clamp(32px, 5vw, 56px) clamp(16px, 4vw, 40px)' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontFamily: 'Baloo 2, sans-serif', fontSize: '12px', fontWeight: '700',
            color: 'var(--coral)', letterSpacing: '0.06em', textTransform: 'uppercase',
            marginBottom: '12px',
          }}>
            Resume analyzer
          </div>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 30px)', marginBottom: '8px' }}>
            Get AI feedback on your resume
          </h1>
          <p style={{ fontSize: '15px', maxWidth: '520px' }}>
            Paste your resume text below. Get specific, placement-focused suggestions to improve it — scored out of 10 with strengths, problems, and exact action items.
          </p>
        </div>

        {/* Input */}
        <div style={{ marginBottom: '16px' }}>
          <label className="field-label" style={{ marginBottom: '10px' }}>
            Your resume text
          </label>
          <textarea
            value={resume}
            onChange={e => setResume(e.target.value)}
            placeholder="Paste your full resume here — education, skills, projects, internships, experience..."
            rows={14}
            style={{
              width: '100%', padding: '18px',
              background: 'var(--bg-card)',
              border: '1.5px solid var(--line)',
              borderRadius: 'var(--radius)',
              color: 'var(--ink)',
              fontFamily: 'Inter, sans-serif', fontSize: '14px',
              lineHeight: '1.65', resize: 'vertical', outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxShadow: '0 2px 8px rgba(75,63,114,0.06)',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--indigo-2)'; e.target.style.boxShadow = '0 0 0 3px rgba(107,91,154,0.12)' }}
            onBlur={e  => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = '0 2px 8px rgba(75,63,114,0.06)' }}
          />
        </div>

        {error && <div className="error-box" style={{ marginBottom: '16px' }}>{error}</div>}

        <button className="btn btn-primary" onClick={analyze}
          disabled={!resume.trim() || loading}
          style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: '12px', marginBottom: '40px' }}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
              Analyzing your resume...
            </span>
          ) : 'Analyze resume →'}
        </button>

        {/* Results */}
        {tips && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Overall score */}
            <div className="card" style={{ padding: '28px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              {/* Score circle */}
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0,
                background: tips.score >= 7
                  ? 'rgba(34,197,94,0.1)'
                  : tips.score >= 4
                  ? 'rgba(245,158,11,0.1)'
                  : 'rgba(255,111,89,0.1)',
                border: `3px solid ${tips.score >= 7 ? '#22C55E' : tips.score >= 4 ? '#f59e0b' : 'var(--coral)'}`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  fontFamily: 'Baloo 2, sans-serif', fontSize: '26px', fontWeight: '800', lineHeight: 1,
                  color: tips.score >= 7 ? '#22C55E' : tips.score >= 4 ? '#f59e0b' : 'var(--coral)',
                }}>
                  {tips.score}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: '600' }}>/10</span>
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: '17px', fontWeight: '700', color: 'var(--indigo)', marginBottom: '6px' }}>
                  Overall score: {tips.score}/10
                </div>
                <p style={{ fontSize: '14px', lineHeight: 1.65, color: 'var(--muted)' }}>
                  {tips.summary}
                </p>
              </div>
            </div>

            {/* Strengths */}
            {tips.strengths?.length > 0 && (
              <div style={{
                padding: '22px 24px',
                background: 'rgba(34,197,94,0.05)',
                border: '1.5px solid rgba(34,197,94,0.2)',
                borderRadius: 'var(--radius)',
              }}>
                <div style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: '13px', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
                  ✓ Strengths
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {tips.strengths.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ color: '#22C55E', fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>✓</span>
                      <p style={{ fontSize: '14px', color: 'var(--ink)', lineHeight: 1.65 }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvements */}
            {tips.improvements?.length > 0 && (
              <div style={{
                padding: '22px 24px',
                background: 'rgba(255,111,89,0.05)',
                border: '1.5px solid rgba(255,111,89,0.2)',
                borderRadius: 'var(--radius)',
              }}>
                <div style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: '13px', fontWeight: '700', color: 'var(--coral)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
                  ✗ Needs improvement
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {tips.improvements.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--coral)', fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>✗</span>
                      <p style={{ fontSize: '14px', color: 'var(--ink)', lineHeight: 1.65 }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action items */}
            {tips.actionItems?.length > 0 && (
              <div className="card" style={{ padding: '22px 24px' }}>
                <div style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: '13px', fontWeight: '700', color: 'var(--indigo)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
                  Action items
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {tips.actionItems.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                        background: 'var(--indigo)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: '700', marginTop: '1px',
                        fontFamily: 'Baloo 2, sans-serif',
                      }}>
                        {i + 1}
                      </div>
                      <p style={{ fontSize: '14px', color: 'var(--ink)', lineHeight: 1.65 }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analyze again */}
            <button className="btn btn-ghost" onClick={() => { setTips(null); setResume('') }}
              style={{ alignSelf: 'flex-start', padding: '10px 20px', fontSize: '13px' }}>
              ← Analyze another resume
            </button>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--line)',
        padding: '24px clamp(16px, 4vw, 48px)',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '12px',
        background: 'var(--bg-card)',
      }}>
        <div className="nav-logo">prep<span>AI</span></div>
        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>© 2026 prepAI. Built for placement season.</div>
      </footer>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}