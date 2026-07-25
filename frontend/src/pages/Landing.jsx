import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

// ── Word-by-word animated headline ──────────────────────
function WordReveal({ children, delay = 0 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.classList.add('in')
      else el.classList.remove('in')
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const words = children.split(' ')
  return (
    <span ref={ref} className="word-reveal" style={{ display: 'block' }}>
      {words.map((w, i) => (
        <span key={i} style={{ transitionDelay: `${delay + i * 0.06}s`, marginRight: '0.28em' }}>
          {w}
        </span>
      ))}
    </span>
  )
}

// ── Animated score ring ─────────────────────────────────
function AnimatedRing({ score = 7, max = 10, size = 80 }) {
  const [displayed, setDisplayed] = useState(0)
  const pct   = displayed / max
  const r     = (size - 8) / 2
  const circ  = 2 * Math.PI * r
  const dash  = circ * pct
  const color = pct >= 0.7 ? '#22C55E' : pct >= 0.4 ? '#f59e0b' : 'var(--coral)'

  useEffect(() => {
    let cur = 0
    const interval = setInterval(() => {
      cur += 0.15
      if (cur >= score) { setDisplayed(score); clearInterval(interval) }
      else setDisplayed(parseFloat(cur.toFixed(1)))
    }, 30)
    return () => clearInterval(interval)
  }, [score])

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--line)" strokeWidth={7} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.06s linear' }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle"
        style={{ transform: `rotate(90deg) translate(0px,-${size}px)`, fontSize: '15px', fontWeight: '800', fill: color, fontFamily: 'Baloo 2, sans-serif' }}>
        {Math.floor(displayed)}
      </text>
    </svg>
  )
}

