import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import AdminGuard from './components/auth/AdminGuard'

import Dashboard   from './pages/Dashboard'
import Zones       from './pages/Zones'
import Species     from './pages/Species'
import Family      from './pages/Family'
import Articles    from './pages/Articles'
import Profile     from './pages/Profile'
import VerifyEmail from './pages/VerifyEmail'
import Layout          from './components/Layout'
import { ModalRenderer } from './components/modals/ModalRenderer'

// AdminGeneratorHub = galería + modal especie + generador simplificado (v5.4)
const AdminGeneratorHub = lazy(() => import('./pages/AdminGeneratorHub'))

// Scroll to top on page navigation — EXCEPTO rutas de modal.
// Las rutas de modal (con segundo segmento) son /zonas/:id, /especies/:id,
// /familia/:slug, /micologia/:slug. Abrir un modal no debe resetear el scroll:
// la página de fondo debe mantenerse exactamente donde estaba.
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    const segments = pathname.split('/').filter(Boolean)
    const isModalRoute = segments.length > 1  // tiene slug → es una ruta de detalle/modal
    if (!isModalRoute) window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
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
          <Route path="familia/:slug"   element={<Family />} />
          <Route path="micologia"       element={<Articles />} />
          <Route path="micologia/:slug" element={<Articles />} />
          <Route path="perfil"          element={<Profile />} />
          <Route path="verificar-email" element={<VerifyEmail />} />
          {/* /admin/generator = hub galería-first (v5.4): galería → modal → generador */}
          <Route path="admin/generator" element={
            <AdminGuard>
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#4a7c59] border-t-transparent rounded-full animate-spin" /></div>}>
                <AdminGeneratorHub />
              </Suspense>
            </AdminGuard>
          } />
          {/* /admin/gallery → redirige al hub unificado */}
          <Route path="admin/gallery" element={<Navigate to="/admin/generator" replace />} />
          <Route path="*"               element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  )
}
