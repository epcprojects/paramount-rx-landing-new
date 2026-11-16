import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { startSmoothScroll } from './motion.js'

document.documentElement.classList.add('js')
startSmoothScroll() // page-wide smooth wheel scrolling (see motion.js)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
