// Recicladores.jsx — contenido del artículo "Los recicladores del bosque"
// Se registra en ARTICLE_REGISTRY al importarse desde Micologia.jsx
import { ARTICLE_REGISTRY, ArticleSection, ArticleP, ArticleCallout } from '../components/modals/ArticleModal'
import { useApp } from '../contexts/AppContext'

// ─── Galería ──────────────────────────────────────────────────────────────────
// Nota: Asegúrate de que estas rutas de imagen existan o cámbialas por las tuyas
const FOTOS = [
  { url: '/assets/images/content/articles/recicladores-tronco.webp',     caption: 'Fig. 1 — Tronco en descomposición con micelio de podredumbre blanca. Se observa cómo la madera se vuelve blanquecina y fibrosa debido a la degradación selectiva de la lignina.' },
  { url: '/assets/images/content/articles/recicladores-infografia.webp', caption: 'Fig. 2 — Representación del flujo de nutrientes. Los hongos transforman la materia orgánica muerta en humus rico disponible para las raíces.' },
  { url: '/assets/images/content/articles/recicladores-corteza.webp',    caption: 'Fig. 3 — Trametes versicolor (cola de pavo) en acción. Su presencia indica una intensa actividad metabólica de descomposición en el tronco.' },
]

// ─── Figura helper ────────────────────────────────────────────────────────────
function Fig({ fotos, idx, height = 290, openLightbox }) {
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

// ─── Cuerpo del Artículo ──────────────────────────────────────────────────────
function RecicladoresContent() {
  const { setLightbox } = useApp()
  const openLightbox = idx => setLightbox({ photos: FOTOS, index: idx })

  return (
    <div className="p-6 pt-0 space-y-2">

      {/* Intro */}
      <ArticleP>
        Los hongos saprófitos son los ingenieros invisibles de nuestros bosques. Sin su capacidad única para degradar la lignina estructural, los ecosistemas terrestres quedarían sepultados bajo toneladas de materia orgánica inerte, provocando el colapso de los ciclos globales de carbono y nitrógeno.
      </ArticleP>

      {/* Sección 1 */}
      <ArticleSection title="El fin del Carbonífero: un hito evolutivo">
        <ArticleP>
          Hace 300 millones de años, la Tierra acumuló vastos depósitos de madera que no se pudría porque ningún organismo podía romper la <strong>lignina</strong>. Este estancamiento terminó con la aparición de los hongos de podredumbre blanca, los primeros "recicladores" eficaces de la historia biológica.
        </ArticleP>
        
        <Fig fotos={FOTOS} idx={0} height={300} openLightbox={openLightbox} />

        <ArticleP>
          Al evolucionar enzimas capaces de desmantelar esta armadura química, los hongos liberaron el carbono atrapado, permitiendo que la atmósfera y la vida recuperaran su equilibrio dinámico.
        </ArticleP>
      </ArticleSection>

      {/* Sección 2 */}
      <ArticleSection title="Maestros de la digestión extracelular">
        <ArticleP>
          A diferencia de los animales, los hongos digieren antes de ingerir. Secretan un arsenal enzimático sofisticado al exterior:
        </ArticleP>
        <ul className="space-y-2 mb-4 pl-1">
          {[
            { term: 'Ligninasas',   desc: 'Herramientas oxidativas extremas capaces de romper los anillos aromáticos de la lignina.' },
            { term: 'Celulasas',    desc: 'Transforman la celulosa en azúcares simples que el micelio absorbe para obtener energía.' },
            { term: 'Mineralización', desc: 'Proceso de liberar nitrógeno, fósforo y potasio al suelo para su reabsorción por las plantas.' },
          ].map(({ term, desc }) => (
            <li key={term} className="flex gap-2 text-cream/75" style={{ fontSize: '15px' }}>
              <span className="text-coffee mt-0.5 shrink-0">›</span>
              <span><strong className="text-muted">{term}:</strong> {desc}</span>
            </li>
          ))}
        </ul>

        <Fig fotos={FOTOS} idx={1} height={270} openLightbox={openLightbox} />

        <ArticleCallout emoji="🧪" color="var(--color-coffee)">
          <strong>Química pura:</strong> La degradación de la madera es un proceso oxidativo tan potente que hoy se estudia para la limpieza de suelos contaminados con hidrocarburos y plásticos (micorremediación).
        </ArticleCallout>
      </ArticleSection>

      {/* Sección 3 */}
      <ArticleSection title="Ingenieros del Ciclo del Carbono y Nitrógeno">
        <ArticleP>
          Los hongos saprófitos actúan como válvulas reguladoras del clima global. Son responsables de hasta el 90% de la respiración heterótrofa en los bosques:
        </ArticleP>
        <ul className="space-y-2 mb-4 pl-1">
          {[
            { term: 'Balance de CO2',  desc: 'Devuelven a la atmósfera el carbono fijado en la madera, cerrando el ciclo de la fotosíntesis.' },
            { term: 'Vena del bosque', desc: 'Mueven el nitrógeno bloqueado en la hojarasca hacia las capas profundas del suelo.' },
            { term: 'Humificación',    desc: 'Crean la estructura estable del suelo que permite la retención de agua y vida microbiana.' },
          ].map(({ term, desc }) => (
            <li key={term} className="flex gap-2 text-cream/75" style={{ fontSize: '15px' }}>
              <span className="text-coffee mt-0.5 shrink-0">›</span>
              <span><strong className="text-muted">{term}:</strong> {desc}</span>
            </li>
          ))}
        </ul>

        <Fig fotos={FOTOS} idx={2} height={290} openLightbox={openLightbox} />
      </ArticleSection>

      {/* Sabías que */}
      <ArticleSection title="¿Sabías que…? Una cura para el planeta">
        <ArticleP>
          La misma capacidad que permite a <em>Trametes versicolor</em> deshacer un tronco de roble se está utilizando en biotecnología para "digerir" vertidos de petróleo. Estos hongos no ven contaminantes, ven estructuras químicas complejas que su arsenal enzimático está diseñado para desmantelar desde hace eones.
        </ArticleP>
      </ArticleSection>

      {/* Referencias */}
      <div className="pt-2 border-t border-white/[0.06]">
        <p className="text-cream/30 text-xs leading-relaxed">
          <strong className="text-cream/45">Referencias:</strong><br />
          · Agencia SINC (2012). <em>Unos hongos marcaron el final del Carbonífero</em>. Science.<br />
          · Frontiers in Microbiology (2024). <em>Variation of carbon and nitrogen content in fungi</em>.<br />
          · Wikipedia — <em>Saprotrophic fungi &amp; Lignin-modifying enzymes</em>
        </p>
      </div>

    </div>
  )
}

// ─── Registro ─────────────────────────────────────────────────────────────────
ARTICLE_REGISTRY['recicladores'] = RecicladoresContent