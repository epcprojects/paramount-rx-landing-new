import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, reducedMotion, lenis } from '../motion.js'
import logoSvg from '../../../public/images/logo.svg?raw'

// Opening for Option 3, inspired by why.zero.university's post-"draw a zero" moment: a soft, frosted screen where
// the Paramount HealthRx logo draws itself on letter by letter, then a circle (the "zero") opens from the centre to
// reveal the hero. It plays once, on load. Built with our own logo and
// colours — no third-party assets.

let resolveIntro
/** Resolves when the hero should start its entrance (as the circle first begins to open). */
export const introDone = new Promise((r) => { resolveIntro = r })

export function Intro() {
  const root = useRef(null)
  const [off, setOff] = useState(false) // reduced motion: never show

  // layout effect: the letters are prepared (hidden, outlines ready to draw) before the browser's first paint, so the
  // finished logo never flashes up and disappears before the animation draws it in
  useLayoutEffect(() => {
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
    const unlock = () => { if (html.style.overflow === 'hidden') html.style.overflow = prevOverflow; lenis?.start() }

    /** Plays the intro from the start. `first` holds the page at the top while it plays (the first visit only —
     *  a replay never blocks scrolling, the visitor can scroll straight on through it). */
    const play = (first) => {
      tl?.kill()
      if (first) { prevOverflow = html.style.overflow; html.style.overflow = 'hidden'; lenis?.stop(); lenis ? lenis.scrollTo(0, { immediate: true, force: true }) : window.scrollTo(0, 0) }
      const radius = Math.hypot(window.innerWidth, window.innerHeight) * 0.6 + 40
      gsap.set(el, { autoAlpha: 1, '--r': '0px' })
      gsap.set(letters, { strokeDashoffset: (i, p) => p.dataset.len, strokeWidth: 0.3, fillOpacity: 0 })
      tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete: () => { unlock(); gsap.set(el, { autoAlpha: 0 }) },
      })
      // Option 4: softer curves and more overlap between the steps so it reads as one continuous motion
      tl.fromTo(bloom, { opacity: 0.6 }, { opacity: 1, duration: 1.8, ease: 'sine.out' }, 0)
        .fromTo(words, { scale: 0.96, opacity: 0.001 }, { scale: 1, opacity: 1, duration: 2.2, ease: 'expo.out' }, 0)
        // draw each letter's outline in turn, then let its colour fill in behind it — fills overlap heavily so the
        // word fills in as a smooth wave instead of letter by letter
        .to(letters, { strokeDashoffset: 0, duration: 1.4, stagger: 0.05, ease: 'sine.inOut' }, 0.15)
        .to(letters, { fillOpacity: 1, duration: 1.0, stagger: 0.035, ease: 'sine.inOut' }, 0.85)
        .to(letters, { strokeWidth: 0, duration: 0.7, ease: 'sine.inOut' }, 2.2)
        // the zero: a circle opens from the centre and the hero shows through it
        .add(() => resolveIntro(), 3.0)
        .to(words, { scale: 1.08, opacity: 0, duration: 1.2, ease: 'power2.inOut' }, 2.85)
        .to(el, { '--r': `${radius}px`, duration: 1.5, ease: 'power3.inOut' }, 2.9)
      // listen for "skip" input — on a replay, only after a beat, so the scroll that brought the visitor back to
      // the top (wheel momentum) doesn't instantly fast-forward it
      const addSkip = () => evs.forEach((e) => window.addEventListener(e, skip, { passive: true, once: true }))
      clearTimeout(skipTimer)
      if (first) addSkip(); else skipTimer = setTimeout(addSkip, 900)
    }
    play(true)

    // (main page: the intro plays once on load only — scrolling back to the top stays on the hero)

    return () => {
      tl?.kill()
      clearTimeout(skipTimer)
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
      {/* Option 4: the two glows are soft radial gradients, not blur() filters, and the grain is a plain overlay (no
          blend mode) — the circle reveal repaints this whole layer every frame, so it has to be cheap to draw */}
      <div className="pointer-events-none absolute -bottom-1/2 -left-1/2 size-[110vmax] rounded-full bg-[radial-gradient(closest-side,rgba(58,181,254,0.25),rgba(58,181,254,0.12)_45%,rgba(58,181,254,0)_100%)]" />
      <div className="pointer-events-none absolute -top-1/2 -right-1/2 size-[100vmax] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.7),rgba(255,255,255,0.3)_45%,rgba(255,255,255,0)_100%)]" />
      <div className="intro-grain pointer-events-none absolute inset-0 opacity-[0.035]" />

      {/* the Paramount HealthRx logo (inlined so each letter can be drawn on) */}
      {/* starts invisible (and its letters unfilled, see .intro-zero in index.css) — only the animation reveals it */}
      <div data-words role="img" aria-label="Paramount HealthRx" style={{ opacity: 0 }} className="relative w-[min(60vw,400px)] [&_svg]:h-auto [&_svg]:w-full [&_svg]:overflow-visible" dangerouslySetInnerHTML={{ __html: logoSvg }} />
    </div>
  )
}
