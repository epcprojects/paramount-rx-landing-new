import { useEffect, useRef, useState } from 'react'
import { gsap, reducedMotion } from '../motion.js'
import logoSvg from '../../../public/images/logo.svg?raw'

// Opening for Option 2, inspired by why.zero.university's post-"draw a zero" moment: a soft, frosted screen where
// the Paramount HealthRx logo draws itself on letter by letter, then a circle (the "zero") opens from the centre to
// reveal the hero. It replays whenever the visitor scrolls all the way back to the top. Built with our own logo and
// colours — no third-party assets.

let resolveIntro
/** Resolves when the hero should start its entrance (as the circle first begins to open). */
export const introDone = new Promise((r) => { resolveIntro = r })

export function Intro() {
  const root = useRef(null)
  const [off, setOff] = useState(false) // reduced motion: never show

  useEffect(() => {
    const el = root.current
    if (!el || reducedMotion()) { resolveIntro(); setOff(true); return }
    const html = document.documentElement
    const words = el.querySelector('[data-words]')
    const bloom = el.querySelector('[data-bloom]')

    // logo letters: outline each in its own brand colour, ready to be drawn on
    const letters = [...words.querySelectorAll('path')].filter((p) => /^#/.test(p.getAttribute('fill') || ''))
    letters.forEach((p) => {
      p.dataset.len = Math.ceil(p.getTotalLength())
      Object.assign(p.style, { stroke: p.getAttribute('fill'), strokeDasharray: p.dataset.len })
    })

    let tl
    let skipTimer
    let prevOverflow = ''
    const skip = () => tl?.timeScale(3.5) // impatient visitors (any input) speed it up
    const evs = ['wheel', 'touchstart', 'keydown', 'pointerdown']
    const unlock = () => { if (html.style.overflow === 'hidden') html.style.overflow = prevOverflow }

    /** Plays the intro from the start. `first` holds the page at the top while it plays (the first visit only —
     *  a replay never blocks scrolling, the visitor can scroll straight on through it). */
    const play = (first) => {
      tl?.kill()
      if (first) { prevOverflow = html.style.overflow; html.style.overflow = 'hidden'; window.scrollTo(0, 0) }
      const radius = Math.hypot(window.innerWidth, window.innerHeight) * 0.6 + 40
      gsap.set(el, { autoAlpha: 1, '--r': '0px' })
      gsap.set(letters, { strokeDashoffset: (i, p) => p.dataset.len, strokeWidth: 0.3, fillOpacity: 0 })
      tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete: () => { unlock(); gsap.set(el, { autoAlpha: 0 }) },
      })
      tl.fromTo(bloom, { opacity: 0.5 }, { opacity: 1, duration: 1.4, ease: 'power2.out' }, 0)
        .fromTo(words, { scale: 0.94, opacity: 0.001 }, { scale: 1, opacity: 1, duration: 1.6, ease: 'power2.out' }, 0)
        // draw each letter's outline in turn, then let its colour fill in behind it
        .to(letters, { strokeDashoffset: 0, duration: 1.3, stagger: 0.07 }, 0.2)
        .to(letters, { fillOpacity: 1, duration: 0.6, stagger: 0.05, ease: 'power1.out' }, 1.0)
        .to(letters, { strokeWidth: 0, duration: 0.5 }, 2.3)
        // the zero: a circle opens from the centre and the hero shows through it
        .add(() => resolveIntro(), 3.05)
        .to(words, { scale: 1.12, opacity: 0, duration: 1.1, ease: 'power2.in' }, 2.9)
        .to(el, { '--r': `${radius}px`, duration: 1.3, ease: 'power3.inOut' }, 2.95)
      // listen for "skip" input — on a replay, only after a beat, so the scroll that brought the visitor back to
      // the top (wheel momentum) doesn't instantly fast-forward it
      const addSkip = () => evs.forEach((e) => window.addEventListener(e, skip, { passive: true, once: true }))
      clearTimeout(skipTimer)
      if (first) addSkip(); else skipTimer = setTimeout(addSkip, 900)
    }
    play(true)

    // replay when the visitor comes all the way back to the top after having scrolled away
    let armed = false
    const onScroll = () => {
      const y = window.scrollY
      if (y > window.innerHeight * 0.5) armed = true
      else if (armed && y <= 2) { armed = false; play(false) }
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      tl?.kill()
      clearTimeout(skipTimer)
      window.removeEventListener('scroll', onScroll)
      evs.forEach((e) => window.removeEventListener(e, skip))
      unlock()
    }
  }, [])

  if (off) return null
  return (
    <div
      ref={root}
      aria-hidden
      className="intro-zero pointer-events-none fixed inset-0 z-[90] grid place-items-center overflow-hidden bg-[#eaf6ff]"
      style={{ '--r': '0px' }}
    >
      {/* soft bloom + frost */}
      <div data-bloom className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_45%,#ffffff_0%,#f2f9ff_40%,#d6ecfb_70%,#a9d6f5_100%)]" />
      <div className="pointer-events-none absolute -bottom-1/4 -left-1/4 size-[70vmax] rounded-full bg-[#3AB5FE]/25 blur-[120px]" />
      <div className="pointer-events-none absolute -top-1/3 -right-1/4 size-[60vmax] rounded-full bg-white/70 blur-[100px]" />
      <div className="intro-grain pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-multiply" />

      {/* the Paramount HealthRx logo (inlined so each letter can be drawn on) */}
      <div data-words role="img" aria-label="Paramount HealthRx" className="relative w-[min(78vw,620px)] [&_svg]:h-auto [&_svg]:w-full [&_svg]:overflow-visible" dangerouslySetInnerHTML={{ __html: logoSvg }} />
    </div>
  )
}
