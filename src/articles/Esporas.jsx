// Esporas.jsx — contenido del artículo "El viaje de las esporas"
// Se registra en ARTICLE_REGISTRY al importarse desde Micologia.jsx
import { ARTICLE_REGISTRY, ArticleSection, ArticleP, ArticleCallout, Fig } from '../components/modals/ArticleModal'
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
        <ArticleCallout emoji="🔬" color="var(--color-green-f)">
          <strong>Nota científica — El origen en los Basidios:</strong> En los hongos superiores, las esporas se forman en los <em>basidios</em>. Mediante meiosis, un solo hongo puede liberar cifras astronómicas; un ejemplar de <em>Calvatia gigantea</em> puede albergar hasta <strong>7 billones de esporas</strong> en su interior.
        </ArticleCallout>

        {/* Fig. 1 — micrografía de basidios, ancho completo */}
        <Fig fotos={FOTOS} idx={0} height="290px" openLightbox={openLightbox} />
      </ArticleSection>

      {/* Sección 2 */}
      <ArticleSection title="Mecanismos de dispersión: Ingeniería fúngica">
        <ArticleP>
          Los hongos han desarrollado métodos que desafían la física para asegurar que sus esporas recorran la mayor distancia posible:
        </ArticleP>

        {/* Fig. 2 y Fig. 3 — mecanismos de dispersión */}
        <div className="my-6 grid grid-cols-2 gap-2">
          <Fig fotos={FOTOS} idx={1} height="260px" openLightbox={openLightbox} />
          <Fig fotos={FOTOS} idx={2} height="260px" openLightbox={openLightbox} />
        </div>

        <ul className="space-y-2 mb-4 pl-1">
          {[
            { term: 'Balistosporía',        desc: 'Mecanismo activo propio de hongos con láminas: la espora se lanza por la tensión superficial de una gota de agua formada en su base (Fig. 2).' },
            { term: 'Hidrocoria (Agua)',    desc: 'La energía cinética de la lluvia catapulta las esporas desde estructuras en copa, como en las Nidulariaceae (Fig. 3).' },
            { term: 'Anemocoria (Viento)',  desc: 'El método más extendido: corrientes térmicas ascendentes elevan esporas muy livianas hasta la troposfera, donde pueden viajar miles de kilómetros.' },
            { term: 'Zoocoria (Animales)',  desc: 'Trufas y afines usan aromas intensos para atraer mamíferos que las consumen y dispersan sus esporas intactas con las heces.' },
          ].map(({ term, desc }) => (
            <li key={term} className="flex gap-2 text-cream/75" style={{ fontSize: '15px' }}>
              <span className="text-coffee mt-0.5 shrink-0">›</span>
              <span><strong className="text-muted">{term}:</strong> {desc}</span>
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
        <Fig fotos={FOTOS} idx={3} height="290px" openLightbox={openLightbox} />

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
        <p className="text-cream/30 text-xs leading-relaxed">
          <strong className="text-cream/45">Referencias:</strong><br />
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
