import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP, appear, ease, reducedMotion } from '../motion.js'
import { links } from '../content.js'
import { Cta } from '../components/ui.jsx'

// "Be Your Best Self" — same layout, copy, imagery and icons as the live paramounthealthrx.com homepage section.

/** Floating glass stat cards over the runner photo — same "frosted glass + mini animated chart" language as
 *  the reference card analysed from goodlifemeds.com (bg-black/25, backdrop-blur, number + sparkline/ring
 *  animating in once scrolled into view), rebuilt in plain SVG + GSAP instead of a Lottie export. */
const floatingStats = [
  { key: 'metabolism', label: 'Boost Metabolism', to: 23, prefix: '+', suffix: '%', chart: 'up', deltaLabel: 'Metabolic rate', className: 'top-[30%] left-[54%] xl:top-[32%]' },
  { key: 'weight', label: 'Sustainable Weight Loss', to: 18, prefix: '-', suffix: '%', chart: 'down', deltaLabel: 'Avg. over 6 months', className: 'bottom-[32%] left-[78%]' },
  { key: 'confidence', label: 'Greater Confidence', to: 94, prefix: '', suffix: '%', chart: 'ring', deltaLabel: 'Patient reported', className: 'bottom-[14%] left-[44%] xl:bottom-[16%]' },
]

const SPARK_PATH = {
  up: 'M2 34 C 18 30, 30 36, 44 24 C 58 12, 70 20, 84 10 C 96 2, 106 6, 118 2',
  down: 'M2 6 C 16 10, 28 6, 42 16 C 56 26, 68 22, 82 30 C 96 36, 106 32, 118 36',
}
const RING_R = 26
const RING_C = 2 * Math.PI * RING_R

/** Breakpoint-driven boolean, used to swap the mobile marquee for the tablet/desktop stat row entirely
 *  (rather than rendering both and hiding one with CSS) so only one set of ScrollTrigger-tracked widgets
 *  ever exists in the DOM at a time — mixing both sets at once is what caused an earlier crash. */
