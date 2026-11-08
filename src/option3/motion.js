// Motion tokens + helpers mirroring Medora's measured behaviour.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export const ease = {
  spring: 'expo.out', // Medora: spring, bounce 0 (long settle)
  image: 'power1.inOut', // Medora: cubic-bezier(.44,0,.56,1)
  ui: 'power2.out',
}

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Medora "appear": every [data-appear] rises 60px and fades in when it reaches 90% of the viewport.
 *  data-appear="0.1" adds a delay (seconds). */
export function appear(scope) {
  const els = gsap.utils.toArray('[data-appear]', scope)
  if (reducedMotion()) { gsap.set(els, { opacity: 1, y: 0 }); return }
  els.forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: 60 }, {
      opacity: 1, y: 0, duration: 1.2, ease: ease.spring, delay: Number(el.dataset.appear) || 0,
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    })
  })
}

export { gsap, ScrollTrigger, useGSAP }
