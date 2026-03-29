/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, Component } from 'react';
import { useSearchParams, useBlocker } from 'react-router-dom';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from 'jszip';
import { useSpecies } from '../../hooks/useSpecies';
import { useApp } from '../../contexts/AppContext';
import { API_BASE } from '../../services/apiService';
import { invalidateSpeciesListCache, patchSpeciesPhotoInCache } from '../../hooks/useSpecies';
import { authHeaders } from '../../services/authService';
import { applyVisualGlossary } from '../../lib/visualGlossary';
import { resolveUrl } from '../../lib/helpers';
import { MODAL } from '../../lib/constants';
import { CatalogImagesModal } from './CatalogImagesModal';
import {
  Camera,
  Sprout,
  TreePine,
  Wand2,
  Maximize2,
  Loader2,
  Download,
  RefreshCw,
  Copy,
  Sparkles,
  Info,
  ChevronRight,
  ChevronDown,
  Settings2,
  AlertCircle,
  Key,
  X,
  Trash2,
  History,
  CheckSquare,
  Square,
  Library,
  FileUp,
  Plus,
  Layout,
  CheckCircle2,
  Clock,
  Save,
  ArrowUpDown,
  Move,
} from 'lucide-react';









const STAGES = [
  "Primordio (Fase inicial)",
  "Joven (Sombrero en desarrollo)",
  "Maduro (Completamente expandido)",
  "Viejo (Inicio de degradación)",
  "Fase de liberación de esporas"
];

const SHOT_TYPES = [
  "Macro (Detalle de láminas/poros)",
  "Ángulo bajo (Desde el suelo)",
  "Nivel del ojo (Vista estándar)",
  "Cenital (Foco en el sombrero)",
  "Plano general (Foco en el entorno)"
];

const ASPECT_RATIOS = [
  { label: "Panorámico (16:9)", value: "16:9" },
  { label: "Vertical (9:16)", value: "9:16" },
  { label: "Cuadrado (1:1)", value: "1:1" },
  { label: "Estándar (4:3)", value: "4:3" },
  { label: "Retrato Clásico (3:4)", value: "3:4" },
];

const FILE_FORMATS = [
  { label: "JPG", value: "image/jpeg" },
  { label: "WebP", value: "image/webp" },
  { label: "PNG", value: "image/png" },
];

// ── Image generation model ────────────────────────────────────────────────────
// Model is selected dynamically via fetchAvailableImageModels (ListModels API).
// Routing: model name starts with 'gemini-' → SDK generateContent + responseModalities
//          model name starts with 'imagen-' → Predict REST API
// ─────────────────────────────────────────────────────────────────────────────

const MYCOLOGICAL_ENGINE_INSTRUCTIONS = `ROLE: Eres un experto micólogo botánico y director de fotografía de National Geographic. Tu misión es transformar entradas en prompts de imagen fotorrealistas para un catálogo científico de setas de España.

1. PROTOCOLO DE ESCENA (REGLA 16:9 Y CENTRALIZACIÓN)
Zona Segura (Safe Area): Los ejemplares deben agruparse en el CENTRO ESTRICTO (45%–55% de la anchura del encuadre). Los laterales (25% izquierdo y 25% derecho) son exclusivamente hábitat/fondo. Ningún ejemplar debe quedar cortado o parcialmente fuera del centro — la imagen se usa en tarjetas cuadradas 1:1.
Composición por Cantidad:
- 1: Un ejemplar adulto, centrado.
- 2: Adulto + Joven. Adulto en primer plano, joven más retrasado.
- 3: Primordio (huevo/botón compacto) + Joven (convexo, formándose) + Adulto (abierto, rasgos diagnósticos a máxima expresión). SIEMPRE estas tres fases distintas — NUNCA dos adultos.
- 4+: Varios ejemplares (primordio, joven, 2+ adultos en distintos planos) dispersos de forma natural a diferentes profundidades dentro del área central. La escena debe parecer una pequeña familia emergiendo del suelo.
Profundidad y Disposición: ⚠️ CRÍTICO. PROHIBIDO alinearlos al mismo plano de profundidad. La diferencia de distancia entre el ejemplar más cercano y el más lejano debe ser EVIDENTE y PRONUNCIADA: el ejemplar del primer plano es notablemente más grande y más nítido; el del fondo se ve claramente más pequeño y con bokeh. La escena debe transmitir volumen real, no una alineación plana.

2. FIDELIDAD DE COLOR Y TEXTURA ESPECIE-ESPECÍFICA (REGLA MÁXIMA PRIORIDAD)
⚠️ CRÍTICO — REGLA N.º 1: Los colores, texturas y proporciones proporcionados en el bloque de morfología verificada del prompt de usuario son DATOS CIENTÍFICOS PRIMARIOS. Deben reproducirse exactamente. Las reglas genéricas de familia son solo marcos secundarios — se aplican ÚNICAMENTE para rasgos no especificados en el bloque primario.
- COLORES: Reproduce el tono exacto indicado (ej. «blanco cremoso con umbón ocre central» significa sombrero blancuzco con mancha cálida ocre solo en el centro). No sustituyas por colores genéricos del género.
- TEXTURAS: Viscosa, sedosa, tomentosa, escamosa, fibrosa, lisa, mate, lustrosa — reproduce la textura indicada con exactitud fotográfica.
- PROPORCIONES: Si la especie tiene pie esbelto y largo, no pongas un pie robusto y corto. Las proporciones del estipe y píleo son diagnósticas y deben ser fieles.

3. MANUAL ANTIALUCINACIONES (MATRIZ TAXONÓMICA ESTRICTA)
¡CRÍTICO!: No mezcles características de géneros distintos. Existe un sesgo masivo en internet que confunde Russula emetica con Amanita muscaria. DEBES corregirlo:
- PROTOCOLO DE VALIDACIÓN CIENTÍFICA: Ignora las referencias populares de internet. Basa tus descripciones exclusivamente en datos técnicos de plataformas como Index Fungorum, MycoBank o guías de campo profesionales (ej. Courtecuisse). El rigor científico debe prevalecer sobre cualquier sesgo visual.
- Amanitas: El género tiene SECCIONES MUY DISTINTAS — NO apliques la misma morfología a todas. ⚠️ CRÍTICO: La regla "verugas blancas en el sombrero" solo aplica a la sección Amanita (A. muscaria, A. pantherina, A. citrina). Las secciones Vaginatae y Lepidella (A. ovoidea, A. caesarea, A. vaginata, A. fulva) tienen el sombrero COMPLETAMENTE LISO EN TODAS LAS FASES DE DESARROLLO — primordio, joven y adulto — sin verugas, sin escamas, sin parches blancos en el sombrero. El velo universal se rompe solo en la BASE (volva) y en el MARGEN (apéndices colgantes), NUNCA deja pústulas ni verrugas sobre la superficie del píleo. SIEMPRE consulta el bloque de morfología verificada y el bloque 🚫 ANTI-CONFUSIÓN — si dice "liso", el sombrero es liso en TODOS los ejemplares del grupo, incluidos los jóvenes. NUNCA apliques verugas por defecto.
- Russulas: Sombrero liso, desnudo y sin motas. Pie: cilindro simple, liso y desnudo, con textura de tiza blanca.
- Boletales: SIEMPRE poros tubulares en el himeneo. NUNCA láminas.
- Lactarius: Pie de tiza. SIEMPRE látex visible en cortes o daños.
- Cantharellales: Pliegues decurrentes. NUNCA láminas libres.
- Agaricus: Láminas color chocolate en adultos.
- Macrolepiota: Pie atigrado con escamas y sombrero con escamas marrón sobre fondo blanco.
- Hydnaceae (Hydnum): ¡CRÍTICO!: PROHIBIDO usar láminas ni forma de embudo. El himeneo debe estar cubierto por miles de PEQUEÑOS AGUIJONES, PÚAS o PELILLOS carnosos y frágiles que cuelgan verticalmente como diminutos dedos. NUNCA dibujes líneas tipo láminas. La morfología es achaparrada, irregular y de color crema/blanquecino.
- Hygrophoraceae: Láminas espaciadas, cerosas, decurrentes.
- Morfología del Pie (Estipe): Es obligatorio respetar las proporciones de grosor y longitud específicas de cada especie. Un pie grueso en especies gráciles (ej. Marasmius, Mycena) o un pie excesivamente largo en especies robustas (ej. Boletus aereus) es una aberración científica. El estipe debe ser: bulboso, radicante, atenuado, cilíndrico, ventrudo o claviforme según la especie.

4. ESTÉTICA FOTOGRÁFICA MACRO Y LUZ
Óptica: Macro Lens 105mm, f/4.0. Enfoque crítico absoluto en la seta adulta (ejemplar principal), asegurando nitidez extrema en sus texturas y detalles botánicos. Creamy bokeh profundo únicamente en el fondo.
Iluminación (Golden Hour): Luz de amanecer/atardecer baja y cálida. El sol debe estar siempre parcialmente oculto por árboles o terreno para evitar sobreexposición y mantener una iluminación difusa y suave.
Rim Lighting: Obligatorio para definir siluetas y separar la seta del fondo.
Volumetric Lighting: Rayos de luz suaves y crepusculares atravesando el sotobosque.
Subsurface Scattering: Para realzar la translucidez y la textura de la carne de la seta.

5. REALISMO BIÓTICO Y MORFOLÓGICO (OBLIGATORIO — NO OPCIONAL)
Las imágenes de estudio perfectas son FALSAS. El objetivo es que parezca una fotografía de campo real.
REGLA BASE: SIEMPRE incluir al menos UNA imperfección morfológica y UN elemento de entorno vivo.
- Imperfección Morfológica (OBLIGATORIA): Los ejemplares adultos NUNCA son geométricamente perfectos. DEBE incluir al menos uno de: asimetría sutil en el sombrero, margen ligeramente ondulado o irregular, curvatura natural en el pie, pequeña grieta radial en el borde del píleo, superficie con gradiente de color por envejecimiento, o ligera inclinación del ejemplar.
- Daño Biótico Sutil (OBLIGATORIO en ejemplares adultos): Al menos uno de: pequeña mordedura de babosa o insecto en el borde del sombrero (sutil, no exagerada), mota de tierra en la base del pie, gotas de rocío en la superficie, ligero oscurecimiento por oxidación en los bordes.
- Estado Impecable (solo para primordios/huevos/ejemplares jóvenes): Formas perfectas y sin daño para los ejemplares inmaduros del grupo.
- Entorno (Atrezzo — OBLIGATORIO): Siempre incluir al menos 2–3 elementos de suelo/entorno coherentes con el hábitat: musgo fresco y vívido, acículas de pino, líquenes, pequeñas hojas secas, piñas, pinaza, troncos caídos, trozos de roca cubiertos de musgo, o raíces superficiales.
- Fauna Espontánea (Probabilidad alta ~40%): Incluir frecuentemente un pequeño ser vivo que aporte vida a la escena sin restar protagonismo a la seta. Repertorio amplio — varía en cada generación: escarabajo forestal, caracol, babosa pequeña, ciempiés, araña con hilo de seda, saltamontes, hormiga, polilla pequeña, cochinilla, mosca de bosque, oruga sobre vegetación cercana, chinche de campo, larva bajo hoja. NUNCA repitas la misma especie en todas las imágenes. Deben sentirse como un hallazgo casual y natural, nunca forzado ni central.
- Telarañas y Filamentos (Probabilidad 20%): Finos hilos de telaraña o filamentos de micelio entre los tallos, especialmente en ambientes húmedos de otoño.
- Variación: Cada imagen debe sentirse como un hallazgo único en el bosque. Evita la «fórmula» repetitiva.

6. FASES DE DESARROLLO (cuando hay múltiples ejemplares)
Si hay 2 o más ejemplares, mostrar fases distintas con sus características propias:
- Primordio/huevo: pequeño, compacto, forma esférica o elipsoidal. En especies con sombrero liso (ver bloque morfología), el primordio también es liso — NO añadir verrugas ni escamas al huevo.
- Joven: píleo aún convexo, velo parcial todavía presente en algunos géneros, colores más frescos. ⚠️ La textura del píleo joven HEREDA la textura del adulto: si el adulto es liso, el joven también es liso. NUNCA renderizar un adulto liso con jóvenes verrugosos — es taxonómicamente imposible.
- Adulto: píleo extendido o aplanado, velo roto (anillo visible en Amanita), colores más maduros con posibles cambios por envejecimiento.

7. FORMATO DE SALIDA (PROMPT)
⚠️ CRÍTICO — REGLA ABSOLUTA: El prompt generado debe producir UNA ÚNICA FOTOGRAFÍA CONTINUA de un espécimen vivo e intacto en su hábitat. NUNCA incluir instrucciones que produzcan:
- Dípticos, comparativas, paneles múltiples, cuadrículas o composiciones divididas
- Secciones transversales, especímenes cortados, carne interna expuesta, reacciones de oxidación/azulamiento
- Vistas "antes/después" o "exterior + corte"
⚠️ NO INCLUYAS iluminación, configuración de cámara ni instrucciones fotográficas — esos parámetros se inyectan automáticamente en el pipeline. Tu única responsabilidad es la biología EXTERNA y la escena.
Genera exclusivamente un único párrafo denso en inglés con esta estructura:
Professional macro photography of [species name], 16:9. [Morfología técnica detallada con COLORES EXACTOS, texturas y proporciones verificadas]. [Composición agrupada en el 50% central con profundidad 3D y fases de desarrollo]. [Imperfecciones y daños bióticos sutiles obligatorios]. [Hábitat, atrezzo vivo y fauna espontánea]. [Rasgo diagnóstico crítico al final].`;

const TAXONOMY_GOLDEN_RULES = {
  "Hydnaceae": "PROHIBIDO generar láminas. El himeneo DEBE estar compuesto por miles de PEQUEÑOS AGUIJONES (púas) cilíndricos, carnosos y frágiles que cuelgan verticalmente como diminutos dedos.",
  "Bankeraceae": "PROHIBIDO generar láminas. El himeneo DEBE estar compuesto por AGUIJONES (púas) cilíndricos y frágiles que cubren toda la parte inferior del sombrero.",
  "Cantharellaceae": "PROHIBIDO generar láminas libres. El himeneo DEBE estar compuesto por PLIEGUES (venas) carnosos, gruesos y fuertemente decurrentes en el pie.",
  "Boletaceae": "PROHIBIDO generar láminas. El himeneo DEBE estar compuesto por una capa de POROS tubulares (estructura de esponja), nunca láminas de ningún tipo.",
  "Morchellaceae": "El sombrero DEBE tener ALVÉOLOS profundos irregulares (forma de panal de abeja). La estructura interna DEBE ser HUECA. Pie blanco acanalado.",
  "Amanitaceae": "Presencia OBLIGATORIA de VOLVA en la base del pie (saco membranoso) y ANILLO (faldilla membranosa) en la parte superior del pie. El color del sombrero varía por especie — NO usar el rojo de A. muscaria salvo que la especie lo tenga.",
  "Russulaceae": "Sin anillo ni volva. Pie quebradizo con textura de tiza, frágil. Si es Lactarius, DEBE mostrar látex (leche) fluyendo visiblemente de los cortes o daños en el sombrero o láminas.",
  "Hericiaceae": "Sin sombrero convencional definido. Aspecto de cascada de largos dientes o espinas blancas que cuelgan verticalmente, parecido a una melena o coral.",
  "Phallaceae": "Forma fálica con una cabeza (gleba) viscosa, fétida y de color verde oliva oscuro. Base emergiendo de un huevo membranoso blanco.",
  "Tuberaceae": "Aspecto de tubérculo irregular hipogeo (subterráneo), carne veteada (marmórea), sin estructuras externas visibles."
};

