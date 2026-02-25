// ==================== MICOLOGÍA ====================

// ── Infographic 1: Nutrient Exchange ──────────────────────────────────────────
function SvgExchange() {
  return (
    <svg viewBox="0 0 600 290" xmlns="http://www.w3.org/2000/svg" className="w-full rounded-xl">
      <defs>
        <marker id="ag" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto">
          <path d="M0,1 L7,4 L0,7 Z" fill="#84cc16" />
        </marker>
        <marker id="aa" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto">
          <path d="M0,1 L7,4 L0,7 Z" fill="#c4a06b" />
        </marker>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e1a0b" />
          <stop offset="100%" stopColor="#162212" />
        </linearGradient>
        <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c1408" />
          <stop offset="100%" stopColor="#141008" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="600" height="290" rx="12" fill="#111a0e" />
      <rect width="600" height="138" rx="12" fill="url(#skyGrad)" />
      <rect y="138" width="600" height="152" fill="url(#soilGrad)" />

      {/* Ground line */}
      <path d="M0,138 Q75,132 150,138 Q225,144 300,138 Q375,132 450,138 Q525,144 600,138"
            fill="none" stroke="#6b4820" strokeWidth="2.5" opacity="0.7" />

      {/* === TREE === */}
      {/* Trunk */}
      <rect x="108" y="92" width="20" height="48" rx="3" fill="#7a5230" />
      {/* Canopy */}
      <ellipse cx="118" cy="60" rx="52" ry="40" fill="#183a0e" />
      <ellipse cx="95"  cy="73" rx="35" ry="27" fill="#1f4a12" />
      <ellipse cx="143" cy="71" rx="37" ry="29" fill="#1f4a12" />
      <ellipse cx="118" cy="46" rx="30" ry="25" fill="#275a16" />
      {/* Canopy highlights */}
      <ellipse cx="112" cy="42" rx="16" ry="12" fill="#2e6a1c" opacity="0.7" />

      {/* Sun + photosynthesis label */}
      <circle cx="555" cy="28" r="16" fill="#eab308" opacity="0.12" />
      <circle cx="555" cy="28" r="10" fill="#eab308" opacity="0.18" />
      <text x="555" y="32" fill="#eab308" fontSize="13" textAnchor="middle" opacity="0.7">☀</text>
      <text x="192" y="28" fill="#84cc16" fontSize="10" fontWeight="600">Fotosíntesis</text>
      <text x="192" y="41" fill="#f4ebe1" fontSize="9" opacity="0.45">CO₂ + H₂O → glucosa</text>

      {/* === ROOTS === */}
      <path d="M118,138 L118,208" stroke="#8a6230" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M118,168 Q92,188 76,222" stroke="#8a6230" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M118,176 Q145,198 160,230" stroke="#8a6230" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M118,198 Q100,214 88,248" stroke="#8a6230" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M118,204 Q135,220 144,252" stroke="#8a6230" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M76,222 Q63,236 56,258" stroke="#8a6230" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M160,230 Q173,242 176,262" stroke="#8a6230" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Root tips */}
      {[[118,208],[76,222],[160,230],[88,248],[144,252],[56,258],[176,262]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="3.5" fill="#a07848" />
      ))}

      {/* === MYCELIUM NETWORK === */}
      <g stroke="#4a7c59" strokeWidth="1.3" fill="none" opacity="0.9">
        <path d="M88,248 Q190,237 295,250 Q390,262 488,246" />
        <path d="M144,252 Q230,256 320,250 Q410,244 505,255" />
        <path d="M56,258 Q150,265 245,257 Q335,250 425,263 Q505,274 565,262" />
        {/* Cross threads */}
        <path d="M245,257 Q248,263 245,268" />
        <path d="M320,250 Q323,258 320,264" />
        <path d="M410,244 Q413,254 410,260" />
        <path d="M505,255 Q507,263 505,270" />
        <path d="M190,252 Q193,260 190,267" />
        <path d="M370,255 Q373,263 370,270" />
        <path d="M470,250 Q473,258 470,265" />
      </g>
      {/* Mycelium nodes */}
      {[[88,248],[144,252],[245,257],[320,250],[410,244],[505,255],[190,252],[370,255],[470,250]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="2.8" fill="#4a7c59" />
      ))}

      {/* === MUSHROOM (fruiting body) === */}
      {/* Cap */}
      <path d="M502,138 Q480,116 500,107 Q520,98 536,107 Q552,116 502,138" fill="#a8702a" />
      <path d="M502,138 Q480,116 500,107 Q520,98 536,107" fill="none" stroke="#c49040" strokeWidth="1" opacity="0.5" />
      {/* Stem */}
      <rect x="498" y="126" width="8" height="16" rx="2" fill="#d4c08a" />
      {/* Mycelium connection to mushroom */}
      <path d="M505,246 L505,142" stroke="#4a7c59" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
      <text x="542" y="110" fill="#d9cda1" fontSize="9" opacity="0.7">Cuerpo</text>
      <text x="542" y="121" fill="#d9cda1" fontSize="9" opacity="0.7">fructífero</text>

      {/* === ARROWS === */}
      {/* Sugars DOWN */}
      <path d="M100,89 L100,168"
            stroke="#84cc16" strokeWidth="2.5" fill="none"
            strokeDasharray="5,4" markerEnd="url(#ag)" opacity="0.95" />
      {/* Minerals UP */}
      <path d="M215,244 L172,188"
            stroke="#c4a06b" strokeWidth="2.5" fill="none"
            strokeDasharray="5,4" markerEnd="url(#aa)" opacity="0.95" />

      {/* Sugars label */}
      <rect x="18" y="114" width="74" height="36" rx="8" fill="#0d1a0a" stroke="#84cc16" strokeWidth="1" opacity="0.95" />
      <text x="55" y="127" fill="#84cc16" fontSize="9.5" fontWeight="700" textAnchor="middle">Azúcares</text>
      <text x="55" y="141" fill="#84cc16" fontSize="8.5" textAnchor="middle" opacity="0.8">Carbono orgánico</text>

      {/* Minerals label */}
      <rect x="222" y="206" width="86" height="50" rx="8" fill="#120d06" stroke="#c4a06b" strokeWidth="1" opacity="0.95" />
      <text x="265" y="220" fill="#c4a06b" fontSize="9.5" fontWeight="700" textAnchor="middle">Agua + Minerales</text>
      <text x="265" y="233" fill="#c4a06b" fontSize="8.5" textAnchor="middle" opacity="0.8">Fósforo (P)</text>
      <text x="265" y="246" fill="#c4a06b" fontSize="8.5" textAnchor="middle" opacity="0.8">Nitrógeno (N)</text>

      {/* Air/soil labels */}
      <text x="10" y="128" fill="#f4ebe1" fontSize="8" opacity="0.3" fontWeight="600" letterSpacing="1">AIRE</text>
      <text x="10" y="160" fill="#f4ebe1" fontSize="8" opacity="0.3" fontWeight="600" letterSpacing="1">SUELO</text>

      {/* Mycorrhizal contact zone */}
      <circle cx="130" cy="205" r="48" fill="none" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.45" />
      <text x="185" y="172" fill="#c084fc" fontSize="9" opacity="0.6">Zona micorrícica</text>

      {/* Bottom label */}
      <text x="390" y="284" fill="#4a7c59" fontSize="10" fontWeight="500" textAnchor="middle" opacity="0.7">Red micelial subterránea</text>
    </svg>
  );
}

