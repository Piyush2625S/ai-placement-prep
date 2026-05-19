import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import API from '../api/axios'

const STEPS = {
  LOADING:   'loading',
  QUESTION:  'question',
  FEEDBACK:  'feedback',
  SCORECARD: 'scorecard',
}

const DIFF_COLORS = {
  Easy:   { color: '#16a34a', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)'  },
  Medium: { color: '#d97706', bg: 'rgba(217,119,6,0.08)',  border: 'rgba(217,119,6,0.2)'  },
  Hard:   { color: '#dc2626', bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.2)'  },
}

// ── Smart content renderer ───────────────────────────────
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
            <SyntaxHighlighter
              key={i}
              language={lang}
              style={oneLight}
              customStyle={{
                margin: 0, borderRadius: '6px',
                fontSize: '13px',
                border: '1px solid var(--line)',
                background: '#F8F8F8',
              }}
            >
              {code}
            </SyntaxHighlighter>
          )
        }
        return part.trim() ? (
          <p key={i} style={{
            fontSize: '13px',
            color: isIdeal ? '#18181B' : '#52525B',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
          }}>
            {part.trim()}
          </p>
        ) : null
      })}
    </div>
  )
}

// ── Score ring ───────────────────────────────────────────
function ScoreRing({ score, max = 10, size = 64 }) {
  const pct   = score / max
  const r     = (size - 8) / 2
  const circ  = 2 * Math.PI * r
  const dash  = circ * pct
  const color = pct >= 0.7 ? '#22C55E' : pct >= 0.4 ? '#f59e0b' : '#ef4444'

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F4F4F5" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle"
        style={{
          transform: `rotate(90deg) translate(0px, -${size}px)`,
          fontSize: '13px', fontWeight: '700',
          fill: color, fontFamily: 'var(--font-body)',
        }}>
        {score}
      </text>
    </svg>
  )
}

