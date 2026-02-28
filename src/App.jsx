import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

import Dashboard  from './pages/Dashboard'
import Zones      from './pages/Zones'
import Species    from './pages/Species'
import Micologia  from './pages/Micologia'
import Profile    from './pages/Profile'
import Layout     from './components/Layout'
import { ModalRenderer } from './components/modals/ModalRenderer'

// Scroll to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <ModalRenderer />
      <Routes>
        <Route element={<Layout />}>
          <Route index                  element={<Dashboard />} />
          <Route path="zonas"           element={<Zones />} />
          <Route path="zonas/:id"       element={<Zones />} />
          <Route path="especies"        element={<Species />} />
          <Route path="especies/:id"    element={<Species />} />
          <Route path="micologia"       element={<Micologia />} />
          <Route path="micologia/:slug" element={<Micologia />} />
          <Route path="perfil"          element={<Profile />} />
          <Route path="*"               element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  )
}
