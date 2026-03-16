// Micorrizas.jsx — contenido del artículo "Micorrizas: la alianza secreta entre hongos y árboles"
// Se registra en ARTICLE_REGISTRY al importarse desde Micologia.jsx
import { ARTICLE_REGISTRY, ArticleSection, ArticleP, ArticleCallout, ArticleInfographic } from '../components/modals/ArticleModal'
import { useApp } from '../contexts/AppContext'

// ─── Infografía 1: Intercambio de nutrientes ──────────────────────────────────
function SvgExchange({ t }) {
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
      <rect width="600" height="290" rx="12" fill="#111a0e" />
      <rect width="600" height="138" rx="12" fill="url(#skyGrad)" />
      <rect y="138" width="600" height="152" fill="url(#soilGrad)" />
      <path d="M0,138 Q75,132 150,138 Q225,144 300,138 Q375,132 450,138 Q525,144 600,138"
        fill="none" stroke="#6b4820" strokeWidth="2.5" opacity="0.7" />
      <rect x="108" y="92" width="20" height="48" rx="3" fill="#7a5230" />
      <ellipse cx="118" cy="60" rx="52" ry="40" fill="#183a0e" />
      <ellipse cx="95" cy="73" rx="35" ry="27" fill="#1f4a12" />
      <ellipse cx="143" cy="71" rx="37" ry="29" fill="#1f4a12" />
      <ellipse cx="118" cy="46" rx="30" ry="25" fill="#275a16" />
      <ellipse cx="112" cy="42" rx="16" ry="12" fill="#2e6a1c" opacity="0.7" />
      <circle cx="555" cy="28" r="16" fill="#eab308" opacity="0.12" />
      <circle cx="555" cy="28" r="10" fill="#eab308" opacity="0.18" />
      <text x="555" y="32" fill="#eab308" fontSize="13" textAnchor="middle" opacity="0.7">☀</text>
      <text x="192" y="28" fill="#84cc16" fontSize="10" fontWeight="600">{t.art_mic_svg1_fotosintesis}</text>
      <text x="192" y="41" fill="#f4ebe1" fontSize="9" opacity="0.45">{t.art_mic_svg1_formula}</text>
      <path d="M118,138 L118,208" stroke="#8a6230" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M118,168 Q92,188 76,222" stroke="#8a6230" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M118,176 Q145,198 160,230" stroke="#8a6230" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M118,198 Q100,214 88,248" stroke="#8a6230" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M118,204 Q135,220 144,252" stroke="#8a6230" strokeWidth="2" fill="none" strokeLinecap="round" />
      <g stroke="#4a7c59" strokeWidth="1.3" fill="none" opacity="0.9">
        <path d="M88,248 Q190,237 295,250 Q390,262 488,246" />
        <path d="M144,252 Q230,256 320,250 Q410,244 505,255" />
        <path d="M56,258 Q150,265 245,257 Q335,250 425,263 Q505,274 565,262" />
      </g>
      {[[88,248],[144,252],[245,257],[320,250],[410,244],[505,255]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="2.8" fill="#4a7c59" />
      ))}
      <path d="M502,138 Q480,116 500,107 Q520,98 536,107 Q552,116 502,138" fill="#a8702a" />
      <rect x="498" y="126" width="8" height="16" rx="2" fill="#d4c08a" />
      <path d="M100,89 L100,168" stroke="#84cc16" strokeWidth="2.5" fill="none" strokeDasharray="5,4" markerEnd="url(#ag)" opacity="0.95" />
      <path d="M215,244 L172,188" stroke="#c4a06b" strokeWidth="2.5" fill="none" strokeDasharray="5,4" markerEnd="url(#aa)" opacity="0.95" />
      <rect x="18" y="114" width="74" height="36" rx="8" fill="#0d1a0a" stroke="#84cc16" strokeWidth="1" opacity="0.95" />
      <text x="55" y="127" fill="#84cc16" fontSize="9.5" fontWeight="700" textAnchor="middle">{t.art_mic_svg1_sugars}</text>
      <text x="55" y="141" fill="#84cc16" fontSize="8.5" textAnchor="middle" opacity="0.8">{t.art_mic_svg1_carbon}</text>
      <rect x="222" y="206" width="86" height="50" rx="8" fill="#120d06" stroke="#c4a06b" strokeWidth="1" opacity="0.95" />
      <text x="265" y="220" fill="#c4a06b" fontSize="9.5" fontWeight="700" textAnchor="middle">{t.art_mic_svg1_minerals}</text>
      <text x="265" y="233" fill="#c4a06b" fontSize="8.5" textAnchor="middle" opacity="0.8">{t.art_mic_svg1_phosphorus}</text>
      <text x="265" y="246" fill="#c4a06b" fontSize="8.5" textAnchor="middle" opacity="0.8">{t.art_mic_svg1_nitrogen}</text>
      <circle cx="130" cy="205" r="48" fill="none" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.45" />
      <text x="185" y="172" fill="#c084fc" fontSize="9" opacity="0.6">{t.art_mic_svg1_zone}</text>
      <text x="390" y="284" fill="#4a7c59" fontSize="10" fontWeight="500" textAnchor="middle" opacity="0.7">{t.art_mic_svg1_network}</text>
    </svg>
  )
}

