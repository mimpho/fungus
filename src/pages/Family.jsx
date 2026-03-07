import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { mockFamilies } from '../data/families' // MOCK PERMANENTE — sin endpoint de familias planificado (v4.5)
import { slugify } from '../lib/helpers'
// La página de familia muestra el catálogo de especies como fondo
// y el ModalRenderer se encarga de abrir el FamilyModal encima.
import Species from './Species'

export default function Family() {
  const { slug } = useParams()
  const { setSelectedFamily } = useApp()

  useEffect(() => {
    if (slug) {
      // mockFamilies está indexado por nombre ('Boletaceae', etc.)
      const familyKey = Object.keys(mockFamilies).find(k => slugify(k) === slug)
      setSelectedFamily(familyKey ? mockFamilies[familyKey] : null)
    } else {
      setSelectedFamily(null)
    }
    return () => setSelectedFamily(null)
  }, [slug])

  // El catálogo de especies es el fondo natural para la ficha de familia
  return <Species />
}
