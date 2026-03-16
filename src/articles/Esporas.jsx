// Esporas.jsx — contenido del artículo "El viaje de las esporas"
// Se registra en ARTICLE_REGISTRY al importarse desde Micologia.jsx
import { ARTICLE_REGISTRY, ArticleSection, ArticleP, ArticleCallout, Fig } from '../components/modals/ArticleModal'
import { useApp } from '../contexts/AppContext'

// ─── Cuerpo del artículo ──────────────────────────────────────────────────────
const FOTO_URLS = [
  '/assets/images/content/articles/esporas-basidios.webp',
  '/assets/images/content/articles/esporas-balistosporia.webp',
  '/assets/images/content/articles/esporas-hidrocoria.webp',
  '/assets/images/content/articles/esporas-somatogamia.webp',
]

function EsporasContent() {
  const { t, setLightbox } = useApp()
  const FOTOS = FOTO_URLS.map((url, i) => ({
    url,
    caption: t[`art_esp_fig${i + 1}_caption`],
  }))
  const openLightbox = idx => setLightbox({ photos: FOTOS, index: idx })
  return (
    <div className="p-6 pt-0 space-y-2">

      {/* Intro */}
      <ArticleP>{t.art_esp_intro}</ArticleP>

      {/* Sección 1 */}
      <ArticleSection title={t.art_esp_s1_title}>
        <ArticleP>{t.art_esp_s1_p1}</ArticleP>
        <ArticleCallout emoji="🔬" color="var(--color-green-f)" html={t.art_esp_callout1} />
        <Fig fotos={FOTOS} idx={0} height="290px" openLightbox={openLightbox} />
      </ArticleSection>

      {/* Sección 2 */}
      <ArticleSection title={t.art_esp_s2_title}>
        <ArticleP>{t.art_esp_s2_intro}</ArticleP>
        <div className="my-6 grid grid-cols-2 gap-2">
          <Fig fotos={FOTOS} idx={1} height="260px" openLightbox={openLightbox} />
          <Fig fotos={FOTOS} idx={2} height="260px" openLightbox={openLightbox} />
        </div>
        <ul className="space-y-2 mb-4 pl-1">
          {t.art_esp_dispersal.map(({ term, desc }) => (
            <li key={term} className="flex gap-2 text-cream/75" style={{ fontSize: '15px' }}>
              <span className="text-coffee mt-0.5 shrink-0">›</span>
              <span><strong className="text-muted">{term}:</strong> {desc}</span>
            </li>
          ))}
        </ul>
      </ArticleSection>

      {/* Sección 3 */}
      <ArticleSection title={t.art_esp_s3_title}>
        <ArticleP html={t.art_esp_s3_p1} />
        <Fig fotos={FOTOS} idx={3} height="290px" openLightbox={openLightbox} />
        <ArticleP>{t.art_esp_s3_p2}</ArticleP>
      </ArticleSection>

      {/* Sabías que */}
      <ArticleSection title={t.art_esp_s4_title}>
        <ArticleP html={t.art_esp_s4_p1} />
      </ArticleSection>

      {/* Referencias */}
      <div className="pt-2 border-t border-white/[0.06]">
        <p className="text-cream/60 text-xs leading-relaxed">
          <strong className="text-coffee-light/90">{t.art_refs_label}:</strong><br />
          <span dangerouslySetInnerHTML={{ __html: t.art_esp_refs }} />
        </p>
      </div>

    </div>
  )
}

// ─── Registro ─────────────────────────────────────────────────────────────────
ARTICLE_REGISTRY['esporas'] = EsporasContent
