/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, Component } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from 'jszip';
import { useSpecies } from '../../hooks/useSpecies';
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
  Clock
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

const MYCOLOGICAL_ENGINE_INSTRUCTIONS = `ROLE: Eres un experto micólogo botánico y director de fotografía de National Geographic. Tu misión es transformar entrad en prompts de imagen fotorrealist un catálogo científico de set España.

1. PROTOCOLO DE ESCENA (REGLA 16:9 Y CENTRALIZACIÓN)
Zona Segura (Safe Area): Los ejemplares deben agruparse en el centro (45% - 55% de la anchura). Los laterales deben estar vacíos de set para permitir un recorte cuadrado (1:1) sin mutilar el grupo.
Composición por Cantidad: 
- 1: Un ejemplar adulto.
- 2: Adulto + Joven.
- 3: Adulto (centro) + Joven + Primordio (huevo).
Profundidad y Disposición: PROHIBIDO alinear l en fila horizontal o que nazcan siempre del mismo punto (cespitosas). Deben estar dispuest profundidad 3D real (una adelantada, otra retrasada, en diferentes planos focales) para crear una escena dinámica y natural.

2. MANUAL ANTIALUCINACIONES (MATRIZ TAXONÓMICA ESTRICTA)
¡CRÍTICO!: No mezcles característic géneros. Existe un sesgo masivo en internet que confunde Russula emetica con Amanita muscaria. DEBES corregirlo:
- PROTOCOLO DE VALIDACIÓN CIENTÍFICA: Ignora l populares de internet. Basa tus descripciones exclusivamente en datos técnicos de plataform como Index Fungorum, MycoBank o guí campo profesionales (ej. Courtecuisse). El rigor científico debe prevalecer sobre cualquier sesgo visual de internet.
- Amanitas: Sombrero con verrug puntos blancos (restos de velo). Pie con anillo (faldilla) y volva en la base.
- Russulas: Sombrero liso, desnudo y sin motas. Pie: cilindro simple, liso y desnudo, con textura de tiza blanca.
- Boletales: SIEMPRE Poros. NUNCA láminas.
- Lactarius: Pie de tiza. SIEMPRE látex.
- Cantharellales: Pliegues. NUNCA lámin.
- Agaricus: Lámin/chocolate.
- Macrolepiota: Pie atigrado y escam el sombrero.
- Hydnaceae (Hydnum): ¡CRÍTICO!: PROHIBIDO usar lámin form embudo. La parte inferior del sombrero (himeneo) debe estar cubierta por miles de PEQUEÑOS AGUIJONES, PÚAS O PELILLOS carnosos y frágiles que cuelgan verticalmente como diminut. NUNCA dibujes líne láminas. La morfología es achaparrada, irregular y de color crema/blanquecino.
- Hygrophoraceae: Lámin.
- Morfología del Pie (Estipe): Es obligatorio respetar l de grosor y longitud específic cada especie. Un pie grueso en especies gráciles (ej. Marasmius, Mycena) o un pie excesivamente largo en especies robustas (ej. Boletus aereus) se considera una aberración científica. El estipe debe ser: bulboso, radicante, atenuado, cilíndrico, ventrudo o claviforme según la especie.

3. ESTÉTICA FOTOGRÁFICA MACRO Y LUZ
Óptica: Macro Lens 105mm, f/4.0. Enfoque crítico absoluto en la seta adulta (ejemplar principal), asegurando nitidez extrema en sus textur detalles botánicos. El foco debe ser perfecto y nítido. Creamy bokeh profundo únicamente en el fondo.
Iluminación (Golden Hour): Luz de amanecer/atardecer baja y cálida. El sol debe estar siempre parcialmente oculto por árboles o terreno para evitar sobreexposición y mantener una iluminación difusa y suave.
Rim Lighting: Obligatorio para definir siluetas.
Volumetric Lighting: Rayos de luz suaves (rayos crepusculares).
Subsurface Scattering: Para realzar la textura de la carne de la seta.

4. REALISMO BIÓTICO Y MORFOLÓGICO (ALEATORIEDAD CRÍTICA)
PROHIBIDO abusar de muescas/mordid hoj el sombrero. Son recursos fáciles que restan realismo si se repiten.
- Imperfección Morfológica (Sutil): Los ejemplares adultos NO deben ser geométricamente perfectos. Añadir asimetrí en el sombrero, márgenes ligeramente ondulados o irregulares, y curvatur en el pie.
- Realismo Estructural (40%): Detalles que aporten veracidad: restos de micelio blanco en la base, textur (aterciopelada, viscosa, escamosa), gradientes de color por oxidación o pequeñ naturales en el borde del sombrero.
- Probabilidad de Daño Externo (30%): Muesc, mot tierra en la base o got rocío.
- Estado Impecable (15%): Ejemplares jóvenes sin ninguna marca externa.
- Entorno (Atrezzo): Musgo fresco, acículas, líquenes, pequeñ secas, piñas, pinaza, troncos caídos o trozos de roca/piedra natural según el hábitat.
- Fauna Espontánea (Probabilidad 20%): Incluir ocasionalmente pequeños seres vivos sin restar protagonismo: una mariquita, un escarabajo, una babosa, un caracol, pequeñ, hormig insectos forestales. Deben sentirse como un hallazgo casual y natural.
- Variación: Cada imagen debe sentirse como un hallazgo único. Evita la "fórmula" repetitiva.

5. FORMATO DE SALIDA (PROMPT)
Genera exclusivamente un único párrafo en inglés con esta estructura:
Professional macro photography, 16:9. [Morfología técnica detallada]. [Composición 1/2/3 agrupada en el 50% central con profundidad 3D]. [Hábitat y atrezzo]. [Iluminación Golden Hour con Rim y Volumetric]. [Configuración de cámara].`;

