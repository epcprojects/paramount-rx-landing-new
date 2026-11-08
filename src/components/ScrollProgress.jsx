import { useEffect, useRef } from 'react'

const SIZE = 52
const STROKE = 3
const RADIUS = (SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * RADIUS

/** Fixed circular scroll-progress ring, bottom-right. Hidden until the intro hero/reveal pin
 *  (#intro-stage) has scrolled past, then fills from the page's overall scroll progress so it
 *  reads 100% right as the user reaches the bottom of the page. */
export function ScrollProgress() {
  const wrap = useRef(null)
  const ring = useRef(null)

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
        wrap.current.style.transform = visible ? 'scale(1)' : 'scale(0.85)'
        wrap.current.style.pointerEvents = visible ? 'auto' : 'none'
      }
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      ring.current.style.strokeDashoffset = String(CIRC * (1 - progress))
      wrap.current.setAttribute('aria-valuenow', String(Math.round(progress * 100)))
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
      className="fixed right-5 bottom-5 z-40 opacity-0 transition-[opacity,transform] duration-300 ease-out sm:right-7 sm:bottom-7"
      style={{ transform: 'scale(0.85)' }}
    >
      <div className="grid place-items-center rounded-full bg-white shadow-[0_8px_24px_-8px_rgba(10,10,10,0.35)]" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90" aria-hidden>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#e6e6e6" strokeWidth={STROKE} />
          <circle
            ref={ring}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#3ab5fe"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC}
          />
        </svg>
      </div>
    </div>
  )
}
