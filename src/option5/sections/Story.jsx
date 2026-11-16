import { useEffect, useRef } from 'react'
import { gsap, useGSAP, reducedMotion } from '../motion.js'
import { links } from '../content.js'
import { Cta, Tag, Img } from '../components/ui.jsx'
import { IconTestosterone, IconPeptides, IconSexualHealth, IconWeightLoss, IconHairLoss, IconPerformance } from '../components/TreatmentIcons.jsx'

// image = base path of the opt5-card-*-600/1000.webp photos (rendered with <Img>)
export const cards = [
  { name: 'Testosterone', tagline: 'Optimize your hormones. Reclaim your edge.', image: '/img/opt5-card-testosterone', Icon: IconTestosterone },
  { name: 'Peptides & Longevity', tagline: 'Science-backed solutions for a longer, healthier life.', image: '/img/opt5-card-peptides', Icon: IconPeptides },
  { name: 'Sexual Health', tagline: 'Confidence. Performance. Intimacy.', image: '/img/opt5-card-sexual-health', Icon: IconSexualHealth },
  { name: 'Weight Loss', tagline: 'Sustainable results. A healthier, lighter you.', image: '/img/opt5-card-weight-loss', Icon: IconWeightLoss },
  { name: 'Hair Loss', tagline: 'Stronger hair. Greater confidence.', image: '/img/opt5-card-hair-loss', Icon: IconHairLoss },
  { name: 'Performance Enhancers', tagline: 'More energy, more strength, more you.', image: '/img/opt5-card-performance', Icon: IconPerformance },
]

/* ───────────── Option 5: treatment cards on a 3D spiral ring ─────────────
   Same motion as the reference "Services" carousel (madetodisrupt.com): the cards sit on a tilted spiral —
   each one is turned to its angle on the ring (rotateY = its angle), drops lower and drifts right as the angle
   grows, and fades as it swings round to the back. Measured from the reference (card ≈ 480px wide):
     x = 252·sinθ + 0.71·θ°   y = 1.85·θ°   z = 210·cosθ   opacity ≈ 0.6 + 0.4·cosθ
   scaled here to our card width. `ring.a` is the ring position in cards (0 = Testosterone in front).
   Desktop: the hero's pinned timeline (Top.jsx) scrubs it with the scroll. Touch: it advances on its own + swipes. */
const N = cards.length
// 'Peptides & Longevity' → 'Peptides & longevity'
const sentenceCase = (s) => s.charAt(0) + s.slice(1).toLowerCase()
export const ring = { a: 0, els: null }

export function layoutRing(a = ring.a) {
  ring.a = a
  const els = ring.els
  if (!els || !els.cards.length) return
  const k = (els.cards[0].firstElementChild.offsetWidth || 480) / 480 // scale the reference's numbers to our card size
  const step = 95 // the reference's spacing: 95° between cards
  els.cards.forEach((card, i) => {
    // a straight run like the reference, not a loop: cards still to come trail down-right behind the front one,
    // cards already passed drift up-left; nothing sits before the first card
    const rel = i - a
    const deg = rel * step
    const t = (deg * Math.PI) / 180
    const front = Math.cos(t)
    const far = Math.abs(deg) > 300 ? Math.max(0, 1 - (Math.abs(deg) - 300) / 40) : 1 // drop cards that are well round the back
    gsap.set(card, {
      x: (252 * Math.sin(t) + 0.71 * deg) * k,
      y: 1.85 * deg * k,
      z: 210 * front * k, // the front card sits forward, so it reads bigger than the rest (as on the reference)
      rotationY: deg,
      opacity: (0.6 + 0.4 * front) * far,
      zIndex: Math.round(100 + front * 50),
    })
    // text only on the side facing you: once a card turns away its title/description fade out (no mirrored text from behind)
    const txt = card.querySelector('[data-ring-text]')
    if (txt) txt.style.opacity = Math.max(0, Math.min(1, front * 4))
    card.firstElementChild.style.pointerEvents = Math.abs(rel) < 0.5 ? 'auto' : 'none' // only the front card is clickable
  })
  const active = Math.min(N - 1, Math.max(0, Math.round(a)))
  els.dots.forEach((dot, i) => { dot.dataset.on = i === active ? '1' : '0' })
}