// ── Navbar ───────────────────────────────────────────────
function Navbar({ children }) {
  return (
    <nav style={{
      height: '56px', borderBottom: '1px solid var(--line)',
      display: 'flex', alignItems: 'center',
      padding: '0 40px', justifyContent: 'space-between',
      background: '#fff', position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{
        fontFamily: 'var(--font-head)', fontSize: '16px',
        fontWeight: '700', letterSpacing: '-0.03em', color: '#18181B',
      }}>
        prep<span style={{ color: 'var(--green)' }}>AI</span>
      </div>
      {children}
    </nav>
  )
}

// ── Main Session component ───────────────────────────────
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

  const generateQuestions = async () => {
    setStep(STEPS.LOADING)
    setError('')
    try {
      const { data } = await API.post('/questions/generate', {
        company, companyName, round, roundName
      })
      setQuestions(data.questions)
      setStep(STEPS.QUESTION)
    } catch (_err) {
      setError('Failed to generate questions. Check your backend is running.')
    }
  }

  useEffect(() => { generateQuestions() }, [])

  const submitAnswer = async () => {
    if (!answer.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const { data } = await API.post('/questions/feedback', {
        question:   questions[current].question,
        userAnswer: answer,
        company:    companyName,
        round:      roundName,
      })
      setFeedback(data)
      setStep(STEPS.FEEDBACK)
    } catch (_err) {
      setError('Failed to get feedback. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const nextQuestion = () => {
    const saved = {
      question:    questions[current].question,
      userAnswer:  answer,
      aiFeedback:  feedback.feedback,
      idealAnswer: feedback.idealAnswer,
      score:       feedback.score,
    }
    const updated = [...allAnswers, saved]
    setAllAnswers(updated)

    if (current + 1 >= questions.length) {
      saveSession(updated)
    } else {
      setCurrent(c => c + 1)
      setAnswer('')
      setFeedback(null)
      setStep(STEPS.QUESTION)
    }
  }

  const saveSession = async (answers) => {
    setSaving(true)
    try {
      await API.post('/sessions', { company, companyName, round, roundName, answers })
    } catch (err) {
      console.error('Failed to save session:', err.message)
    } finally {
      setSaving(false)
      setStep(STEPS.SCORECARD)
    }
  }

  const totalScore = allAnswers.reduce((s, a) => s + a.score, 0)
  const maxScore   = allAnswers.length * 10
  const pct        = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

  // ── LOADING screen ───────────────────────────────────────
  if (step === STEPS.LOADING) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexDirection: 'column', gap: '16px',
      background: '#FAFAFA', fontFamily: 'var(--font-body)',
    }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%',
        border: '3px solid var(--line)',
        borderTop: '3px solid var(--green)',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
        Generating {roundName} questions for {companyName}...
      </p>
      {error && (
        <div style={{
          padding: '12px 20px',
          background: 'rgba(220,38,38,0.08)',
          border: '1px solid rgba(220,38,38,0.2)',
          borderRadius: '6px', fontSize: '13px', color: '#dc2626',
          maxWidth: '420px', textAlign: 'center',
        }}>
          {error}
          <br />
          <button onClick={generateQuestions} style={{
            marginTop: '8px', color: '#dc2626', background: 'none',
            border: 'none', cursor: 'pointer',
            textDecoration: 'underline', fontSize: '13px',
          }}>
            Try again
          </button>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  // ── SCORECARD screen ─────────────────────────────────────
  if (step === STEPS.SCORECARD) return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: 'var(--font-body)' }}>
      <Navbar>
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}
          style={{ fontSize: '13px', padding: '7px 16px' }}>
          ← Back to dashboard
        </button>
      </Navbar>

      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <span style={{
            display: 'inline-block', padding: '3px 10px',
            background: 'rgba(34,197,94,0.08)', color: 'var(--green)',
            border: '1px solid rgba(34,197,94,0.2)', borderRadius: '3px',
            fontSize: '11px', fontWeight: '600', letterSpacing: '0.07em',
            textTransform: 'uppercase', marginBottom: '14px',
          }}>
            Session complete
          </span>
          <h1 style={{
            fontFamily: 'var(--font-head)', fontSize: '26px',
            fontWeight: '700', letterSpacing: '-0.03em', color: '#18181B',
          }}>
            {companyName} · {roundName}
          </h1>
        </div>

        {/* Score summary */}
        <div style={{
          padding: '28px', background: '#fff',
          border: '1px solid var(--line)', borderRadius: '8px',
          display: 'flex', alignItems: 'center', gap: '28px',
          marginBottom: '28px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}>
          <ScoreRing score={totalScore} max={maxScore} size={80} />
          <div>
            <div style={{
              fontSize: '28px', fontWeight: '700',
              fontFamily: 'var(--font-head)', color: '#18181B',
              letterSpacing: '-0.03em',
            }}>
              {totalScore} / {maxScore}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '2px' }}>
              {pct >= 70 ? 'Strong performance 💪' : pct >= 40 ? 'Room to improve' : 'Keep practicing'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '8px' }}>
              {allAnswers.length} questions · avg {Math.round(totalScore / allAnswers.length * 10) / 10} / 10 per question
            </div>
          </div>
        </div>

        {/* Per-question breakdown */}
        <h2 style={{
          fontSize: '14px', fontWeight: '600', color: '#18181B',
          marginBottom: '12px', letterSpacing: '-0.01em',
        }}>
          Question breakdown
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
          {allAnswers.map((a, i) => (
            <div key={i} style={{
              padding: '18px 20px', background: '#fff',
              border: '1px solid var(--line)', borderRadius: '8px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '13px', fontWeight: '600', color: '#18181B',
                    marginBottom: '6px', lineHeight: 1.4,
                  }}>
                    Q{i + 1}. {a.question}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '10px' }}>
                    {a.aiFeedback}
                  </p>
                  <details style={{ cursor: 'pointer' }}>
                    <summary style={{
                      fontSize: '12px', color: 'var(--green)',
                      fontWeight: '500', listStyle: 'none',
                    }}>
                      View ideal answer ↓
                    </summary>
                    <div style={{
                      marginTop: '8px', padding: '12px',
                      background: '#F9F9F9', borderRadius: '6px',
                      border: '1px solid var(--line)',
                    }}>
                      <SmartContent text={a.idealAnswer} isIdeal={true} />
                    </div>
                  </details>
                </div>
                <ScoreRing score={a.score} max={10} size={52} />
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary"
            onClick={() => navigate('/dashboard')}
            style={{ flex: 1, padding: '12px' }}>
            Back to dashboard
          </button>
          <button className="btn btn-ghost"
            onClick={() => {
              setStep(STEPS.LOADING)
              setCurrent(0)
              setAnswer('')
              setFeedback(null)
              setAllAnswers([])
              generateQuestions()
            }}
            style={{ flex: 1, padding: '12px' }}>
            Retry this session
          </button>
        </div>

      </main>
    </div>
  )

  // ── QUESTION / FEEDBACK screen ───────────────────────────
  const q    = questions[current]
  const diff = q ? DIFF_COLORS[q.difficulty] || DIFF_COLORS.Medium : DIFF_COLORS.Medium

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: 'var(--font-body)' }}>

      <Navbar>
        {/* Progress bar */}
        <div style={{ flex: 1, maxWidth: '320px', margin: '0 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
              {companyName} · {roundName}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
              {current + 1} / {questions.length}
            </span>
          </div>
          <div style={{ height: '3px', background: 'var(--line)', borderRadius: '99px' }}>
            <div style={{
              height: '100%',
              width: `${((current + (step === STEPS.FEEDBACK ? 1 : 0)) / questions.length) * 100}%`,
              background: 'var(--green)', borderRadius: '99px',
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}
          style={{ fontSize: '12px', padding: '6px 14px' }}>
          Exit
        </button>
      </Navbar>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px' }}>
        {q && (
          <>
            {/* Question header */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{
                  padding: '2px 8px', background: diff.bg, color: diff.color,
                  border: `1px solid ${diff.border}`, borderRadius: '3px',
                  fontSize: '10px', fontWeight: '600',
                  letterSpacing: '0.07em', textTransform: 'uppercase',
                }}>
                  {q.difficulty}
                </span>
                <span style={{
                  padding: '2px 8px', background: '#F4F4F5', color: 'var(--muted)',
                  borderRadius: '3px', fontSize: '10px', fontWeight: '600',
                  letterSpacing: '0.07em', textTransform: 'uppercase',
                }}>
                  {q.topic}
                </span>
              </div>
              <h1 style={{
                fontFamily: 'var(--font-head)', fontSize: '22px',
                fontWeight: '700', letterSpacing: '-0.02em',
                color: '#18181B', lineHeight: 1.4,
              }}>
                {q.question}
              </h1>
            </div>

            {/* Answer area */}
            {step === STEPS.QUESTION && (
              <div>
                <label style={{
                  display: 'block', fontSize: '11px', fontWeight: '600',
                  color: 'var(--muted)', textTransform: 'uppercase',
                  letterSpacing: '0.07em', marginBottom: '10px',
                }}>
                  Your answer
                </label>
                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Type your answer here. Be as detailed as you would in a real interview..."
                  rows={10}
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
                {error && <div className="error-box" style={{ marginTop: '10px' }}>{error}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button className="btn btn-primary" onClick={submitAnswer}
                    disabled={!answer.trim() || submitting}
                    style={{ padding: '11px 28px', fontSize: '14px' }}>
                    {submitting ? 'Evaluating...' : 'Submit answer →'}
                  </button>
                </div>
              </div>
            )}

            {/* Feedback area */}
            {step === STEPS.FEEDBACK && feedback && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* Score + feedback */}
                <div style={{
                  padding: '20px 24px', background: '#fff',
                  border: '1px solid var(--line)', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', gap: '20px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}>
                  <ScoreRing score={feedback.score} max={10} size={64} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#18181B', marginBottom: '4px' }}>
                      Score: {feedback.score}/10
                    </div>
                    <p style={{ fontSize: '13px', color: '#52525B', lineHeight: 1.6 }}>
                      {feedback.feedback}
                    </p>
                  </div>
                </div>

                {/* Your answer */}
                <div style={{
                  padding: '16px 20px', background: '#FAFAFA',
                  border: '1px solid var(--line)', borderRadius: '8px',
                }}>
                  <p style={{
                    fontSize: '11px', fontWeight: '600', color: 'var(--muted)',
                    textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px',
                  }}>
                    Your answer
                  </p>
                  <SmartContent text={answer} />
                </div>

                {/* Ideal answer */}
                <div style={{
                  padding: '16px 20px',
                  background: 'rgba(34,197,94,0.04)',
                  border: '1px solid rgba(34,197,94,0.2)',
                  borderRadius: '8px',
                }}>
                  <p style={{
                    fontSize: '11px', fontWeight: '600', color: 'var(--green)',
                    textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px',
                  }}>
                    Ideal answer
                  </p>
                  <SmartContent text={feedback.idealAnswer} isIdeal={true} />
                </div>

                {/* Weak areas */}
                {feedback.weakAreas?.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Weak areas:</span>
                    {feedback.weakAreas.map(w => (
                      <span key={w} style={{
                        padding: '2px 10px',
                        background: 'rgba(220,38,38,0.06)',
                        color: '#dc2626',
                        border: '1px solid rgba(220,38,38,0.15)',
                        borderRadius: '3px',
                        fontSize: '12px', fontWeight: '500',
                      }}>
                        {w}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                  <button className="btn btn-primary" onClick={nextQuestion} disabled={saving}
                    style={{ padding: '11px 28px', fontSize: '14px' }}>
                    {saving ? 'Saving...' : current + 1 >= questions.length ? 'View scorecard →' : 'Next question →'}
                  </button>
                </div>

              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}