import { useEffect, useRef, useState } from 'react'
import { gsap, reducedMotion } from '../motion.js'
import logoSvg from '../../../public/images/logo.svg?raw'

// Opening for Option 2, inspired by why.zero.university's post-"draw a zero" moment: a soft mint, frosted
// screen where the Paramount HealthRx logo draws itself on letter by letter, then a circle (the "zero") opens from the centre to reveal
// the hero. Built with our own type and colours — no third-party assets.

let resolveIntro
/** Resolves when the hero should start its entrance (as the circle begins to open). */
export const introDone = new Promise((r) => { resolveIntro = r })

export function Intro() {
  const root = useRef(null)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const el = root.current
    if (!el || reducedMotion()) { resolveIntro(); setGone(true); return }
    const html = document.documentElement
    const prevOverflow = html.style.overflow
    html.style.overflow = 'hidden' // hold the page at the top while the intro plays
    window.scrollTo(0, 0)

    // logo letters: outline each in its own brand colour, ready to be drawn on
    const letters = [...el.querySelectorAll('[data-words] path')].filter((p) => /^#/.test(p.getAttribute('fill') || ''))
    letters.forEach((p) => {
      const len = Math.ceil(p.getTotalLength())
      Object.assign(p.style, { stroke: p.getAttribute('fill'), strokeWidth: '0.3', strokeDasharray: `${len}`, strokeDashoffset: `${len}`, fillOpacity: '0' })
      p.dataset.len = len
    })
    const radius = Math.hypot(window.innerWidth, window.innerHeight) * 0.6 + 40

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: () => { html.style.overflow = prevOverflow; setGone(true) },
    })
    tl.set(el, { '--r': '0px' })
      .fromTo(el.querySelector('[data-bloom]'), { opacity: 0.5 }, { opacity: 1, duration: 1.4, ease: 'power2.out' }, 0)
      .fromTo(el.querySelector('[data-words]'), { scale: 0.94, opacity: 0.001 }, { scale: 1, opacity: 1, duration: 1.6, ease: 'power2.out' }, 0)
      // draw each letter's outline in turn, then let its colour fill in behind it
      .to(letters, { strokeDashoffset: 0, duration: 1.3, stagger: 0.07 }, 0.2)
      .to(letters, { fillOpacity: 1, duration: 0.6, stagger: 0.05, ease: 'power1.out' }, 1.0)
      .to(letters, { strokeWidth: 0, duration: 0.5 }, 2.3)
      // the zero: a circle opens from the centre and the hero shows through it
      .add(() => resolveIntro(), 3.05)
      .to(el.querySelector('[data-words]'), { scale: 1.12, opacity: 0, duration: 1.1, ease: 'power2.in' }, 2.9)
      .to(el, { '--r': `${radius}px`, duration: 1.3, ease: 'power3.inOut' }, 2.95)

    // let impatient visitors skip ahead
    const skip = () => tl.timeScale(3.5)
    const evs = ['wheel', 'touchstart', 'keydown', 'pointerdown']
    evs.forEach((e) => window.addEventListener(e, skip, { passive: true, once: true }))
    return () => {
      tl.kill()
      evs.forEach((e) => window.removeEventListener(e, skip))
      html.style.overflow = prevOverflow
    }
  }, [])

  if (gone) return null
  return (
    <div
      ref={root}
      aria-hidden
      className="intro-zero fixed inset-0 z-[90] grid place-items-center overflow-hidden bg-[#eaf6ff]"
      style={{ '--r': '0px' }}
    >
      {/* soft mint bloom + frost */}
      <div data-bloom className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_45%,#ffffff_0%,#f2f9ff_40%,#d6ecfb_70%,#a9d6f5_100%)]" />
      <div className="pointer-events-none absolute -bottom-1/4 -left-1/4 size-[70vmax] rounded-full bg-[#3AB5FE]/25 blur-[120px]" />
      <div className="pointer-events-none absolute -top-1/3 -right-1/4 size-[60vmax] rounded-full bg-white/70 blur-[100px]" />
      <div className="intro-grain pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-multiply" />

      {/* the Paramount HealthRx logo (inlined so each letter can be drawn on) */}
      <div data-words role="img" aria-label="Paramount HealthRx" className="relative w-[min(78vw,620px)] [&_svg]:h-auto [&_svg]:w-full [&_svg]:overflow-visible" dangerouslySetInnerHTML={{ __html: logoSvg }} />
    </div>
  )
}