/** Treatment cards revealed under the hero, then turned on a 3D ring. */
export function About() {
  const sectionRef = useRef(null)
  const headingRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    const el = ringRef.current
    ring.els = { cards: [...el.querySelectorAll('[data-ring-card]')], dots: [...sectionRef.current.querySelectorAll('[data-ring-dot]')] }
    layoutRing(0)
    const ro = new ResizeObserver(() => layoutRing())
    ro.observe(el)

    // touch screens: the ring turns by itself every few seconds and follows sideways swipes
    const touch = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024
    let tween, timer, x0 = null, y0 = 0
    const go = (to) => {
      tween?.kill()
      to = Math.min(N - 1, Math.max(0, to)) // the run has ends, like the reference
      const p = { a: ring.a }
      // going back to the start turns through every card, so give it more time
      tween = gsap.to(p, { a: to, duration: Math.abs(to - ring.a) > 1.5 ? 1.8 : 0.9, ease: 'power3.inOut', onUpdate: () => layoutRing(p.a) })
    }
    const inView = () => { const r = sectionRef.current.getBoundingClientRect(); return r.top < innerHeight * 0.4 && r.bottom > innerHeight * 0.6 }
    const restart = () => { clearInterval(timer); timer = setInterval(() => { if (inView() && !document.hidden && !reducedMotion()) go(Math.round(ring.a) >= N - 1 ? 0 : Math.round(ring.a) + 1) }, 3200) }
    const down = (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY }
    const up = (e) => {
      if (x0 == null) return
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0
      x0 = null
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { go(Math.round(ring.a) + (dx < 0 ? 1 : -1)); restart() }
    }
    if (touch) { restart(); el.addEventListener('touchstart', down, { passive: true }); el.addEventListener('touchend', up) }
    ring.go = (dir) => { go(Math.round(ring.a) + dir); if (touch) restart() }
    return () => { ro.disconnect(); tween?.kill(); clearInterval(timer); el.removeEventListener('touchstart', down); el.removeEventListener('touchend', up); ring.els = null }
  }, [])

  return (
    <section id="about" className="relative z-10 h-lvh min-h-[560px] overflow-x-clip bg-gray-100">
      <div ref={sectionRef} className="flex h-svh min-h-[560px] flex-col px-3 pt-[92px] pb-6 sm:px-[30px] sm:pt-[112px] sm:pb-8 lg:pt-[118px]">{/* top room for the floating header */}
        <div ref={headingRef} data-fan-head className="mx-auto flex max-w-[985px] flex-col items-center text-center">
          <Tag dot={false}>Treatments</Tag>
          <h2 id="treatments-heading" className="t-h2 mt-3 max-w-none md:whitespace-nowrap">Choose Your Health Journey</h2>
        </div>

        {/* the ring: every card sits at the centre and layoutRing() moves it into its spot */}
        <ul ref={ringRef} aria-labelledby="treatments-heading" className="relative mt-4 min-h-0 flex-1 [perspective:1600px] [touch-action:pan-y] [mask-image:linear-gradient(to_bottom,transparent,#000_12%,#000_88%,transparent)]">{/* soft top/bottom fade: cards drifting up-left or down-right melt out instead of running over the heading */}
          {cards.map((c) => (
            <li key={c.name} data-ring-card className="pointer-events-none absolute inset-0 flex items-center justify-center will-change-transform">
              <div data-ring-in className="w-[min(460px,80vw,calc((100svh-330px)*1.0))]">
                <a
                  href={links.products}
                  aria-label={`Explore ${c.name}`}
                  className="group relative block aspect-[1/0.8] overflow-hidden rounded-[18px] bg-ink text-white [clip-path:inset(0_round_18px)]"
                >{/* clip-path keeps the corners rounded once the card is turned in 3D (overflow + radius alone get dropped there) */}
                  <Img base={c.image} widths={[600, 1000]} sizes="(min-width: 1024px) 540px, 92vw" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[center_30%] transition-transform duration-700 ease-out group-hover:scale-105" />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  {/* title + description bottom-left, same copy as the hero's treatment cards; title in sentence case */}
                  <span data-ring-text className="relative z-10 flex h-full flex-col justify-end p-5 text-left sm:p-7">
                    <span className="block text-[clamp(20px,2.1vw,28px)] leading-tight font-semibold tracking-[-0.01em]">{sentenceCase(c.name)}</span>
                    <span className="mt-1.5 block max-w-[34ch] text-[13px] leading-snug text-white/90 sm:text-[16px]">{c.tagline}</span>
                  </span>
                </a>
              </div>
            </li>
          ))}
        </ul>

        {/* position dots (+ arrows on touch screens) */}
        <div data-ring-in className="mt-3 flex items-center justify-center gap-4 lg:hidden">
          <button type="button" aria-label="Previous treatment" onClick={() => ring.go?.(-1)} className="flex size-9 items-center justify-center rounded-full border border-ink/15 text-ink">
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10 3.5L5.5 8 10 12.5" /></svg>
          </button>
          <div className="flex items-center gap-2">
            {cards.map((c, i) => <span key={c.name} data-ring-dot data-on={i === 0 ? '1' : '0'} className="h-1.5 w-1.5 rounded-full bg-ink/25 transition-all duration-300 data-[on=1]:w-6 data-[on=1]:bg-navy" />)}
          </div>
          <button type="button" aria-label="Next treatment" onClick={() => ring.go?.(1)} className="flex size-9 items-center justify-center rounded-full border border-ink/15 text-ink">
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 3.5L10.5 8 6 12.5" /></svg>
          </button>
        </div>
      </div>
    </section>
  )
}