// ─── Infografía 2: Ecto vs Endo ───────────────────────────────────────────────
function SvgEctoEndo({ t }) {
  const cellW = 38, cellH = 28, gap = 6
  const cells = (ox, oy, rows, cols, fill, stroke) =>
    Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => (
        <rect key={`${r}-${c}`} x={ox + c*(cellW+gap)} y={oy + r*(cellH+gap)}
          width={cellW} height={cellH} rx="5" fill={fill} stroke={stroke} strokeWidth="1" />
      ))
    )
  const ectoOx = 40, ectoOy = 75, endoOx = 330, endoOy = 75
  const cols = 3, rows = 3
  const panelW = cols*cellW + (cols-1)*gap
  const panelH = rows*cellH + (rows-1)*gap
  return (
    <svg viewBox="0 0 600 260" xmlns="http://www.w3.org/2000/svg" className="w-full rounded-xl">
      <rect width="600" height="260" rx="12" fill="#111a0e" />
      <line x1="300" y1="20" x2="300" y2="240" stroke="#f4ebe1" strokeWidth="1" opacity="0.08" />
      <text x="103" y="35" fill="#f4ebe1" fontSize="13" fontWeight="700" textAnchor="middle">{t.art_mic_svg2_ecto}</text>
      <text x="103" y="50" fill="#f4ebe1" fontSize="9" textAnchor="middle" opacity="0.45">{t.art_mic_svg2_ecto_abbr}</text>
      <rect x={ectoOx - 14} y={ectoOy - 14} width={panelW + 28} height={panelH + 28}
        rx="12" fill="none" stroke="#4a7c59" strokeWidth="12" opacity="0.25" />
      <rect x={ectoOx - 14} y={ectoOy - 14} width={panelW + 28} height={panelH + 28}
        rx="12" fill="none" stroke="#4a7c59" strokeWidth="4" opacity="0.6" />
      {cells(ectoOx, ectoOy, rows, cols, '#1e3a18', '#3a6030')}
      <text x="497" y="35" fill="#f4ebe1" fontSize="13" fontWeight="700" textAnchor="middle">{t.art_mic_svg2_endo}</text>
      <text x="497" y="50" fill="#f4ebe1" fontSize="9" textAnchor="middle" opacity="0.45">{t.art_mic_svg2_endo_abbr}</text>
      {cells(endoOx, endoOy, rows, cols, '#1e3a18', '#3a6030')}
      <line x1={ectoOx + panelW/2} y1={ectoOy + cellH + gap/2} x2={ectoOx + panelW/2} y2={210}
        stroke="#6aaa7a" strokeWidth="1" opacity="0.5" />
      <text x={ectoOx + panelW/2} y={222} fill="#6aaa7a" fontSize="8.5" textAnchor="middle">{t.art_mic_svg2_hartig}</text>
      <text x={ectoOx + panelW/2} y={234} fill="#6aaa7a" fontSize="7.5" textAnchor="middle" opacity="0.6">{t.art_mic_svg2_hartig_sub}</text>
      <line x1={endoOx + panelW/2} y1={endoOy + cellH + gap/2} x2={endoOx + panelW/2} y2={210}
        stroke="#c4a06b" strokeWidth="1" opacity="0.5" />
      <text x={endoOx + panelW/2} y={222} fill="#c4a06b" fontSize="8.5" textAnchor="middle">{t.art_mic_svg2_arbusculos}</text>
      <text x={endoOx + panelW/2} y={234} fill="#c4a06b" fontSize="7.5" textAnchor="middle" opacity="0.6">{t.art_mic_svg2_arbusculos_sub}</text>
      <text x="300" y="252" fill="#f4ebe1" fontSize="8.5" textAnchor="middle" opacity="0.35">
        {t.art_mic_svg2_footer}
      </text>
    </svg>
  )
}