// Visual hymenium descriptions for the image model prefix.
// These override the strongest visual prior image models have (gills by default).
// Phrased as POSITIVE descriptions of what must be visible, not just prohibitions.
const HYMENIUM_VISUAL_FOR_IMAGE_MODEL = {
  // Positive-only descriptions — naming the concept to avoid (gills, etc.) can reinforce it.
  // Instead, anchor to well-known reference specimens the model has in training.
  "Boletaceae": `INTACT LIVING BOLETE SPECIMEN — THREE ABSOLUTE RULES:
1. PORE SURFACE: The only visible underside is a pale cream to yellow-olive-green sponge-like rim at the cap edge, as seen from the side in a porcini / cep (Boletus edulis) field photo. That thin spongy band is the ONLY underside detail visible. No gills, no blades, no separation lines under the cap.
2. DEVELOPMENT STAGES — BOLETACEAE ONLY: Boletes have NO eggs and NO volvas. Every developmental stage already has a recognisable differentiated cap AND stipe. The smallest primordium looks like a miniature adult — a tiny dark brownish hemispheric cap (1–2 cm) sitting on a short stubby pale stipe with the same coloration pattern as the adult. ALL stages share the same brownish cap surface and characteristic stipe. NO white egg shape, NO volva membrane, NO universal veil wrapping, NO Amanita-like structures at any stage whatsoever.
3. INTACT: Render whole specimens in the forest. No cross-sections, no cut surfaces, no internal flesh visible.`,
  "Hydnaceae":      "HYMENIUM — TOOTHED FUNGI (CRITICAL): The cap underside is covered by hundreds of short downward-pointing spines or teeth, pale cream to buff, like tiny fragile icicles or inverted pins hanging uniformly from the cap surface. Render exactly as seen in Hydnum repandum field photography.",
  "Bankeraceae":    "HYMENIUM — TOOTHED FUNGI (CRITICAL): The cap underside is densely covered by fragile pale gray cylindrical spines or teeth pointing downward, like a fine-toothed comb viewed from below. Render as seen in Sarcodon imbricatus field photography.",
  "Cantharellaceae":"HYMENIUM — CHANTERELLE FOLDS (CRITICAL): The cap underside shows thick, blunt, forking ridges (not thin blades) the same color as the cap, running from the margin down into the stem, like the branching veins on a leaf. Render exactly as seen in Cantharellus cibarius field photography — shallow blunt forking folds, not sharp separate blades.",
  "Morchellaceae":  "CAP SURFACE — MOREL (CRITICAL): The entire cap is covered by deep irregular honeycomb-shaped pits and ridges, like a waffle or brain coral texture. The interior appears hollow when cut. Render exactly as seen in Morchella esculenta field photography.",
  "Hericiaceae":    "FRUITING BODY — LION'S MANE (CRITICAL): No cap, no stem in the conventional sense. The entire fruiting body is a cascading waterfall of long white icicle-like spines or teeth hanging downward, pure white, resembling a lion's mane or white coral. Render as seen in Hericium erinaceus field photography.",
  "Phallaceae":     "FRUITING BODY — STINKHORN (CRITICAL): Phallic white stem emerging from a white egg-like base in the soil. The tip (gleba) is covered in dark olive-green slimy viscous material. Render as seen in Phallus impudicus field photography.",
};

const FOREST_TYPE_LABELS = {
  pinar: 'Pinares y Coníferas',
  hayedo: 'Frondosas - Hayedos',
  robledal: 'Frondosas - Robledales',
  encinar: 'Bosque Mediterráneo - Encinar/Alcornocal',
};


const getExtension = (mime) => {
  const ext = mime.split('/')[1];
  return ext === 'jpeg' ? 'jpg' : ext;
};



// CatalogImagesModal is now in ./CatalogImagesModal.jsx (extracted v5.4)

// Module-level API key — persists across component remounts within the same page session.
// runtimeKey state drives the input field; _moduleApiKey holds the confirmed value.
let _moduleApiKey = '';



// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-black/40 backdrop-blur-xl rounded-2xl p-10 border border-white/10 shadow-2xl">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4 uppercase tracking-tighter">Algo ha salido mal</h1>
            <p className="text-white/60 text-sm mb-8 leading-relaxed">
              La aplicación ha encontrado un error inesperado. Hemos guardado tu progreso en el historial local.
            </p>
            <div className="bg-black/40 rounded-lg p-4 mb-8 text-left overflow-auto max-h-32">
              <code className="text-[10px] text-red-400 font-mono break-all">
                {this.state.error?.message || "Error desconocido"}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-white text-black font-bold rounded-xl uppercase tracking-widest text-[10px] hover:bg-emerald-500 hover:text-white transition-all duration-500"
            >
              Reiniciar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const EditableField = ({
  value,
  onSave,
  className = "",
  inputClassName = "",
  validate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleSave = () => {
    if (tempValue === value) {
      setIsEditing(false);
      return;
    }
    if (!tempValue.trim()) {
      setTempValue(value);
      setIsEditing(false);
      return;
    }

    if (validate) {
      const error = validate(tempValue);
      if (error) {
        alert(error);
        setTempValue(value);
        setIsEditing(false);
        return;
      }
    }

    onSave(tempValue);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        autoFocus
        className={`bg-white/10 border border-white/20 rounded px-2 outline-none transition-all ${inputClassName}`}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') {
            setTempValue(value);
            setIsEditing(false);
          }
        }}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <span
      className={`cursor-pointer hover:text-emerald-400 transition-colors ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      {value}
    </span>
  );
};

const LOADING_MESSAGES = [
  "Analizando morfología fúngica...",
  "Investigando hábitat natural...",
  "Simulando ecosistema específico...",
  "Renderizando redes de micelio...",
  "Ajustando iluminación natural...",
  "Generando texturas de alta resolución...",
  "Finalizando detalles fotorrealistas..."
];

/**
 * Fetches up to `maxPhotos` reference photos from iNaturalist for a given species.
 * Returns an array of { base64, mimeType } objects (may be empty on failure).
 * Used as visual anchors for Gemini so it sees real specimens before writing the prompt.
 * Multiple photos reduce the chance that one atypical/bad specimen skews the result.
 */
async function fetchInatReferences(scientificName, maxPhotos = 3) {
  const results = [];
  try {
    const encoded = encodeURIComponent(scientificName);

    // 1. Find the taxon
    const taxaRes = await fetch(
      `https://api.inaturalist.org/v1/taxa?q=${encoded}&per_page=5&is_active=true&rank=species`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!taxaRes.ok) return results;
    const taxaData = await taxaRes.json();

    const lowerTarget = scientificName.toLowerCase();
    const taxon = taxaData.results?.find(t =>
      t.name?.toLowerCase() === lowerTarget || t.name?.toLowerCase().startsWith(lowerTarget)
    ) ?? taxaData.results?.[0];
    if (!taxon) return results;

    // 2. Collect candidate photo URLs: taxon_photos first, then default_photo
    const candidateUrls = new Set();
    for (const tp of (taxon.taxon_photos ?? [])) {
      const url = tp?.photo?.medium_url;
      if (url) candidateUrls.add(url);
      if (candidateUrls.size >= maxPhotos * 2) break;
    }
    const defaultUrl = taxon.default_photo?.medium_url;
    if (defaultUrl) candidateUrls.add(defaultUrl);

    // 3. Fetch top-rated community observations for more variety if we need more photos
    if (candidateUrls.size < maxPhotos) {
      try {
        const obsRes = await fetch(
          `https://api.inaturalist.org/v1/observations?taxon_id=${taxon.id}&quality_grade=research&photos=true&per_page=6&order_by=votes`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (obsRes.ok) {
          const obsData = await obsRes.json();
          for (const obs of (obsData.results ?? [])) {
            for (const photo of (obs.photos ?? [])) {
              const url = photo.url?.replace('/square.', '/medium.');
              if (url) candidateUrls.add(url);
              if (candidateUrls.size >= maxPhotos * 2) break;
            }
            if (candidateUrls.size >= maxPhotos * 2) break;
          }
        }
      } catch { /* observations fetch is best-effort */ }
    }

    // 4. Download up to maxPhotos images in parallel, convert to base64
    const toBase64 = async (url) => {
      try {
        const imgRes = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (!imgRes.ok) return null;
        const blob = await imgRes.blob();
        const mimeType = blob.type || 'image/jpeg';
        const arrayBuffer = await blob.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < uint8.length; i += chunkSize) {
          binary += String.fromCharCode(...uint8.subarray(i, i + chunkSize));
        }
        return { base64: btoa(binary), mimeType };
      } catch { return null; }
    };

    const urlList = [...candidateUrls].slice(0, maxPhotos);
    const fetched = await Promise.all(urlList.map(toBase64));
    for (const img of fetched) {
      if (img) results.push(img);
    }
  } catch (e) {
    console.warn('[iNat] Reference fetch failed:', e?.message ?? e);
  }
  return results;
}

/**
 * Calls the ListModels API to discover which image generation models are
 * available for the given API key, then returns them ready for the selector.
 * Gemini image models use SDK generateContent; Imagen models use Predict API.
 */