function useBelow(breakpointPx) {
  const [below, setBelow] = useState(() => typeof window !== 'undefined' && window.innerWidth < breakpointPx)
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`)
    const onChange = () => setBelow(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [breakpointPx])
  return below
}

function StatWidget({ label, to, prefix = '', suffix = '', chart, deltaLabel, className = '', variant = 'row' }) {
  const wrap = useRef(null)
  const valueEl = useRef(null)
  const pathEl = useRef(null)
  const ringEl = useRef(null)

  useGSAP(() => {
    if (reducedMotion()) {
      valueEl.current.textContent = `${prefix}${to}${suffix}`
      if (pathEl.current) gsap.set(pathEl.current, { strokeDashoffset: 0 })
      if (ringEl.current) gsap.set(ringEl.current, { strokeDashoffset: RING_C * (1 - to / 100) })
      return
    }
    const counter = { n: 0 }
    const tl = gsap.timeline({ scrollTrigger: { trigger: wrap.current, start: 'top 85%', once: true } })
    tl.from(wrap.current, { opacity: 0, y: 24, duration: 0.6, ease: ease.spring }, 0)
      .to(counter, {
        n: to, duration: 1.4, ease: ease.ui, snap: { n: 1 },
        onUpdate: () => { valueEl.current.textContent = `${prefix}${counter.n}${suffix}` },
      }, 0.15)
    if (pathEl.current) {
      const len = pathEl.current.getTotalLength()
      gsap.set(pathEl.current, { strokeDasharray: len, strokeDashoffset: len })
      tl.to(pathEl.current, { strokeDashoffset: 0, duration: 1.4, ease: ease.ui }, 0.15)
    }
    if (ringEl.current) {
      gsap.set(ringEl.current, { strokeDasharray: RING_C, strokeDashoffset: RING_C })
      tl.to(ringEl.current, { strokeDashoffset: RING_C * (1 - to / 100), duration: 1.4, ease: ease.ui }, 0.15)
    }
  }, { scope: wrap })

  const marquee = variant === 'marquee'
  const wrapClassName = marquee
    ? 'flex w-[204px] shrink-0 flex-col gap-3 rounded-2xl bg-black/25 p-5 text-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] backdrop-blur-[30px]'
    : `z-10 flex w-full flex-col gap-2 rounded-xl bg-black/80 p-3 text-white shadow-[0_12px_30px_-16px_rgba(0,0,0,0.5)] xl:absolute xl:w-[204px] xl:gap-3 xl:rounded-2xl xl:bg-black/25 xl:p-5 xl:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] xl:backdrop-blur-[30px] ${className}`

  return (
    <div ref={wrap} className={wrapClassName}>
      <p className={marquee ? 'text-[12px] font-medium text-white/70' : 'text-[11px] font-medium text-white/70 xl:text-[12px]'}>{label}</p>
      <div className="flex items-center justify-between gap-2">
        <span ref={valueEl} className={marquee ? 'text-[30px] leading-none font-semibold' : 'text-[26px] leading-none font-semibold xl:text-[30px]'}>{prefix}0{suffix}</span>
        {chart === 'ring' && (
          <svg width="52" height="52" viewBox="0 0 60 60" className="-rotate-90" aria-hidden>
            <circle cx="30" cy="30" r={RING_R} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="6" />
            <circle ref={ringEl} cx="30" cy="30" r={RING_R} fill="none" stroke="#A8FF93" strokeWidth="6" strokeLinecap="round" />
          </svg>
        )}
      </div>
      {chart !== 'ring' && (
        <svg viewBox="0 0 120 40" className="h-8 w-full" preserveAspectRatio="none" aria-hidden>
          <path ref={pathEl} d={SPARK_PATH[chart]} fill="none" stroke="#A8FF93" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )}
      <p className={marquee ? 'flex items-center gap-1 text-[12px] text-white/60' : 'flex items-center gap-1 text-[11px] text-white/60 xl:text-[12px]'}>
        {chart !== 'ring' && <span className="text-[#A8FF93]">{chart === 'down' ? '↓' : '↑'}</span>}
        {deltaLabel}
      </p>
    </div>
  )
}

/** Decorative, non-animated duplicate of a stat card — pads out the marquee track for a seamless loop.
 *  Final values are static (no GSAP/ScrollTrigger of its own) and it's hidden from assistive tech. */
function StaticStatCard({ label, to, prefix = '', suffix = '', chart, deltaLabel }) {
  return (
    <div aria-hidden className="flex w-[204px] shrink-0 flex-col gap-3 rounded-2xl bg-black/25 p-5 text-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] backdrop-blur-[30px]">
      <p className="text-[12px] font-medium text-white/70">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[30px] leading-none font-semibold">{prefix}{to}{suffix}</span>
        {chart === 'ring' && (
          <svg width="52" height="52" viewBox="0 0 60 60" className="-rotate-90" aria-hidden>
            <circle cx="30" cy="30" r={RING_R} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="6" />
            <circle cx="30" cy="30" r={RING_R} fill="none" stroke="#A8FF93" strokeWidth="6" strokeLinecap="round" strokeDasharray={RING_C} strokeDashoffset={RING_C * (1 - to / 100)} />
          </svg>
        )}
      </div>
      {chart !== 'ring' && (
        <svg viewBox="0 0 120 40" className="h-8 w-full" preserveAspectRatio="none" aria-hidden>
          <path d={SPARK_PATH[chart]} fill="none" stroke="#A8FF93" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )}
      <p className="flex items-center gap-1 text-[12px] text-white/60">
        {chart !== 'ring' && <span className="text-[#A8FF93]">{chart === 'down' ? '↓' : '↑'}</span>}
        {deltaLabel}
      </p>
    </div>
  )
}

/** Mobile-only: slow auto-scrolling marquee of the stat cards, styled like the desktop floating cards
 *  (same width, blurred glass). The real cards drive the reveal/counter; a duplicated, non-animated set
 *  pads the track so the loop is seamless. Falls back to a manually swipeable row when the user prefers
 *  reduced motion, so every card stays reachable without relying on the animation.
 *  No mask-image edge fade here: a mask on an ancestor of a backdrop-blur element makes Chromium drop the
 *  blur (it isolates the masked layer from what's behind it), so the track is a plain hard clip instead. */
function MobileStatsMarquee() {
  if (reducedMotion()) {
    return (
      <div className="no-scrollbar relative z-10 mx-auto flex w-full max-w-7xl gap-3 overflow-x-auto px-4 pb-1">
        {floatingStats.map(({ key, ...s }) => <StatWidget key={key} variant="marquee" {...s} />)}
      </div>
    )
  }
  return (
    <div className="relative z-10 overflow-hidden">
      <div className="marquee-track flex w-max gap-3 px-4">
        {floatingStats.map(({ key, ...s }) => <StatWidget key={key} variant="marquee" {...s} />)}
        {floatingStats.map(({ key, ...s }) => <StaticStatCard key={`${key}-clone`} {...s} />)}
      </div>
    </div>
  )
}

export function BestSelf() {
  const root = useRef(null)
  const isMobile = useBelow(768)
  useGSAP(() => appear(root.current), { scope: root })

  return (
    <section ref={root} id="best-self" className="relative z-10 bg-white px-4 py-0 md:px-5 md:py-8">
      <div className="relative mx-auto flex min-h-[100svh] max-w-[96rem] flex-col justify-between overflow-hidden rounded-[22px] py-10 md:block md:min-h-[74vh] md:rounded-[30px] md:px-10 md:pt-24 md:pb-32 xl:px-14">
        {/* runner photo, covers full width of the panel at every breakpoint */}
        <div aria-hidden className="absolute inset-0 bg-[url('/img/runners-duo-1920.webp')] bg-cover bg-center bg-no-repeat" />
        {/* mobile-only scrim so the white-on-photo text stays legible without a solid card behind it */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/40 md:hidden" />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 md:gap-[120px] xl:px-8">
          <div data-appear className="flex w-full flex-col items-start gap-4 rounded-2xl p-5 text-white md:bg-white/90 md:p-5 md:text-black md:backdrop-blur-sm xl:w-auto xl:gap-8 xl:rounded-none xl:bg-transparent xl:p-0 xl:backdrop-blur-none">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl leading-[1.2] font-medium tracking-[-0.02em] text-white md:text-[64px] md:text-black">
                <span className="text-white/70 md:text-black/60">Be Your</span> Best Self
              </h2>
              <p className="text-sm text-white md:text-black md:text-lg">
                Paramount HealthRx was built to deliver integrated,<br className="hidden md:block" /> physician-guided optimization—not isolated products.
              </p>
              <p className="mt-2 text-sm text-white/85 md:mt-3 md:text-black/80 md:text-lg">Physician-guided. Real support. Lasting results.</p>
            </div>
            <Cta href={links.products} variant="black" size="lg">Start Your Journey</Cta>
          </div>
        </div>

        {isMobile ? (
          <MobileStatsMarquee />
        ) : (
          /* Tablet: compact 3-up row. Desktop (xl): wrapper becomes display:contents so each card positions
             absolutely against the panel instead of this wrapper. */
          <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-3 gap-2 px-4 xl:contents xl:px-0">
            {floatingStats.map(({ key, ...s }) => <StatWidget key={key} {...s} />)}
          </div>
        )}
      </div>
    </section>
  )
}