// ─── Infografía 3: Especie ↔ Árbol ───────────────────────────────────────────
function SvgSpeciesTree({ t }) {
  const species = [
    { name: 'Boletus edulis',        emoji: '🍄', trees: [1,1,1,0,1] },
    { name: 'Cantharellus cibarius', emoji: '🌼', trees: [0,1,1,1,0] },
    { name: 'Lactarius deliciosus',  emoji: '🟠', trees: [1,0,0,0,1] },
    { name: 'Tuber melanosporum',    emoji: '⚫', trees: [0,1,0,1,0] },
    { name: 'Amanita caesarea',      emoji: '🔴', trees: [0,1,0,1,0] },
  ]
  const trees      = t.art_mic_svg3_trees
  const treeEmojis = ['🌲', '🌳', '🌲', '🌿', '🎄']
  const rowH = 36, headerH = 55, colW = 80, labelW = 170
  const totalH = headerH + species.length * rowH + 24
  return (
    <svg viewBox={`0 0 ${labelW + trees.length * colW + 20} ${totalH}`}
      xmlns="http://www.w3.org/2000/svg" className="w-full rounded-xl">
      <rect width="700" height={totalH} rx="12" fill="#111a0e" />
      {trees.map((tree, ci) => (
        <g key={ci}>
          <text x={labelW + ci*colW + colW/2} y={24} fill="#f4ebe1" fontSize="15" textAnchor="middle" opacity="0.8">{treeEmojis[ci]}</text>
          <text x={labelW + ci*colW + colW/2} y={42} fill="#f4ebe1" fontSize="9.5" textAnchor="middle" opacity="0.6" fontWeight="500">{tree}</text>
        </g>
      ))}
      {species.map((sp, ri) => {
        const y = headerH + ri * rowH
        return (
          <g key={ri}>
            <rect x="8" y={y} width={labelW + trees.length*colW + 4} height={rowH}
              rx="6" fill={ri % 2 === 0 ? '#ffffff06' : '#00000010'} />
            <text x="18" y={y + 14} fill="#f4ebe1" fontSize="10.5" fontWeight="600" opacity="0.9">
              {sp.emoji} {sp.name}
            </text>
            {sp.trees.map((assoc, ci) => (
              assoc ? (
                <g key={ci}>
                  <circle cx={labelW + ci*colW + colW/2} cy={y + rowH/2} r="10" fill="#4a7c59" opacity="0.85" />
                  <text x={labelW + ci*colW + colW/2} y={y + rowH/2 + 4} fill="#f4ebe1" fontSize="10" textAnchor="middle">✓</text>
                </g>
              ) : (
                <circle key={ci} cx={labelW + ci*colW + colW/2} cy={y + rowH/2}
                  r="6" fill="none" stroke="#f4ebe1" strokeWidth="1" opacity="0.12" />
              )
            ))}
          </g>
        )
      })}
      <text x="8" y={totalH - 6} fill="#f4ebe1" fontSize="8.5" opacity="0.3">{t.art_mic_svg3_footer}</text>
    </svg>
  )
}