const TAXONOMY_GOLDEN_RULES = {
  "Hydnaceae": "PROHIBIDO generar láminas. El himeneo DEBE estar compuesto por miles de PEQUEÑOS AGUIJONES (púas) cilíndricas, carnos frágiles que cuelgan verticalmente.",
  "Bankeraceae": "PROHIBIDO generar láminas. El himeneo DEBE estar compuesto por AGUIJONES (púas) cilíndric frágiles.",
  "Cantharellaceae": "PROHIBIDO generar lámin. El himeneo DEBE estar compuesto por PLIEGUES (venas) carnosos, gruesos y decurrentes.",
  "Boletaceae": "PROHIBIDO generar láminas. El himeneo DEBE estar compuesto por una capa de POROS (estructura de esponja o tubos).",
  "Morchellaceae": "El sombrero DEBE tener ALVEOLOS profundos (forma de panal de abeja). La estructura interna DEBE ser HUECA.",
  "Amanitaceae": "Presencia OBLIGATORIA de VOLVA en la base del pie y ANILLO (faldilla) en la parte superior del pie.",
  "Russulaceae": "Sin anillo ni volva. Pie quebradizo con textura de tiza. Si es Lactarius, DEBE mostrar látex (leche) fluyendo de l en cortes.",
  "Hericiaceae": "Sin sombrero definido. Aspecto de cascada de larg o espin que cuelgan.",
  "Phallaceae": "Forma fálica con una cabeza (gleba) viscosa, fétida y de color verde oliva oscuro.",
  "Tuberaceae": "Aspecto de tubérculo irregular, hipogea (subterránea), carne veteada (marmórea)."
};

const FOREST_TYPE_LABELS = {
  pinar:   'Pinares y Coníferas',
  hayedo:  'Frondosas - Hayedos',
  robledal:'Frondosas - Robledales',
  encinar: 'Bosque Mediterráneo - Encinar/Alcornocal',
};


