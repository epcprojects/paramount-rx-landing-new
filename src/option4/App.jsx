import { Header, Hero } from './sections/Top.jsx'
import { About } from './sections/Story.jsx'
import { BestSelf } from './sections/BestSelf.jsx'
import { BodyMap } from './sections/BodyMap.jsx'
import { SmartChoice, Steps, Pillars, Biology, Faq, Footer } from './sections/More.jsx'
import { Intro } from './components/Intro.jsx'
import { BackToTop } from './components/BackToTop.jsx'

// Page: header → hero (tiles flip away to reveal the treatment cards) → cards → body map → "Be Your Best Self"
// → the live site's remaining sections: Smart Choice, 4 easy steps, Your biology is unique, FAQ, footer.
export default function App() {
  return (
    <>
      {/* Option 3 only: calligraphy write-on, then a circle opens to reveal the hero */}
      <Intro />
      <a href="#main" className="sr-only z-[70] rounded-full bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">Skip to content</a>
      <Header />
      <main id="main">
        {/* Option 3: the hero is a pinned scroll film (HeroFilm) ending on two hands + the treatment cards */}
        {/* Option 4: the hero film plays on top of "Choose Your Health Journey"; at the end the meadow's tiles flip away
            to reveal the cards underneath, which then unfold (both are pinned together — see Top.jsx) */}
        <div id="intro-stage" className="relative">
          <Hero />
          <About />
        </div>
        <BodyMap />
        <BestSelf />
        <SmartChoice />
        <Steps />
        <Pillars />
        <Biology />
        <Faq />
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}
