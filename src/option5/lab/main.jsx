import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import CardsLab from './CardsLab.jsx'
import { startSmoothScroll } from '../motion.js'

// Hero Section Options page (option-5/hero-section-options.html): layout + animation options for the "Choose Your Health Journey" cards.
document.documentElement.classList.add('js')
startSmoothScroll()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CardsLab />
  </StrictMode>,
)
