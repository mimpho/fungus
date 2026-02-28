// Esporas.jsx — contenido del artículo "El viaje de las esporas"
// Se registra en ARTICLE_REGISTRY al importarse desde Micologia.jsx
import { ARTICLE_REGISTRY, ArticleSection, ArticleP, ArticleCallout } from '../components/modals/ArticleModal'
import { useApp } from '../contexts/AppContext'

// ─── Cuerpo del artículo ──────────────────────────────────────────────────────
const FOTOS = [
  { url: '/assets/images/content/articles/esporas-basidios.webp',      caption: 'Fig. 1 — Micrografía de la superficie de una lámina mostrando los basidios en maduración.' },
  { url: '/assets/images/content/articles/esporas-balistosporia.webp', caption: 'Fig. 2 — Eyección balística por tensión superficial del agua en la base de la espora.' },
  { url: '/assets/images/content/articles/esporas-hidrocoria.webp',    caption: 'Fig. 3 — Mecanismo de copa de salpicadura en Nidulariaceae por impacto de lluvia.' },
  { url: '/assets/images/content/articles/esporas-somatogamia.webp',   caption: 'Fig. 4 — Somatogamia: fusión de dos tubos germinales compatibles (espora A y B) formando un nuevo micelio dicariótico.' },
]

function EsporasContent() {
  const { setLightbox } = useApp()
  const openLightbox = idx => setLightbox({ photos: FOTOS, index: idx })
  return (
    <div className="p-6 pt-0 space-y-2">

      {/* Intro */}
      <ArticleP>
        Si bien las setas son la parte más visible del reino Fungi, su existencia tiene un único propósito fundamental: la producción y liberación de esporas. Estas estructuras son la culminación de un proceso evolutivo optimizado para la supervivencia genética en los ecosistemas más diversos.
      </ArticleP>

      {/* Sección 1 */}
      <ArticleSection title="La unidad biológica: ¿Qué es una espora?">
        <ArticleP>
          A diferencia de las semillas de las plantas, la espora es típicamente unicelular y haploide. Es una cápsula de vida mínima, despojada de casi toda reserva, confiando su éxito puramente en el número y la resistencia.
        </ArticleP>
        <ArticleCallout emoji="🔬" color="#4a7c59">
          <strong>Nota científica — El origen en los Basidios:</strong> En los hongos superiores, las esporas se forman en los <em>basidios</em>. Mediante meiosis, un solo hongo puede liberar cifras astronómicas; un ejemplar de <em>Calvatia gigantea</em> puede albergar hasta <strong>7 billones de esporas</strong> en su interior.
        </ArticleCallout>

        {/* Fig. 1 — micrografía de basidios, ancho completo */}
        <figure className="m-0 mt-4 relative cursor-pointer group" style={{ height: '290px' }}
          onClick={() => openLightbox(0)}>
          <div className="h-full rounded-xl overflow-hidden">
            <img src={FOTOS[0].url} alt="Detalle microscópico de basidios"
              className="w-full h-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-[1.02]" />
          </div>
          {/* Gradiente + caption overlay */}
          <div className="absolute inset-x-0 bottom-0 h-20 rounded-b-xl"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72), transparent)' }} />
          <figcaption className="absolute bottom-3 left-4 right-4 text-[#f4ebe1]/85 text-xs leading-snug">
            <strong className="text-[#d9cda1]">Fig. 1:</strong> Micrografía de la superficie de una lámina mostrando los basidios en maduración.
          </figcaption>
          <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
          </div>
        </figure>
      </ArticleSection>

      {/* Sección 2 */}
      <ArticleSection title="Mecanismos de dispersión: Ingeniería fúngica">
        <ArticleP>
          Los hongos han desarrollado métodos que desafían la física para asegurar que sus esporas recorran la mayor distancia posible:
        </ArticleP>

        {/* Fig. 2 y Fig. 3 — mecanismos de dispersión */}
        <div className="my-6 grid grid-cols-2 gap-2">
          {[
            { idx: 1, alt: 'Eyección balística de espora',     label: 'Fig. 2', sub: 'Eyección balística por tensión superficial.' },
            { idx: 2, alt: 'Hidrocoria — copa de salpicadura', label: 'Fig. 3', sub: <>Copa de salpicadura en <em>Nidulariaceae</em>.</> },
          ].map(({ idx, alt, label, sub }) => (
            <figure key={idx} className="m-0 relative cursor-pointer group" style={{ height: '260px' }}
              onClick={() => openLightbox(idx)}>
              <div className="h-full rounded-xl overflow-hidden">
                <img src={FOTOS[idx].url} alt={alt}
                  className="w-full h-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-[1.02]" />
              </div>
              {/* Gradiente + caption overlay */}
              <div className="absolute inset-x-0 bottom-0 h-20 rounded-b-xl"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72), transparent)' }} />
              <figcaption className="absolute bottom-3 left-3 right-3 text-[#f4ebe1]/85 text-xs leading-snug">
                <strong className="text-[#d9cda1]">{label}:</strong> {sub}
              </figcaption>
              <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
              </div>
            </figure>
          ))}
        </div>

        <ul className="space-y-2 mb-4 pl-1">
          {[
            { term: 'Balistosporía',        desc: 'Mecanismo activo propio de hongos con láminas: la espora se lanza por la tensión superficial de una gota de agua formada en su base (Fig. 2).' },
            { term: 'Hidrocoria (Agua)',    desc: 'La energía cinética de la lluvia catapulta las esporas desde estructuras en copa, como en las Nidulariaceae (Fig. 3).' },
            { term: 'Anemocoria (Viento)',  desc: 'El método más extendido: corrientes térmicas ascendentes elevan esporas muy livianas hasta la troposfera, donde pueden viajar miles de kilómetros.' },
            { term: 'Zoocoria (Animales)',  desc: 'Trufas y afines usan aromas intensos para atraer mamíferos que las consumen y dispersan sus esporas intactas con las heces.' },
          ].map(({ term, desc }) => (
            <li key={term} className="flex gap-2 text-[#f4ebe1]/75" style={{ fontSize: '15px' }}>
              <span className="text-[#8b7a5a] mt-0.5 shrink-0">›</span>
              <span><strong className="text-[#d9cda1]">{term}:</strong> {desc}</span>
            </li>
          ))}
        </ul>
      </ArticleSection>

      {/* Sección 3 */}
      <ArticleSection title="Del vuelo a la vida: La germinación">
        <ArticleP>
          Tras aterrizar en un sustrato óptimo, la espora absorbe agua y emite un tubo germinal. Si dos hifas compatibles se encuentran, ocurre la <em>somatogamia</em>, estableciendo un nuevo micelio capaz de repetir este ciclo infinito.
        </ArticleP>

        {/* Fig. 4 — somatogamia, ancho completo */}
        <figure className="m-0 mt-4 mb-2 relative cursor-pointer group" style={{ height: '290px' }}
          onClick={() => openLightbox(3)}>
          <div className="h-full rounded-xl overflow-hidden">
            <img src={FOTOS[3].url} alt="Somatogamia — fusión de tubos germinales"
              className="w-full h-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-[1.02]" />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-20 rounded-b-xl"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72), transparent)' }} />
          <figcaption className="absolute bottom-3 left-4 right-4 text-[#f4ebe1]/85 text-xs leading-snug">
            <strong className="text-[#d9cda1]">Fig. 4:</strong> Somatogamia — fusión de dos tubos germinales compatibles formando un nuevo micelio dicariótico.
          </figcaption>
          <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
          </div>
        </figure>

        <ArticleP>
          La probabilidad de éxito es infinitesimal — se estima que solo una de cada varios millones de esporas llegará a formar un hongo maduro — pero la estrategia del número masivo ha demostrado ser una de las más exitosas en la historia de la vida.
        </ArticleP>
      </ArticleSection>

      {/* Sabías que */}
      <ArticleSection title="¿Sabías que…? Las viajeras del espacio">
        <ArticleP>
          Las esporas poseen paredes ricas en <strong>quitina y melanina</strong>, lo que les permite sobrevivir al vacío del espacio y a radiaciones extremas. Se han germinado esporas atrapadas en ámbar de hace <strong>20 millones de años</strong>, lo que alimenta las teorías sobre la panspermia biológica.
        </ArticleP>
      </ArticleSection>

      {/* Referencias */}
      <div className="pt-2 border-t border-white/[0.06]">
        <p className="text-[#f4ebe1]/30 text-xs leading-relaxed">
          <strong className="text-[#f4ebe1]/45">Referencias:</strong><br />
          · Moore, D., et al. (2020). <em>21st Century Guidebook to Fungi</em>.<br />
          · Pringle, A., et al. (2005). "The captured launch of a ballistospore". <em>Mycologia</em>.<br />
          · Money, N. P. (2016). <em>The Amoeba in the Room</em>. Oxford University Press.
        </p>
      </div>

    </div>
  )
}

// ─── Registro ─────────────────────────────────────────────────────────────────
ARTICLE_REGISTRY['esporas'] = EsporasContent
