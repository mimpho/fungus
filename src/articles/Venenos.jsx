// Venenos.jsx — contenido del artículo "Venenos del reino Fungi"
// Se registra en ARTICLE_REGISTRY al importarse desde Micologia.jsx
import { ARTICLE_REGISTRY, ArticleSection, ArticleP, ArticleCallout } from '../components/modals/ArticleModal'
import { useApp } from '../contexts/AppContext'

// ─── Galería ──────────────────────────────────────────────────────────────────
const FOTOS = [
  { url: '/assets/images/content/articles/venenos-amanita.webp',    caption: 'Fig. 1 — Amanita phalloides («ángel de la muerte»): volva en la base, anillo membranoso y sombrero verde-oliva pálido. Causa el 90 % de las muertes por seta en el mundo.' },
  { url: '/assets/images/content/articles/venenos-amatoxinas.webp', caption: 'Fig. 2 — Representación de la infiltración de amatoxinas en células hepáticas. La toxina bloquea la ARN-polimerasa II impidiendo la síntesis de proteínas.' },
  { url: '/assets/images/content/articles/venenos-confusion.webp',  caption: 'Fig. 3 — Las confusiones más letales: Amanita phalloides (izq., verde pálido, volva) vs. Agaricus campestris (der., marrón, sin volva). La diferencia es de vida o muerte.' },
]

// ─── Figura helper (igual patrón que Esporas) ─────────────────────────────────
function Fig({ fotos, idx, height = 'auto', openLightbox }) {
  return (
    <figure className="m-0 my-4 relative cursor-pointer group" style={{ height }}
      onClick={() => openLightbox(idx)}>
      <div className="h-full rounded-xl overflow-hidden">
        <img src={fotos[idx].url} alt={fotos[idx].caption}
          className="w-full h-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-[1.02]" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-20 rounded-b-xl"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }} />
      <figcaption className="absolute bottom-3 left-4 right-4 text-cream/85 text-xs leading-snug">
        <strong className="text-muted">Fig. {idx + 1}:</strong>{' '}
        {fotos[idx].caption.replace(/^Fig\. \d+ — /, '')}
      </figcaption>
      <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
        </svg>
      </div>
    </figure>
  )
}