// ── Infographic 2: Ecto vs Endo ────────────────────────────────────────────────
function SvgEctoEndo() {
  // Plant cell grid: rows x cols
  const cellW = 38, cellH = 28, gap = 6;
  const cells = (ox, oy, rows, cols, fill, stroke) =>
    Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => (
        <rect key={`${r}-${c}`}
          x={ox + c*(cellW+gap)} y={oy + r*(cellH+gap)}
          width={cellW} height={cellH} rx="5"
          fill={fill} stroke={stroke} strokeWidth="1" />
      ))
    );

  // Ecto panel: cells 3x3 starting at (40, 75), mantle around them
  const ectoOx = 40, ectoOy = 75;
  // Endo panel: cells 3x3 starting at (330, 75)
  const endoOx = 330, endoOy = 75;
  const cols = 3, rows = 3;
  const panelW = cols*cellW + (cols-1)*gap;  // 126
  const panelH = rows*cellH + (rows-1)*gap;  // 118

  return (
    <svg viewBox="0 0 600 260" xmlns="http://www.w3.org/2000/svg" className="w-full rounded-xl">
      <rect width="600" height="260" rx="12" fill="#111a0e" />

      {/* Panel divider */}
      <line x1="300" y1="20" x2="300" y2="240" stroke="#f4ebe1" strokeWidth="1" opacity="0.08" />

      {/* === ECTO Panel === */}
      <text x="103" y="35" fill="#f4ebe1" fontSize="13" fontWeight="700" textAnchor="middle">Ectomicorriza</text>
      <text x="103" y="50" fill="#f4ebe1" fontSize="9" textAnchor="middle" opacity="0.45">(ECM)</text>

      {/* Mantle hyphae outer ring */}
      <rect x={ectoOx - 14} y={ectoOy - 14} width={panelW + 28} height={panelH + 28}
            rx="12" fill="none" stroke="#4a7c59" strokeWidth="12" opacity="0.25" />
      <rect x={ectoOx - 14} y={ectoOy - 14} width={panelW + 28} height={panelH + 28}
            rx="12" fill="none" stroke="#4a7c59" strokeWidth="4" opacity="0.6" />

      {/* Cells */}
      {cells(ectoOx, ectoOy, rows, cols, '#1e3a18', '#3a6030')}

      {/* Hartig net: lines between cells (intercellular hyphae) */}
      <g stroke="#6aaa7a" strokeWidth="1" opacity="0.8">
        {/* Vertical lines between columns */}
        <line x1={ectoOx+cellW+2} y1={ectoOy} x2={ectoOx+cellW+2} y2={ectoOy+panelH} />
        <line x1={ectoOx+2*(cellW+gap)-4} y1={ectoOy} x2={ectoOx+2*(cellW+gap)-4} y2={ectoOy+panelH} />
        {/* Horizontal lines between rows */}
        <line x1={ectoOx} y1={ectoOy+cellH+2} x2={ectoOx+panelW} y2={ectoOy+cellH+2} />
        <line x1={ectoOx} y1={ectoOy+2*(cellH+gap)-4} x2={ectoOx+panelW} y2={ectoOy+2*(cellH+gap)-4} />
      </g>

      {/* Ecto labels */}
      <line x1={ectoOx - 10} y1={ectoOy + panelH/2} x2="16" y2={ectoOy + panelH/2}
            stroke="#4a7c59" strokeWidth="1" opacity="0.6" />
      <text x="14" y={ectoOy + panelH/2 - 6} fill="#4a7c59" fontSize="8.5" textAnchor="end">Manto</text>
      <text x="14" y={ectoOy + panelH/2 + 6} fill="#4a7c59" fontSize="8.5" textAnchor="end">miceliar</text>

      <line x1={ectoOx + panelW/2} y1={ectoOy + cellH + gap/2} x2={ectoOx + panelW/2} y2={210}
            stroke="#6aaa7a" strokeWidth="1" opacity="0.5" />
      <text x={ectoOx + panelW/2} y={222} fill="#6aaa7a" fontSize="8.5" textAnchor="middle">Red de Hartig</text>
      <text x={ectoOx + panelW/2} y={234} fill="#6aaa7a" fontSize="7.5" textAnchor="middle" opacity="0.6">(entre células)</text>

      {/* === ENDO Panel === */}
      <text x="497" y="35" fill="#f4ebe1" fontSize="13" fontWeight="700" textAnchor="middle">Endomicorriza</text>
      <text x="497" y="50" fill="#f4ebe1" fontSize="9" textAnchor="middle" opacity="0.45">(AMF — Arbuscular)</text>

      {/* Cells */}
      {cells(endoOx, endoOy, rows, cols, '#1e3a18', '#3a6030')}

      {/* External hyphae threads (thin, no mantle) */}
      <g stroke="#4a7c59" strokeWidth="1" fill="none" opacity="0.5">
        <path d={`M${endoOx-8},${endoOy+20} Q${endoOx-18},${endoOy+60} ${endoOx-8},${endoOy+90}`} />
        <path d={`M${endoOx+panelW+8},${endoOy+15} Q${endoOx+panelW+22},${endoOy+55} ${endoOx+panelW+8},${endoOy+100}`} />
      </g>

      {/* Arbuscules inside middle cells */}
      {[
        [endoOx+cellW+gap, ectoOy+cellH+gap],   // middle-left cell in endo
        [endoOx+2*(cellW+gap), ectoOy],           // top-right
      ].map(([cx, cy], i) => {
        const mx = cx + cellW/2, my = cy + cellH/2;
        return (
          <g key={i} stroke="#c4a06b" strokeWidth="1.2" fill="none" opacity="0.9">
            {/* Central trunk */}
            <line x1={mx} y1={my-8} x2={mx} y2={my+8} />
            {/* Branches */}
            <line x1={mx} y1={my-2} x2={mx-8} y2={my-9} />
            <line x1={mx} y1={my-2} x2={mx+8} y2={my-9} />
            <line x1={mx} y1={my+3} x2={mx-7} y2={my+10} />
            <line x1={mx} y1={my+3} x2={mx+7} y2={my+10} />
            {/* Tips */}
            <circle cx={mx-8} cy={my-9} r="1.5" fill="#c4a06b" />
            <circle cx={mx+8} cy={my-9} r="1.5" fill="#c4a06b" />
            <circle cx={mx-7} cy={my+10} r="1.5" fill="#c4a06b" />
            <circle cx={mx+7} cy={my+10} r="1.5" fill="#c4a06b" />
          </g>
        );
      })}

      {/* Hyphae entering a cell */}
      <path d={`M${endoOx+panelW+6},${endoOy+cellH/2} L${endoOx+panelW},${endoOy+cellH/2}`}
            stroke="#4a7c59" strokeWidth="1.5" fill="none" />
      <path d={`M${endoOx-6},${endoOy+cellH+gap+cellH/2} L${endoOx},${endoOy+cellH+gap+cellH/2}`}
            stroke="#4a7c59" strokeWidth="1.5" fill="none" />

      {/* Endo labels */}
      <line x1={endoOx + panelW/2} y1={endoOy + cellH + gap/2} x2={endoOx + panelW/2} y2={210}
            stroke="#c4a06b" strokeWidth="1" opacity="0.5" />
      <text x={endoOx + panelW/2} y={222} fill="#c4a06b" fontSize="8.5" textAnchor="middle">Arbúsculos</text>
      <text x={endoOx + panelW/2} y={234} fill="#c4a06b" fontSize="7.5" textAnchor="middle" opacity="0.6">(intracelulares)</text>

      {/* Key difference note */}
      <text x="300" y="252" fill="#f4ebe1" fontSize="8.5" textAnchor="middle" opacity="0.35">
        Las hifas no penetran en las células (ECM) · Las hifas entran dentro de las células (AMF)
      </text>
    </svg>
  );
}

