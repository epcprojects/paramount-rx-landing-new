import { useEffect, useRef } from 'react'

const BOX = 64
const OUTER_R = 30
const MAIN_R = 23
const STROKE = 3
const CIRC = 2 * Math.PI * MAIN_R

/** Fixed circular scroll-progress ring, bottom-right — outline only, nothing filled behind it.
 *  Hidden until the intro hero/reveal pin (#intro-stage) has scrolled past, then its gradient arc
 *  fills with overall page scroll, a comet dot rides the tip, and a dashed halo spins slowly for
 *  a bit of constant life even before you start scrolling again. */
export function ScrollProgress() {
  const wrap = useRef(null)
  const ring = useRef(null)
  const dot = useRef(null)
  const ping = useRef(null)

  useEffect(() => {
    const introStage = document.getElementById('intro-stage')
    let ticking = false
    let visible = false

    const update = () => {
      ticking = false
      const pastHero = introStage ? introStage.getBoundingClientRect().bottom <= 0 : window.scrollY > window.innerHeight
      if (pastHero !== visible) {
        visible = pastHero
        wrap.current.style.opacity = visible ? '1' : '0'
        wrap.current.style.pointerEvents = visible ? 'auto' : 'none'
        if (visible) {
          wrap.current.classList.remove('scroll-ring-pop')
          void wrap.current.offsetWidth
          wrap.current.classList.add('scroll-ring-pop')
        }
      }
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      ring.current.style.strokeDashoffset = String(CIRC * (1 - progress))
      wrap.current.setAttribute('aria-valuenow', String(Math.round(progress * 100)))

      const angle = -Math.PI / 2 + progress * 2 * Math.PI
      const x = BOX / 2 + MAIN_R * Math.cos(angle)
      const y = BOX / 2 + MAIN_R * Math.sin(angle)
      dot.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
      ping.current.style.transform = dot.current.style.transform
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div
      ref={wrap}
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      className="fixed right-5 bottom-5 z-40 opacity-0 transition-opacity duration-300 ease-out sm:right-7 sm:bottom-7"
      style={{ width: BOX, height: BOX }}
    >
      <div className="relative h-full w-full">
        {/* breathing glow behind everything */}
        <div className="scroll-ring-glow absolute inset-0 rounded-full bg-sky/40 blur-md" aria-hidden />

        <svg width={BOX} height={BOX} viewBox={`0 0 ${BOX} ${BOX}`} className="relative drop-shadow-[0_2px_10px_rgba(10,10,10,0.35)]" aria-hidden>
          <defs>
            <linearGradient id="scroll-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3ab5fe" />
              <stop offset="100%" stopColor="#A8FF93" />
            </linearGradient>
          </defs>

          {/* decorative spinning dashed halo */}
          <circle className="scroll-ring-outer" cx={BOX / 2} cy={BOX / 2} r={OUTER_R} fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.2" strokeDasharray="1 6" strokeLinecap="round" />

          {/* track — outline only, nothing filled inside */}
          <circle cx={BOX / 2} cy={BOX / 2} r={MAIN_R} fill="none" stroke="#ffffff" strokeOpacity="0.3" strokeWidth={STROKE} />

          {/* progress arc */}
          <circle
            ref={ring}
            cx={BOX / 2}
            cy={BOX / 2}
            r={MAIN_R}
            fill="none"
            stroke="url(#scroll-ring-grad)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC}
            transform={`rotate(-90 ${BOX / 2} ${BOX / 2})`}
            style={{ transition: 'stroke-dashoffset 120ms linear' }}
          />
        </svg>

        {/* comet tip: pulsing ping ripple + solid dot riding the arc's leading edge */}
        <div ref={ping} className="scroll-ring-ping pointer-events-none absolute top-0 left-0 h-2.5 w-2.5 rounded-full bg-[#A8FF93]" aria-hidden />
        <div ref={dot} className="scroll-ring-comet pointer-events-none absolute top-0 left-0 h-2 w-2 rounded-full bg-white shadow-[0_0_6px_2px_rgba(168,255,147,0.85)]" aria-hidden />
      </div>
    </div>
  )
}
