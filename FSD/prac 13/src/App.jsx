import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Footer from './components/Footer.jsx'
import NavBar from './components/NavBar.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import { appConfig } from './config.js'
import Checklist from './pages/Checklist.jsx'
import Guide from './pages/Guide.jsx'
import Home from './pages/Home.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  useEffect(() => {
    document.title = `${appConfig.name} | React on Vercel`
  }, [])

  return (
    <BrowserRouter>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ScrollToTop />
      <div className="app-shell">
        <NavBar />
        <main id="main" className="site-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/checklist" element={<Checklist />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
