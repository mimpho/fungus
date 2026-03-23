/**
 * AdminGeneratorHub — punto de entrada único para /admin/generator (v5.4).
 *
 * Modo galería (por defecto):
 *   /admin/generator             → AdminGallery con buscador + filtros
 *   /admin/generator?especie=XXX → AdminGallery + SpeciesAdminModal para esa especie
 *
 * Modo generador (simplificado):
 *   /admin/generator?especie=XXX&generar=1 → ImageGenerator (sidebar simplificado)
 *
 * Navegación:
 *   GalleryCard click   → setSearchParams({ ...prev, especie: id })       [replace]
 *   SpeciesModal close  → setSearchParams({ ...prev, sin especie })        [replace]
 *   "Generar imagen"    → setSearchParams({ especie: id, generar: '1' })   [push]
 *   Botón "← Galería"  → navigate(-1) o remove generar param              [en generator]
 */

import { lazy, Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import AdminGallery from './AdminGallery'
import SpeciesAdminModal from '../components/admin/SpeciesAdminModal'
import { useSpecies } from '../hooks/useSpecies'

const ImageGenerator = lazy(() => import('../components/admin/ImageGenerator'))

const Spinner = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[#4a7c59] border-t-transparent rounded-full animate-spin" />
  </div>
)

export default function AdminGeneratorHub() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { species } = useSpecies()

  const especieId   = searchParams.get('especie')
  const generarMode = searchParams.get('generar') === '1'

  // ── Modo generador ────────────────────────────────────────────────────────
  if (generarMode && especieId) {
    return (
      <Suspense fallback={<Spinner />}>
        <ImageGenerator />
      </Suspense>
    )
  }

  // ── Modo galería ──────────────────────────────────────────────────────────
  const activeSpecies = especieId
    ? species.find(s => s.id === especieId) ?? null
    : null

  const handleOpen = (s) => {
    setSearchParams(
      prev => { const p = new URLSearchParams(prev); p.set('especie', s.id); return p },
      { replace: true }
    )
  }

  const handleClose = () => {
    setSearchParams(
      prev => { const p = new URLSearchParams(prev); p.delete('especie'); return p },
      { replace: true }
    )
  }

  const handleGenerate = (id) => {
    // Push so the back button returns to the gallery
    setSearchParams({ especie: id, generar: '1' })
  }

  return (
    <>
      <AdminGallery onOpen={handleOpen} />

      {activeSpecies && (
        <SpeciesAdminModal
          species={activeSpecies}
          onClose={handleClose}
          onGenerate={handleGenerate}
        />
      )}
    </>
  )
}
