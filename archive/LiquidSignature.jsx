import { useRef, useState } from 'react'
import { gsap, useGSAP, ScrollTrigger, reducedMotion } from '../motion.js'
import { createLiquid } from '../liquid.js'
import { links } from '../content.js'
import { Cta, Eyebrow } from '../components/ui.jsx'

/**
 * Signature interaction (Farm Minerals-inspired, medically neutral):
 * an abstract droplet — not a product — meets a still surface; ripples carry the message.
 * Scroll-scrubbed and pinned on all sizes (shorter on mobile); static fallback without WebGL or with reduced motion.
 */
export default function LiquidSignature() {
  const root = useRef(null)
  const canvas = useRef(null)
  const [fallback, setFallback] = useState(false)

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    if (reducedMotion()) { setFallback(true); return }

    const mobile = window.matchMedia('(max-width: 767px)').matches
    const liquid = createLiquid(canvas.current, { dprCap: mobile ? 1 : 1.5 })
    if (!liquid) { setFallback(true); return }
    let visible = false
    let raf = 0
    const loop = () => { liquid.render(); if (visible) raf = requestAnimationFrame(loop) }
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting
      cancelAnimationFrame(raf)
      if (visible) raf = requestAnimationFrame(loop)
    })
    io.observe(canvas.current)
    // Canvas text needs the real web fonts: load them explicitly, and redraw if any font finishes later.
    const redraw = () => liquid.refreshText()
    if (document.fonts) {
      Promise.all([
        document.fonts.load('300 64px Manrope'),
        document.fonts.load('italic 400 64px "Instrument Serif"'),
      ]).then(redraw, redraw)
      document.fonts.addEventListener('loadingdone', redraw)
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root.current, start: 'top top', end: mobile ? '+=150%' : '+=230%',
        pin: true, scrub: 1, anticipatePin: 1,
        onUpdate: (self) => liquid.setProgress(self.progress),
      },
    })
    // HTML layers ride the same timeline (duration 1 = whole pin).
    tl.fromTo(q('[data-intro]'), { opacity: 1, y: 0 }, { opacity: 0, y: -30, duration: 0.14, ease: 'power1.in' }, 0.12)
      .fromTo(q('[data-outro]'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.12, ease: 'power1.out' }, 0.8)
      .to({}, { duration: 0.08 }, 0.92)

    return () => {
      cancelAnimationFrame(raf); io.disconnect()
      document.fonts?.removeEventListener('loadingdone', redraw)
      liquid.destroy()
    }
  }, { scope: root })

  return (
    <section ref={root} aria-labelledby="liquid-title" className="relative z-10 h-svh min-h-[560px] overflow-hidden bg-ink text-white">
      <canvas ref={canvas} aria-hidden className={`absolute inset-0 h-full w-full ${fallback ? 'hidden' : ''}`} />

      {fallback && (
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#1a5ea8_0%,#104584_35%,#0a1a2f_80%)]">
          {[18, 32, 48, 66].map((s) => (
            <span key={s} className="absolute top-1/2 left-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky/25" style={{ width: `${s}vmax` }} />
          ))}
        </div>
      )}

      {/* Screen-reader + fallback copy of the "underwater" message */}
      <h2 id="liquid-title" className={fallback ? 'absolute inset-x-0 top-[38%] px-6 text-center display text-[clamp(2.2rem,6vw,5rem)]' : 'sr-only'}>
        Your biology is unique. <span className="accent text-sky">Your treatment should be too.</span>
      </h2>

      <div data-intro className={`pointer-events-none absolute inset-x-0 top-24 px-6 text-center sm:top-28 ${fallback ? 'hidden' : ''}`}>
        <Eyebrow light className="justify-center">Precision care</Eyebrow>
        <p className="mx-auto mt-4 max-w-md text-lg text-white/80">One measured step at a time. Keep scrolling.</p>
      </div>

      <div data-outro className={`absolute inset-x-0 bottom-0 px-6 pb-12 text-center sm:pb-16 ${fallback ? '' : 'opacity-0'}`}>
        <p className="mx-auto max-w-xl text-[15px] leading-relaxed text-white/80 sm:text-base">
          Individualized protocols, real labs and licensed providers — built around your health history and goals, not a one-size-fits-all formula.
        </p>
        <Cta href={links.products} className="mt-7">Start Your Assessment</Cta>
      </div>
    </section>
  )
}
