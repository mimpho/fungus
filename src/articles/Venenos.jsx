// Venenos.jsx — contenido del artículo "Venenos del reino Fungi"
// Se registra en ARTICLE_REGISTRY al importarse desde Micologia.jsx
import { ARTICLE_REGISTRY, ArticleSection, ArticleP, ArticleCallout, Fig } from '../components/modals/ArticleModal'
import { useApp } from '../contexts/AppContext'

// ─── URLs de la galería ───────────────────────────────────────────────────────
const FOTO_URLS = [
  '/assets/images/content/articles/venenos-amanita.webp',
  '/assets/images/content/articles/venenos-amatoxinas.webp',
  '/assets/images/content/articles/venenos-confusion.webp',
]

// ─── Cuerpo ───────────────────────────────────────────────────────────────────
function VenenosContent() {
  const { t, setLightbox } = useApp()
  const FOTOS = FOTO_URLS.map((url, i) => ({
    url,
    caption: t[`art_ven_fig${i + 1}_caption`],
  }))
  const openLightbox = idx => setLightbox({ photos: FOTOS, index: idx })

  return (
    <div className="p-6 pt-0 space-y-2">

      {/* Intro */}
      <ArticleP html={t.art_ven_intro} />

      {/* Sección 1 */}
      <ArticleSection title={t.art_ven_s1_title}>
        <ArticleP>{t.art_ven_s1_intro}</ArticleP>
        <ul className="space-y-2 mb-4 pl-1">
          {t.art_ven_toxins.map(({ term, desc }) => (
            <li key={term} className="flex gap-2 text-cream/75" style={{ fontSize: '15px' }}>
              <span className="text-coffee mt-0.5 shrink-0">›</span>
              <span><strong className="text-muted">{term}:</strong> {desc}</span>
            </li>
          ))}
        </ul>
        <ArticleCallout emoji="⚠️" color="#dc2626" html={t.art_ven_callout1} />
      </ArticleSection>

      {/* Sección 2 */}
      <ArticleSection title={t.art_ven_s2_title}>
        <ArticleP>{t.art_ven_s2_p1}</ArticleP>
        <Fig fotos={FOTOS} idx={0} openLightbox={openLightbox} />
        <ArticleP>{t.art_ven_s2_p2}</ArticleP>
        <Fig fotos={FOTOS} idx={1} openLightbox={openLightbox} />
        <ArticleCallout emoji="🏥" color="var(--color-coffee)" html={t.art_ven_callout2} />
      </ArticleSection>

      {/* Sección 3 */}
      <ArticleSection title={t.art_ven_s3_title}>
        <ArticleP>{t.art_ven_s3_intro}</ArticleP>
        <ul className="space-y-2 mb-4 pl-1">
          {t.art_ven_syndromes.map(({ term, desc }) => (
            <li key={term} className="flex gap-2 text-cream/75" style={{ fontSize: '15px' }}>
              <span className="text-coffee mt-0.5 shrink-0">›</span>
              <span><strong className="text-muted">{term}:</strong> {desc}</span>
            </li>
          ))}
        </ul>
      </ArticleSection>

      {/* Sección 4 */}
      <ArticleSection title={t.art_ven_s4_title}>
        <ArticleP>{t.art_ven_s4_intro}</ArticleP>
        <Fig fotos={FOTOS} idx={2} openLightbox={openLightbox} />
        <ul className="space-y-2 my-4 pl-1">
          {t.art_ven_confusions.map(({ term, desc }) => (
            <li key={term} className="flex gap-2 text-cream/75" style={{ fontSize: '15px' }}>
              <span className="text-coffee mt-0.5 shrink-0">›</span>
              <span><strong className="text-muted">{term}:</strong> {desc}</span>
            </li>
          ))}
        </ul>
        <ArticleCallout emoji="🍄" color="var(--color-green-f)" html={t.art_ven_callout3} />
      </ArticleSection>

      {/* Sabías que */}
      <ArticleSection title={t.art_ven_s5_title}>
        <ArticleP html={t.art_ven_s5_p1} />
      </ArticleSection>

      {/* Referencias */}
      <div className="pt-2 border-t border-white/[0.06]">
        <p className="text-cream/60 text-xs leading-relaxed">
          <strong className="text-coffee-light/90">{t.art_refs_label}:</strong><br />
          <span dangerouslySetInnerHTML={{ __html: t.art_ven_refs }} />
        </p>
      </div>

    </div>
  )
}

// ─── Registro ─────────────────────────────────────────────────────────────────
ARTICLE_REGISTRY['venenos'] = VenenosContent