// ─── Cuerpo del artículo ──────────────────────────────────────────────────────
function MicorrizasContent() {
  const { t } = useApp()
  return (
    <div className="p-6 pt-0 space-y-8">
      <ArticleCallout emoji="🔬" color="#4a7c59" html={t.art_mic_callout_intro} />

      <ArticleSection title={t.art_mic_s1_title}>
        <ArticleP html={t.art_mic_s1_p1} />
        <ArticleP>{t.art_mic_s1_p2}</ArticleP>
        <ArticleP>{t.art_mic_s1_p3}</ArticleP>
      </ArticleSection>

      <ArticleInfographic
        title={t.art_mic_infog1_title}
        caption={t.art_mic_infog1_caption}
        infografiaLabel={t.infografia}>
        <SvgExchange t={t} />
      </ArticleInfographic>

      <ArticleSection title={t.art_mic_s2_title}>
        <ArticleP html={t.art_mic_s2_p1} />
        <ArticleP html={t.art_mic_s2_p2} />
        <ArticleP>{t.art_mic_s2_p3}</ArticleP>
      </ArticleSection>

      <ArticleSection title={t.art_mic_s3_title}>
        <ArticleP>{t.art_mic_s3_p1}</ArticleP>
        <ArticleP html={t.art_mic_s3_p2} />
        <ArticleP html={t.art_mic_s3_p3} />
        <ArticleInfographic
          title={t.art_mic_infog2_title}
          caption={t.art_mic_infog2_caption}
          infografiaLabel={t.infografia}>
          <SvgEctoEndo t={t} />
        </ArticleInfographic>
      </ArticleSection>

      <ArticleSection title={t.art_mic_s4_title}>
        <ArticleP>{t.art_mic_s4_p1}</ArticleP>
        <ArticleP html={t.art_mic_s4_p2} />
        <ArticleInfographic
          title={t.art_mic_infog3_title}
          caption={t.art_mic_infog3_caption}
          infografiaLabel={t.infografia}>
          <SvgSpeciesTree t={t} />
        </ArticleInfographic>
      </ArticleSection>

      <ArticleSection title={t.art_mic_s5_title}>
        <ArticleP>{t.art_mic_s5_p1}</ArticleP>
        <div className="space-y-3">
          {t.art_mic_tips.map((item, i) => (
            <div key={i} className="flex gap-3 p-4 glass rounded-xl">
              <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
              <div>
                <p className="font-semibold text-[#d9cda1] mb-1" style={{ fontSize: '14px' }}>{item.title}</p>
                <p className="text-[#f4ebe1]/55 leading-relaxed" style={{ fontSize: '13px' }}>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </ArticleSection>

      <ArticleSection title={t.art_mic_s6_title}>
        <ArticleCallout emoji="💡" color="#8b7a5a" html={t.art_mic_s6_callout} />
      </ArticleSection>

      <div className="mt-10 pt-6" style={{ borderTop: '1px solid #ffffff10' }}>
        <p className="text-xs font-semibold text-[#f4ebe1]/30 uppercase tracking-widest mb-4">{t.art_sources}</p>
        <div className="space-y-2">
          {[
            { author: 'Sheldrake, M. (2020)', title: 'Entangled Life: How Fungi Make Our Worlds', pub: 'Random House' },
            { author: 'Read, D.J. (1991)', title: 'Mycorrhizas in ecosystems', pub: 'Experientia 47: 376–391' },
            { author: 'Smith, S.E. & Read, D.J. (2008)', title: 'Mycorrhizal Symbiosis (3ª ed.)', pub: 'Academic Press' },
            { author: 'Societat Catalana de Micologia', title: "Guia d'introducció a la micologia", pub: 'scm.org.cat' },
          ].map((s, i) => (
            <div key={i} className="text-xs text-[#f4ebe1]/40 leading-relaxed">
              <span className="text-[#f4ebe1]/55">{s.author}</span> — <em>{s.title}</em>
              <span className="text-[#f4ebe1]/22"> · {s.pub}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Registro ─────────────────────────────────────────────────────────────────
ARTICLE_REGISTRY['micorrizas'] = MicorrizasContent