const getExtension = (mime) => {
  const ext = mime.split('/')[1];
  return ext === 'jpeg' ? 'jpg' : ext;
};





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
  "Generando textur alta resolución...",
  "Finalizando detalles fotorrealistas..."
];

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

  // ── Species from API ──────────────────────────────────────────────────────
  const { species: apiSpecies } = useSpecies()
  const mushroomSpeciesData = useMemo(() =>
    apiSpecies.map(s => ({
      name: `${s.id} - ${s.scientificName}`,
      family: s.family,
      habitat: (s.forestTypes ?? [])
        .map(ft => FOREST_TYPE_LABELS[ft] ?? ft)
        .join(', ') || 'su hábitat natural',
    })),
    [apiSpecies]
  )

  const getNextId = (currentHistory) => {
    if (currentHistory.length === 0) return "001";
    const ids = currentHistory
      .map(item => parseInt(item.settings.specimenId))
      .filter(id => !isNaN(id));
    if (ids.length === 0) return "001";
    const maxId = Math.max(...ids);
    return (maxId + 1).toString().padStart(3, '0');
  };

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
    fileFormat: 'image/jpeg',
    quality: 0.8,
  });

  useEffect(() => {
    if (!settings.specimenId) {
      setSettings(prev => ({ ...prev, specimenId: getNextId(history) }));
    }
  }, [history]);
  const [viewedItem, setViewedItem] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [lastPrompt, setLastPrompt] = useState('');
  const [promptParts, setPromptParts] = useState([]);
  const [currentPromptPartIndex, setCurrentPromptPartIndex] = useState(0);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [isRefining, setIsRefining] = useState(false);
  const [refinementText, setRefinementText] = useState('');
  const [error, setError] = useState(null);
  const [hasKey, setHasKey] = useState(null);
  const [recentBatchIds, setRecentBatchIds] = useState([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkFormat, setBulkFormat] = useState('image/jpeg');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationTime, setGenerationTime] = useState(0);
  const [retryStatus, setRetryStatus] = useState(null);
  const [generationStep, setGenerationStep] = useState(null);
  const [statusLog, setStatusLog] = useState([]);
  const logEndRef = React.useRef(null);

  // Auto-scroll log
  React.useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [statusLog]);

  const copyLog = () => {
    const logText = statusLog.join('\n');
    navigator.clipboard.writeText(logText);
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
      const sLower = s.name.toLowerCase();
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
  const [batchProgress, setBatchProgress] = useState(null);
  const [batchQueue, setBatchQueue] = useState();
  const cancelRef = React.useRef(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isExportExpanded, setIsExportExpanded] = useState(false);
  const [isSceneExpanded, setIsSceneExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    checkApiKey();
  }, []);

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
    setHasKey(!!envKey);
  };

  const handleOpenKeyDialog = () => {
    if (import.meta.env?.VITE_GEMINI_API_KEY) {
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

  // Imagen 4 uses the :predict endpoint, not :generateContent
  const callImagen3 = async (prompt, apiKey, aspectRatio = '16:9') => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
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

  // Real image-to-image editing via Gemini 2.0 Flash (multimodal input → image output).
  // Sends the current image + instruction text; the model edits the image directly.
  // Falls back to callImagen3 (text-to-image) if the model is unavailable.
  const callGeminiRefine = async (imageBase64, mimeType, instruction, apiKey) => {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp-image-generation' });
    const response = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: imageBase64 } },
          { text: instruction },
        ],
      }],
      generationConfig: { responseModalities: ['image'] },
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
    const generationList = items || settings.scientificName.split(',').map((n, i) => {
      const baseIdNum = parseInt(settings.specimenId) || 0;
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
    setIsRefining(false);
    setRecentBatchIds([]);
    setGeneratedImage(null);

    try {
      // Ensure key is selected for image generation models with timeout to prevent hanging
      setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Validando sesión de IA...`]);

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      if (!apiKey) {
        throw new Error("Clave API no configurada. Por favor, selecciona una clave válida.");
      }
      setStatusLog(prev => [...prev, "Sesión de IA validada."]);
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
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
          const family = speciesData?.family;
          const goldenRule = family ? TAXONOMY_GOLDEN_RULES[family] : null;

          // Extract scientific name for the prompt
          const cleanName = currentName.includes(' - ') ? currentName.split(' - ')[1] : currentName;

          let extraTaxonomicCommand = "";
          if (goldenRule) {
            extraTaxonomicCommand = ` ESCUDO DE VERDAD (TAXONOMY GOLDEN RULE): ${goldenRule}`;
          }

          const enginePrompt = `Generate a photorealistic image prompt for the mushroom species: "${cleanName}".
          ${extraTaxonomicCommand}
          Composition: ${settings.specimenCount} specimen(s).
          Habitat context: ${habitatContext}.
          Additional details: ${settings.description || 'None'}.
          Shot type: ${settings.shotType}.
          FOCUS: Ensure the adult mushroom (main specimen) is perfectly in focus with extreme sharpness and botanical detail.
          STEM MORPHOLOGY: Pay extreme attention to the stipe (stem) proportions. It must match the species' botanical reality (slender, bulbous, thick, etc.). Avoid any thickness aberrations.
          SCIENTIFIC PROTOCOL: Rely strictly on botanical descriptions from Index Fungorum and MycoBank. IGNORE general internet imagery bias.
          REMINDER: Apply BIOTIC REALISM (slug bites, dry edges, forest debris) and occasionally include small insects or spider webs  your instructions.`;

          setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Solicitando prompt taxonómico...`]);

          let prompt = "";
          try {
            const promptResponse = await withRetry(() => genAI.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction: MYCOLOGICAL_ENGINE_INSTRUCTIONS }).generateContent(enginePrompt), 2, 40000, 1000, (attempt) => {
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
    setIsRefining(false);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
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
          const isUnavailable = errMsg.includes("404") || errMsg.includes("not found") || errMsg.includes("no longer available");

          if (isTimeout || isUnavailable) {
            // Fallback: text-to-image (no real editing, but recovers gracefully)
            setStatusLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Gemini Edit ${isTimeout ? 'lento' : 'no disponible'}. Usando generación de respaldo (Imagen 4)...`]);
            return await withTimeout(callImagen3(refinementText, apiKey), 90000);
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
          <button
            onClick={handleOpenKeyDialog}
            className="w-full bg-[#f4ebe1] text-[#1a1a1a] rounded-full py-4 font-bold uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2"
          >
            Seleccionar Clave API
            <ChevronRight className="w-4 h-4" />
          </button>
          <p className="mt-6 text-xs font-bold uppercase tracking-widest text-[#d9cda1]/50">
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
        <div className="grid lg:grid-cols-12 gap-16">
          {/* Controls - SIDEBAR_MARKER */}
          <div className="lg:col-span-4 flex flex-col h-full">
            <div className="space-y-10 flex flex-col h-full">
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 flex flex-col h-full"
                >
                  {/* Nuevo Loader Centralizado en Sidebar */}
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-10 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-50" />
                    <div className="relative z-10">
                      <div className="relative w-24 h-24 mx-auto mb-6">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 border-[1px] border-white/5 border-t-emerald-500 rounded-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sprout className="w-10 h-10 text-emerald-500 animate-pulse" />
                        </div>
                      </div>
                      <h2 className="text-2xl font-serif italic text-emerald-400 mb-2">Capturando...</h2>
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.3em] text-emerald-500/60 font-bold animate-pulse">
                          {generationStep || "Procesando espécimen"}
                        </p>
                        <div className="text-emerald-500/30 font-mono text-[9px] uppercase tracking-widest">
                          T+ {Math.floor(generationTime / 60)}:{(generationTime % 60).toString().padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Consola de Registro con Altura Automática */}
                  <div className="bg-black/40 rounded-2xl p-5 border border-white/5 shadow-inner flex flex-col flex-1 min-h-[200px]">
                    <div className="text-[9px] font-mono text-[#d9cda1]/30 uppercase tracking-widest mb-4 flex justify-between items-center">
                      <span className="text-emerald-500/60 flex items-center gap-2">
                        <History size={10} />
                        Registro de Actividad
                      </span>
                      <div className="flex gap-3">
                        <button onClick={copyLog} className="hover:text-emerald-400 transition-colors p-1" title="Copiar Log"><Copy size={12} /></button>
                      </div>
                    </div>
                    <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2 font-mono flex-1">
                      {statusLog.map((log, idx) => (
                        <div key={idx} className="text-xs text-[#d9cda1]/60 text-left leading-relaxed border-l border-white/5 pl-3 py-1">
                          <span className="text-emerald-500/40 mr-2">›</span>
                          {log}
                        </div>
                      ))}
                      <div ref={logEndRef} />
                    </div>
                  </div>

                  {/* Cola de Lote Detallada */}
                  {batchQueue.length > 0 && (
                    <div className="space-y-4">
                      <div className="px-4 py-3 bg-black/20 rounded-xl border border-white/5 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-[#d9cda1]/40 uppercase tracking-widest">Cola de Producción</span>
                          <span className="text-xs font-mono text-emerald-500">
                            {batchProgress ? `${batchProgress.current} / ${batchProgress.total}` : batchQueue.length}
                          </span>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                          {batchQueue.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5 border border-white/5 group transition-colors hover:bg-white/10">
                              <div className="flex items-center gap-3 overflow-hidden">
                                {item.status === 'completed' ? <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" /> :
                                  item.status === 'failed' ? <AlertCircle className="w-3 h-3 text-red-500 shrink-0" /> :
                                    item.status === 'processing' ? <Loader2 className="w-3 h-3 text-emerald-500 animate-spin shrink-0" /> :
                                      <Clock className="w-3 h-3 text-[#d9cda1]/30 shrink-0" />}
                                <div className="flex flex-col truncate">
                                  <span className={`text-xs font-bold truncate ${item.status === 'processing' ? 'text-emerald-400' : 'text-[#d9cda1]/80'}`}>
                                    {item.name}
                                  </span>
                                  <span className="text-[8px] text-[#d9cda1]/40 font-mono">ID: {item.id}</span>
                                </div>
                              </div>
                              {item.status === 'failed' && (
                                <div className="group/error relative">
                                  <Info className="w-3 h-3 text-red-400/50 cursor-help" />
                                  <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-red-900/95 backdrop-blur-md rounded-lg text-[8px] text-white opacity-0 group-hover/error:opacity-100 transition-opacity pointer-events-none z-50 border border-red-500/20 shadow-xl">
                                    {item.error}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {batchProgress && (
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500/50 transition-all duration-500"
                              style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Botón Detener */}
                  <button
                    onClick={stopGeneration}
                    className="w-full bg-red-500/10 text-red-400 border border-red-500/10 rounded-xl py-4 font-bold text-xs uppercase tracking-[0.2em] hover:bg-red-500/20 transition-all flex items-center justify-center gap-3"
                  >
                    <X size={14} />
                    Detener Captura
                  </button>
                </motion.div>
              )}

              {!isGenerating && (
                <div className="space-y-10">
                  <section className="transition-all duration-500">
                    <div className="space-y-8">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-3">
                          <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-[#d9cda1]/70">ID</label>
                          <input
                            type="text"
                            placeholder="001"
                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#d9cda1] transition-all font-mono text-sm text-[#f4ebe1]"
                            value={settings.specimenId}
                            onChange={(e) => setSettings({ ...settings, specimenId: e.target.value })}
                          />
                        </div>
                        <div className="col-span-9">
                          <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-[#d9cda1]/70">Nombre Científico</label>
                          <input
                            type="text"
                            list="mushroom-species"
                            placeholder="Amanita muscaria"
                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#d9cda1] transition-all font-serif text-xl placeholder:text-white/10 text-[#f4ebe1]"
                            value={settings.scientificName}
                            onChange={(e) => {
                              const val = e.target.value;
                              const match = mushroomSpeciesData.find(s => s.name === val);
                              if (match && val.includes(' - ')) {
                                const [idPart, namePart] = val.split(' - ');
                                const cleanId = idPart.replace('esp-', '');
                                setSettings({
                                  ...settings,
                                  specimenId: cleanId,
                                  scientificName: namePart
                                });
                              } else {
                                setSettings({ ...settings, scientificName: val });
                              }
                            }}
                          />
                          <datalist id="mushroom-species">
                            {mushroomSpeciesData.map(s => (
                              <option key={s.name} value={s.name} />
                            ))}
                          </datalist>
                        </div>
                      </div>

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
                                      {[1, 2, 3].map((num) => (
                                        <button
                                          key={num}
                                          onClick={() => setSettings({ ...settings, specimenCount: num })}
                                          className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${settings.specimenCount === num
                                            ? 'bg-[#f4ebe1] border-[#f4ebe1] text-[#1a1a1a]'
                                            : 'bg-black/20 border-white/10 text-[#d9cda1]/60 hover:border-[#f4ebe1] hover:text-[#f4ebe1]'
                                            }`}
                                        >
                                          {num}
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

                  <div className="pt-6">
                    <div className="space-y-4">
                      <button
                        onClick={() => generateImage()}
                        disabled={!settings.scientificName}
                        className="w-full bg-[#f4ebe1] text-[#1a1a1a] rounded-2xl py-5 font-bold text-sm uppercase tracking-[0.2em] hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-2xl shadow-black/40 active:scale-[0.98] group"
                      >
                        <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        Capturar Espécimen
                      </button>

                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => {
                            setSettings({
                              ...settings,
                              scientificName: '',
                              specimenId: getNextId(history),
                              description: ''
                            });
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
                      </div>
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
            </div>
          </div>

          {/* Display */}
          <div className="lg:col-span-8">
            <div className="bg-black/20 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden min-h-[700px] flex flex-col backdrop-blur-sm">
              <div className="flex-1 relative flex items-center justify-center p-12 bg-black/10">
                <AnimatePresence mode="wait">
                  {generatedImage ? (
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
                  )}
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