// ─── Cuerpo ───────────────────────────────────────────────────────────────────
function VenenosContent() {
  const { setLightbox } = useApp()
  const openLightbox = idx => setLightbox({ photos: FOTOS, index: idx })

  return (
    <div className="p-6 pt-0 space-y-2">

      {/* Intro */}
      <ArticleP>
        El reino Fungi ha perfeccionado durante millones de años un arsenal bioquímico de una sofisticación extraordinaria. Algunas de estas moléculas son tan eficaces que con tan solo medio sombrero de <em>Amanita phalloides</em> —unos 30 gramos— basta para causar un fallo hepático fulminante en un adulto. Entender estos mecanismos no es alarmismo: es la diferencia entre recolectar con seguridad o convertirse en una estadística.
      </ArticleP>

      {/* Sección 1 */}
      <ArticleSection title="El arsenal tóxico: una clasificación">
        <ArticleP>
          Las toxinas fúngicas no forman una familia química uniforme. Se agrupan por estructura molecular y mecanismo de acción:
        </ArticleP>
        <ul className="space-y-2 mb-4 pl-1">
          {[
            { term: 'Amatoxinas',   desc: 'Péptidos cíclicos presentes en Amanita, Galerina y Lepiota. Inhiben la ARN-polimerasa II bloqueando la síntesis proteica celular. Termoestables: cocinar no las destruye.' },
            { term: 'Falotoxinas',  desc: 'Coexisten con las amatoxinas en Amanita phalloides. Afectan la membrana intestinal produciendo gastroenteritis grave, aunque por sí solas no son letales sistémicamente.' },
            { term: 'Muscarina',    desc: 'Alcaloide de Clitocybe y algunos Inocybe. Activa los receptores muscarínicos del sistema nervioso parasimpático: sudoración, salivación, bradicardia.' },
            { term: 'Orellanina',   desc: 'Toxina nefrotóxica de Cortinarius orellanus. Único veneno fúngico con latencia de 2–3 semanas, lo que dificulta su diagnóstico.' },
            { term: 'Giromitrina',  desc: 'Presente en Gyromitra esculenta. Se hidroliza en monometilhidrazina (MMH), un potente hepatotóxico y hemolítico. Parcialmente volátil al cocinar.' },
          ].map(({ term, desc }) => (
            <li key={term} className="flex gap-2 text-cream/75" style={{ fontSize: '15px' }}>
              <span className="text-coffee mt-0.5 shrink-0">›</span>
              <span><strong className="text-muted">{term}:</strong> {desc}</span>
            </li>
          ))}
        </ul>
        <ArticleCallout emoji="⚠️" color="#dc2626">
          <strong>Regla de oro:</strong> ninguna prueba popular (plata, ajo, ebullición, color del corte) detecta amatoxinas. La única prueba fiable es la identificación botánica rigurosa o el análisis de laboratorio.
        </ArticleCallout>
      </ArticleSection>

      {/* Sección 2 */}
      <ArticleSection title="Amatoxinas: el veneno más letal">
        <ArticleP>
          Las amatoxinas son bicíclicos octapéptidos con una estabilidad extraordinaria: resisten el calor, la congelación, el secado y los jugos gástricos. Se absorben íntegramente en el intestino delgado, circulan hasta el hígado y allí ejercen su acción bloqueando la ARN-polimerasa II, la enzima responsable de transcribir el ADN en ARNm. Sin síntesis de proteínas, la célula hepática muere.
        </ArticleP>

        <Fig fotos={FOTOS} idx={0} openLightbox={openLightbox} />

        <ArticleP>
          La intoxicación evoluciona en tres fases. La primera (6–24 h) es un período de latencia silencioso —la toxina actúa sin síntomas—. La segunda (24–72 h) produce gastroenteritis violenta con diarrea sanguinolenta y vómitos. La tercera fase, la más temida, es la citólisis hepática que puede conducir al fallo multiorgánico entre el día 4 y el día 8.
        </ArticleP>

        <Fig fotos={FOTOS} idx={1} openLightbox={openLightbox} />

        <ArticleCallout emoji="🏥" color="var(--color-coffee)">
          <strong>Tratamiento:</strong> No existe antídoto específico. El protocolo incluye silibinina intravenosa (extracto de cardo mariano), N-acetilcisteína y, en casos graves, trasplante hepático. La supervivencia depende casi exclusivamente de la rapidez del diagnóstico.
        </ArticleCallout>
      </ArticleSection>

      {/* Sección 3 */}
      <ArticleSection title="Otros síndromes: muscarina, orellanina y giromitrina">
        <ArticleP>
          Más allá de las amatoxinas, existen síndromes clínicos bien documentados con otras toxinas, cada uno con su ventana temporal característica:
        </ArticleP>
        <ul className="space-y-2 mb-4 pl-1">
          {[
            { term: 'Síndrome muscarínico (30 min–2 h)',  desc: 'Provocado por especies de Clitocybe y Inocybe. Presenta el acrónimo SLUDE: salivación, lagrimeo, micción, diarrea y emesis. Responde bien a atropina.' },
            { term: 'Síndrome orellánico (2–3 semanas)', desc: 'El más insidioso. Cortinarius orellanus provoca insuficiencia renal crónica semanas después de la ingesta. En el momento del diagnóstico el daño suele ser irreversible.' },
            { term: 'Síndrome giromítrico (6–12 h)',     desc: 'Gyromitra esculenta («falsa colmenilla»). Hepatotóxico y hemolítico. Parte de la toxina puede eliminarse al hervir con ventilación, pero el riesgo nunca es cero.' },
            { term: 'Síndrome panterínico (30 min–3 h)', desc: 'Amanita muscaria y A. pantherina contienen muscimol e ibotenic acid, agentes psicoactivos que causan delirio, alucinaciones y convulsiones en dosis altas.' },
          ].map(({ term, desc }) => (
            <li key={term} className="flex gap-2 text-cream/75" style={{ fontSize: '15px' }}>
              <span className="text-coffee mt-0.5 shrink-0">›</span>
              <span><strong className="text-muted">{term}:</strong> {desc}</span>
            </li>
          ))}
        </ul>
      </ArticleSection>

      {/* Sección 4 */}
      <ArticleSection title="Por qué nos confundimos: las especies gemelas">
        <ArticleP>
          La mayoría de intoxicaciones graves no ocurren por ignorancia total sino por una confusión concreta entre dos especies que se parecen. Los errores más frecuentes en España:
        </ArticleP>

        <Fig fotos={FOTOS} idx={2} openLightbox={openLightbox} />

        <ul className="space-y-2 my-4 pl-1">
          {[
            { term: 'A. phalloides por A. campestris',   desc: 'El champiñón silvestre no tiene volva ni anillo tan marcado; sus láminas son rosadas (nunca blancas) y oscurecen con la madurez.' },
            { term: 'A. phalloides por Volvariella',     desc: 'Volvariella speciosa también emerge de una volva, pero sus láminas son rosadas y carece de anillo.' },
            { term: 'Gyromitra por Morchella',           desc: 'La falsa colmenilla tiene el sombrero cerebriforme e irregular; la colmenilla real muestra alvéolos regulares y el sombrero está unido al pie desde la base.' },
            { term: 'Cortinarius por Boletus / Russula', desc: 'Los Cortinarius tóxicos suelen tener restos de cortina aracnoide en el pie y láminas de color óxido al madurar. Nunca comer Cortinarius de identificación dudosa.' },
          ].map(({ term, desc }) => (
            <li key={term} className="flex gap-2 text-cream/75" style={{ fontSize: '15px' }}>
              <span className="text-coffee mt-0.5 shrink-0">›</span>
              <span><strong className="text-muted">{term}:</strong> {desc}</span>
            </li>
          ))}
        </ul>
        <ArticleCallout emoji="🍄" color="var(--color-green-f)">
          <strong>Protocolo ante sospecha de intoxicación:</strong> llamar al 112 o al Servicio de Información Toxicológica (91 562 04 20 en España) inmediatamente, conservar restos de la seta —o una fotografía detallada— y no esperar a que aparezcan síntomas graves.
        </ArticleCallout>
      </ArticleSection>

      {/* Sabías que */}
      <ArticleSection title="¿Sabías que…? La paradoja de la medicina">
        <ArticleP>
          La misma faloidina que hace letal a <em>Amanita phalloides</em> es hoy una herramienta fundamental en biología celular: conjugada con rodamina, se usa como marcador fluorescente de actina en microscopía confocal. Y la silibinina —extraída del cardo mariano y usada como antídoto— debe su eficacia a que compite con las amatoxinas por los mismos transportadores hepáticos. El veneno y la cura hablan el mismo idioma molecular.
        </ArticleP>
      </ArticleSection>

      {/* Referencias */}
      <div className="pt-2 border-t border-white/[0.06]">
        <p className="text-cream/30 text-xs leading-relaxed">
          <strong className="text-cream/45">Referencias:</strong><br />
          · Bresinsky, A. &amp; Besl, H. (1990). <em>A Colour Atlas of Poisonous Fungi</em>. Wolfe Publishing.<br />
          · Enjalbert, F., et al. (2002). «Treatment of amatoxin poisoning». <em>J. Toxicology: Clinical Toxicology</em>.<br />
          · Servicio de Información Toxicológica de España — <em>sit.toxicologia.org</em>
        </p>
      </div>

    </div>
  )
}

// ─── Registro ─────────────────────────────────────────────────────────────────
ARTICLE_REGISTRY['venenos'] = VenenosContent
