import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import API from '../api/axios'
import { Footer } from './Login'

const STEPS = { LOADING:'loading', QUESTION:'question', FEEDBACK:'feedback', SCORECARD:'scorecard' }

const DIFF = {
  Easy:   { color: '#2A7DA8', bg: '#EAF4FB', border: '#BFE0F0' },
  Medium: { color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  Hard:   { color: 'var(--coral)', bg: '#FFF1EE', border: '#FFCFC6' },
}

function NavBar({ children }) {
  return (
    <nav className="nav nav-pad">
      <div className="nav-logo">prep<span>AI</span></div>
      {children}
    </nav>
  )
}

function SmartContent({ text, isIdeal = false }) {
  if (!text) return null
  const parts = text.split(/(```[\s\S]*?```)/g)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const lines = part.split('\n')
          const lang  = lines[0].replace('```', '').trim() || 'cpp'
          const code  = lines.slice(1, -1).join('\n')
          return (
            <SyntaxHighlighter key={i} language={lang} style={oneLight}
              customStyle={{ margin: 0, borderRadius: '10px', fontSize: '13px', border: '1px solid var(--line)' }}>
              {code}
            </SyntaxHighlighter>
          )
        }
        return part.trim() ? (
          <p key={i} style={{ fontSize: '14px', color: isIdeal ? 'var(--ink)' : 'var(--muted)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {part.trim()}
          </p>
        ) : null
      })}
    </div>
  )
}

function ScoreRing({ score, max = 10, size = 72 }) {
  const pct   = score / max
  const r     = (size - 8) / 2
  const circ  = 2 * Math.PI * r
  const dash  = circ * pct
  const color = pct >= 0.7 ? '#22C55E' : pct >= 0.4 ? '#f59e0b' : 'var(--coral)'
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--line)" strokeWidth={7} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle"
        style={{ transform: `rotate(90deg) translate(0px,-${size}px)`, fontSize: '14px', fontWeight: '700', fill: color, fontFamily: 'Baloo 2, sans-serif' }}>
        {score}
      </text>
    </svg>
  )
}