// ── Infographic 3: Species ↔ Trees ────────────────────────────────────────────
function SvgSpeciesTree() {
  const species = [
    { name: 'Boletus edulis',       emoji: '🍄', trees: [1,1,1,0,1] },
    { name: 'Cantharellus cibarius',emoji: '🌼', trees: [0,1,1,1,0] },
    { name: 'Lactarius deliciosus', emoji: '🟠', trees: [1,0,0,0,1] },
    { name: 'Tuber melanosporum',   emoji: '⚫', trees: [0,1,0,1,0] },
    { name: 'Amanita caesarea',     emoji: '🔴', trees: [0,1,0,1,0] },
  ];
  const trees = ['Pino', 'Roble', 'Haya', 'Encina', 'Abeto'];
  const treeEmojis = ['🌲', '🌳', '🌲', '🌿', '🎄'];

  const rowH = 36, headerH = 55;
  const colW = 80, labelW = 170;
  const totalH = headerH + species.length * rowH + 24;

  return (
    <svg viewBox={`0 0 ${labelW + trees.length * colW + 20} ${totalH}`}
         xmlns="http://www.w3.org/2000/svg" className="w-full rounded-xl">
      <rect width="700" height={totalH} rx="12" fill="#111a0e" />

      {/* Column headers (trees) */}
      {trees.map((tree, ci) => (
        <g key={ci}>
          <text x={labelW + ci*colW + colW/2} y={24}
                fill="#f4ebe1" fontSize="15" textAnchor="middle" opacity="0.8">
            {treeEmojis[ci]}
          </text>
          <text x={labelW + ci*colW + colW/2} y={42}
                fill="#f4ebe1" fontSize="9.5" textAnchor="middle" opacity="0.6" fontWeight="500">
            {tree}
          </text>
        </g>
      ))}

      {/* Rows */}
      {species.map((sp, ri) => {
        const y = headerH + ri * rowH;
        return (
          <g key={ri}>
            {/* Row background alternating */}
            <rect x="8" y={y} width={labelW + trees.length*colW + 4} height={rowH}
                  rx="6" fill={ri % 2 === 0 ? '#ffffff06' : '#00000010'} />

            {/* Species label */}
            <text x="18" y={y + 14} fill="#f4ebe1" fontSize="10.5" fontWeight="600" opacity="0.9">
              {sp.emoji} {sp.name}
            </text>

            {/* Association dots */}
            {sp.trees.map((assoc, ci) => (
              assoc ? (
                <g key={ci}>
                  <circle cx={labelW + ci*colW + colW/2} cy={y + rowH/2}
                          r="10" fill="#4a7c59" opacity="0.85" />
                  <text x={labelW + ci*colW + colW/2} y={y + rowH/2 + 4}
                        fill="#f4ebe1" fontSize="10" textAnchor="middle">✓</text>
                </g>
              ) : (
                <circle key={ci}
                        cx={labelW + ci*colW + colW/2} cy={y + rowH/2}
                        r="6" fill="none" stroke="#f4ebe1" strokeWidth="1" opacity="0.12" />
              )
            ))}
          </g>
        );
      })}

      {/* Footer */}
      <text x="8" y={totalH - 6} fill="#f4ebe1" fontSize="8.5" opacity="0.3">
        ✓ = asociación micorrícica conocida
      </text>
    </svg>
  );
}

