import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP, reducedMotion } from '../motion.js'
import { links } from '../content.js'
import { Cta, Tag, Img } from '../components/ui.jsx'
import { IconTestosterone, IconPeptides, IconSexualHealth, IconWeightLoss, IconHairLoss, IconPerformance } from '../components/TreatmentIcons.jsx'

export const cards = [
  { name: 'Testosterone', tagline: 'Optimize your hormones. Reclaim your edge.', image: '/img/card-testosterone-500.webp', photo: '/img/opt5-card-testosterone', Icon: IconTestosterone },
  { name: 'Peptides & Longevity', tagline: 'Science-backed solutions for a longer, healthier life.', image: '/img/card-peptides-500.webp', photo: '/img/opt5-card-peptides', Icon: IconPeptides },
  { name: 'Sexual Health', tagline: 'Confidence. Performance. Intimacy.', image: '/img/card-sexual-health-500.webp', photo: '/img/opt5-card-sexual-health', Icon: IconSexualHealth },
  { name: 'Weight Loss', tagline: 'Sustainable results. A healthier, lighter you.', image: '/img/card-weight-loss-500.webp', photo: '/img/opt5-card-weight-loss', Icon: IconWeightLoss },
  { name: 'Hair Loss', tagline: 'Stronger hair. Greater confidence.', image: '/img/card-hair-loss-500.webp', photo: '/img/opt5-card-hair-loss', Icon: IconHairLoss },
  { name: 'Performance Enhancers', tagline: 'More energy, more strength, more you.', image: '/img/card-performance-500.webp', photo: '/img/opt5-card-performance', Icon: IconPerformance },
]

/** Option 5: the treatments as a horizontal reel (Concept H from the Hero Section Options page) — big tall cards on
 *  a strip. Desktop: the hero's pinned timeline (Top.jsx) brings the cards in, then slides the reel sideways as you
 *  scroll, with each photo drifting inside its card. Touch screens: the strip is a swipeable row. */
export function About() {
  const [touch, setTouch] = useState(false)
  useEffect(() => { setTouch(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024) }, [])

  return (
    <section id="about" className="relative z-10 h-lvh min-h-[560px] overflow-x-clip bg-gray-100">{/* full large-viewport height (browser bar hidden) so nothing below peeks in */}
      <div className="flex h-svh min-h-[560px] flex-col justify-center pt-[92px] pb-6 sm:pt-[112px] sm:pb-8 lg:pt-[118px]">{/* top room for the floating header */}
        <div data-fan-head className="mb-10 px-5 sm:mb-14 sm:px-[8vw] lg:mb-20">
          <Tag dot={false}>Treatments</Tag>
          <h2 id="treatments-heading" className="t-h2 mt-3">Choose Your Health Journey</h2>
        </div>
        <div className={touch ? 'no-scrollbar -my-8 snap-x snap-mandatory overflow-x-auto overscroll-x-contain py-8' : ''}>
          <ul data-reel-track aria-labelledby="treatments-heading" className="flex w-max items-center gap-4 px-5 will-change-transform sm:gap-6 sm:px-[8vw]">
            {cards.map((c) => (
              <li key={c.name} data-reel-card className="w-[min(380px,76vw)] shrink-0 snap-center sm:w-[min(380px,46vw)] lg:w-[min(380px,74vw)]">
                <a href={links.products} aria-label={`Explore ${c.name}`} className="group relative block h-[min(480px,calc(100svh-360px))] min-h-[340px] sm:h-[min(560px,calc(100svh-400px))] lg:h-[min(520px,calc(100svh-330px))] overflow-hidden rounded-[30px] text-white shadow-[0_30px_60px_-30px_rgba(10,26,47,0.55)]">
                  <Img data-reel-img base={c.photo} widths={[600, 1000]} sizes="(min-width: 640px) 380px, 76vw" alt="" loading="lazy" className="absolute top-[-12%] left-[-12%] h-[124%] w-[124%] max-w-none object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105" />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />
                  <span className="absolute top-5 right-5 flex size-12 items-center justify-center rounded-full border border-white/30 bg-black/40 backdrop-blur-md transition-colors duration-300 group-hover:bg-sky"><c.Icon /></span>
                  <span className="absolute inset-x-6 bottom-6 flex flex-col items-start gap-2">
                    <span className="text-[24px] leading-tight font-semibold sm:text-[26px]">{c.name}</span>
                    <span className="max-w-[30ch] text-[14px] leading-snug text-white/85 sm:text-[15px]">{c.tagline}</span>
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-ink transition-colors duration-300 group-hover:bg-sky group-hover:text-white">
                      Explore
                      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 3.5L10.5 8 6 12.5" /></svg>
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
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
