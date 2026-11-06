import { useRef } from 'react'
import { gsap, useGSAP, ScrollTrigger, reducedMotion } from '../motion.js'
import { links } from '../content.js'
import { Cta, Tag, Img } from '../components/ui.jsx'
import { IconTestosterone, IconPeptides, IconSexualHealth, IconWeightLoss, IconHairLoss, IconPerformance } from '../components/TreatmentIcons.jsx'

const cards = [
  { name: 'Testosterone', tagline: 'Optimize your hormones. Reclaim your edge.', image: '/img/card-testosterone-500.webp', Icon: IconTestosterone },
  { name: 'Peptides & Longevity', tagline: 'Science-backed solutions for a longer, healthier life.', image: '/img/card-peptides-500.webp', Icon: IconPeptides },
  { name: 'Sexual Health', tagline: 'Confidence. Performance. Intimacy.', image: '/img/card-sexual-health-500.webp', Icon: IconSexualHealth },
  { name: 'Weight Loss', tagline: 'Sustainable results. A healthier, lighter you.', image: '/img/card-weight-loss-500.webp', Icon: IconWeightLoss },
  { name: 'Hair Loss', tagline: 'Stronger hair. Greater confidence.', image: '/img/card-hair-loss-500.webp', Icon: IconHairLoss },
  { name: 'Performance Enhancers', tagline: 'More energy, more strength, more you.', image: '/img/card-performance-500.webp', Icon: IconPerformance },
]

/** Treatment cards revealed under the hero tiles, unfolding from edge-on. */
export function About() {
  // The cards' unfold lives in the hero's pinned timeline (Top.jsx), so the page holds until they're all flat.
  return (
    <section id="about" className="relative z-10 flex h-svh min-h-[560px] items-center overflow-x-clip bg-gray-100 px-5 py-10 sm:px-[30px] sm:py-14">
      <div className="relative z-10 w-full">
        {/* Heading — wording from the live site's "Choose a Health Journey" treatment picker */}
        <div data-fan-head className="mx-auto mb-8 flex max-w-[985px] flex-col items-center text-center sm:mb-14">
          <Tag dot={false}>Treatments</Tag>
          <h2 id="treatments-heading" className="t-h2 mt-3 max-w-[640px]">Choose your health journey</h2>
        </div>
        {/* Treatment cards — same art, icons and copy as the live paramounthealthrx.com cards (3 × 2).
            Width is capped by the viewport height so the heading and both rows (three on phones) fit on one screen. */}
        <ul data-fanwrap className="mx-auto grid w-full max-w-[min(985px,calc((100svh-250px)*0.68))] grid-cols-2 gap-3 [perspective:1200px] sm:gap-5 md:max-w-[min(985px,calc((100svh-290px)*1.53+40px))] md:grid-cols-3" aria-labelledby="treatments-heading">
          {cards.map((c, i) => (
            <li key={c.name} data-fan data-col={i % 3} data-row={Math.floor(i / 3)} className="will-change-transform">
              <a
                href={links.products}
                aria-label={`Explore ${c.name}`}
                className="group relative block aspect-[259/254] overflow-hidden rounded-[22px] border-2 border-white/50 text-left text-white shadow-[0_18px_40px_-24px_rgba(10,26,47,0.55)]"
              >
                <div aria-hidden className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 ease-out group-hover:scale-105" style={{ backgroundImage: `url(${c.image})` }} />
                <div className="relative z-10 flex h-full flex-col items-start justify-between p-4 sm:p-5">
                  <span className="flex size-12 items-center justify-center rounded-full border border-white/30 bg-black/50 backdrop-blur-[52px] transition-colors duration-300 group-hover:bg-sky sm:size-[54px]">
                    <c.Icon />
                  </span>
                  <span className="block w-full">
                    <span className="block text-[18px] leading-tight font-semibold tracking-[-0.01em] sm:text-[22px]">{c.name}</span>
                    <span className="mt-1.5 flex items-end justify-between gap-3">
                      <span className="text-[13px] leading-snug text-white/90 sm:text-[15px]">{c.tagline}</span>
                      <svg viewBox="0 0 16 16" className="mb-0.5 h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 3.5L10.5 8 6 12.5" /></svg>
                    </span>
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
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