export default function Landing() {
  const fillRef = useRef(null)

  useEffect(() => {
    const update = () => {
      if (!fillRef.current) return
      const scrolled = window.scrollY
      const max = document.body.scrollHeight - window.innerHeight
      fillRef.current.style.height = max > 0 ? Math.min(100, (scrolled / max) * 100) + '%' : '0%'
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => e.target.classList.toggle('in', e.isIntersecting))
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' })
    document.querySelectorAll('.reveal').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: 'var(--bg)', color: 'var(--ink)', overflowX: 'hidden' }}>

      {/* Readiness meter */}
      <div className="meter-rail">
        <span className="meter-label">READINESS</span>
        <div className="meter-track">
          <div className="meter-fill" ref={fillRef} />
        </div>
      </div>

      {/* Navbar */}
      <nav className="nav">
        <div className="nav-logo">prep<span>AI</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="#how" className="nav-hide-mobile" style={{ fontSize: '14px', fontWeight: '500', color: 'var(--muted)', transition: 'color 0.15s' }}
            onMouseEnter={e => e.target.style.color = 'var(--ink)'}
            onMouseLeave={e => e.target.style.color = 'var(--muted)'}>
            How it works
          </a>
          <a href="#features" className="nav-hide-mobile" style={{ fontSize: '14px', fontWeight: '500', color: 'var(--muted)', transition: 'color 0.15s' }}
            onMouseEnter={e => e.target.style.color = 'var(--ink)'}
            onMouseLeave={e => e.target.style.color = 'var(--muted)'}>
            Features
          </a>
          <Link to="/login" className="btn btn-ghost" style={{ padding: '8px 18px', fontSize: '13px' }}>Sign in</Link>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>Start free →</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: '92vh', display: 'flex', alignItems: 'center' }}>

        {/* Floating orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Grain */}
        <div className="grain" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: '1200px', margin: '0 auto', width: '100%',
          padding: 'clamp(40px, 6vw, 80px) clamp(20px, 5vw, 64px)',
          display: 'grid', gridTemplateColumns: '1.1fr 1fr',
          gap: '56px', alignItems: 'center',
        }} className="hero-grid">

          {/* Left */}
          <div>
            <div className="reveal" style={{ marginBottom: '22px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                fontSize: '12px', fontWeight: '700', color: 'var(--indigo-2)',
                background: '#EFEAF9', padding: '6px 14px', borderRadius: '999px',
                fontFamily: 'Baloo 2, sans-serif', letterSpacing: '0.02em',
              }}>
                <span className="pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--coral)', display: 'inline-block' }} />
                Built for campus placements
              </span>
            </div>

            <h1 style={{
              fontFamily: 'Baloo 2, sans-serif', fontWeight: '800',
              fontSize: 'clamp(36px, 5vw, 58px)', lineHeight: 1.08,
              letterSpacing: '-0.02em', marginBottom: '20px', color: 'var(--indigo)',
            }}>
              <WordReveal delay={0.1}>Practice the interview</WordReveal>
              <span style={{ display: 'block', marginTop: '4px' }}>
                <WordReveal delay={0.3}>before it practices</WordReveal>
              </span>
              <span className="reveal in" style={{ color: 'var(--coral)', display: 'block', transitionDelay: '0.7s' }}>you.</span>
            </h1>

            <p className="reveal" style={{ fontSize: '17px', color: 'var(--muted)', lineHeight: 1.75, maxWidth: '480px', marginBottom: '32px', transitionDelay: '0.5s' }}>
              Pick a company, pick a round, answer for real — and get told exactly what to fix, the way a mentor would, not a generic pass/fail.
            </p>

            <div className="reveal" style={{ display: 'flex', gap: '12px', marginBottom: '40px', flexWrap: 'wrap', transitionDelay: '0.6s' }}>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '15px 30px', fontSize: '15px', borderRadius: '999px' }}>
                Start your first round →
              </Link>
              <a href="#how" className="btn btn-ghost" style={{ padding: '15px 28px', fontSize: '15px', borderRadius: '999px' }}>
                See how it works
              </a>
            </div>

            <div className="reveal" style={{ display: 'flex', gap: '36px', transitionDelay: '0.7s' }}>
              {[
                { n: '20+', l: 'companies' },
                { n: '4',   l: 'round types' },
                { n: '∞',   l: 'practice sessions' },
              ].map(({ n, l }) => (
                <div key={n}>
                  <div style={{ fontFamily: 'Baloo 2, sans-serif', fontWeight: '800', fontSize: '24px', color: 'var(--indigo)' }}>{n}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — animated session card */}
          <div className="reveal" style={{ transitionDelay: '0.4s' }}>
            <div className="card" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
              {/* Shimmer line at top */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--coral), var(--sky), var(--indigo))', borderRadius: 'var(--radius) var(--radius) 0 0' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{
                  fontFamily: 'Baloo 2, sans-serif', fontSize: '11px', fontWeight: '700',
                  color: 'var(--indigo-2)', background: '#EFEAF9',
                  padding: '4px 10px', borderRadius: '999px',
                }}>
                  Amazon · Technical
                </span>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>3 of 5</span>
              </div>

              <p style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: '16px', fontWeight: '600', color: 'var(--ink)', marginBottom: '16px', lineHeight: 1.4 }}>
                "How would you design a rate limiter for an API?"
              </p>

              {/* Progress dots */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
                {['done','done','active','',''].map((s, i) => (
                  <div key={i} style={{
                    flex: 1, height: '5px', borderRadius: '99px',
                    background: s === 'done' ? 'var(--coral)' : s === 'active' ? 'var(--sky)' : 'var(--line)',
                    transition: 'background 0.3s',
                  }} />
                ))}
              </div>

              {/* Animated score */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <AnimatedRing score={7} max={10} size={72} />
                <div>
                  <div style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: '14px', fontWeight: '700', color: 'var(--ink)', marginBottom: '4px' }}>
                    Score: 7/10
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>
                    Previous question result
                  </div>
                </div>
              </div>

              <div style={{
                fontSize: '13px', color: 'var(--ink)',
                background: '#FFF6F0', border: '1px solid #FFE3D6',
                borderRadius: '10px', padding: '12px 14px', lineHeight: 1.6,
              }}>
                <span style={{ color: 'var(--coral)', fontWeight: '700' }}>Feedback: </span>
                Good on token bucket logic, but you skipped distributed node handling — that's the follow-up they'll ask.
              </div>
            </div>

            {/* Floating testimonial */}
            <div style={{
              marginTop: '16px', padding: '16px 20px',
              background: 'var(--bg-card)', border: '1px solid var(--line)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex', alignItems: 'center', gap: '12px',
              boxShadow: '0 4px 16px rgba(75,63,114,0.08)',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--coral), var(--indigo))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Baloo 2, sans-serif', fontWeight: '700', fontSize: '14px', color: '#fff',
              }}>R</div>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: '500', lineHeight: 1.5 }}>
                  "Got placed at TCS after 2 weeks of daily sessions."
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '3px' }}>
                  Rahul S. · B.Tech CSE 2025
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <section id="how" style={{ maxWidth: '1200px', margin: '0 auto', padding: '96px clamp(20px, 5vw, 64px)' }}>
        <div style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: '12px', fontWeight: '700', color: 'var(--coral)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
          HOW IT WORKS
        </div>
        <h2 className="reveal" style={{ fontFamily: 'Baloo 2, sans-serif', fontWeight: '700', color: 'var(--indigo)', fontSize: 'clamp(22px, 3vw, 32px)', letterSpacing: '-0.01em', maxWidth: '560px', marginBottom: '52px', lineHeight: 1.25 }}>
          Four steps. The same order every placement drive runs.
        </h2>

        <div>
          {[
            { step: '01', title: 'Pick your target', desc: 'Choose the company and round — DSA, technical, aptitude, or HR — so the questions match how that company actually interviews.' },
            { step: '02', title: 'Answer like it\'s real', desc: 'Type your answer the way you\'d say it in the room. No shortcuts, no multiple choice.' },
            { step: '03', title: 'Get told what to fix', desc: 'A score out of 10, the exact line that cost you marks, and what a stronger answer sounds like.' },
            { step: '04', title: 'Watch the weak spots close', desc: 'Every session is saved, so you can see which round is actually improving — not just that you showed up.' },
          ].map(({ step, title, desc }, i) => (
            <div key={step} className="reveal" style={{
              display: 'grid', gridTemplateColumns: '80px 1fr',
              gap: '24px', padding: '28px 0',
              borderTop: '1px solid var(--line)',
              transitionDelay: `${i * 0.08}s`,
            }}>
              <div style={{
                fontFamily: 'Baloo 2, sans-serif', fontSize: '28px', fontWeight: '800',
                color: 'var(--line)', letterSpacing: '-0.02em',
                transition: 'color 0.3s',
              }}
                onMouseEnter={e => e.target.style.color = 'var(--coral)'}
                onMouseLeave={e => e.target.style.color = 'var(--line)'}
              >
                {step}
              </div>
              <div style={{ paddingTop: '6px' }}>
                <div style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: '18px', fontWeight: '700', color: 'var(--ink)', marginBottom: '8px' }}>{title}</div>
                <div style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.75, maxWidth: '520px' }}>{desc}</div>
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--line)' }} />
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(20px, 5vw, 64px) 96px' }}>
        <div style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: '12px', fontWeight: '700', color: 'var(--coral)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
          WHAT YOU GET
        </div>
        <h2 className="reveal" style={{ fontFamily: 'Baloo 2, sans-serif', fontWeight: '700', color: 'var(--indigo)', fontSize: 'clamp(22px, 3vw, 32px)', letterSpacing: '-0.01em', maxWidth: '560px', marginBottom: '44px', lineHeight: 1.25 }}>
          Built around the four gates every drive runs you through.
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="features-grid stagger">
          {[
            { icon: '⌥', title: 'Real company patterns', desc: 'Questions calibrated to how each company actually interviews — FAANG gets hard, service gets easy-medium.' },
            { icon: '◫', title: 'Every round covered',   desc: 'DSA, technical, aptitude, HR — the four gates every placement drive runs you through.' },
            { icon: '◎', title: 'Feedback that names the fix', desc: 'Not "good job" — the exact weak line and what a stronger answer sounds like.' },
            { icon: '▤', title: 'Resume feedback too',   desc: 'Paste your resume, get line-by-line marking from AI trained on placement expectations.' },
          ].map(({ icon, title, desc }, i) => (
            <div key={title} className="card card-hover reveal" style={{
              padding: '28px 22px',
              transitionDelay: `${i * 0.1}s`,
              cursor: 'default',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px', marginBottom: '18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #EFEAF9, #E8F4FC)',
                color: 'var(--indigo)', fontSize: '20px',
                transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              }}>
                {icon}
              </div>
              <div style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: '15px', fontWeight: '700', marginBottom: '10px', color: 'var(--ink)' }}>
                {title}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65 }}>
                {desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Encouragement strip */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(20px, 5vw, 64px) 96px' }}>
        <div className="reveal" style={{
          background: 'linear-gradient(135deg, var(--indigo) 0%, var(--indigo-2) 60%, #8B6FC2 100%)',
          borderRadius: '24px', padding: '48px clamp(24px, 4vw, 56px)',
          color: '#fff', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Background orb inside strip */}
          <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: '80px', bottom: '-60px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(110,193,228,0.12)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: '800', marginBottom: '10px', lineHeight: 1.3 }}>
              You don't need more questions.<br />You need to know which answer was weak.
            </h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.72)', maxWidth: '440px', lineHeight: 1.7 }}>
              Most students practice volume. This tracks precision — the same round, scored the same way, every time you come back.
            </p>
          </div>
          <Link to="/signup" className="btn" style={{
            background: '#fff', color: 'var(--indigo)',
            padding: '14px 32px', borderRadius: '999px',
            fontSize: '14px', fontWeight: '700', flexShrink: 0,
            zIndex: 1, position: 'relative',
            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
          }}>
            Start practicing →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <div className="reveal" style={{ textAlign: 'center', padding: '64px clamp(20px, 5vw, 64px) 80px' }}>
        <h2 style={{ fontFamily: 'Baloo 2, sans-serif', fontWeight: '800', color: 'var(--indigo)', fontSize: 'clamp(28px, 4vw, 44px)', marginBottom: '10px', letterSpacing: '-0.02em' }}>
          Your next interview
        </h2>
        <h2 style={{ fontFamily: 'Baloo 2, sans-serif', fontWeight: '800', fontSize: 'clamp(28px, 4vw, 44px)', marginBottom: '28px', letterSpacing: '-0.02em' }}
          className="grad-text">
          starts with one round.
        </h2>
        <Link to="/signup" className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '16px', borderRadius: '999px' }}>
          Start practicing free →
        </Link>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--line)',
        padding: '44px clamp(20px, 5vw, 64px)',
        display: 'flex', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '32px',
        background: 'var(--bg-card)',
      }}>
        <div>
          <div className="nav-logo" style={{ marginBottom: '8px', fontSize: '22px' }}>
            prep<span style={{ color: 'var(--coral)' }}>AI</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>
            © 2026 prepAI.<br />Built for placement season.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '56px', flexWrap: 'wrap' }}>
          {[
            { title: 'Product', links: [{ l: 'How it works', h: '#how' }, { l: 'Features', h: '#features' }] },
            { title: 'Account', links: [{ l: 'Sign up free', h: '/signup' }, { l: 'Sign in', h: '/login' }] },
            { title: 'Contact', links: [{ l: 'hello@prepai.app', h: 'mailto:hello@prepai.app' }, { l: 'Report an issue', h: '#' }] },
            { title: 'Legal',   links: [{ l: 'Privacy', h: '#' }, { l: 'Terms', h: '#' }] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: '13px', color: 'var(--indigo)', fontWeight: '700', marginBottom: '12px', letterSpacing: '0.01em' }}>
                {col.title}
              </div>
              {col.links.map(({ l, h }) => (
                <a key={l} href={h} style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginBottom: '8px', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--coral)'}
                  onMouseLeave={e => e.target.style.color = 'var(--muted)'}>
                  {l}
                </a>
              ))}
            </div>
          ))}
        </div>
      </footer>

      <style>{`
        @media (max-width: 860px) {
          .hero-grid     { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}