// Homepage copy mapped onto Medora's section structure.
// Source of truth: paramounthealthrx.com (home, /products, /how-it-works, /faqs). Lightly rewritten to fit; meaning unchanged.

const SITE = 'https://www.paramounthealthrx.com'

export const links = {
  products: `${SITE}/products`, // hosts the "Choose a Health Journey" assessment modal
  howItWorks: `${SITE}/how-it-works`,
  faqs: `${SITE}/faqs`,
  privacy: `${SITE}/privacy-policy`,
  consumerData: `${SITE}/consumer-data-policy`,
  portal: 'https://portal.paramounthealthrx.com/patient/login',
  email: 'mailto:support@paramounthealthrx.com',
  phone: 'tel:+18887063905',
}

export const menu = [
  { label: 'Home', href: '#top' },
  { label: 'Treatments', href: links.products },
  { label: 'Why Paramount', href: '#why' },
  { label: 'How it Works', href: links.howItWorks },
  { label: 'Products', href: links.products },
  { label: 'FAQ', href: links.faqs },
  { label: 'Patient Login', href: links.portal },
]

// Medora "logo marquee" → Paramount credentials.
export const credentials = ['Licensed Providers', 'U.S. Pharmacies', 'Real Labs', 'Discreet Delivery', 'No Mandatory Membership', 'Physician-Guided']

// Medora "Services" → categories from /products.
export const treatments = [
  { name: 'Testosterone', body: 'Optimize your hormones and reclaim your edge with provider-guided testosterone support — capsules, troches, creams and injectable options.', image: '/img/t-testosterone' },
  { name: 'Weight Loss', body: 'Physician-guided programs with semaglutide and tirzepatide options. Real support toward sustainable, lasting results.', image: '/img/t-weight-loss' },
  { name: 'Sexual Wellness', body: 'Confidence, performance and intimacy — prescription options such as sildenafil, tadalafil and PT-141 after a provider review.', image: '/img/t-sexual-health' },
  { name: 'Peptides & Longevity', body: 'Science-backed compounds like NAD+, sermorelin and glutathione to support healing, body composition and longevity.', image: '/img/t-peptides' },
  { name: 'Hair Loss', body: 'Stronger hair, greater confidence — oral and topical minoxidil and finasteride formulations prescribed for your goals.', image: '/img/t-hair-loss' },
]

export const featureCards = [
  { title: 'Individualized Protocols', body: 'Care begins with your health history, goals, and a licensed provider’s clinical evaluation.', icon: 'protocol' },
  { title: 'Real Labs, Real Doctors', body: 'Hormones and many peptides require lab work to ensure safety and efficacy — reviewed by licensed providers.', icon: 'lab' },
  { title: 'Licensed Pharmacies', body: 'Every treatment is prescribed by licensed providers, compounded by licensed pharmacies and fulfilled in the U.S.', icon: 'pharmacy' },
]

// Medora "Results" rows. 95% and 92% are shown on the live homepage; 54 = products listed on /products.
export const resultRows = [
  { label: 'Patients reporting a simple, convenient experience', value: 95, suffix: '%' },
  { label: 'Care plans personalized to your biology', value: 100, suffix: '%' },
  { label: 'Treatments available through our providers', value: 54, suffix: '+' },
]
export const patientResult = { value: 92, suffix: '%', text: 'of patients stay engaged with their recommended care plan.' }

export const benefits = ['Private by design — no clinic visits', 'No waiting, no friction', 'Continuous monitoring & refinement', 'Discreet delivery to your door']

// Medora "Blog" → product families from the live homepage.
export const products = [
  { name: 'Peptides', meta: 'Longevity & recovery', body: 'Advanced compounds designed to accelerate healing, improve body composition, and support longevity.', image: '/img/product-vial-200.webp' },
  { name: 'Hormones', meta: 'Medically supervised', body: 'Precision-dosed testosterone, estrogen, progesterone, and more — medically supervised.', image: '/img/product-cream-200.webp' },
  { name: 'Vitamins', meta: 'Pharmaceutical-grade', body: 'Pharmaceutical-grade micronutrients, not store-bought fillers.', image: '/img/product-capsule-200.webp' },
]

// Medora "Testimonials" carousel → the six real steps from /how-it-works (no invented reviews).
export const steps = [
  { title: 'Create your account', kicker: 'Fast. Secure. Straightforward.', body: 'Start by creating your Paramount HealthRx account. The process is simple and designed to take minutes — not days.', image: '/img/step-assessment' },
  { title: 'Complete your intake', kicker: 'Context creates precision.', body: 'Share your health background, lifestyle, optimization priorities and relevant medical history. No one-size-fits-all protocols.', image: '/img/step-assessment' },
  { title: 'Provider review', kicker: 'Real clinicians. Real oversight.', body: 'If appropriate, your information is reviewed by a licensed medical provider experienced in modern optimization care.', image: '/img/step-review' },
  { title: 'Your personalized plan', kicker: 'Clarity over complexity.', body: 'Receive a tailored care pathway aligned with your goals and baseline — presented clearly, without jargon.', image: '/img/step-plan' },
  { title: 'Discreet delivery', kicker: 'No pharmacy lines.', body: 'Once approved, your products are shipped directly to you in discreet packaging.', image: '/img/step-delivery' },
  { title: 'Optimize & evolve', kicker: 'Your baseline, upgraded.', body: 'Adjust protocols, stay consistent and level up intentionally as your goals evolve.', image: '/img/medical-review' },
]

export const faqs = [
  { q: 'Is this legal?', a: 'Yes. All treatments are prescribed by licensed providers and fulfilled by U.S. pharmacies.' },
  { q: 'Do I need labs?', a: 'Yes. Hormones and many peptides require lab work to ensure safety and efficacy.' },
  { q: 'Is there a membership?', a: 'No mandatory membership. Pay only for what you need.' },
  { q: 'Is this discreet?', a: 'Absolutely. All shipments are discreet and confidential.' },
]
