import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../option5/index.css'
import { startSmoothScroll } from '../option5/motion.js'
import { Header } from '../option5/sections/Top.jsx'
import { Footer } from '../option5/sections/More.jsx'
import { skipIntro } from '../option5/components/Intro.jsx'
import Products from './Products.jsx'

// Products page option (products-option/): Option 5's header and footer around a rebuilt /products page.
document.documentElement.classList.add('js', 'hdr-light') // the header's solid white style from the start (no dark hero here)
startSmoothScroll()
skipIntro() // no logo intro on this page: let the header come in straight away

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Header />
    <Products />
    <Footer />
  </StrictMode>,
)