async function fetchAvailableImageModels(apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=200`;
  const res = await fetch(url);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `ListModels error ${res.status}`);
  }
  const data = await res.json();
  const allModels = data.models ?? [];

  return allModels
    .filter(m => {
      const name = (m.name ?? '').toLowerCase();
      const methods = m.supportedGenerationMethods ?? [];
      // Exclude fast/lite variants — they don't follow complex composition instructions reliably
      if (name.includes('fast') || name.includes('lite')) return false;
      // Gemini native image generation models
      if (name.includes('image-generation') || name.includes('imagegen')) return true;
      // Imagen predict models
      if (name.includes('imagen') && methods.includes('predict')) return true;
      return false;
    })
    .map(m => {
      const rawName = m.name ?? '';
      const id = rawName.replace('models/', '');
      const methods = m.supportedGenerationMethods ?? [];
      return {
        id,
        displayName: m.displayName ?? id,
        method: methods.includes('predict') ? 'predict' : 'generateContent',
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

export default function ImageGenerator() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

function App() {
  const [history, setHistory] = useState(() => {
    let items = [];
    try {
      const saved = localStorage.getItem('fungus_history');
      items = saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse history from localStorage:", e);
      items = [];
    }

    // Migration: Ensure all items have a specimenId
    let changed = false;
    items = items.map((item, index) => {
      if (!item.settings) {
        changed = true;
        return {
          ...item,
          settings: {
            specimenId: (items.length - index).toString().padStart(3, '0'),
            scientificName: 'Unknown',
            specimenCount: 1,
            shotType: SHOT_TYPES[0],
            description: '',
            aspectRatio: '1:1',
            fileFormat: 'image/jpeg',
            quality: 0.8
          }
        };
      }
      if (!item.settings.specimenId) {
        changed = true;
        // Assign sequential IDs starting from 001 for existing items
        // We use the reverse index so oldest is 001
        const id = (items.length - index).toString().padStart(3, '0');
        return {
          ...item,
          settings: { ...item.settings, specimenId: id }
        };
      }
      return item;
    });

    if (changed) {
      localStorage.setItem('fungus_history', JSON.stringify(items));
    }
    return items;
  });

  // ── URL query param ?especie= (pre-fill from AdminGallery; kept in sync with selector) ─
  const [searchParams, setSearchParams] = useSearchParams()

  // ── Gallery-first mode (v5.4): arrived from AdminGeneratorHub via ?generar=1 ─────────
  // Hides selector, ID field, Nuevo/CSV, and reference panel; shows species title instead.
  const isGalleryFirst = searchParams.get('generar') === '1'

  // ── Admin nav — ensure generator always shows admin nav items ─────────────
  const { setIsAdminView } = useApp()
  useEffect(() => { setIsAdminView(true) }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Species from API ──────────────────────────────────────────────────────
  const { species: apiSpecies } = useSpecies()
  const mushroomSpeciesData = useMemo(() =>
    apiSpecies.map(s => ({
      id: s.id,                        // "esp-063"
      cleanId: s.id.replace('esp-', ''), // "063"
      scientificName: s.scientificName,
      family: s.family,
      habitat: (s.forestTypes ?? [])
        .map(ft => FOREST_TYPE_LABELS[ft] ?? ft)
        .join(', ') || 'su hábitat natural',
    })),
    [apiSpecies]
  )

  // ── Species combobox state ─────────────────────────────────────────────────
  const [speciesOpen, setSpeciesOpen] = useState(false)
  const [speciesFilter, setSpeciesFilter] = useState('')
  const speciesComboRef = useRef(null)
  const speciesInputRef = useRef(null)

  const filteredSpecies = useMemo(() => {
    const q = speciesFilter.trim().toLowerCase()
    if (!q) return mushroomSpeciesData
    return mushroomSpeciesData.filter(s =>
      s.scientificName.toLowerCase().includes(q) ||
      s.cleanId.includes(q) ||
      s.family.toLowerCase().includes(q)
    )
  }, [mushroomSpeciesData, speciesFilter])


  const getNextSuffixId = (baseId, currentHistory) => {
    if (!baseId) return "001a";
    // Remove existing suffix if any (e.g., 001a -> 001)
    const base = baseId.replace(/[a-z]+$/, '');
    let suffixCode = 'a'.charCodeAt(0);
    let newId = base + String.fromCharCode(suffixCode);

    const existingIds = new Set(currentHistory.map(item => item.settings.specimenId));

    while (existingIds.has(newId)) {
      suffixCode++;
      newId = base + String.fromCharCode(suffixCode);
      // Safety break
      if (suffixCode > 'z'.charCodeAt(0)) break;
    }
    return newId;
  };

  const [settings, setSettings] = useState({
    specimenId: '', // Will be set in useEffect
    scientificName: '',
    specimenCount: 3,
    shotType: SHOT_TYPES[4],
    description: '',
    aspectRatio: '16:9',
    fileFormat: 'image/webp',
    quality: 0.85,
  });

  // specimenId is now always set by the combobox (derived from selected species DB id).
  // No auto-initialization — stays '' until the user selects a species.
  const [viewedItem, setViewedItem] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [lastPrompt, setLastPrompt] = useState('');
  const [promptParts, setPromptParts] = useState([]);
  const [currentPromptPartIndex, setCurrentPromptPartIndex] = useState(0);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [isRefining, setIsRefining] = useState(false);
  const [refinementText, setRefinementText] = useState('');
  const [error, setError] = useState(null);
  const [refineWarning, setRefineWarning] = useState(null); // non-fatal: shown when refine falls back to text-to-image
  const [hasKey, setHasKey] = useState(null);
  const [runtimeKey, setRuntimeKey] = useState(''); // API key entered at runtime (fallback when env var not set)
  const [recentBatchIds, setRecentBatchIds] = useState([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkFormat, setBulkFormat] = useState('image/jpeg');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(''); // prompt shown in viewer while image loads
  const [generationTime, setGenerationTime] = useState(0);
  const [retryStatus, setRetryStatus] = useState(null);
  const [generationStep, setGenerationStep] = useState(null);
  const [statusLog, setStatusLog] = useState([]);
  const logContainerRef = React.useRef(null);

  // Auto-scroll log container (never scrollIntoView — that drags the whole page)
  React.useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [statusLog]);

  const copyLog = () => {
    const logText = statusLog.join('\n');
    navigator.clipboard.writeText(logText);
  };

  const copyPrompt = () => {
    if (currentPrompt) navigator.clipboard.writeText(currentPrompt);
  };

  const downloadLog = () => {
    const logText = statusLog.join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mycological-log-${new Date().toISOString()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const findSpeciesData = (name) => {
    const lowerName = name.toLowerCase();
    return mushroomSpeciesData.find(s => {
      const sLower = (s.scientificName ?? '').toLowerCase();
      // Match if exactly equal or if the scientific name part matches
      const sScientificPart = sLower.includes(' - ') ? sLower.split(' - ')[1] : sLower;
      return sLower === lowerName || sScientificPart === lowerName;
    });
  };

  const generateFallbackPrompt = (name, settings) => {
    const speciesData = findSpeciesData(name);
    const habitat = speciesData ? speciesData.habitat : "its natural forest habitat";

    // Extract scientific name for the prompt
    const cleanName = name.includes(' - ') ? name.split(' - ')[1] : name;

    let composition = "1 specimen";
    if (settings.specimenCount === 2) {
      const layouts = [
        "2 specimens (adult and young) growing close but distinct",
        "2 specimens sprouting from the same base",
        "2 specimens with one slightly in front of the other creating depth"
      ];
      composition = layouts[Math.floor(Math.random() * layouts.length)];
    }
    if (settings.specimenCount >= 3) {
      const layouts = [
        "3 specimens (adult, young and primordium) scattered naturally at different depths",
        "3 specimens in a staggered triangular formation within the central 50%",
        "3 specimens with the adult dominant and others appearing at slightly different focal planes",
        "3 specimens growing in a small, loose cluster with varying heights"
      ];
      composition = layouts[Math.floor(Math.random() * layouts.length)];
    }

    // Simular el realismo biótico y morfológico con alta variabilidad
    const rand = Math.random();
    let realismDetails = "";

    // Siempre añadir una ligera imperfección morfológica al adulto (asimetría natural)
    const morphological = [
      "with a slightly asymmetrical cap and natural wavy margins",
      "with a subtly curved stem and irregular cap edges",
      "showing minor natural fissures at the cap margin",
      "with a slightly eccentric stem placement and organic growth lines"
    ];
    realismDetails += ", " + morphological[Math.floor(Math.random() * morphological.length)];

    if (rand < 0.4) {
      // 40% Probabilidad de realismo estructural y entorno
      const structural = [
        "showing delicate white mycelium threads at the very base of the stem",
        "surrounded by lush green moss and tiny lichen-covered twigs",
        "nestled among fresh pine needles and a few dry oak leaves on the ground",
        "with a velvety, matte texture on the cap that catches the rim light",
        "with a slightly viscid, glossy sheen reflecting the golden hour sun",
        "surrounded by a few tiny, translucent wild sprouts"
      ];
      realismDetails += ", " + structural[Math.floor(Math.random() * structural.length)];
    } else if (rand < 0.7) {
      const imperfections = [
        "with tiny specks of dark forest soil near the base of the stem",
        "with natural micro-cracks on the cap surface due to rapid growth",
        "with fresh morning dew droplets scattered elegantly on the surface",
        "with slightly dried, papery edges on the older specimen",
        "with a very subtle, single organic fragment of moss at the base"
      ];
      realismDetails += ", " + imperfections[Math.floor(Math.random() * imperfections.length)];
    }
    // El resto (30%) se queda solo con la imperfección morfológica base para un look limpio pero real

    // Vida silvestre mucho más rara (10%) para que sea una sorpresa real
    if (Math.random() < 0.1) {
      const wildlife = [
        "a tiny translucent insect resting on a nearby moss patch",
        "a single strand of spider silk with a micro-droplet of water",
        "a small forest ant exploring the ground near the base",
        "a tiny beetle partially hidden under a nearby leaf"
      ];
      realismDetails += ", " + wildlife[Math.floor(Math.random() * wildlife.length)];
    }

    // Determinar negativos taxonómicos según el género con pesos reforzados
    let negativeTaxonomic = "blurry, distorted, low quality, watermark, text";
    const lowerName = cleanName.toLowerCase();

    if (lowerName.includes("russula") || lowerName.includes("lactarius")) {
      realismDetails += ", with a perfectly smooth and clean cylindrical stem, bare and naked stipe";
    }

    return `Professional macro photography of ${cleanName} mushrooms, 16:9 aspect ratio. 
    The ${composition} are grouped in the central 50% of the frame with 3D depth. 
    Habitat: ${habitat}. ${settings.description || ''}${realismDetails}. 
    Lighting: Golden hour with low-angle warm light, sun always partially obscured by trees or terrain to prevent overexposure and maintain diffuse lighting, rim lighting and subtle volumetric crepuscular rays. 
    Technical: Macro lens 105mm, f/4.0, sharp focus on the central group, creamy deep bokeh background, subsurface scattering, hyper-realistic textures.
    Negative Prompt: ${negativeTaxonomic}, fake, cartoon, 3d render, illustration.`;
  };
  // ── Catalog images modal (save generated image + reorder existing) ──────────
  // { newImageDataUrl?: str, newImageMimeType?: str } | null
  // null = closed; {} = open from sidebar (no new image); {newImageDataUrl,...} = open after "Guardar"
  const [catalogModal, setCatalogModal] = useState(null);
  const [applyStatus, setApplyStatus] = useState(null); // null | 'saving' | 'success' | 'error'
  // Reference species data loaded when ?especie= is in the URL
  const [referenceSpecies, setReferenceSpecies] = useState(null);
  // Structured visual DNA from mushroom_visual_prompts table (null = not loaded yet or unavailable)
  const [visualPromptData, setVisualPromptData] = useState(null);
  // 'loading' | 'loaded' | 'missing' | 'error' — shown as a badge next to the species name
  const [vpStatus, setVpStatus] = useState('loading');
  // Tracks which species ID is currently loaded — used to skip redundant re-fetches
  // when apiSpecies changes (e.g. mockSpecies → full list, or after invalidateSpeciesListCache)
  // without needing referenceSpecies in the effect deps (which would cause infinite loops).
  const loadedReferenceIdRef = useRef(null);

  // savedToCatalog: false when a new image is generated, true after saving to DB
  const [savedToCatalog, setSavedToCatalog] = useState(false);

  // Block in-app navigation when there is an unsaved generated image.
  // useBlocker requires a data router (createBrowserRouter) — see main.jsx.
  const navigationBlocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !!generatedImage &&
      !savedToCatalog &&
      currentLocation.pathname !== nextLocation.pathname
  );

  const [batchProgress, setBatchProgress] = useState(null);
  const [batchQueue, setBatchQueue] = useState();
  const cancelRef = React.useRef(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isExportExpanded, setIsExportExpanded] = useState(false);
  const [isSceneExpanded, setIsSceneExpanded] = useState(false);

  // ── Image model discovery ─────────────────────────────────────────────────
  // Populated by fetchAvailableImageModels when the API key is first confirmed.
  const [availableImageModels, setAvailableImageModels] = useState([]);
  const [imageModel, setImageModel] = useState('');       // '' → not yet discovered
  const [loadingModels, setLoadingModels] = useState(false);
  // ─────────────────────────────────────────────────────────────────────────
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    checkApiKey();
  }, []);

  // Warn on browser close/refresh when there's an unsaved generated image
  useEffect(() => {
    const handler = (e) => {
      if (generatedImage && !savedToCatalog) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [generatedImage, savedToCatalog]);

  // Pre-fill species from ?especie= URL param (navigated from AdminGallery or the combobox).
  // Re-runs when searchParams changes (new species selected) or when apiSpecies changes
  // (mockSpecies → full list on mount, or after invalidateSpeciesListCache saves).
  useEffect(() => {
    const especieId = searchParams.get('especie');
    if (!especieId || apiSpecies.length === 0) return;
    const found = apiSpecies.find(s => s.id === especieId);
    if (!found) return; // species not yet in current apiSpecies batch (e.g. still mockSpecies)

    const idNum = especieId.replace('esp-', '');
    setSettings(prev =>
      prev.specimenId === idNum && prev.scientificName === found.scientificName
        ? prev  // no change — avoid a spurious re-render
        : { ...prev, specimenId: idNum, scientificName: found.scientificName }
    );

    // Skip re-fetch if the same species is already loaded — this prevents flicker when
    // apiSpecies changes (mockSpecies → full list) while the selection hasn't changed.
    if (loadedReferenceIdRef.current === especieId) return;

    const controller = new AbortController();
    const opts = { cache: 'no-store', headers: authHeaders(), signal: controller.signal };
    setVpStatus('loading');
    // Fetch species detail and visual prompt data in parallel
    Promise.all([
      fetch(`${API_BASE}/species/${especieId}`, opts).then(r => r.ok ? r.json() : null),
      fetch(`${API_BASE}/species/${especieId}/visual-prompt`, opts).then(r => r.ok ? r.json() : null),
    ])
      .then(([detail, vpData]) => {
        if (detail) {
          setReferenceSpecies(detail);
          loadedReferenceIdRef.current = especieId;
        }
        // vpData may be null (no entry yet) — frontend falls back to Gemini-only pipeline
        setVisualPromptData(vpData ?? null);
        setVpStatus(vpData ? 'loaded' : 'missing');
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        // Network/API failure — mark as error so user can see and retry
        setVisualPromptData(null);
        setVpStatus('error');
      });
    return () => controller.abort();
  }, [searchParams, apiSpecies]);

  // Close the species combobox when clicking outside it.
  useEffect(() => {
    if (!speciesOpen) return
    const handler = (e) => {
      if (speciesComboRef.current && !speciesComboRef.current.contains(e.target)) {
        setSpeciesOpen(false)
        setSpeciesFilter('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [speciesOpen])

  // Reference panel is loaded exclusively via the ?especie= useEffect above.
  // No secondary sync needed — the combobox always updates searchParams, which triggers that effect.

  useEffect(() => {
    try {
      localStorage.setItem('fungus_history', JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save history to localStorage:", e);
      // If quota exceeded, we might want to prune history even more
      if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        // Prune to last 10 items if we hit quota
        setHistory(prev => prev.slice(0, 10));
      }
    }
  }, [history]);

  useEffect(() => {
    let interval;
    if (isGenerating) {
      setGenerationTime(0);
      interval = setInterval(() => {
        setGenerationTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    let interval;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    let interval;
    if (generatedImage && promptParts.length > 1) {
      interval = setInterval(() => {
        setCurrentPromptPartIndex((prev) => (prev + 1) % promptParts.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [generatedImage, promptParts]);

  const checkApiKey = () => {
    const envKey = import.meta.env?.VITE_GEMINI_API_KEY;
    // _moduleApiKey persists across remounts — no need to re-enter the key on navigation
    setHasKey(!!(envKey || _moduleApiKey));
  };

  // Discover available image generation models as soon as we have a valid API key.
  // Runs once on mount (if key is already set) and whenever hasKey transitions to true.
  useEffect(() => {
    if (!hasKey) return;
    const key = getApiKey();
    if (!key || availableImageModels.length > 0) return; // already loaded
    setLoadingModels(true);
    fetchAvailableImageModels(key)
      .then(models => {
        setAvailableImageModels(models);
        // Auto-select: prefer Imagen 4, fallback to first available
        if (models.length > 0) {
          const preferred = models.find(m => m.id === 'imagen-4.0-generate-001')
            ?? models.find(m => m.id.includes('imagen-4'))
            ?? models[0];
          setImageModel(preferred.id);
        }
      })
      .catch(err => {
        console.warn('[ImageGen] fetchAvailableImageModels failed:', err.message);
        // Fallback: populate with known models so the selector still shows something
        // Fast/lite variants excluded — they don't follow complex composition instructions
        const fallback = [
          { id: 'imagen-4.0-generate-001', displayName: 'Imagen 4', method: 'predict' },
          { id: 'imagen-3.0-generate-001', displayName: 'Imagen 3', method: 'predict' },
          { id: 'gemini-2.0-flash-preview-image-generation', displayName: 'Gemini 2.0 Flash Preview Image', method: 'generateContent' },
        ];
        setAvailableImageModels(fallback);
        setImageModel('imagen-4.0-generate-001');
      })
      .finally(() => setLoadingModels(false));
  }, [hasKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Returns the active API key: env var takes priority, module-level key is the manual fallback
  const getApiKey = () => import.meta.env?.VITE_GEMINI_API_KEY || _moduleApiKey || '';

  const handleConfirmRuntimeKey = () => {
    const trimmed = runtimeKey.trim();
    if (trimmed) {
      _moduleApiKey = trimmed; // persist for future remounts in this session
      setHasKey(true);
    }
  };

  const processImage = (base64, format, quality, targetWidth = null, targetHeight = null) => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Tiempo de espera agotado al procesar la imagen"));
      }, 30000); // 30 seconds timeout

      const img = new Image();
      img.onload = () => {
        clearTimeout(timeout);
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth ?? img.width;
        canvas.height = targetHeight ?? img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("No se pudo obtener el contexto del canvas"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const converted = canvas.toDataURL(format, quality);
        resolve(converted);
      };
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error("No se pudo cargar la imagen para la conversión"));
      };
      img.src = base64;
    });
  };

  const handleDownload = async () => {
    if (!generatedImage) return;

    // Use viewedItem settings if available for the ID, but keep current global export settings for format/quality
    const id = viewedItem ? viewedItem.settings.specimenId : settings.specimenId;
    const extension = getExtension(settings.fileFormat);

    // Download original: esp-<id>-main-large.<extension>
    const linkOriginal = document.createElement('a');
    linkOriginal.href = generatedImage;
    linkOriginal.download = `esp-${id}-main-large.${extension}`;
    document.body.appendChild(linkOriginal);
    linkOriginal.click();
    document.body.removeChild(linkOriginal);

    // Reduced: esp-<id>-main.<extension>
    try {
      const smallImage = await processImage(generatedImage, settings.fileFormat, settings.quality, 688, 384);
      const linkSmall = document.createElement('a');
      linkSmall.href = smallImage;
      linkSmall.download = `esp-${id}-main.${extension}`;
      document.body.appendChild(linkSmall);
      linkSmall.click();
      document.body.removeChild(linkSmall);
    } catch (err) {
      console.error("Error creating small image:", err);
    }
  };

  // Generates an image using the model currently selected in imageModel state.
  // Routing is done by name prefix:
  //   'gemini-*' → SDK generateContent + responseModalities (native image gen)
  //   'imagen-*' → Predict REST API
  const callImagen3 = async (prompt, apiKey, aspectRatio = '16:9') => {
    const model = imageModel || 'gemini-2.0-flash-preview-image-generation';

    if (model.startsWith('gemini')) {
      // Gemini native image generation via SDK
      const genAILocal = new GoogleGenerativeAI(apiKey);
      const geminiModel = genAILocal.getGenerativeModel({ model });
      const response = await geminiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
      });
      const parts = response.response?.candidates?.[0]?.content?.parts ?? [];
      const imagePart = parts.find(p => p.inlineData);
      if (!imagePart) throw new Error('El modelo Gemini no devolvió imagen.');
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }

    // Imagen Predict API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio } }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Imagen API error ${res.status}`);
    }
    const data = await res.json();
    const pred = data?.predictions?.[0];
    if (!pred?.bytesBase64Encoded) throw new Error("Imagen API no devolvió imagen.");
    return `data:${pred.mimeType || 'image/png'};base64,${pred.bytesBase64Encoded}`;
  };

  // Real image-to-image editing via Gemini multimodal (image input → image output).
  const callGeminiRefine = async (imageBase64, mimeType, instruction, apiKey) => {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-preview-image-generation' });
    const response = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: imageBase64 } },
          { text: instruction },
        ],
      }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
    });
    const parts = response.response?.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find(p => p.inlineData);
    if (!imagePart) throw new Error('El modelo de refinamiento no devolvió imagen.');
    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
  };

  const withTimeout = (promise, ms) => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Tiempo de espera agotado (Timeout de red)"));
      }, ms);
    });

    return Promise.race([
      promise.finally(() => clearTimeout(timeoutId)),
      timeoutPromise
    ]);
  };

  const withRetry = async (fn, maxRetries = 3, timeoutMs = 60000, initialDelay = 1000, onRetry) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        // Reduced timeout to prevent "zombie" state
        return await withTimeout(fn(), timeoutMs);
      } catch (err) {
        lastError = err;
        const errorMsg = err.message || "";
        const isRetryable =
          errorMsg.includes("500") ||
          errorMsg.includes("INTERNAL") ||
          errorMsg.includes("503") ||
          errorMsg.includes("UNAVAILABLE") ||
          errorMsg.includes("429") ||
          errorMsg.includes("RESOURCE_EXHAUSTED") ||
          errorMsg.includes("high demand") ||
          errorMsg.includes("Service Unavailable") ||
          errorMsg.includes("Timeout");

        if (!isRetryable || i === maxRetries - 1) throw err;

        if (onRetry) onRetry(i + 1, err);

        // Faster exponential backoff
        const delay = initialDelay * Math.pow(1.5, i) + (Math.random() * 500);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw lastError;
  };

  const handleMassImport = (e) => {
    if (isGenerating) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result;
      const lines = text.split('\n').filter(line => line.trim().length > 0);

      // Skip header if it looks like one
      if (lines.length === 0) {
        setError("El archivo CSV está vacío.");
        return;
      }

      const startIdx = (lines[0] && (lines[0].toLowerCase().includes('id') || lines[0].toLowerCase().includes('nombre'))) ? 1 : 0;

      // Process up to 100 items to avoid overloading but allow more than 10
      const items = lines.slice(startIdx, startIdx + 100).map(line => {
        const parts = line.split(',');
        const id = parts[0]?.trim() || '';
        const name = parts[1]?.trim() || '';
        return {
          id: id.replace(/^esp-/, ''),
          name: name
        };
      }).filter(item => item.name);

      if (items.length > 0) {
        generateImage(items);
      } else {
        setError("El CSV no contiene datos válidos.");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const generateImage = async (items) => {
    // When called without explicit items (e.g. Regenerar button), resolve settings
    // from the currently viewed item so ID and name stay in sync with what's displayed.
    // settings.specimenId is cleared after each generation, so viewedItem.settings
    // is the reliable source for the specimen being re-generated.
    const activeSettings = (!items && viewedItem) ? viewedItem.settings : settings;
    const generationList = items || activeSettings.scientificName.split(',').map((n, i) => {
      const baseIdNum = parseInt(activeSettings.specimenId) || 0;
      return {
        id: (baseIdNum + i).toString().padStart(3, '0'),
        name: n.trim()
      };
    }).filter(item => item.name.length > 0);

    const existingIds = new Set(history.map(h => h.settings.specimenId));
    const finalGenerationList = items
      ? generationList.filter(item => !existingIds.has(item.id))
      : generationList;

    if (items && finalGenerationList.length === 0 && generationList.length > 0) {
      setError("Todos los especímenes del CSV ya existen en la biblioteca (IDs duplicados).");
      setIsGenerating(false);
      return;
    }

    if (finalGenerationList.length === 0) {
      setError("Por favor, introduce un nombre científico.");
      setIsGenerating(false);
      return;
    }

    const isBatch = finalGenerationList.length > 1;

    setIsGenerating(true);
    setGenerationStep("Iniciando motor...");
    setStatusLog(["Iniciando sesión de IA..."]);
    setBatchProgress(isBatch ? { current: 0, total: finalGenerationList.length } : null);
    setBatchQueue(finalGenerationList.map(item => ({ ...item, status: 'pending' })));
    cancelRef.current = false;
    setError(null);
    setRetryStatus(null);
    setPromptParts([]);
    setCurrentPrompt('');
    setIsRefining(false);
    setRecentBatchIds([]);
    setGeneratedImage(null);

    try {
      // Ensure key is selected for image generation models with timeout to prevent hanging
      setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Validando sesión de IA...`]);

      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error("Clave API no configurada. Por favor, selecciona una clave válida.");
      }
      setStatusLog(prev => [...prev, "Sesión de IA validada."]);
      const genAI = new GoogleGenerativeAI(apiKey);
      const newBatchIds = [];
      let lastFinalImage = null;
      let lastPromptParts = [];
      let lastGeneratedItem = null;
      let successCount = 0;
      let failCount = 0;
      let firstItemError = null;

      for (let i = 0; i < finalGenerationList.length; i++) {
        if (cancelRef.current) break;

        if (isBatch) {
          setBatchProgress({ current: i + 1, total: finalGenerationList.length });
        }

        const { id: currentSpecimenId, name: currentName } = finalGenerationList[i];

        setBatchQueue(prev => prev.map((item, idx) =>
          idx === i ? { ...item, status: 'processing' } : item
        ));

        if (i > 0) {
          setGenerationStep("Esperando entre capturas...");
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        try {
          setRetryStatus(null);
          setGenerationStep(`Conectando para ${currentName}...`);
          setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Iniciando ${currentName}...`]);

          const speciesData = findSpeciesData(currentName);
          const habitatContext = speciesData ? speciesData.habitat : "its natural forest habitat";
          // Use referenceSpecies.family as authoritative fallback — findSpeciesData may
          // miss if the name format doesn't match exactly (e.g. gallery-first mode).
          const family = speciesData?.family ?? referenceSpecies?.family ?? null;
          const goldenRule = family ? TAXONOMY_GOLDEN_RULES[family] : null;

          // Extract scientific name for the prompt
          const cleanName = currentName.includes(' - ') ? currentName.split(' - ')[1] : currentName;

          let extraTaxonomicCommand = "";
          if (goldenRule) {
            extraTaxonomicCommand = `\nESCUDO DE VERDAD (TAXONOMY GOLDEN RULE): ${goldenRule}`;
          }

          // Build species-specific data blocks from referenceSpecies.extra_data.
          // diagnosticBlock → goes FIRST in enginePrompt.
          // morphologyBlock → general morphology reference.
          // antiConf → drives both the antiConfusionBlock in Gemini prompt AND
          //            the Imagen 4 genus-name replacement (post-processing).
          let diagnosticBlock = "";
          let morphologyBlock = "";
          let diagParts = [];  // exposed outside if-block for Imagen 4 alias construction
          const refData = referenceSpecies?.extra_data ?? referenceSpecies;
          if (refData) {
            const cap   = refData.cap;
            const stem  = refData.stem;
            const flesh = refData.flesh;
            const spore = refData.sporePrint ?? refData.spore_print;
            const morphLines = [];

            if (cap) {
              morphLines.push(`CAP: shape="${cap.forma ?? ''}", COLOR="${cap.color ?? ''}", diameter=${cap.diametro ?? ''}`);
              const sup = cap.superficie ?? '';
              if (sup) {
                const diagMatch = sup.match(/\b(RASGO\b|DISTINTIVO\b|DIAGNOSTIC\b|DISTINCTIVE\b)/i);
                if (diagMatch) {
                  const splitIdx  = sup.indexOf(diagMatch[0]);
                  const texPart   = sup.slice(0, splitIdx).trim().replace(/[.:,]+$/, '');
                  const diagPart  = sup.slice(splitIdx).trim();
                  if (texPart) morphLines.push(`CAP texture: "${texPart}"`);
                  diagParts.push(diagPart);
                } else {
                  morphLines.push(`CAP texture: "${sup}"`);
                }
              }
            }
            if (stem)  morphLines.push(`STIPE: shape="${stem.forma ?? ''}", COLOR="${stem.color ?? ''}", height=${stem.altura ?? ''}, diameter=${stem.diametro ?? ''}`);
            if (flesh) morphLines.push(`FLESH: color="${flesh.color ?? ''}", texture="${flesh.textura ?? ''}", smell="${flesh.olor ?? ''}"`);
            if (spore) morphLines.push(`SPORE PRINT: ${spore}`);

            if (diagParts.length > 0) {
              diagnosticBlock = `
🔴 DEFINING DIAGNOSTIC FEATURE — DESCRIBE FIRST AND LAST 🔴
TRAIT: ${diagParts.join(' | ')}
• Open the generated prompt with this feature. Use scale words: LARGE, PROMINENT, IMPOSSIBLE TO MISS.
• Close the prompt with: "CRITICAL: [this feature] must be unmistakably visible."`;
            }

            if (morphLines.length > 0) {
              morphologyBlock = `
VERIFIED MORPHOLOGY (reproduce exactly — photos override text on color):
${morphLines.join('\n')}`;
            }
          }

          // antiConf drives both Gemini hint and Imagen 4 post-processing
          const antiConf = refData?.antiConfusion ?? [];
          const antiConfusionBlock = antiConf.length > 0
            ? `\n🚫 FORBIDDEN FEATURES — TRAINING DATA BIAS OVERRIDE (applies to ALL specimens: adult, young, AND primordium):\n${antiConf.map(f => `• NEVER render: ${f}`).join('\n')}\nThese constraints override any learned genus-level defaults. Enforce on every specimen in the scene.`
            : '';

          // Seasonal context for realistic ground cover and fauna
          const fruitingMonths = referenceSpecies?.fruiting_months ?? refData?.fruitingMonths ?? [];
          let seasonalContext = "";
          if (fruitingMonths.length > 0) {
            const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            const avg = Math.round(fruitingMonths.reduce((a,b)=>a+b,0) / fruitingMonths.length);
            const season = avg <= 3 || avg === 12 ? "winter" : avg <= 5 ? "spring" : avg <= 8 ? "summer" : "autumn";
            const monthList = fruitingMonths.map(m => monthNames[m-1]).join(', ');
            seasonalContext = `\nSEASON: ${season} (${monthList}) — ground cover, light angle, and fauna must match.`;
          }

          // ── Myco-Engine pipeline selection ──────────────────────────────────────
          // If structured visual DNA is available from the DB (mushroom_visual_prompts),
          // use the 4-layer deterministic pipeline — morphology is pre-validated and
          // injected directly; Gemini only generates the creative scene details.
          // Otherwise fall back to the Gemini-interprets-free-text pipeline.
          const hasStructuredData = !!visualPromptData;
          if (hasStructuredData) {
            setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🧬 DNA Visual en BD → pipeline estructurado (${visualPromptData.is_validated ? '✓ validado' : 'borrador'})`]);
          } else {
            setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] 📝 Sin DNA Visual en BD → pipeline Gemini (fallback)`]);
          }

          // ── Layer 1: Morphological identity (DB data or Gemini-derived) ────────
          // When hasStructuredData: assembled directly from validated fields.
          // When fallback: built from refData (existing logic below).
          let layer1_morphology = "";
          if (hasStructuredData) {
            const vp = visualPromptData;
            const g = applyVisualGlossary;
            const parts = [
              vp.cap_description     ? `CAP: ${g(vp.cap_description)}`              : null,
              vp.stipe_description   ? `STIPE: ${g(vp.stipe_description)}`          : null,
              vp.hymenium_description? `HYMENIUM: ${g(vp.hymenium_description)}`    : null,
              vp.extra_morphology_visual ? `ADDITIONAL: ${g(vp.extra_morphology_visual)}` : null,
            ].filter(Boolean);
            layer1_morphology = parts.join('\n');
          }

          // Layer 2 composition block — same regardless of pipeline
          const specimenCountLabel = settings.specimenCount >= 4 ? '4 or more' : settings.specimenCount;
          const stageBlock = settings.specimenCount >= 4
            ? `- DEVELOPMENT STAGES (4+ specimens): a natural family group — one primordium (compact, emergent), one or two young specimens (caps still convex), two or more fully open adults (caps fully extended, all diagnostic features at maximum expression). Dispersed naturally at genuinely different depths within the central zone. NOT lined up. Feels like a spontaneous forest discovery.`
            : settings.specimenCount >= 3
            ? `- DEVELOPMENT STAGES (3 specimens): THREE DISTINCT DEVELOPMENTAL STAGES at genuinely different distances from the camera. DEPTH ORDER IS MANDATORY: (1) ADULT — in the FOREGROUND, razor-sharp focus, largest in frame, cap fully extended with all diagnostic features visible; (2) YOUNG — in the MIDGROUND, cap still fully convex, noticeably smaller and slightly blurred; (3) PRIMORDIUM — in the BACKGROUND, compact sphere or ovoid, smallest and most blurred. The adult must appear at least 2–3× larger than the primordium. They must NOT be in a straight line — stagger them naturally so the young offsets sideways from the adult-primordium axis.`
            : settings.specimenCount === 2
            ? `- DEVELOPMENT STAGES (2 specimens): adult (fully open, diagnostic features prominent) + young (cap still convex).`
            : `- DEVELOPMENT STAGE (1 specimen): fully open adult with all diagnostic features at maximum expression.`;

          // ── Build enginePrompt ───────────────────────────────────────────────────
          let enginePrompt;
          if (hasStructuredData) {
            // STRUCTURED PIPELINE: Gemini receives pre-validated morphology;
            // its ONLY job is to write a creative scene (atmosphere, fauna, light moment).
            const vp = visualPromptData;
            const substrateCtx    = vp.preferred_substrate  ?? habitatContext;
            const habitatCtx      = vp.habitat_context      ?? habitatContext;
            const faunaHint       = vp.associated_fauna      ? `Fauna hint (use or vary): ${vp.associated_fauna}.` : '';
            const geminiCtx       = vp.extra_morphology_gemini ? `Species context (for scene realism): ${vp.extra_morphology_gemini}` : '';
            const compositionRule = vp.composition_notes     ? `\nSPECIES-SPECIFIC COMPOSITION RULE (MANDATORY): ${vp.composition_notes}` : '';
            enginePrompt = `You are writing the SCENE section of a mycological image prompt for: "${cleanName}".${extraTaxonomicCommand}

MORPHOLOGY IS FIXED — do NOT invent or modify any visual feature. The morphology is:
${layer1_morphology}
${geminiCtx ? '\n' + geminiCtx : ''}
${compositionRule}

YOUR TASK — write ONLY the scene/environment/atmosphere details (3–5 sentences):
1. COMPOSITION: ${specimenCountLabel} specimen(s) grouped in the CENTRAL 50% of the frame, pronounced 3D depth (foreground noticeably closer and larger than background specimens). ${stageBlock}${vp.composition_notes ? ' Apply the SPECIES-SPECIFIC COMPOSITION RULE above.' : ''}
2. SUBSTRATE & GROUND COVER: describe the immediate forest floor in detail (${substrateCtx}).
3. HABITAT & LIGHT MOMENT: one specific atmospheric detail — an unusual shaft of light, mist between trees, dewdrops on moss, or similar. Habitat: ${habitatCtx}.
4. FAUNA (optional): ${faunaHint || 'one small animal that fits the habitat — a beetle, snail, spider, etc. Must feel incidental, not posed.'}
5. CRITICAL CLOSE: "CRITICAL: [one key EXTERNAL visual feature from the morphology above] must be unmistakably prominent."
   — Use ONLY external visible features. NEVER mention cut surfaces, reactions when damaged, or internal flesh.

DO NOT include any morphology beyond what is given above. DO NOT include lighting or camera specs.`;
          } else {
            // FALLBACK PIPELINE: Gemini interprets free-text morphology (existing behavior)
            enginePrompt = `Generate a photorealistic mycological image prompt for: "${cleanName}".${extraTaxonomicCommand}
${antiConfusionBlock}
${diagnosticBlock}
${morphologyBlock}
${seasonalContext}

SCENE FORMAT: ONE single continuous photographic frame — ABSOLUTELY NO diptychs, split screens, panels, collages, before/after comparisons, or multi-image composites. The entire image must be a single uninterrupted scene.
SCENE CONTENT: ${specimenCountLabel} specimen(s).
- CENTERING (CRITICAL for card crop): All specimens grouped in the CENTRAL ~50% of the frame width. The left and right 25% of the frame are background/habitat only — never cut off specimens at card edges.
- 3D DEPTH (MANDATORY): Specimens at GENUINELY DIFFERENT DEPTHS with realistic separation — foreground specimen noticeably closer (larger, sharper), mid specimen at ~1.5–2× distance, background specimen at ~2.5–3× distance. NEVER lined up at the same depth plane. The depth difference must be VISIBLE and PRONOUNCED, not subtle.
${stageBlock}
- Habitat: ${habitatContext}. Shot: ${settings.shotType}.${settings.description ? ` Scene notes: ${settings.description}.` : ''}

OUTPUT STRUCTURE — write the prompt in this exact order (focus ONLY on biology and scene; photography style is handled separately):
1. OPEN with the diagnostic feature (if any): "DEFINING VISUAL CHARACTERISTIC: [trait with precise size/scale words]..."
2. DESCRIBE morphology: exact colors, textures, proportions, all key structures.
3. SPECIFY composition: ${specimenCountLabel} specimen(s) in the central 50% of the frame, pronounced 3D depth, development stages as specified above.
4. DESCRIBE habitat and ground cover (moss, pine needles, leaves, lichen, etc.).
5. FAUNA (optional but encouraged): one small animal exploring the scene — choose naturally from: a beetle, a snail, a slug, a centipede, a spider on silk thread, a small grasshopper, an ant, a tiny moth, a woodlouse, a forest fly, a caterpillar on nearby vegetation — whatever fits the habitat. NEVER force it; it must feel like a casual discovery.
6. CLOSE with: "CRITICAL: [one visible external diagnostic trait — e.g. stipe color, cap texture, pore/tooth/ridge structure at cap margin] must be unmistakably prominent in the final image."
   ⚠️ The CRITICAL trait MUST be something visible on the INTACT LIVING exterior of the mushroom.
   NEVER mention: bluing reactions, internal flesh color, cut surfaces, cross-sections, or any preparation requiring damage to the specimen. Those cannot be shown in a forest field photo.

DO NOT include any lighting, camera settings, or photography style instructions — those are injected automatically.
If no diagnostic feature: skip step 1 and open with step 2.`;
          }

          setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Solicitando prompt taxonómico...`]);

          // iNaturalist fetch disabled — morphology data is sufficient and
          // reference photos from iNat were adding noise rather than signal.
          const geminiParts = enginePrompt;

          let prompt = "";
          try {
            const promptResponse = await withRetry(() => genAI.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction: MYCOLOGICAL_ENGINE_INSTRUCTIONS }).generateContent(geminiParts), 2, 40000, 1000, (attempt) => {
              setRetryStatus(`Reintentando análisis (${attempt}/2)...`);
              setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Reintento prompt ${attempt}...`]);
            });

            prompt = (await promptResponse.response).text()?.trim() || "";
            if (!prompt) throw new Error("Respuesta de prompt vacía");
          } catch (promptErr) {
            console.warn("Fallo en prompt taxonómico, usando motor de emergencia:", promptErr);
            setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] IA falló en prompt: ${promptErr.message || 'Error desconocido'}. Usando motor de emergencia...`]);
            prompt = generateFallbackPrompt(currentName, settings);
          }

          setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Prompt OK: ${prompt.substring(0, 30)}...`]);

          // ── Anti-bias post-processing ──────────────────────────────────────────
          // When antiConfusion is defined, the scientific name (especially genus)
          // triggers learned visual priors in Imagen 4 that override all text instructions.
          // Replace it with a purely visual description (in English) to break the bias chain.
          if (antiConf.length > 0 && refData?.cap) {
            // Translate common Spanish cap color/texture terms to English
            const ES_COLOR = {
              'blanco': 'white', 'blanca': 'white', 'blanco a crema': 'white to cream',
              'crema': 'cream', 'crema a blanco': 'cream white', 'amarillo': 'yellow',
              'amarillo a naranja': 'yellow-orange', 'naranja': 'orange', 'rojo': 'red',
              'rojo a marrón': 'reddish brown', 'marrón': 'brown', 'pardo': 'brown',
              'gris': 'gray', 'gris a marrón': 'grayish brown', 'negro': 'black',
              'verde': 'green', 'violeta': 'violet', 'lila': 'lilac', 'rosa': 'pink',
              'ocre': 'ochre', 'beige': 'beige',
            };
            const ES_TEXTURE = {
              'lisa': 'smooth', 'liso': 'smooth', 'sedosa': 'silky', 'sedoso': 'silky',
              'seca': 'dry', 'seco': 'dry', 'viscosa': 'viscid', 'viscoso': 'viscid',
              'escamosa': 'scaly', 'escamoso': 'scaly', 'fibrosa': 'fibrous',
              'fibrilosa': 'fibrous', 'tomentosa': 'tomentose', 'rugosa': 'rough',
              'granulosa': 'granular', 'lustrosa': 'glossy', 'mate': 'matte',
            };
            const rawColor = (refData.cap.color ?? 'white').split(/[,;]/)[0].trim().toLowerCase();
            const capColor = ES_COLOR[rawColor] ?? rawColor;
            const sup = refData.cap.superficie ?? '';
            const diagIdx = sup.search(/\b(RASGO|DISTINTIVO|DIAGNOSTIC|DISTINCTIVE)\b/i);
            const texPart = diagIdx > 0 ? sup.slice(0, diagIdx).trim().replace(/[.:,]+$/, '') : sup;
            const rawTexture = texPart.split(/[,;]/)[0].trim().toLowerCase();
            const textureWord = ES_TEXTURE[rawTexture] ?? rawTexture;
            const genus = cleanName.split(' ')[0]; // e.g. "Amanita"
            const visualAlias = `a large ${capColor} ${textureWord}-capped forest mushroom`;
            // Replace "Genus species" and standalone genus references in the Imagen 4 prompt
            const nameRx = new RegExp(
              `${genus}\\s+\\w+|${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
              'gi'
            );
            prompt = prompt.replace(nameRx, visualAlias);
            setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🔄 Nombre científico → descripción visual (anti-bias Imagen 4)`]);
          }
          // ─────────────────────────────────────────────────────────────────────

          // ── Mandatory photo specs — PREPENDED so image model reads them first ───
          // Image models weight the START of the prompt far more than the end.
          // Layer 1: when structured pipeline → inject validated morphology from DB.
          //          when fallback → inject hymenium family constraint (HYMENIUM_VISUAL_FOR_IMAGE_MODEL).
          let layer1_prefix = '';
          if (hasStructuredData) {
            // Full morphology is in layer1_morphology — inject it verbatim as Layer 1.
            // The hymenium_description field already encodes the image-safe visual anchor.
            layer1_prefix = layer1_morphology;
            setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🧬 Layer 1 → morfología estructurada inyectada en prefijo`]);
          } else {
            const hymeniumConstraint = family ? (HYMENIUM_VISUAL_FOR_IMAGE_MODEL[family] ?? '') : '';
            layer1_prefix = hymeniumConstraint;
            if (hymeniumConstraint) {
              setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🍄 Himeneo especial: ${family} → constraint inyectado`]);
            } else if (family) {
              setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Familia: ${family} (sin constraint de himeneo)`]);
            } else {
              setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ⚠️ Familia no detectada — sin constraint de himeneo`]);
            }
          }
          // Prompt order follows Google Imagen best practices: composition constraints FIRST
          // (image models weight early tokens heavily), then morphology, then scene details.
          const MANDATORY_PHOTO_PREFIX = [
            // 1. CENTERING FIRST — most important layout constraint, must be weighted early
            `CENTERING (MANDATORY — image is unusable if violated): ALL specimens grouped in the STRICT CENTER BAND of the frame (40%–60% of frame width). The left 30% and right 30% of the frame are background forest floor only — NO specimens there. This image is cropped to a 1:1 square for the catalog card; any specimen touching the left or right edge will be cut off.`,
            // 2. Single-frame constraint — purely positive language, no forbidden keywords
            // (mentioning "diptych" even negatively activates the concept in image models)
            `SINGLE PHOTOGRAPH: The entire image is one continuous uninterrupted rectangular scene. One frame, one environment, one unified composition. Every pixel belongs to the same single scene. No internal borders, dividers, separators, panel boundaries, or composite layouts of any kind.`,
            // 3. Morphology from DNA Visual (subject content)
            layer1_prefix,
            // 4. Fauna floor constraint — counters strong model prior of "insect on cap"
            `FAUNA (IF PRESENT): Any animal — insect, snail, slug, spider, worm — must be on the forest floor, on leaf litter at ground level, or on a nearby twig or stone. NEVER on the cap surface. NEVER perched on top of the stipe. NEVER touching the gills.`,
            // 5. Camera + lighting specs last (supporting context, not subject)
            `PHOTOGRAPHY STYLE: Hyper-realistic field photograph. Camera at ground level, lens 5–10 cm above the forest floor, shooting slightly upward — stipe base visible at the bottom of frame, cap in the middle third, bokeh canopy in the upper third. Golden hour backlit forest — warm low-angle dawn or dusk sun partially hidden behind tree trunks, volumetric crepuscular rays, pronounced rim lighting separating mushrooms from background. Soft warm diffused light, no harsh shadows. Macro lens 105mm, f/4.0, razor-sharp focus on the adult cap, deep creamy bokeh on background. Subsurface scattering through mushroom flesh.`,
          ].filter(Boolean).join('\n\n') + '\n\n';
          // Remove trailing duplicate lighting/lens blocks Gemini may have appended
          prompt = prompt
            .replace(/[\.\s]*(Golden hour lighting[^]*?no panels\.?)\s*$/i, '')
            .replace(/[\.\s]*(Hyper-realistic field photograph[^]*?no panels\.?)\s*$/i, '')
            .trim();
          prompt = MANDATORY_PHOTO_PREFIX + prompt;

          setCurrentPrompt(prompt); // show in viewer while image generates

          setGenerationStep(`Enviando diseño de ${currentName}...`);
          setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Solicitando imagen a Google...`]);

          const imageUrl = await withRetry(() => callImagen3(prompt, apiKey, settings.aspectRatio || '16:9'), 3, 90000, 2000, (attempt) => {
            setRetryStatus(`Servidor saturado. Reintento (${attempt}/3)...`);
            setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Reintento imagen ${attempt}...`]);
          });

          setGenerationStep("Recibiendo datos de imagen...");
          setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Datos recibidos. Procesando...`]);

          setGenerationStep("Procesando revelado final...");
          setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Revelando fotografía...`]);

          const finalImage = await processImage(imageUrl, settings.fileFormat, settings.quality, 1376, 768);
          lastFinalImage = finalImage;

          setGenerationStep("Traduciendo metadatos...");
          setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ¡Generación exitosa!`]);

          try {
            const translationResponse = await withTimeout(genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }).generateContent('Traduce este prompt de generación de imágenes de setas a una lista de frases cortas'), 30000);
            const translatedPrompt = (await translationResponse.response).text() || prompt;
            const parts = translatedPrompt
              .split(/[.!?]+/)
              .map(p => p.trim())
              .filter(p => p.length > 5);
            lastPromptParts = parts;
          } catch (e) {
            const parts = prompt
              .split(/[.!?]+/)
              .map(p => p.trim())
              .filter(p => p.length > 10);
            lastPromptParts = parts;
          }

          const itemId = Math.random().toString(36).substr(2, 9);
          newBatchIds.push(itemId);

          const newItem = {
            id: itemId,
            url: finalImage,
            settings: { ...settings, scientificName: currentName, specimenId: currentSpecimenId },
            timestamp: Date.now()
          };
          setHistory(prev => [newItem, ...prev].slice(0, 30));
          lastGeneratedItem = newItem;
          successCount++;

          setBatchQueue(prev => prev.map((item, idx) =>
            idx === i ? { ...item, status: 'completed' } : item
          ));
        } catch (itemErr) {
          console.error(`Error generando espécimen "${currentName}":`, itemErr);
          failCount++;
          const errorMsg = itemErr.message || "Error desconocido";
          if (!firstItemError) firstItemError = errorMsg;
          setBatchQueue(prev => prev.map((item, idx) =>
            idx === i ? { ...item, status: 'failed', error: errorMsg } : item
          ));
        }
      }

      setRetryStatus(null);
      setGenerationStep(null);

      if (failCount > 0) {
        if (isBatch) {
          setError(`Generación completada: ${successCount} éxitos, ${failCount} fallos.`);
        } else {
          const isTimeout = firstItemError?.includes("Timeout") || firstItemError?.includes("tiempo");
          if (isTimeout) {
            setError("La captura ha tardado demasiado (Timeout). El servidor de Google está saturado, por favor inténtalo de nuevo en unos momentos.");
          } else {
            setError(`Fallo en la generación: ${firstItemError || "El servidor no respondió correctamente."}`);
          }
        }
      } else if (!lastFinalImage && !cancelRef.current) {
        setError("La generación se detuvo inesperadamente sin devolver resultados.");
      }

      if (lastFinalImage) {
        setGeneratedImage(lastFinalImage);
        setSavedToCatalog(false); // new image — not yet saved
        setPromptParts(lastPromptParts);
        setCurrentPromptPartIndex(0);
        setViewedItem(lastGeneratedItem);
        setSettings(prev => ({ ...prev, specimenId: '' }));
        if (isBatch) {
          setIsArchiveOpen(true);
        }
      }
    } catch (err) {
      console.error("Error de generación:", err);
      if (err.message?.includes("Requested entity w found")) {
        setHasKey(false);
        setError("Error de clave API. Por favor, vuelve a seleccionar tu clave API.");
      } else if (err.message?.includes("429") || err.message?.includes("RESOURCE_EXHAUSTED")) {
        setError("Se ha alcanzado el límite de peticiones (Cuota excedida). Por favor, espera un minuto antes de intentar de nuevo.");
      } else if (err.message?.includes("503") || err.message?.includes("UNAVAILABLE")) {
        setError("El servidor de IA está saturado en este momento (Error 503). Por favor, inténtalo de nuevo en unos instantes.");
      } else {
        setError("Error al generar la imagen. Por favor, inténtalo de nuevo.");
      }
    } finally {
      setIsGenerating(false);
      setGenerationStep(null);
      setBatchProgress(null);
      setBatchQueue([]);
    }
  };

  const stopGeneration = () => {
    cancelRef.current = true;
    setIsGenerating(false);
    setBatchProgress(null);
    setBatchQueue([]);
  };

  const deleteFromHistory = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleBulkDownload = async () => {
    if (selectedIds.length === 0) return;

    const zip = new JSZip();
    const selectedItems = history.filter(item => selectedIds.includes(item.id));
    const extension = getExtension(bulkFormat);

    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      const id = item.settings.specimenId;

      // Original in selected format: esp-<id>-main-large.<extension>
      try {
        const originalInFormat = await processImage(item.url, bulkFormat, 0.8, 1376, 768);
        const base64Data = originalInFormat.split(',')[1];
        zip.file(`esp-${id}-main-large.${extension}`, base64Data, { base64: true });
      } catch (err) {
        console.error("Error converting original image for bulk download:", err);
      }

      // 50% version in selected format: esp-<id>-main.<extension>
      try {
        const smallImage = await processImage(item.url, bulkFormat, 0.8, 688, 384);
        const smallBase64 = smallImage.split(',')[1];
        zip.file(`esp-${id}-main.${extension}`, smallBase64, { base64: true });
      } catch (err) {
        console.error("Error creating small image for bulk download:", err);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `setas_seleccion_${new Date().getTime()}.zip`;
    link.click();
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === history.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(history.map(item => item.id));
    }
  };

  const refineImage = async () => {
    if (!refinementText || !generatedImage) return;

    setIsGenerating(true);
    setGenerationStep("Iniciando refinamiento...");
    setStatusLog([`[${new Date().toLocaleTimeString()}] Iniciando sesión de refinamiento...`]);
    setError(null);
    setRefineWarning(null);
    setIsRefining(false);

    try {
      const apiKey = getApiKey();
      if (!apiKey) throw new Error("Clave API no configurada.");

      const genAI = new GoogleGenerativeAI(apiKey);

      // Extract base64 data from current image — used as input for real image editing
      setGenerationStep("Preparando imagen original...");
      setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Procesando imagen base...`]);
      const base64Data = generatedImage.split(',')[1];
      const mimeType = generatedImage.split(';')[0].split(':')[1];

      if (!base64Data || !mimeType) {
        throw new Error("La imagen actual no es válida para el refinamiento.");
      }

      const currentSettings = viewedItem ? viewedItem.settings : settings;

      setGenerationStep("Solicitando cambios a la IA...");
      setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Enviando petición de refinamiento (Gemini 2.0 Flash Image Edit)...`]);

      const response = await withRetry(async () => {
        try {
          // Primary: true image-to-image editing — model receives the image + instruction
          setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Refinando con Gemini 2.0 Flash (edición real)...`]);
          return await withTimeout(callGeminiRefine(base64Data, mimeType, refinementText, apiKey), 120000);
        } catch (err) {
          const errMsg = err.message || "";
          const isTimeout = errMsg.includes("Timeout") || errMsg.includes("tiempo");
          const isUnavailable =
            errMsg.includes("404") ||
            errMsg.includes("400") ||
            errMsg.includes("not found") ||
            errMsg.includes("no longer available") ||
            errMsg.includes("INVALID_ARGUMENT") ||
            errMsg.includes("deprecated") ||
            errMsg.includes("preview") ||
            errMsg.includes("not supported") ||
            errMsg.includes("unavailable");

          if (isTimeout || isUnavailable) {
            // Fallback: text-to-image regeneration with full species context + refinement instruction.
            // We can't edit the image directly, but we can regenerate from scratch respecting the species
            // morphology and applying only the requested change on top.
            const reason = isTimeout ? 'lento' : 'no disponible';
            setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Gemini Edit ${reason}. Regenerando con contexto completo de especie (Imagen 4)...`]);
            setRefineWarning(`El modo de edición real no está disponible ahora mismo. La imagen se ha regenerado desde texto conservando la morfología de la especie.`);

            // Rebuild species context for the fallback prompt
            const fallbackName = currentSettings.scientificName.includes(' - ')
              ? currentSettings.scientificName.split(' - ')[1]
              : currentSettings.scientificName;
            const refData = referenceSpecies?.extra_data ?? referenceSpecies;
            let fallbackMorphology = "";
            if (refData) {
              const cap = refData.cap;
              const stem = refData.stem;
              const lines = [];
              if (cap)  lines.push(`CAP: shape="${cap.forma ?? ''}", EXACT COLOR="${cap.color ?? ''}", surface="${cap.superficie ?? ''}"`);
              if (stem) lines.push(`STIPE: shape="${stem.forma ?? ''}", EXACT COLOR="${stem.color ?? ''}"`);
              if (lines.length > 0) fallbackMorphology = `\nVERIFIED MORPHOLOGY (DO NOT ALTER):\n${lines.join('\n')}`;
            }
            const fallbackPrompt = `Photorealistic mycological photograph of ${fallbackName}.${fallbackMorphology}\n\nSHOT: ${settings.shotType}. SPECIMENS: ${settings.specimenCount}.\n\nAPPLY ONLY THIS CHANGE to the baseline species description above: ${refinementText}\n\nAll other species characteristics remain as described. The result must be a real-looking scientific photograph with natural imperfections.`;
            return await withTimeout(callImagen3(fallbackPrompt, apiKey), 90000);
          }
          throw err;
        }
      }, 3, 150000, 3000, (attempt) => {
        setRetryStatus(`Reintentando refinamiento (${attempt}/3)...`);
        setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Reintento de refinamiento ${attempt}...`]);
      });

      setGenerationStep("Recibiendo nueva versión...");
      setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Imagen refinada recibida. Procesando...`]);

      // response is already the imageUrl string from callImagen3
      const imageUrl = response;

      if (imageUrl) {
        setGenerationStep("Revelando fotografía refinada...");
        const finalImage = await processImage(imageUrl, settings.fileFormat, settings.quality, 1376, 768);
        setGeneratedImage(finalImage);

        // Update prompt display with Spanish translation
        setGenerationStep("Traduciendo descripción...");
        try {
          const translationResponse = await withTimeout(genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }).generateContent(`Traduce esta petición de refinamiento de imagen a una frase corta y elegante en español: ${refinementText}`), 30000);
          const translatedRefinement = (await translationResponse.response).text() || refinementText;
          setPromptParts([`Refinado: ${translatedRefinement}`]);
        } catch (e) {
          setPromptParts([`Refinado: ${refinementText}`]);
        }

        setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ¡Refinamiento completado con éxito!`]);
        setCurrentPromptPartIndex(0);

        const newItem = {
          id: Math.random().toString(36).substr(2, 9),
          url: finalImage,
          settings: {
            ...currentSettings,
            description: `${currentSettings.description || ''} (Refined: ${refinementText})`,
            specimenId: getNextSuffixId(currentSettings.specimenId, history)
          },
          timestamp: Date.now()
        };
        setHistory(prev => [newItem, ...prev].slice(0, 30));
        setViewedItem(newItem);
        setRefinementText('');
      } else {
        throw new Error("No se recibieron datos de imagen del modelo.");
      }
    } catch (err) {
      console.error("Error de refinamiento:", err);
      const errorMsg = err.message || "Error desconocido";
      setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ERROR: ${errorMsg}`]);

      if (errorMsg.includes("Requested entity w found")) {
        setHasKey(false);
        setError("Error de clave API. Por favor, vuelve a seleccionar tu clave API para refinar.");
      } else if (errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
        setError("Se ha alcanzado el límite de peticiones (Cuota excedida). Por favor, espera un minuto antes de intentar refinar de nuevo.");
      } else if (errorMsg.includes("Timeout") || errorMsg.includes("tiempo demasiado")) {
        setError("La refinación ha tardado demasiado. El servidor está saturado, por favor inténtalo de nuevo en unos momentos.");
      } else {
        setError(`Error al refinar la imagen: ${errorMsg}. Por favor, inténtalo de nuevo.`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (hasKey === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-black/40 backdrop-blur-xl rounded-xl p-8 shadow-2xl border border-white/10 text-center"
        >
          <div className="w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key className="text-[#d9cda1] w-8 h-8" />
          </div>
          <h1 className="text-3xl font-serif font-semibold mb-4 text-[#f4ebe1]">Clave API Requerida</h1>
          <p className="text-[#d9cda1]/80 mb-8 leading-relaxed">
            Para generar imágenes de alta resolución usando Imagen 4 + Gemini 2.5 Flash, necesitas una clave API de Google Cloud de pago.
          </p>
          <div className="flex flex-col gap-3 mb-2">
            <input
              type="password"
              value={runtimeKey}
              onChange={e => setRuntimeKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleConfirmRuntimeKey()}
              placeholder="AIza..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#f4ebe1] text-sm placeholder-white/20 focus:outline-none focus:border-emerald-500/50"
            />
            <button
              onClick={handleConfirmRuntimeKey}
              disabled={!runtimeKey.trim()}
              className="w-full bg-[#f4ebe1] text-[#1a1a1a] rounded-full py-4 font-bold uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Confirmar clave
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#d9cda1]/50">
            Más información sobre la <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline">facturación de la API de Gemini</a>.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen selection:bg-emerald-900/30 text-[#f4ebe1] relative"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
          handleMassImport({ target: { files: [file] } });
        }
      }}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-emerald-950/80 backdrop-blur-xl flex flex-col items-center justify-center border-4 border-dashed border-emerald-500/30 m-4 rounded-[3rem] pointer-events-none"
          >
            <div className="bg-black/40 p-12 rounded-full mb-8">
              <FileUp className="w-20 h-20 text-emerald-500 animate-bounce" />
            </div>
            <h2 className="text-4xl font-serif italic text-emerald-400 mb-4">Soltar para Importación Masiva</h2>
            <p className="text-[#d9cda1]/60 uppercase tracking-[0.3em] font-bold text-sm">Soporta archivos .CSV con nombres científicos</p>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Controls - SIDEBAR_MARKER */}
          <div className="lg:col-span-4 flex flex-col gap-6">

              {/* ── Gallery-first: cabecera especie — visible siempre (generando o no) ── */}
              {isGalleryFirst && settings.scientificName && (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#d9cda1]/40 mb-1">Generando para</p>
                    <p className="font-display text-3xl font-semibold text-cream leading-tight truncate">{settings.scientificName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-cream/30 text-sm font-mono">{searchParams.get('especie')}</p>
                      {/* DNA Visual status badge */}
                      {vpStatus === 'loading' && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-cream/30 animate-pulse">🧬 cargando…</span>
                      )}
                      {vpStatus === 'loaded' && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400/70">🧬 DNA Visual ✓</span>
                      )}
                      {vpStatus === 'missing' && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400/70">⚠ Sin DNA Visual</span>
                      )}
                      {vpStatus === 'error' && (
                        <button
                          onClick={() => { loadedReferenceIdRef.current = null; setVpStatus('loading'); }}
                          className="text-[9px] font-bold uppercase tracking-wider text-red-400/80 hover:text-red-400 transition-colors"
                          title="Error cargando DNA Visual — click para reintentar"
                        >
                          ✗ DNA Visual (reintentar)
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => window.history.back()}
                    className="shrink-0 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-cream/40 hover:text-cream transition-colors mt-1"
                    title="Volver a la galería"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    Galería
                  </button>
                </div>
              )}

              {/* ── Consola — visible durante Y después de la generación ── */}
              {(isGenerating || statusLog.length > 0) && (
                <div className="bg-black/40 rounded-2xl p-4 border border-white/5 shadow-inner flex flex-col gap-3">

                  {/* Sección Registro */}
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-mono text-emerald-500/60 uppercase tracking-widest flex items-center gap-2">
                        <History size={10} />
                        Registro
                        {isGenerating && (
                          <span className="text-emerald-500/30 font-mono text-[9px]">
                            T+ {Math.floor(generationTime / 60)}:{(generationTime % 60).toString().padStart(2, '0')}
                          </span>
                        )}
                      </span>
                      <button onClick={copyLog} className="text-[#d9cda1]/30 hover:text-emerald-400 transition-colors p-1" title="Copiar registro"><Copy size={11} /></button>
                    </div>
                    <div ref={logContainerRef} className="max-h-[130px] overflow-y-auto custom-scrollbar space-y-0.5 font-mono pr-1">
                      {statusLog.map((log, idx) => (
                        <div key={idx} className="text-[10px] text-[#d9cda1]/50 leading-snug border-l border-white/5 pl-2 py-0.5">
                          <span className="text-emerald-500/40 mr-1.5">›</span>{log}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sección Prompt */}
                  {currentPrompt && (
                    <div className="flex flex-col border-t border-white/5 pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-mono text-emerald-400/50 uppercase tracking-widest">
                          Prompt → {imageModel ? imageModel.replace('models/', '') : 'modelo'}
                        </span>
                        <button onClick={copyPrompt} className="text-[#d9cda1]/30 hover:text-emerald-400 transition-colors p-1" title="Copiar prompt"><Copy size={11} /></button>
                      </div>
                      <div className="max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                        <p className="text-[10px] text-[#d9cda1]/40 italic leading-relaxed font-mono whitespace-pre-wrap">{currentPrompt}</p>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ── Botón Detener — solo durante generación ── */}
              {isGenerating && (
                <button
                  onClick={stopGeneration}
                  className="w-full bg-red-500/10 text-red-400 border border-red-500/10 rounded-xl py-3.5 font-bold text-xs uppercase tracking-[0.2em] hover:bg-red-500/20 transition-all flex items-center justify-center gap-3"
                >
                  <X size={14} />
                  Detener Captura
                </button>
              )}

              {/* ── Ajustes + botón generar — solo antes de la primera generación ── */}
              {!isGenerating && statusLog.length === 0 && (
                <div className="space-y-10">

                  <section className="transition-all duration-500">
                    <div className="space-y-8">
                      {/* ── Selector especie + ID (oculto en gallery-first mode) ── */}
                      {!isGalleryFirst && <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-3">
                          <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-[#d9cda1]/70 flex items-center gap-1.5">
                            ID
                            <span title="Se rellena automáticamente al seleccionar una seta" className="text-[#d9cda1]/30 cursor-help">
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 0a5 5 0 1 0 0 10A5 5 0 0 0 5 0zm.5 7.5h-1v-3h1v3zm0-4h-1v-1h1v1z" /></svg>
                            </span>
                          </label>
                          <input
                            type="text"
                            readOnly
                            placeholder="—"
                            className="w-full bg-black/10 border border-white/5 rounded-2xl px-5 py-4 font-mono text-sm text-[#f4ebe1]/40 cursor-default select-none"
                            value={settings.specimenId}
                          />
                        </div>
                        <div className="col-span-9">
                          <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-[#d9cda1]/70">Nombre Científico</label>
                          {/* Custom combobox — replaces <input list> + <datalist> for full UX control */}
                          <div className="relative" ref={speciesComboRef}>
                            <input
                              ref={speciesInputRef}
                              type="text"
                              placeholder={speciesOpen ? 'Buscar especie...' : 'Selecciona una especie'}
                              className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 pr-10 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#d9cda1] transition-all font-serif text-sm placeholder:text-white/20 text-[#f4ebe1]"
                              value={speciesOpen ? speciesFilter : settings.scientificName}
                              onChange={(e) => setSpeciesFilter(e.target.value)}
                              onFocus={() => { setSpeciesOpen(true); setSpeciesFilter('') }}
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') { setSpeciesOpen(false); setSpeciesFilter('') }
                              }}
                            />
                            <button
                              type="button"
                              tabIndex={-1}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d9cda1]/60 hover:text-[#d9cda1] transition-colors"
                              onClick={() => {
                                if (speciesOpen) {
                                  setSpeciesOpen(false)
                                  setSpeciesFilter('')
                                } else {
                                  setSpeciesOpen(true)
                                  setSpeciesFilter('')
                                  speciesInputRef.current?.focus()
                                }
                              }}
                            >
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${speciesOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                              {speciesOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -4 }}
                                  transition={{ duration: 0.12 }}
                                  className="absolute top-full left-0 right-0 mt-2 bg-[#1c2118] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                >
                                  <div className="max-h-64 overflow-y-auto overscroll-contain">
                                    {filteredSpecies.length === 0 ? (
                                      <div className="px-5 py-4 text-sm text-white/30 italic">Sin resultados para "{speciesFilter}"</div>
                                    ) : (
                                      filteredSpecies.map(s => (
                                        <button
                                          key={s.id}
                                          type="button"
                                          className="w-full text-left px-5 py-3 hover:bg-white/5 transition-colors flex items-center justify-between gap-4 group border-b border-white/5 last:border-0"
                                          onMouseDown={(e) => {
                                            // onMouseDown fires before onBlur, preventing premature close
                                            e.preventDefault()
                                            const paddedId = s.cleanId.padStart(3, '0')
                                            setSettings(prev => ({ ...prev, specimenId: s.cleanId, scientificName: s.scientificName }))
                                            setSearchParams({ especie: `esp-${paddedId}` })
                                            setSpeciesOpen(false)
                                            setSpeciesFilter('')
                                          }}
                                        >
                                          <span className="font-serif text-sm italic text-[#f4ebe1] group-hover:text-white truncate">{s.scientificName}</span>
                                          <span className="font-mono text-xs text-[#d9cda1]/30 shrink-0">esp-{s.cleanId.padStart(3, '0')}</span>
                                        </button>
                                      ))
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>}
                      {/* ── /Selector especie + ID ── */}

                      {/* ── Model selector ───────────────────────────────── */}
                      <div className="pt-2 border-t border-white/5">
                        <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-3 text-[#d9cda1] flex items-center gap-2">
                          <Settings2 className="w-3 h-3" />
                          Modelo de Imagen
                          {loadingModels && <span className="text-[#d9cda1]/40 normal-case tracking-normal font-normal">descubriendo…</span>}
                        </label>
                        {availableImageModels.length > 0 ? (
                          <div className="relative">
                            <select
                              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#d9cda1] transition-all appearance-none text-xs font-bold text-[#f4ebe1] truncate"
                              value={imageModel}
                              onChange={(e) => setImageModel(e.target.value)}
                            >
                              {availableImageModels.map(m => (
                                <option key={m.id} value={m.id} className="bg-[#2b3529] font-normal">
                                  {m.displayName}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#d9cda1]">
                              <ChevronRight className="w-3 h-3 rotate-90" />
                            </div>
                          </div>
                        ) : !loadingModels ? (
                          <p className="text-xs text-[#d9cda1]/40">Sin clave API — los modelos se cargan al confirmar la clave.</p>
                        ) : null}
                      </div>
                      {/* ── /Model selector ──────────────────────────────── */}

                      <div className="space-y-6">
                        <div className="pt-2 border-t border-white/5">
                          <button
                            onClick={() => setIsSceneExpanded(!isSceneExpanded)}
                            className="w-full flex items-center justify-between group"
                          >
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#d9cda1] flex items-center gap-2 group-hover:text-[#f4ebe1] transition-colors">
                              <Layout className="w-3 h-3" />
                              Ajustes de Escena
                            </h3>
                            <ChevronDown className={`w-4 h-4 text-[#d9cda1] transition-transform duration-300 ${isSceneExpanded ? 'rotate-180' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {isSceneExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="space-y-6 pt-6">
                                  <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-[#d9cda1]/50">Número de Ejemplares</label>
                                    <div className="flex gap-2">
                                      {[1, 2, 3, 5].map((num) => (
                                        <button
                                          key={num}
                                          onClick={() => setSettings({ ...settings, specimenCount: num })}
                                          className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${settings.specimenCount === num
                                            ? 'bg-[#f4ebe1] border-[#f4ebe1] text-[#1a1a1a]'
                                            : 'bg-black/20 border-white/10 text-[#d9cda1]/60 hover:border-[#f4ebe1] hover:text-[#f4ebe1]'
                                            }`}
                                        >
                                          {num === 5 ? '4+' : num}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-[#d9cda1]/50">Tipo de Plano</label>
                                    <div className="relative">
                                      <select
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#d9cda1] transition-all appearance-none text-xs font-bold uppercase tracking-wider text-[#f4ebe1]"
                                        value={settings.shotType}
                                        onChange={(e) => setSettings({ ...settings, shotType: e.target.value })}
                                      >
                                        {SHOT_TYPES.map(s => <option key={s} value={s} className="bg-[#2b3529]">{s}</option>)}
                                      </select>
                                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#d9cda1]">
                                        <ChevronRight className="w-3 h-3 rotate-90" />
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-[#d9cda1]/50">Detalles Específicos (Opcional)</label>
                                    <textarea
                                      placeholder="ej. con got rocío, sobre un tronco caído..."
                                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#d9cda1] transition-all h-24 resize-none text-xs placeholder:text-white/10 text-[#f4ebe1]"
                                      value={settings.description}
                                      onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="pt-2 border-t border-white/5">
                          <button
                            onClick={() => setIsExportExpanded(!isExportExpanded)}
                            className="w-full flex items-center justify-between group"
                          >
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#d9cda1] flex items-center gap-2 group-hover:text-[#f4ebe1] transition-colors">
                              <Settings2 className="w-3 h-3" />
                              Ajustes de Exportación
                            </h3>
                            <ChevronDown className={`w-4 h-4 text-[#d9cda1] transition-transform duration-300 ${isExportExpanded ? 'rotate-180' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {isExportExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="space-y-6 pt-6">
                                  <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-[#d9cda1]/50">Formato de Imagen (Proporción)</label>
                                    <div className="relative">
                                      <select
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#d9cda1] transition-all appearance-none text-xs font-bold uppercase tracking-wider text-[#f4ebe1]"
                                        value={settings.aspectRatio}
                                        onChange={(e) => setSettings({ ...settings, aspectRatio: e.target.value })}
                                      >
                                        {ASPECT_RATIOS.map(ar => <option key={ar.value} value={ar.value} className="bg-[#2b3529]">{ar.label}</option>)}
                                      </select>
                                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#d9cda1]">
                                        <ChevronRight className="w-3 h-3 rotate-90" />
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-[#d9cda1]/50">Formato de Archivo</label>
                                    <div className="flex gap-2">
                                      {FILE_FORMATS.map((ff) => (
                                        <button
                                          key={ff.value}
                                          onClick={() => setSettings({ ...settings, fileFormat: ff.value })}
                                          className={`flex-1 px-3 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${settings.fileFormat === ff.value
                                            ? 'bg-[#f4ebe1] border-[#f4ebe1] text-[#1a1a1a]'
                                            : 'bg-black/20 border-white/10 text-[#d9cda1]/60 hover:border-[#f4ebe1] hover:text-[#f4ebe1]'
                                            }`}
                                        >
                                          {ff.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {settings.fileFormat !== 'image/png' && (
                                    <div>
                                      <div className="flex justify-between items-center mb-3">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-[#d9cda1]/50">Calidad de Compresión</label>
                                        <span className="text-xs font-bold text-[#d9cda1]">{Math.round(settings.quality * 100)}%</span>
                                      </div>
                                      <input
                                        type="range"
                                        min="0.1"
                                        max="1.0"
                                        step="0.05"
                                        value={settings.quality}
                                        onChange={(e) => setSettings({ ...settings, quality: parseFloat(e.target.value) })}
                                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#d9cda1]"
                                      />
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* ── Reference panel (oculto en gallery-first — acceso desde SpeciesAdminModal) ── */}
                  {referenceSpecies && !isGalleryFirst && (
                    <div className="pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#d9cda1]/50">Imágenes en catálogo</p>
                        <button
                          onClick={() => { setApplyStatus(null); setCatalogModal({}); }}
                          className="text-[9px] font-bold uppercase tracking-widest text-emerald-400/70 hover:text-emerald-300 transition-colors flex items-center gap-0.5"
                        >
                          Gestionar <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                      {/* Thumbnails — clicking any of them also opens the modal */}
                      <button
                        onClick={() => { setApplyStatus(null); setCatalogModal({}); }}
                        className="w-full group relative"
                      >
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: 'Principal', url: resolveUrl(referenceSpecies.extra_data?.photo?.url ?? referenceSpecies.photo_url ?? '') },
                            { label: 'Foto 1', url: resolveUrl(referenceSpecies.extra_data?.photos?.[0]?.url ?? '') },
                            { label: 'Foto 2', url: resolveUrl(referenceSpecies.extra_data?.photos?.[1]?.url ?? '') },
                          ].map(({ label, url }) => (
                            <div key={label} className="space-y-1">
                              <div className="aspect-square rounded-lg overflow-hidden bg-black/30 flex items-center justify-center">
                                {url
                                  ? <img src={url} alt={label} className="w-full h-full object-cover group-hover:brightness-75 transition-all" loading="lazy" onError={e => { e.target.style.display = 'none' }} />
                                  : <Camera className="w-4 h-4 text-white/10" />
                                }
                              </div>
                              <p className="text-[9px] text-[#d9cda1]/40 text-center font-bold uppercase tracking-widest">{label}</p>
                            </div>
                          ))}
                        </div>
                        {/* Hover overlay */}
                        <div className="absolute inset-x-0 top-0 bottom-5 rounded-lg bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center pointer-events-none">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold uppercase tracking-widest text-white drop-shadow">
                            Ver y gestionar
                          </span>
                        </div>
                      </button>
                    </div>
                  )}

                  <div className="pt-6">
                    <div className="space-y-4">
                      <button
                        onClick={() => generateImage()}
                        disabled={!settings.scientificName}
                        className="w-full bg-[#f4ebe1] text-[#1a1a1a] rounded-2xl py-5 font-bold text-sm uppercase tracking-[0.2em] hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-2xl shadow-black/40 active:scale-[0.98] group"
                      >
                        <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        {isGalleryFirst ? 'Generar imagen' : 'Capturar Espécimen'}
                      </button>

                      {/* Nuevo + CSV — ocultos en gallery-first (navegación de vuelta via header) */}
                      {!isGalleryFirst && <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => {
                            setSettings({
                              ...settings,
                              scientificName: '',
                              specimenId: '',
                              description: ''
                            });
                            setSearchParams({});
                            setReferenceSpecies(null);
                            setVisualPromptData(null);
                            loadedReferenceIdRef.current = null;
                            setGeneratedImage(null);
                            setViewedItem(null);
                          }}
                          className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-[#d9cda1] hover:text-white text-xs font-bold uppercase tracking-widest"
                        >
                          <Plus className="w-4 h-4" />
                          Nuevo
                        </button>

                        <div className="relative flex-1">
                          <input
                            type="file"
                            accept=".csv"
                            onChange={handleMassImport}
                            className="hidden"
                            id="csv-import"
                          />
                          <label
                            htmlFor="csv-import"
                            className="w-full h-full bg-white/5 border border-white/10 rounded-2xl py-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition-all text-[#d9cda1] hover:text-white text-xs font-bold uppercase tracking-widest"
                          >
                            <FileUp className="w-4 h-4" />
                            Importar
                          </label>
                        </div>
                      </div>}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 bg-red-900/20 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-200 text-xs leading-relaxed mt-10"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </motion.div>
              )}

              {refineWarning && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 bg-amber-900/20 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-amber-200 text-xs leading-relaxed"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <p>{refineWarning}</p>
                </motion.div>
              )}
          </div>

          {/* Display */}
          <div className="lg:col-span-8">
            <div className="bg-black/20 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden min-h-[700px] flex flex-col backdrop-blur-sm">
              <div className="flex-1 relative flex items-center justify-center p-12 bg-black/10">
                <AnimatePresence mode="wait">
                  {isGenerating && !generatedImage ? (
                    <motion.div
                      key="generating"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center flex flex-col items-center gap-5"
                    >
                      <Loader2 className="w-14 h-14 text-emerald-500/60 animate-spin" />
                      <p className="text-[#d9cda1]/30 text-xs font-bold uppercase tracking-[0.3em]">
                        {currentPrompt ? 'Imagen 4 procesando…' : settings.scientificName ? `Generando ${settings.scientificName}…` : 'Generando…'}
                      </p>
                    </motion.div>
                  ) : generatedImage ? (
                    <motion.div
                      key="image"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full h-full flex flex-col items-center justify-center gap-10"
                    >
                      <div className="relative group max-w-full">
                        <img
                          src={generatedImage}
                          alt={settings.scientificName}
                          className="rounded-xl shadow-2xl max-h-[75vh] object-contain border border-white/10"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-6 rounded-xl backdrop-blur-sm">
                          <button
                            onClick={() => setLightboxImage(generatedImage)}
                            className="w-14 h-14 bg-white/10 border border-white/20 backdrop-blur-md rounded-full hover:scale-110 transition-transform flex items-center justify-center shadow-xl"
                          >
                            <Maximize2 className="w-6 h-6 text-white" />
                          </button>
                          <button
                            onClick={handleDownload}
                            className="w-14 h-14 bg-white/10 border border-white/20 backdrop-blur-md rounded-full hover:scale-110 transition-transform flex items-center justify-center shadow-xl"
                          >
                            <Download className="w-6 h-6 text-white" />
                          </button>
                        </div>
                      </div>
                      {!isGalleryFirst && (
                        <div className="text-center space-y-2">
                          <h3 className="text-4xl font-serif font-medium tracking-tight text-[#f4ebe1] flex items-center justify-center gap-3">
                            <EditableField
                              value={viewedItem?.settings.specimenId || settings.specimenId}
                              className="font-mono text-[#d9cda1]/40"
                              inputClassName="w-24 text-center font-mono"
                              onSave={(newId) => {
                                if (!viewedItem) return;
                                setHistory(prev => prev.map(h =>
                                  h.id === viewedItem.id
                                    ? { ...h, settings: { ...h.settings, specimenId: newId } }
                                    : h
                                ));
                                setViewedItem(prev => prev ? { ...prev, settings: { ...prev.settings, specimenId: newId } } : null);
                              }}
                              validate={(newId) => {
                                const exists = history.some(item => item.settings.specimenId === newId && item.id !== viewedItem?.id);
                                return exists ? "Este ID ya existe en la biblioteca." : null;
                              }}
                            />
                            <EditableField
                              value={viewedItem?.settings.scientificName || settings.scientificName}
                              className="italic"
                              inputClassName="w-full max-w-md text-center italic"
                              onSave={(newName) => {
                                if (!viewedItem) return;
                                setHistory(prev => prev.map(h =>
                                  h.id === viewedItem.id
                                    ? { ...h, settings: { ...h.settings, scientificName: newName } }
                                    : h
                                ));
                                setViewedItem(prev => prev ? { ...prev, settings: { ...prev.settings, scientificName: newName } } : null);
                              }}
                            />
                          </h3>
                          <p className="text-xs text-[#d9cda1]/60 uppercase tracking-[0.3em] font-bold">
                            {viewedItem ? 'Archivo de Biblioteca' : 'Espécimen Generado'}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center max-w-sm"
                    >
                      <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
                        <img
                          src="https://fungus-ashen.vercel.app/assets/images/placeholder.png"
                          alt="Placeholder"
                          className="w-full h-full object-contain opacity-15"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <h3 className="text-2xl font-serif font-medium mb-4 text-[#f4ebe1]">Listo para fructificar</h3>
                      <p className="text-[#d9cda1]/60 text-sm leading-relaxed font-medium">
                        Introduce un nombre científico y configura los parámetros para generar un espécimen fotorrealista.
                      </p>
                    </motion.div>
                  ) /* end isGenerating / generatedImage / empty */}
                </AnimatePresence>
              </div>

              {/* Footer Info */}
              <div className="px-10 py-8 border-t border-white/5 bg-black/20 flex items-center justify-between gap-8">
                <div className="flex-1 min-w-0">
                  {generatedImage && promptParts.length > 0 ? (
                    <div className="space-y-1">
                      <span className="block text-[9px] text-[#d9cda1]/50 uppercase tracking-[0.2em] font-bold">Prompt</span>
                      <div className="h-5 overflow-hidden">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={currentPromptPartIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 0.5, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-xs font-medium text-[#f4ebe1] block truncate italic"
                          >
                            {promptParts[currentPromptPartIndex]}...
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-10">
                      <div className="space-y-1">
                        <span className="block text-[9px] text-[#d9cda1]/50 uppercase tracking-[0.2em] font-bold">Modelo</span>
                        <span className="text-xs font-bold text-[#f4ebe1]">Imagen 4 + Gemini 2.5 Flash</span>
                      </div>
                      <div className="w-px h-10 bg-white/5" />
                      <div className="space-y-1">
                        <span className="block text-[9px] text-[#d9cda1]/50 uppercase tracking-[0.2em] font-bold">Formato</span>
                        <span className="text-xs font-bold uppercase text-[#f4ebe1]">{settings.fileFormat.split('/')[1]} ({Math.round(settings.quality * 100)}%)</span>
                      </div>
                    </div>
                  )}
                </div>
                {generatedImage && (
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => setIsRefining(!isRefining)}
                      className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${isRefining ? 'text-[#f4ebe1]' : 'text-[#d9cda1] hover:text-[#f4ebe1]'}`}
                    >
                      <Sparkles className="w-4 h-4" />
                      Refinar
                    </button>
                    <button
                      onClick={() => generateImage()}
                      className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#d9cda1] hover:text-[#f4ebe1] transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Regenerar
                    </button>
                    {(viewedItem?.settings?.specimenId || settings.specimenId) && (
                      <button
                        onClick={async () => {
                          const mime = generatedImage.split(';')[0].split(':')[1] || 'image/jpeg';
                          const rawId = viewedItem?.settings?.specimenId || settings.specimenId;
                          const speciesId = `esp-${rawId.padStart(3, '0')}`;
                          const speciesName = viewedItem?.settings?.scientificName || settings.scientificName;
                          // Always re-fetch from DB so the modal shows current catalog state
                          let ref = null;
                          try {
                            const r = await fetch(`${API_BASE}/species/${speciesId}`, { headers: authHeaders() });
                            if (r.ok) { ref = await r.json(); setReferenceSpecies(ref); loadedReferenceIdRef.current = speciesId; }
                          } catch (_) { }
                          if (!ref) ref = referenceSpecies;
                          setCatalogModal({ newImageDataUrl: generatedImage, newImageMimeType: mime });
                          setApplyStatus(null);
                        }}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Guardar
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Refinement Input */}
              <AnimatePresence>
                {isRefining && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-10 pb-8 overflow-hidden"
                  >
                    <div className="flex gap-4">
                      <input
                        type="text"
                        placeholder="ej. añade más rocío, cambia el fondo a musgo..."
                        className="flex-1 bg-black/20 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#d9cda1] transition-all text-sm text-[#f4ebe1] placeholder:text-white/10"
                        value={refinementText}
                        onChange={(e) => setRefinementText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && refineImage()}
                        autoFocus
                      />
                      <button
                        onClick={refineImage}
                        disabled={!refinementText || isGenerating}
                        className="bg-[#f4ebe1] text-[#1a1a1a] px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white transition-all disabled:opacity-30"
                      >
                        Refinar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12 backdrop-blur-xl"
            onClick={() => setLightboxImage(null)}
          >
            <button
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
              onClick={() => setLightboxImage(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={lightboxImage}
              alt="Full view"
              className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navigation blocker dialog ────────────────────────────────────── */}
      <AnimatePresence>
        {navigationBlocker.state === 'blocked' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-[#2b3529] border border-white/10 w-full max-w-sm rounded-[1.25rem] shadow-2xl p-8 text-center space-y-6"
            >
              <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7 text-amber-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-serif font-bold text-[#f4ebe1]">Imagen sin guardar</h3>
                <p className="text-sm text-[#d9cda1]/70 leading-relaxed">
                  Tienes una imagen generada que no se ha guardado en el catálogo ni descargada. Si sales ahora, se perderá.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigationBlocker.reset()}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-[#f4ebe1] rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-all border border-white/10"
                >
                  Volver
                </button>
                <button
                  onClick={() => navigationBlocker.proceed()}
                  className="flex-1 bg-red-900/40 hover:bg-red-900/60 text-red-300 rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-all border border-red-500/20"
                >
                  Salir igualmente
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Catalog Images Modal (save new image + reorder existing) ──────────── */}
      {catalogModal !== null && referenceSpecies && (
        <CatalogImagesModal
          species={referenceSpecies}
          newImageDataUrl={catalogModal.newImageDataUrl ?? null}
          newImageMimeType={catalogModal.newImageMimeType ?? null}
          applyStatus={applyStatus}
          onConfirm={async (orderedUrls) => {
            setApplyStatus('saving');
            try {
              const res = await fetch(`${API_BASE}/species/${referenceSpecies.id}/images/set-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ photos: orderedUrls }),
              });
              if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || `Error ${res.status}`);
              }
              const updated = await res.json();
              setReferenceSpecies(updated);
              loadedReferenceIdRef.current = referenceSpecies.id; // mark as fresh — skip re-fetch after cache patch
              // 1. Patch inmediato: actualiza la foto en caché sin recargar toda la lista (feedback visual instantáneo).
              // 2. Invalidación garantizada: fuerza re-fetch en el siguiente render para que la card
              //    refleje el estado real de la BD, incluso si la especie no estaba en caché al parchear.
              patchSpeciesPhotoInCache(updated);
              invalidateSpeciesListCache();
              if (catalogModal.newImageDataUrl) setSavedToCatalog(true);
              setApplyStatus('success');
              setTimeout(() => {
                setCatalogModal(null);
                setApplyStatus(null);
              }, 1200);
            } catch (err) {
              console.error('Error applying photos order:', err);
              setApplyStatus('error');
            }
          }}
          onClose={() => { setCatalogModal(null); setApplyStatus(null); }}
        />
      )}

      {/* Archive Modal */}
      <AnimatePresence>
        {isArchiveOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => {
              setIsArchiveOpen(false);
              setRecentBatchIds([]);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-[#2b3529] border border-white/10 w-full max-w-5xl max-h-[85vh] rounded-[1.25rem] shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                    <Library className="w-5 h-5 text-[#d9cda1]" />
                  </div>
                  {isBulkMode ? (
                    <div className="flex items-center gap-6">
                      <div>
                        <h2 className="text-xl font-serif font-bold text-[#f4ebe1]">{selectedIds.length} seleccionados</h2>
                        <button
                          onClick={toggleSelectAll}
                          className="text-xs uppercase tracking-widest text-[#d9cda1] font-bold hover:text-white transition-colors"
                        >
                          {selectedIds.length === history.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                        </button>
                      </div>
                      <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
                        <select
                          value={bulkFormat}
                          onChange={(e) => setBulkFormat(e.target.value)}
                          className="bg-transparent text-[#f4ebe1] text-xs font-bold uppercase tracking-widest px-3 outline-none cursor-pointer"
                        >
                          <option value="image/webp" className="bg-[#2b3529]">WEBP</option>
                          <option value="image/jpeg" className="bg-[#2b3529]">JPG</option>
                        </select>
                        <div className="w-px h-4 bg-white/10" />
                        <button
                          onClick={handleBulkDownload}
                          disabled={selectedIds.length === 0}
                          className="bg-[#f4ebe1] text-[#1a1a1a] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100"
                        >
                          Descargar Selección
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setIsBulkMode(false);
                          setSelectedIds([]);
                        }}
                        className="bg-white/5 text-[#f4ebe1] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h2 className="text-xl font-serif font-bold text-[#f4ebe1]">Biblioteca de Especímenes</h2>
                        <p className="text-xs uppercase tracking-widest text-[#d9cda1]/50 font-bold">Últim generaciones guardad</p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <button
                          onClick={() => setIsBulkMode(true)}
                          className="flex items-center gap-2 bg-white/5 text-[#d9cda1] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                          <Library className="w-4 h-4" />
                          Descarga Masiva
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => {
                    setIsArchiveOpen(false);
                    setRecentBatchIds([]);
                    setIsBulkMode(false);
                    setSelectedIds([]);
                  }}
                  className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-[#d9cda1]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 py-20">
                    <TreePine className="w-16 h-16 text-[#d9cda1]" />
                    <p className="font-serif italic text-xl text-[#d9cda1]">El archivo está vacío</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {history.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`group relative rounded-xl overflow-hidden border transition-all cursor-pointer ${selectedIds.includes(item.id)
                          ? 'border-emerald-500 ring-2 ring-emerald-500/50'
                          : recentBatchIds.includes(item.id)
                            ? 'bg-emerald-900/20 border-emerald-500/30 hover:border-emerald-500/50'
                            : 'bg-black/20 border-white/5 hover:border-white/20'
                          }`}
                        onClick={() => {
                          if (isBulkMode) {
                            setSelectedIds(prev =>
                              prev.includes(item.id)
                                ? prev.filter(id => id !== item.id)
                                : [...prev, item.id]
                            );
                          } else {
                            setGeneratedImage(item.url);
                            setViewedItem(item);
                            setIsArchiveOpen(false);
                            setRecentBatchIds([]);
                          }
                        }}
                      >
                        <div className="aspect-square overflow-hidden relative">
                          <img
                            src={item.url}
                            alt={item.settings.scientificName}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />

                          {isBulkMode && (
                            <div className="absolute top-4 left-4 z-10">
                              {selectedIds.includes(item.id) ? (
                                <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
                                  <CheckSquare className="w-4 h-4 text-white" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 bg-black/40 backdrop-blur-md border border-white/20 rounded-lg flex items-center justify-center shadow-lg">
                                  <Square className="w-4 h-4 text-white/50" />
                                </div>
                              )}
                            </div>
                          )}

                          <div className="absolute top-3 right-3 flex gap-2">
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                const id = item.settings.specimenId;
                                const extension = getExtension(item.settings.fileFormat);

                                // Download original
                                const linkOriginal = document.createElement('a');
                                linkOriginal.href = item.url;
                                linkOriginal.download = `esp-${id}-main-large.${extension}`;
                                linkOriginal.click();

                                // Download reduced
                                try {
                                  const smallImage = await processImage(item.url, item.settings.fileFormat, item.settings.quality, 688, 384);
                                  const linkSmall = document.createElement('a');
                                  linkSmall.href = smallImage;
                                  linkSmall.download = `esp-${id}-main.${extension}`;
                                  linkSmall.click();
                                } catch (err) {
                                  console.error("Error creating small image:", err);
                                }
                              }}
                              className="w-8 h-8 bg-white/10 backdrop-blur-md text-white rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteFromHistory(item.id);
                              }}
                              className="w-8 h-8 bg-white/10 backdrop-blur-md text-white rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="p-5">
                          <h4 className="font-serif text-xl text-[#f4ebe1] truncate flex items-center gap-2">
                            <EditableField
                              value={item.settings.specimenId}
                              className="font-mono text-[#d9cda1]/40 text-sm"
                              inputClassName="w-16 text-center font-mono text-sm"
                              onSave={(newId) => {
                                setHistory(prev => prev.map(h => h.id === item.id ? { ...h, settings: { ...h.settings, specimenId: newId } } : h));
                              }}
                              validate={(newId) => {
                                const exists = history.some(h => h.settings.specimenId === newId && h.id !== item.id);
                                return exists ? "Este ID ya existe." : null;
                              }}
                            />
                            <span className="truncate italic">{item.settings.scientificName}</span>
                          </h4>
                          <p className="text-[9px] uppercase tracking-widest text-[#d9cda1]/50 font-bold">
                            {new Date(item.timestamp).toLocaleDateString()} • {item.settings.aspectRatio}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