/** Medora "Difference": pinned media grows from a small rounded card to full-bleed, then a dark blur layer and centred copy. */
export function Difference() {
  const root = useRef(null)
  useGSAP(() => {
    const q = gsap.utils.selector(root)
    if (reducedMotion()) { gsap.set(q('[data-frame]'), { width: '100%', height: '100%', borderRadius: 0 }); gsap.set(q('[data-blur], [data-text]'), { opacity: 1 }); return }
    const mobile = window.innerWidth < 768
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: '+=160%', pin: true, scrub: true, anticipatePin: 1 } })
    // Phase lengths follow Medora's triggers: grow 846px · overlay 338px · text 423px.
    tl.fromTo(q('[data-frame]'), { width: mobile ? '78%' : '40%', height: mobile ? '42%' : '50%', borderRadius: 16 }, { width: '100%', height: '100%', borderRadius: 0, ease: 'none', duration: 0.53 })
      .fromTo(q('[data-media]'), { scale: 1.25 }, { scale: 1, ease: 'none', duration: 0.53 }, 0)
      .fromTo(q('[data-blur]'), { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.21 }, 0.53)
      .fromTo(q('[data-text] > *'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: 'power1.out', duration: 0.2, stagger: 0.04 }, 0.74)
  }, { scope: root })

  return (
    <section ref={root} id="why" className="relative z-10 flex h-svh min-h-[560px] items-center justify-center overflow-hidden bg-white">
      <div data-frame className="relative h-full w-full overflow-hidden">
        <Img data-media base="/img/medical-review" widths={[900, 1800]} alt="A Paramount HealthRx provider reviewing a patient’s health history, lab results and goals" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[45%_center]" />
        <div data-blur className="absolute inset-0 bg-black/50 opacity-0 backdrop-blur-md" />
        <div data-text className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
          <Tag light dot={false}>Physician-Guided Care</Tag>
          <h2 className="t-h2 mt-4 max-w-[640px]">Real clinicians. Real oversight. Care <br className="hidden md:block" />built around your goals.</h2>
          <p className="t-body mt-4 max-w-[520px] !text-[#d9d9d9]">If appropriate, your information is reviewed by a licensed medical provider — so every recommendation is responsible, personalized and medically grounded.</p>
          <Cta href={links.products} variant="glass" size="lg" className="mt-7">Start Your Assessment</Cta>
        </div>
      </div>
    </section>
  )
}
