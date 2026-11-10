import { useEffect, useRef } from 'react'
import { gsap, reducedMotion } from '../motion.js'

const BOX = 64
const OUTER_R = 30
const MAIN_R = 23
const STROKE = 3
const CIRC = 2 * Math.PI * MAIN_R
const MAGNET_RADIUS = 90 // px from the button's rest centre where the pointer starts pulling it in
const MAGNET_PULL = 0.35
const MAGNET_MAX = 18 // clamp on how far the button can travel toward the pointer

/** Fixed circular "back to top" button, bottom-right. Doubles as a scroll-progress ring (gradient arc
 *  fills with overall page scroll), is magnetic — it drifts toward the pointer as it gets close — and
 *  launches its arrow up and out on click while the page glides to the top, with a springy landing once
 *  it's back. Hidden until the intro hero/reveal pin (#intro-stage) has scrolled past. */
export function BackToTop() {
  const wrap = useRef(null)
  const btn = useRef(null)
  const ring = useRef(null)
  const icon = useRef(null)
  const magnet = useRef(null)

  useEffect(() => {
    magnet.current = {
      x: gsap.quickTo(btn.current, 'x', { duration: 0.45, ease: 'power3' }),
      y: gsap.quickTo(btn.current, 'y', { duration: 0.45, ease: 'power3' }),
    }
  }, [])

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
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    let magTicking = false
    const onPointerMove = (e) => {
      if (reducedMotion() || !visible || magTicking) return
      magTicking = true
      requestAnimationFrame(() => {
        magTicking = false
        const r = btn.current.getBoundingClientRect()
        const offsetX = gsap.getProperty(btn.current, 'x')
        const offsetY = gsap.getProperty(btn.current, 'y')
        const cx = r.left + r.width / 2 - offsetX
        const cy = r.top + r.height / 2 - offsetY
        const dx = e.clientX - cx
        const dy = e.clientY - cy
        const dist = Math.hypot(dx, dy)
        if (dist < MAGNET_RADIUS) {
          const pull = 1 - dist / MAGNET_RADIUS
          magnet.current.x(gsap.utils.clamp(-MAGNET_MAX, MAGNET_MAX, dx * MAGNET_PULL * pull))
          magnet.current.y(gsap.utils.clamp(-MAGNET_MAX, MAGNET_MAX, dy * MAGNET_PULL * pull))
        } else {
          magnet.current.x(0)
          magnet.current.y(0)
        }
      })
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [])

  const handleClick = () => {
    if (reducedMotion()) { window.scrollTo({ top: 0 }); return }
    gsap.to(icon.current, { y: -14, opacity: 0, duration: 0.22, ease: 'power2.in' })
    gsap.to(window, {
      duration: 1.1,
      ease: 'power3.inOut',
      scrollTo: { y: 0 },
      onComplete: () => gsap.fromTo(icon.current, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(2.4)' }),
    })
  }

  return (
    <div ref={wrap} className="fixed right-7 bottom-7 z-40 hidden opacity-0 transition-opacity duration-300 ease-out lg:block" style={{ width: BOX, height: BOX }}>
      <button ref={btn} type="button" onClick={handleClick} aria-label="Scroll back to top"
        className="back-to-top group relative grid h-full w-full cursor-pointer place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-sky">
        {/* breathing glow behind everything */}
        <div className="scroll-ring-glow absolute inset-0 rounded-full bg-sky/40 blur-md" aria-hidden />

        <svg width={BOX} height={BOX} viewBox={`0 0 ${BOX} ${BOX}`} className="absolute inset-0 drop-shadow-[0_2px_10px_rgba(10,10,10,0.35)]" aria-hidden>
          <defs>
            <linearGradient id="btt-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3ab5fe" />
              <stop offset="100%" stopColor="#A8FF93" />
            </linearGradient>
          </defs>

          {/* decorative spinning dashed halo — spins up on hover (index.css) */}
          <circle className="scroll-ring-outer" cx={BOX / 2} cy={BOX / 2} r={OUTER_R} fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.2" strokeDasharray="1 6" strokeLinecap="round" />

          {/* track — outline only, nothing filled inside */}
          <circle cx={BOX / 2} cy={BOX / 2} r={MAIN_R} fill="none" stroke="#ffffff" strokeOpacity="0.3" strokeWidth={STROKE} />

          {/* scroll-progress arc */}
          <circle
            ref={ring}
            cx={BOX / 2}
            cy={BOX / 2}
            r={MAIN_R}
            fill="none"
            stroke="url(#btt-grad)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC}
            transform={`rotate(-90 ${BOX / 2} ${BOX / 2})`}
            style={{ transition: 'stroke-dashoffset 120ms linear' }}
          />
        </svg>

        {/* dark glass core + arrow, swells slightly on hover */}
        <span className="relative grid size-11 place-items-center overflow-hidden rounded-full bg-[rgba(6,12,14,0.55)] text-white backdrop-blur-xl transition-transform duration-300 ease-out group-hover:scale-110">
          <svg ref={icon} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
    </div>
  )
}
