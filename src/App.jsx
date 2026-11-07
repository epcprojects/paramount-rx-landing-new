import { Header, Hero } from './sections/Top.jsx'
import { About } from './sections/Story.jsx'
import { BestSelf } from './sections/BestSelf.jsx'
import { BodyMap } from './sections/BodyMap.jsx'
import { SmartChoice, Steps, Biology, Faq, Footer } from './sections/More.jsx'

// Page: header → hero (tiles flip away to reveal the treatment cards) → cards → body map → "Be Your Best Self"
// → the live site's remaining sections: Smart Choice, 4 easy steps, Your biology is unique, FAQ, footer.
export default function App() {
  return (
    <>
      <a href="#main" className="sr-only z-[70] rounded-full bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">Skip to content</a>
      <Header />
      <main id="main">
        {/* Hero is an overlay on top of the treatment cards; the stage is pinned while the hero's tiles flip away to reveal it. */}
        <div id="intro-stage" className="relative">
          <Hero />
          <About />
        </div>
        <BodyMap />
        <BestSelf />
        <SmartChoice />
        <Steps />
        <Biology />
        <Faq />
      </main>
      <Footer />
    </>
  )
}