// ── Full Mycorrhizae Article ───────────────────────────────────────────────────
function MicorrizasArticle({ onBack }) {
  const [readProgress, setReadProgress] = useState(0);
  const contentRef = React.useRef(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const onScroll = () => {
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setReadProgress(total > 0 ? Math.round((scrolled / total) * 100) : 0);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const Section = ({ title, children }) => (
    <section className="mb-8">
      <h3 className="font-display text-xl text-[#d9cda1] mb-3 mt-6" style={{ borderLeft: '3px solid #4a7c59', paddingLeft: '12px' }}>
        {title}
      </h3>
      {children}
    </section>
  );

  const P = ({ children }) => (
    <p className="text-[#f4ebe1]/75 leading-relaxed mb-3 text-sm">{children}</p>
  );

  const Callout = ({ emoji, children, color = 'emerald' }) => (
    <div className={`rounded-xl p-4 mb-6 bg-${color}-500/10`}>
      <p className="text-sm leading-relaxed text-[#f4ebe1]">
        <span className="mr-2 text-base">{emoji}</span>{children}
      </p>
    </div>
  );

  const InfographicBlock = ({ title, caption, children }) => (
    <div className="my-8 rounded-2xl overflow-hidden" style={{ background: '#0e1a0a', border: '1px solid #ffffff0a' }}>
      <div className="px-5 pt-4 pb-2">
        <p className="text-xs font-semibold text-[#d9cda1]/50 uppercase tracking-widest mb-0.5">Infografía</p>
        <p className="text-[#f4ebe1]/80 font-medium text-sm">{title}</p>
      </div>
      <div className="px-4 pb-4">
        {children}
        {caption && <p className="text-xs text-[#f4ebe1]/35 mt-2 text-center leading-snug">{caption}</p>}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Fixed header */}
      <div className="sticky top-0 z-10 py-3 flex items-center gap-3" style={{ flexShrink: 0 }}>
        <button onClick={onBack}
          className="flex items-center gap-2 text-sm text-[#f4ebe1]/60 hover:text-[#f4ebe1] transition-colors">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Micología
        </button>
        <span className="text-[#f4ebe1]/20">·</span>
        <span className="text-xs text-[#f4ebe1]/40 truncate">Micorrizas: la alianza secreta</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-[#4a7c59] font-medium">{readProgress}%</span>
          <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-[#4a7c59] rounded-full transition-all duration-200"
                 style={{ width: `${readProgress}%` }} />
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto">
        {/* Hero */}
        <div className="glass flex flex-col md:flex-row rounded-2xl overflow-hidden hover-lift cursor-pointer mb-8 transition-all duration-200">
          <div class="md:w-1/2">
            <img src="/assets/images/content/articles/micorrizas.webp" class="w-full h-full object-cover" alt="micorrizas" height="416" width="624" />
          </div>
          <div className="md:w-1/2 p-6 sm:p-8 text-center flex flex-col items-center justify-center">
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-3">Ecología · Simbiosis · Biología</p>
            <h1 className="font-display text-2xl sm:text-3xl text-[#f4ebe1] mb-3 leading-tight">
              Micorrizas: la alianza secreta<br />entre hongos y árboles
            </h1>
            <p className="text-amber-100/80 text-sm leading-relaxed max-w-lg mx-auto">
              Cómo los hongos micorrícicos sostienen los bosques y qué significa para el recolector
            </p>
            <div className="flex items-center justify-center gap-4 mt-5 text-xs text-[#f4ebe1]/35">
              <span>20 febrero 2026</span>
              <span>·</span>
              <span>8 min de lectura</span>
            </div>
          </div>
        </div>

        {/* Article body */}
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Callout emoji="🔬" color="emerald">
            El 90% de todas las plantas terrestres forman micorrizas. Los bosques que conocemos
            —con sus pinos centenarios, sus robles majestuosos, sus hayas plateadas— solo son
            posibles gracias a esta alianza subterránea entre raíces y hongos.
          </Callout>

          <Section title="¿Qué es exactamente una micorriza?">
            <P>
              El término viene del griego <em>mykos</em> (hongo) y <em>rhiza</em> (raíz). Una micorriza
              es la asociación simbiótica entre las hifas de un hongo y las células de una raíz vegetal.
              El resultado es una estructura híbrida —ni completamente hongo ni completamente planta—
              que funciona como un órgano de intercambio metabólico extraordinariamente eficiente.
            </P>
            <P>
              Las hifas fúngicas, de apenas 2 a 10 micrómetros de diámetro, son capaces de penetrar
              en espacios del suelo completamente inaccesibles para las raíces. Esta red micelial puede
              extenderse decenas de metros cuadrados bajo una sola planta, actuando como una
              extensión radical de altísima superficie activa.
            </P>
            <P>
              La simbiosis es mutuamente beneficiosa: ninguno de los dos organismos puede prescindir
              del otro. En condiciones naturales, la mayoría de árboles forestales no sobreviven
              sin sus hongos simbióticos, algo que complica enormemente los proyectos de reforestación.
            </P>
          </Section>

          <InfographicBlock
            title="El intercambio de nutrientes entre árbol y micelio"
            caption="El árbol aporta entre el 10-40% del carbono fijado. El hongo retribuye con agua, fósforo y nitrógeno del suelo.">
            <SvgExchange />
          </InfographicBlock>

          <Section title="El intercambio: azúcares por minerales">
            <P>
              La simbiosis funciona sobre un principio de trueque molecular. El árbol proporciona
              al hongo entre el <strong className="text-[#84cc16]/80">10% y el 40% del carbono</strong> que
              fija mediante la fotosíntesis, fundamentalmente en forma de glucosa y sacarosa.
              A cambio, el hongo transfiere a la planta agua y minerales del suelo.
            </P>
            <P>
              Los minerales más importantes que el hongo aporta son el <strong className="text-[#c4a06b]/80">fósforo (P)</strong> y
              el <strong className="text-[#c4a06b]/80">nitrógeno (N)</strong>, que son los principales nutrientes
              limitantes del crecimiento vegetal. Estudios con trazadores radiactivos han demostrado
              que el hongo puede multiplicar hasta 60 veces la capacidad de absorción fosfórica de la planta.
            </P>
            <P>
              En condiciones de estrés hídrico, la red micelial también actúa como canal de agua,
              permitiendo al árbol resistir periodos de sequía que, sin el hongo, serían letales.
              Esta función cobra especial relevancia en el contexto del cambio climático.
            </P>
          </Section>

          <Section title="Ectomicorrizas y endomicorrizas: dos estrategias diferentes">
            <P>
              No todas las micorrizas funcionan de la misma manera. Existen dos grandes grupos
              funcionales con estrategias radicalmente distintas de interacción con la célula vegetal.
            </P>
            <P>
              Las <strong className="text-[#f4ebe1]/90">ectomicorrizas (ECM)</strong> son características de los
              árboles forestales que conocemos: pinos, robles, hayas, abetos, castaños, chopos.
              Las hifas forman un manto compacto —el "mantle"— que envuelve la raíz como un calcetín,
              y penetran <em>entre</em> las células corticales formando la llamada red de Hartig,
              pero <em>sin</em> introducirse dentro de ninguna célula. Es esta la estrategia
              del 90% de setas comestibles que buscamos.
            </P>
            <P>
              Las <strong className="text-[#f4ebe1]/90">endomicorrizas arbusculares (AMF)</strong> son las más
              extendidas del planeta —presentes en el 80% de plantas terrestres— pero los hongos
              AMF no forman setas visibles. Sus hifas penetran <em>dentro</em> de las células
              corticales de la raíz y forman estructuras ramificadas llamadas arbúsculos,
              que son el punto de intercambio metabólico.
            </P>

            <InfographicBlock
              title="Ectomicorriza vs Endomicorriza: estructura microscópica"
              caption="Izquierda: las hifas forman un manto exterior y la red de Hartig entre células. Derecha: las hifas penetran dentro de las células y forman arbúsculos ramificados.">
              <SvgEctoEndo />
            </InfographicBlock>
          </Section>

          <Section title="Las grandes setas comestibles micorrícicas">
            <P>
              Para el micólogo aficionado, este es el dato que lo cambia todo: las mejores setas
              comestibles son ECM obligadas. No pueden completar su ciclo de vida sin el árbol
              huésped. Esta es la razón por la que ninguna de ellas se cultiva en el laboratorio
              con facilidad, y explica por qué la trufa negra sigue valiendo más que el oro.
            </P>
            <P>
              Cada especie tiene un conjunto de árboles huéspedes preferidos, aunque muchas
              admiten cierta plasticidad. El <em>Boletus edulis</em> aparece bajo pinos, hayas
              y abetos, mientras que <em>Lactarius deliciosus</em> es casi exclusivo de pinares.
              Las trufas (<em>Tuber melanosporum</em>) prefieren encinas y robles en suelos calcáreos.
            </P>

            <InfographicBlock
              title="Asociaciones especie-árbol: ¿con qué árbol vive cada seta?"
              caption="Las especies micorrícicas tienen preferencias específicas por sus árboles huéspedes.">
              <SvgSpeciesTree />
            </InfographicBlock>
          </Section>

          <Section title="Lo que todo recolector debería saber">
            <P>
              Entender las micorrizas no es solo fascinante: cambia la forma de buscar setas
              y de cuidar los bosques.
            </P>
            <div className="space-y-3">
              {[
                {
                  icon: '🌲',
                  title: 'Identifica los árboles antes que las setas',
                  text: 'Si quieres ceps (Boletus edulis), busca pinares, hayedos y abetales de altitud. El árbol y el hongo son inseparables.',
                },
                {
                  icon: '📏',
                  title: 'Las setas pueden aparecer lejos del tronco',
                  text: 'El micelio se extiende hasta la gotiera de las raíces, a veces 10-15 metros del árbol. Busca en el perímetro del dosel.',
                },
                {
                  icon: '🚫',
                  title: 'Los suelos perturbados rinden menos',
                  text: 'La compactación y labranza rompen el micelio. Los bosques maduros sin pisoteo intenso tienen redes micorrícicas mucho más productivas.',
                },
                {
                  icon: '✂️',
                  title: 'Corta, no arranques',
                  text: 'Cortar la seta por la base preserva el micelio mejor que arrancarla. Los hilos que quedan bajo tierra no son desecho: son parte viva del hongo.',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 p-4 glass rounded-xl">
                  <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-[#d9cda1] mb-1">{item.title}</p>
                    <p className="text-xs text-[#f4ebe1]/55 leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Para ir más lejos">
            <Callout emoji="💡" color="yellow">
              Las micorrizas son solo una pieza del llamado "Wood Wide Web", la red de comunicación
              química que conecta árboles de un mismo bosque a través del micelio compartido.
              Árboles madre, alertas ante patógenos, transferencia de nutrientes a plántulas en sombra...
              el bosque como superorganismo es uno de los campos más activos de la ecología actual.
            </Callout>
          </Section>

          {/* Sources */}
          <div className="mt-10 pt-6" style={{ borderTop: '1px solid #ffffff10' }}>
            <p className="text-xs font-semibold text-[#f4ebe1]/35 uppercase tracking-widest mb-4">Fuentes</p>
            <div className="space-y-2">
              {[
                {
                  author: 'Sheldrake, M. (2020)',
                  title: 'Entangled Life: How Fungi Make Our Worlds',
                  pub: 'Random House',
                },
                {
                  author: 'Read, D.J. (1991)',
                  title: 'Mycorrhizas in ecosystems',
                  pub: 'Experientia 47: 376–391',
                },
                {
                  author: 'Smith, S.E. & Read, D.J. (2008)',
                  title: 'Mycorrhizal Symbiosis (3ª ed.)',
                  pub: 'Academic Press',
                },
                {
                  author: 'Societat Catalana de Micologia',
                  title: 'Guia d\'introducció a la micologia',
                  pub: 'scm.org.cat',
                },
              ].map((s, i) => (
                <div key={i} className="text-xs text-[#f4ebe1]/40 leading-relaxed">
                  <span className="text-[#f4ebe1]/60">{s.author}</span> — <em>{s.title}</em>
                  <span className="text-[#f4ebe1]/25"> · {s.pub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Back button bottom */}
          <div className="mt-10 mb-8 flex justify-center">
            <button onClick={onBack}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-[#f4ebe1]/60 hover:text-[#f4ebe1] transition-all hover:bg-white/5"
              style={{ border: '1px solid #ffffff10' }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a Micología
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Article Card ───────────────────────────────────────────────────────────────
function ArticleCard({ article, onSelect }) {
  const isPublished = article.status === 'published';

  return (
    <div
      onClick={() => isPublished && onSelect(article)}
      className={`glass rounded-2xl overflow-hidden ${isPublished ? 'hover-lift cursor-pointer' : 'opacity-60'} transition-all duration-200`}
      style={{ border: isPublished ? '1px solid #4a7c5930' : '1px solid #ffffff08' }}>
      {/* Color header */}
      <div className="px-5 py-5 flex items-start justify-between"
           style={{ background: isPublished ? 'linear-gradient(135deg, #1a2e14, #243018)' : '#161e12' }}>
        <span className="text-4xl">{article.emoji}</span>
        <div className="flex items-center gap-2">
          {!isPublished && (
            <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: '#ffffff10', color: '#f4ebe1', opacity: 0.5 }}>
              Próximamente
            </span>
          )}
          {isPublished && (
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ background: '#4a7c5930', color: '#84cc16' }}>
              Nuevo
            </span>
          )}
        </div>
      </div>

      <div className="px-5 pb-5">
        <h3 className="font-display text-base text-[#f4ebe1] mb-1 leading-tight mt-3">
          {article.title}
        </h3>
        <p className="text-xs text-[#d9cda1]/50 mb-3 leading-relaxed line-clamp-2">
          {article.summary}
        </p>

        {/* Tags + read time */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-1.5 flex-wrap">
            {article.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-xs text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <span className="text-xs text-[#f4ebe1]/30 ml-2 flex-shrink-0">
            {article.readingTime} min
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Micología main page ────────────────────────────────────────────────────────
function Micologia({ t }) {
  const [selectedSlug, setSelectedSlug] = useState(null);

  if (selectedSlug === 'micorrizas') {
    return <MicorrizasArticle onBack={() => setSelectedSlug(null)} />;
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {IC.book}
          <h2 className="font-display text-2xl text-[#f4ebe1]">Micología</h2>
        </div>
        <p className="text-sm text-[#f4ebe1]/45 max-w-xl">
          Artículos para entender el reino fungi: ecología, identificación, historia y ciencia.
        </p>
      </div>

      {/* Featured article */}
      {mockArticles.filter(a => a.featured).map(article => (
        <div key={article.id}
             onClick={() => setSelectedSlug(article.slug)}
             className="glass flex flex-col md:flex-row rounded-2xl overflow-hidden hover-lift cursor-pointer mb-8 transition-all duration-200">
          <div class="md:w-1/2">
            <img src={article.heroImage} class="w-full h-full object-cover" alt="micorrizas" height="416" width="624" />
          </div>
          <div className="md:w-1/2 p-6 sm:p-8">
            <h2 className="font-display text-xl sm:text-3xl text-[#f4ebe1] mb-3 leading-snug">
              {article.title}
            </h2>
            <p className="text-sm text-amber-100/80 leading-relaxed mb-4 max-w-xl">
              {article.summary}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {article.tags.map(tag => (
                  <span key={tag} className="text-emerald-400 bg-emerald-400/5 text-xs px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <span className="hidden md:block text-xs text-[#f4ebe1]/30">{article.readingTime} min de lectura</span>
            </div>
          </div>
        </div>
      ))}

      {/* Other articles grid */}
      <div className="mb-4">
        <h3 className="font-display text-lg text-[#f4ebe1]/60 mb-4">Más artículos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mockArticles.filter(a => !a.featured).map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              onSelect={a => setSelectedSlug(a.slug)}
            />
          ))}
        </div>
      </div>

      {/* Coming soon note */}
      <div className="mt-8 text-center py-8">
        <p className="text-xs text-[#f4ebe1]/25">
          Nuevos artículos cada mes · Basados en fuentes científicas
        </p>
      </div>
    </div>
  );
}
