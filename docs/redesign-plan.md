# Paramount HealthRx — Homepage Redesign Plan

> **Current build (v2):** per the latest direction, the homepage now follows medora.framer.ai section-for-section, with Paramount content and images. Farm Minerals elements (left slide-in menu, liquid section) were removed; the liquid effect is kept in `archive/`.
>
> | Medora section | Paramount version | Medora behaviour reproduced (measured) |
> |---|---|---|
> | Header | Dark bar, logo, round menu button + dropdown panel | burger → X, panel drops under bar |
> | Hero | "Modern Medicine, *Personalized* & Delivered" + "Peak performance isn't accidental…" | image 1.2→1 / 1.5s; copy rises 400px spring 1.8s; sticky curtain + 0.15× parallax |
> | Overlap Detailing | same | 5 white columns (15/20/25/25/15%) rise 21.6/29.9/53.5/29.9/17.2 vh |
> | Logo strip | Credentials marquee | infinite marquee |
> | Who we are | "This isn't wellness…" | word fill grey→black on scroll; 3 photos unfold from edge-on |
> | Services | 5 treatment categories from /products | click accordion; image wipes top→down |
> | Difference | Provider-review image + "Real clinicians. Real oversight." | pinned: grow 40%→100% · blur overlay · text (846/338/423 px phases) |
> | Features | Why Paramount + 95% badge + 3 cards | image enters from x−200/y+200, scroll-smoothed |
> | Results | 95% / 100% / 54+ rows + 92% patient result | counters, image scale |
> | Core Benefits | 4 benefits + avatar strip | appear |
> | Blog | Peptides / Hormones / Vitamins | appear, hover zoom |
> | Testimonials | The 6 real steps (no invented reviews) | autoplay carousel with dots |
> | FAQ | 4 real FAQs | single-open accordion |
> | CTA band | "No gimmicks. No guesswork…" | parallax photo |
> | Footer | Real links, contact, policies + wordmark | overlap skyline again |
>
> Colour swaps: Medora lime → Paramount sky `#3AB5FE`; warm card `#F3F1EB` → cool `#F1F3F6`. Fonts match Medora (Inter Display + Gentium Plus italic).