export default function Session() {
  const [params]  = useSearchParams()
  const navigate  = useNavigate()

  const company     = params.get('company')
  const companyName = params.get('companyName')
  const round       = params.get('round')
  const roundName   = params.get('roundName')

  const [step,       setStep]       = useState(STEPS.LOADING)
  const [questions,  setQuestions]  = useState([])
  const [current,    setCurrent]    = useState(0)
  const [answer,     setAnswer]     = useState('')
  const [feedback,   setFeedback]   = useState(null)
  const [allAnswers, setAllAnswers] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')
  const [saving,     setSaving]     = useState(false)

  const generateQuestions = useCallback(async () => {
    setStep(STEPS.LOADING); setError('')
    try {
      const { data } = await API.post('/questions/generate', { company, companyName, round, roundName })
      setQuestions(data.questions); setStep(STEPS.QUESTION)
    } catch { setError('Failed to generate questions. Check your backend is running.') }
  }, [company, companyName, round, roundName])

  useEffect(() => {
    const load = async () => { await generateQuestions() }
    void load()
  }, [generateQuestions])

  const submitAnswer = async () => {
    if (!answer.trim()) return
    setSubmitting(true); setError('')
    try {
      const { data } = await API.post('/questions/feedback', {
        question: questions[current].question, userAnswer: answer, company: companyName, round: roundName,
      })
      setFeedback(data); setStep(STEPS.FEEDBACK)
    } catch { setError('Failed to get feedback. Try again.') }
    finally { setSubmitting(false) }
  }

  const nextQuestion = () => {
    const saved = { question: questions[current].question, userAnswer: answer, aiFeedback: feedback.feedback, idealAnswer: feedback.idealAnswer, score: feedback.score }
    const updated = [...allAnswers, saved]
    setAllAnswers(updated)
    if (current + 1 >= questions.length) { saveSession(updated) }
    else { setCurrent(c => c + 1); setAnswer(''); setFeedback(null); setStep(STEPS.QUESTION) }
  }

  const saveSession = async (answers) => {
    setSaving(true)
    try { await API.post('/sessions', { company, companyName, round, roundName, answers }) }
    catch (err) { console.error('Failed to save session:', err.message) }
    finally { setSaving(false); setStep(STEPS.SCORECARD) }
  }

  const totalScore = allAnswers.reduce((s, a) => s + a.score, 0)
  const maxScore   = allAnswers.length * 10
  const pct        = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

  if (step === STEPS.LOADING) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', background: 'var(--bg)' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '3px solid var(--line)', borderTop: '3px solid var(--coral)', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ fontSize: '14px', color: 'var(--muted)', fontFamily: 'Baloo 2, sans-serif', fontWeight: '600' }}>
        Generating {roundName} questions for {companyName}...
      </p>
      {error && (
        <div className="error-box" style={{ maxWidth: '400px', textAlign: 'center' }}>
          {error}<br />
          <button onClick={generateQuestions} style={{ marginTop: '8px', color: 'var(--coral)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}>
            Try again
          </button>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (step === STEPS.SCORECARD) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <NavBar>
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard')} style={{ fontSize: '13px', padding: '8px 18px' }}>
          ← Dashboard
        </button>
      </NavBar>

      <main className="main-pad" style={{ maxWidth: '720px', margin: '0 auto', width: '100%', padding: '48px 24px', flex: 1 }}>
        <div style={{ marginBottom: '32px' }}>
          <span style={{ display: 'inline-block', padding: '4px 12px', background: '#EFEAF9', color: 'var(--indigo)', borderRadius: '999px', fontSize: '11px', fontWeight: '700', fontFamily: 'Baloo 2, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
            Session complete
          </span>
          <h1 style={{ fontSize: '26px', marginBottom: '0' }}>{companyName} · {roundName}</h1>
        </div>

        {/* Score card */}
        <div className="card scorecard-score" style={{ padding: '28px', display: 'flex', alignItems: 'center', gap: '28px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <ScoreRing score={totalScore} max={maxScore} size={88} />
          <div>
            <div style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: '32px', fontWeight: '800', color: 'var(--indigo)', lineHeight: 1 }}>
              {totalScore} / {maxScore}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>
              {pct >= 70 ? '💪 Strong performance' : pct >= 40 ? 'Room to improve' : 'Keep practicing'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '6px' }}>
              {allAnswers.length} questions · avg {Math.round(totalScore / allAnswers.length * 10) / 10} / 10
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
          {allAnswers.map((a, i) => (
            <div key={i} title={`Q${i+1}: ${a.score}/10`} style={{
              flex: 1, height: '6px', borderRadius: '99px',
              background: a.score >= 7 ? '#22C55E' : a.score >= 4 ? '#f59e0b' : 'var(--coral)',
            }} />
          ))}
        </div>

        <h2 style={{ fontSize: '16px', marginBottom: '14px' }}>Question breakdown</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
          {allAnswers.map((a, i) => (
            <div key={i} className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ink)', fontFamily: 'Baloo 2, sans-serif', marginBottom: '6px', lineHeight: 1.4 }}>
                    Q{i + 1}. {a.question}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '10px' }}>
                    {a.aiFeedback}
                  </p>
                  <details style={{ cursor: 'pointer' }}>
                    <summary style={{ fontSize: '13px', color: 'var(--coral)', fontWeight: '600', listStyle: 'none', fontFamily: 'Baloo 2, sans-serif' }}>
                      View ideal answer ↓
                    </summary>
                    <div style={{ marginTop: '10px', padding: '14px', background: '#FAFAF8', borderRadius: '10px', border: '1px solid var(--line)' }}>
                      <SmartContent text={a.idealAnswer} isIdeal={true} />
                    </div>
                  </details>
                </div>
                <ScoreRing score={a.score} max={10} size={52} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ flex: 1, padding: '13px', borderRadius: '12px' }}>
            Back to dashboard
          </button>
          <button className="btn btn-ghost" onClick={() => { setStep(STEPS.LOADING); setCurrent(0); setAnswer(''); setFeedback(null); setAllAnswers([]); generateQuestions() }}
            style={{ flex: 1, padding: '13px', borderRadius: '12px' }}>
            Retry session
          </button>
        </div>
      </main>
      <Footer />
    </div>
  )

  const q    = questions[current]
  const diff = q ? DIFF[q.difficulty] || DIFF.Medium : DIFF.Medium

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <NavBar>
        <div className="progress-bar-nav" style={{ flex: 1, maxWidth: '280px', margin: '0 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'Baloo 2, sans-serif', fontWeight: '600' }}>{companyName} · {roundName}</span>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{current + 1} / {questions.length}</span>
          </div>
          <div style={{ height: '4px', background: 'var(--line)', borderRadius: '99px' }}>
            <div style={{
              height: '100%', borderRadius: '99px',
              background: 'linear-gradient(90deg, var(--coral), var(--sky))',
              width: `${((current + (step === STEPS.FEEDBACK ? 1 : 0)) / questions.length) * 100}%`,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard')} style={{ fontSize: '12px', padding: '7px 16px' }}>
          Exit
        </button>
      </NavBar>

      <main className="main-pad" style={{ maxWidth: '760px', margin: '0 auto', width: '100%', padding: '48px 24px', flex: 1 }}>
        {q && (
          <>
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ padding: '3px 10px', background: diff.bg, color: diff.color, border: `1px solid ${diff.border}`, borderRadius: '999px', fontSize: '10px', fontWeight: '700', fontFamily: 'Baloo 2, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {q.difficulty}
                </span>
                <span style={{ padding: '3px 10px', background: 'var(--bg)', color: 'var(--muted)', border: '1px solid var(--line)', borderRadius: '999px', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {q.topic}
                </span>
              </div>
              <h1 style={{ fontSize: 'clamp(18px, 3vw, 24px)', lineHeight: 1.4 }}>
                {q.question}
              </h1>
            </div>

            {step === STEPS.QUESTION && (
              <div>
                <label className="field-label" style={{ marginBottom: '10px' }}>Your answer</label>
                <textarea value={answer} onChange={e => setAnswer(e.target.value)}
                  placeholder="Type your answer here. Be as detailed as you would in a real interview..."
                  rows={10}
                  style={{
                    width: '100%', padding: '16px',
                    background: 'var(--bg-card)', border: '1.5px solid var(--line)',
                    borderRadius: 'var(--radius)', color: 'var(--ink)',
                    fontFamily: 'Inter, sans-serif', fontSize: '14px',
                    lineHeight: '1.6', resize: 'vertical', outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--indigo-2)'; e.target.style.boxShadow = '0 0 0 3px rgba(107,91,154,0.12)' }}
                  onBlur={e  => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none' }}
                />
                {error && <div className="error-box" style={{ marginTop: '10px' }}>{error}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button className="btn btn-primary" onClick={submitAnswer}
                    disabled={!answer.trim() || submitting}
                    style={{ padding: '12px 28px', fontSize: '14px', borderRadius: '999px' }}>
                    {submitting ? 'Evaluating...' : 'Submit answer →'}
                  </button>
                </div>
              </div>
            )}

            {step === STEPS.FEEDBACK && feedback && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                <div className="card" style={{ padding: '22px 24px', display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
                  <ScoreRing score={feedback.score} max={10} size={72} />
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: '15px', fontWeight: '700', color: 'var(--indigo)', marginBottom: '6px' }}>
                      Score: {feedback.score}/10
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 }}>
                      {feedback.feedback}
                    </p>
                  </div>
                </div>

                <div style={{ padding: '16px 20px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--radius)' }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', fontFamily: 'Baloo 2, sans-serif' }}>
                    Your answer
                  </p>
                  <SmartContent text={answer} />
                </div>

                <div style={{ padding: '16px 20px', background: '#EFEAF9', border: '1px solid #D5CCEF', borderRadius: 'var(--radius)' }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--indigo-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', fontFamily: 'Baloo 2, sans-serif' }}>
                    Ideal answer
                  </p>
                  <SmartContent text={feedback.idealAnswer} isIdeal={true} />
                </div>

                {feedback.weakAreas?.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '600' }}>Weak areas:</span>
                    {feedback.weakAreas.map(w => (
                      <span key={w} style={{ padding: '3px 12px', background: '#FFF1EE', color: 'var(--coral)', border: '1px solid #FFCFC6', borderRadius: '999px', fontSize: '12px', fontWeight: '600', fontFamily: 'Baloo 2, sans-serif' }}>
                        {w}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                  <button className="btn btn-primary" onClick={nextQuestion} disabled={saving}
                    style={{ padding: '12px 28px', fontSize: '14px', borderRadius: '999px' }}>
                    {saving ? 'Saving...' : current + 1 >= questions.length ? 'View scorecard →' : 'Next question →'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}