Audit date: 2026-11-06. Everything marked **Verified** was measured in a live browser (computed styles, DOM, the sites' own animation configs or scripts). **Observed** means seen on screen while scrolling but not measured. **Unverified** means it could not be inspected and is not claimed as reproduced. **Proposed** means it is our own design, not taken from a reference.

---

## Phase 1 — Reference audit

### Medora (medora.framer.ai) — main reference

| Area | Finding | Status |
|---|---|---|
| Platform | Framer site; appear animations stored as JSON in a `framer/appear` script | Verified |
| Type | Headings in **Inter Display 400**, hero 52px / line-height 1.1 / tracking −0.04em; one word set in **Gentium Plus italic** ("Built *Around People*"); section titles 36px / 500 / −0.03em; eyebrow labels 16px with a small lime dot | Verified |
| Colour | White page, black text, single lime accent `#C0F85F` used only for CTAs and dots; warm, moody photography carries the colour | Verified |
| Header | Fixed 78px bar, transparent; logo left, a single circular menu button right; menu opens as a dark rounded dropdown panel under the bar, icon morphs burger → X | Verified (layout, icon morph); dropdown timing **Unverified** |
| Hero | Full-bleed photo; photo scales **1.2 → 1 over 1.5s, ease (0.44, 0, 0.56, 1)**; copy block rises **y 400 → 0, opacity 0 → 1, spring, 1.8s, bounce 0, delay 0.1s**; pill tag, two-line H1, side paragraph, CTA pill with arrow chip (`4px 4px 4px 16px` padding, 30px radius, 46px tall) | Verified |
| Hero → content | Hero sits in a sticky layer; white content slides up over it like a curtain; hero background drifts at ~0.15× scroll | Verified |
| Intro ("Who we are") | Large paragraph whose words fill from grey to black with scroll progress | Observed |
| Image fan | Three portrait photos that start rotated in 3D and settle flat as they enter | Observed; mobile stacks them vertically with a smaller tilt (Observed) |
| Services | Left: accordion list (title + description expands on **click**). Right: image panel; the new image **wipes down from the top** over the old one (~0.6s) | Verified (click behaviour, wipe direction); exact duration **Observed** |
| Feature photo | Sticky full-bleed photo grows from a small rounded card (~45% width) to full viewport as you scroll, then darkens/blurs while a centred headline + CTA fade in | Verified |
| Diagonal reveal | Large image enters from x −200 / y +200, opacity 0 → 1, scroll-linked with smoothing | Verified |
| Benefit cards | Stacked soft-grey cards (icon, title, one line) under a large photo with a rating badge | Observed |
| Results | Rows "Consultations completed … 248K+" with counting numbers, then a large photo + "97%" | Observed (counter easing **Unverified**) |
| Testimonials | Two-card carousel: photo card + quote card, dot pagination | Observed |
| FAQ | Big light-weight question rows, circular + icon, single-open accordion, image on the left | Observed |
| Final CTA / footer | Full-bleed photo with centred statement; footer with large outlined wordmark | Observed |

### Farm Minerals (farmminerals.com/promo) — secondary reference

| Area | Finding | Status |
|---|---|---|
| Platform | Webflow + **GSAP, ScrollTrigger, SplitText, Lenis** smooth scroll, Splide carousel | Verified |
| Header | Three-part bar: tiny uppercase **MENU** left, centred logo, **CONTACT US** right, transparent over the hero | Verified |
| Menu | Left panel (~45% width) slides in over the page, large menu links, small contact line at the bottom, "CLOSE" label | Verified (layout); easing/duration **Unverified** (Webflow IX) |
| Hero | Huge product wordmark, thin rule, small uppercase meta text, centred 3D tablet | Verified |
| Hero exit | Five cream columns rise in a staggered "blinds" wipe over the hero | Observed |
| Tablet → water | **Pre-rendered CG image sequence (~120 AVIF frames) drawn to a sticky full-screen canvas, scrubbed by ScrollTrigger (`scrub: 1`, start `top top`, end `bottom bottom`) over a ~2,950px section.** The tablet rotates, drops, splashes and sinks with bubbles while feature callouts appear left/right | Verified |
| Text reveals | SplitText characters `autoAlpha 0 → 1`, **0.4s, power2.out, stagger 0.02 from random**, triggered at `top 90%` | Verified |
| Plant interaction | Click-driven frame sequence ("grow" button advances frames) | Verified (not used) |

### Paramount HealthRx (paramounthealthrx.com) — current site

- **Stack:** Next.js (client-rendered pages), Tailwind, Radix accordion, Headless UI menu. **Not in this workspace** — this folder only holds the Vite + React + Tailwind prototype. The redesign is built here; the production Next.js code will need to be ported (see Phase 4 notes).
- **Routes:** `/`, `/how-it-works`, `/faqs`, `/products` (54 products, client-side category filter), `/privacy-policy`, `/consumer-data-policy`, patient portal `https://portal.paramounthealthrx.com/patient/login`. Header also has a "Consult List" (cart) button.
- **Conversion flow:** "Start Your Assessment" / "Explore Treatments" are JS buttons that open a **"How would you like to get started? Choose a Health Journey"** modal (Testosterone, Peptides & Longevity, Sexual Health, Hair Loss, …). The prototype links to `/products`, where that modal lives.
- **Verified copy used:** hero ("Personalized Care for a Stronger You.", "Evidence-based treatment, provider-guided care…"), title "Modern Medicine. Personalized. Delivered.", products headline "Peak performance isn't accidental. It's engineered.", banner "No gimmicks. No guesswork. Just precision health, made accessible.", "This isn't wellness. This is medicine—done right.", the four differentiators, Peptides / Hormones / Vitamins blurbs, the **6-step journey from /how-it-works**, "Private By Design", "No Waiting. No Friction.", "Designed For Clarity.", the 4 FAQs, footer tagline + contact details.
- **Categories on /products:** Hair Loss, Hormones, Peptides, Performance Enhancer, Sexual Wellness, Testosterone, Weight Loss. **"General Health" does not exist — not shown.** "Vitamins" exists only as a homepage blurb and a B12 product, so it appears in copy, not as a category tab.
- **Statistics on the live homepage:** 95% (simple, convenient experience), 100% (personalized), 92% (stay engaged) — values read from the site's JS bundle. Kept because they are on the live site; **please confirm their source** before launch.
- **Not found:** testimonials, star ratings, eligibility/state rules, separate legal disclaimers. → Testimonials section **omitted** (no fabricated reviews). No eligibility rules invented.

### Design-language comparison

| | Medora | Farm Minerals | Paramount (today) |
|---|---|---|---|
| Mood | Calm, editorial, warm photography, lots of white | Bold, cinematic, product-hero | Bright lifestyle, card-heavy |
| Type | Light display sans + one italic serif accent | Huge grotesk wordmark, micro uppercase meta | Manrope, mid weights |
| Motion | Soft long springs, scroll-linked image scale/reveal, sticky storytelling | Scrubbed frame sequences, SplitText, smooth scroll | Simple counters, hover |
| Colour | White + black + one accent | Olive + cream | Navy `#104584` + sky `#3AB5FE` |

---

## Phase 2 — Homepage architecture

Brand system (Proposed): white / cool off-white `#F4F6F9` page, ink `#0A1A2F`, Paramount navy `#104584` for deep sections, sky `#3AB5FE` as the single CTA accent (the role lime plays on Medora). **Manrope** (current brand font) for all text, light 400 at display sizes with tight tracking; **Instrument Serif italic** for one accent word per heading (Medora's principle, our own pairing).

| # | Section | Paramount content | Layout / motion pattern | Source |
|---|---|---|---|---|
| 01 | Header + Hero | Logo, Treatments / How it Works / FAQ, Login, Start Assessment; "Modern medicine. *Personalized.* Delivered." + "Peak performance isn't accidental. It's engineered." | Farm three-part header + left slide-in menu; Medora full-bleed hero with 1.2→1 image scale, rising copy, sticky curtain | Farm (header/menu), Medora (hero) |
| 02 | Brand introduction | "This isn't wellness. This is medicine—*done right.*" + integrated-care line | Word-by-word scroll fill + 3-image 3D fan | Medora |
| 03 | Explore Treatments | Testosterone, Weight Loss, Sexual Wellness, Peptides & Longevity, Hair Loss, Hormones — taglines, real formats/products from /products | Click accordion + top-down image wipe; mobile: image inside open panel | Medora |
| 04 | Why Paramount | 4 differentiators | Sticky photo grows to full-bleed, darkens, headline appears; pillar cards stagger in | Medora |
| 05 | How It Works | 6 verified steps from /how-it-works | Sticky image panel + step list, active step on scroll, progress rail, step counter; mobile: stacked cards | Medora-inspired (Proposed sequencing) |
| 06 | Signature liquid | Abstract "precision drop" → ripples → "Measured. *Personal.* Physician-guided." | Pinned, scroll-scrubbed WebGL water surface | Farm-inspired (Proposed) |
| 07 | Benefits & results | 95% / 100% / 92% (live-site claims) + Private by Design, No Waiting, Designed for Clarity | Medora results rows with counters + large photo | Medora |
| 08 | Safety & medical trust | Provider review "if appropriate", labs, licensed pharmacies, U.S. fulfilment, discreet shipping, monitoring | Calm navy section, numbered list reveal | Proposed |
| 09 | Testimonials | **None verified → omitted** | — | — |
| 10 | FAQ + final CTA + footer | 4 real FAQs; "No gimmicks. No guesswork. *Just precision health.*"; real footer links/contact | Medora accordion + full-bleed CTA; outlined wordmark footer | Medora |

### Signature interaction — medical-accuracy decision
Farm Minerals' tablet dissolves in water because that is its real use. Paramount's products are injectables, troches, capsules, creams and patches, none of which is meant to be dropped in water. So **no product is shown entering liquid.** Instead: a single clear droplet (an abstract "precise dose" metaphor, not a product) falls onto a still liquid surface viewed from above. On impact, ripples spread and refract the words beneath the surface; as the water settles, the message becomes readable. Nothing implies a product dissolves in drinking water.

---

## Phase 3 — Motion specification

### Tokens (`src/motion.js`)
| Token | Value | Use |
|---|---|---|
| `ease.out` | `expo.out` ≈ cubic-bezier(0.16, 1, 0.3, 1) | entrances (Medora's bounce-0 springs) |
| `ease.inOut` | cubic-bezier(0.44, 0, 0.56, 1) (`power1.inOut` in GSAP) | image scale (Medora verified) |
| `ease.ui` | `power2.out` | hovers, accordions, menu |
| `dur` | xs 0.2 · sm 0.4 · md 0.8 · lg 1.2 · xl 1.6 s | |
| `distance` | sm 24 · md 48 · lg 120 px | |
| `stagger` | words 0.06 · items 0.1 · lines 0.12 s | |
| `scrub` | 0.6 (sections) · 1 (signature) | ScrollTrigger smoothing |

### Interactions
| Interaction | Trigger | Animation | Mobile / reduced motion |
|---|---|---|---|
| Header state | scroll > 40px | transparent → white bar with blur, 0.4s | same |
| Menu | click MENU | panel `xPercent −100 → 0` 0.8s expo.out; links rise y 48 → 0, stagger 0.06; backdrop fades; Esc / backdrop click closes; focus trapped | full-width panel / instant |
| Hero load | page load | image scale 1.2 → 1, 1.5s inOut; lines rise y 120 → 0 + fade, 1.2s expo.out, stagger 0.12 | same / static |
| Hero curtain | scroll | hero `position: sticky`, image y +15% parallax, copy fades out | same / no parallax |
| Intro fill | scroll (scrub) | word opacity 0.15 → 1 across the paragraph | same / full opacity |
| Image fan | enter viewport (scrub) | rotateY ±28°, rotateZ ±6°, y 80 → flat | smaller angles / flat |
| Treatments | click item | panel height auto 0.5s power2.out; new image `clip-path inset(0 0 100% 0) → inset(0)` 0.7s expo.out + scale 1.08 → 1 | image inside panel / instant |
| Why photo | scroll (pinned 150%) | width 46% → 100%, radius 24 → 0, overlay 0 → 0.55, headline fades in at 60% | no pin: static full photo |
| How it works | scroll | sticky image panel; active step from scroll position; image crossfade 0.6s; progress rail scaleY; counter 01→06 | stacked cards, no sticky |
| Signature liquid | scroll (pinned 220%, scrub 1) | 0–28% drop falls · 28% impact flash + crown ring · 28–85% ripples spread and decay · 55–85% copy settles · 85–100% calm | shorter pin, DPR 1 / static calm frame + CSS rings, no WebGL |
| Counters | enter viewport | 0 → value, 1.6s power3.out | instant value |
| Section reveals | enter at 85% | y 48 → 0, opacity, 0.8s expo.out, stagger 0.1 | opacity only |
| FAQ | click | height auto 0.45s power2.out, icon rotates 45° | same |
| Buttons | hover | arrow chip rotates −45° and fills; background lightens 0.3s | — |

No scroll-jacking: native scroll everywhere (no Lenis); pinned sections use ScrollTrigger pins with normal scroll speed.

---

## Phase 4 — Implementation notes
- Built in this Vite + React 19 + Tailwind 4 prototype with **GSAP 3 + ScrollTrigger** (and `@gsap/react`'s `useGSAP` for cleanup). The signature section uses raw WebGL (one fragment shader) — no Three.js needed.
- Images are resized and converted to WebP (`npm run images`) from `source-images/`.
- Links point to the live routes on paramounthealthrx.com so the real assessment modal, products, portal and policies keep working.
- **Porting to production (Next.js):** each section is a self-contained client component (`'use client'`), animations are scoped with `useGSAP` and reverted on unmount, and nothing reads `window` during render, so the components can move into the Next.js app without hydration issues.
