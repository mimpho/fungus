// ==================== ARTICLE MODAL ====================
// Shell genérico del modal de artículos.
// Los helpers de artículo (ArticleSection, ArticleP, etc.) están definidos aquí
// y son accesibles por los archivos de contenido cargados después.
// Cada artículo se registra en ARTICLE_REGISTRY al final de su propio archivo.

// ── Helpers de artículo ───────────────────────────────────────────────────────
function ArticleSection({ title, children }) {
  return (
    <section className="mb-8">
      <h3 className="font-display text-xl text-[#d9cda1] mb-3 mt-6"
          style={{ borderLeft: '3px solid #8b7a5a', paddingLeft: '12px' }}>
        {title}
      </h3>
      {children}
    </section>
  );
}

function ArticleP({ children }) {
  return <p className="text-[#f4ebe1]/80 leading-relaxed mb-4" style={{ fontSize: '15px' }}>{children}</p>;
}

function ArticleCallout({ emoji, children, color = '#8b7a5a' }) {
  return (
    <div className="rounded-xl p-4 mb-6" style={{ background: color + '18', border: `1px solid ${color}35` }}>
      <p className="leading-relaxed text-[#d9cda1]" style={{ fontSize: '14px' }}>
        <span className="mr-2 text-base">{emoji}</span>{children}
      </p>
    </div>
  );
}

function ArticleInfographic({ title, caption, children }) {
  return (
    <div className="my-8 rounded-2xl overflow-hidden" style={{ background: '#0e1a0a', border: '1px solid #ffffff0a' }}>
      <div className="px-5 pt-4 pb-2">
        <p className="text-xs font-semibold text-[#d9cda1]/40 uppercase tracking-widest mb-0.5">Infografía</p>
        <p className="text-[#f4ebe1]/75 font-medium text-sm">{title}</p>
      </div>
      <div className="px-4 pb-4">
        {children}
        {caption && <p className="text-xs text-[#f4ebe1]/30 mt-2 text-center leading-snug">{caption}</p>}
      </div>
    </div>
  );
}

// ── Registro de artículos ─────────────────────────────────────────────────────
// Los archivos de components/articles/*.js se registran aquí en tiempo de carga.
// ArticleModal usa este objeto para renderizar el contenido correcto por slug.
const ARTICLE_REGISTRY = {};

// ── Modal wrapper ─────────────────────────────────────────────────────────────
function ArticleModal({ slug, onClose }) {
  const [scrolled, setScrolled] = useState(false);
  const modalRef  = useRef(null);
  const heroRef   = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!slug) return null;

  const article = mockArticles.find(a => a.slug === slug);
  if (!article) return null;

  const tagsLabel = article.tags.slice(0, 3)
    .map(t => t.charAt(0).toUpperCase() + t.slice(1))
    .join(' · ');

  const dateLabel = article.date
    ? new Date(article.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-start justify-center modal-outer"
      style={{ background: MODAL.overlay, backdropFilter: 'blur(8px)', overflowY: 'auto' }}
      onClick={onClose}>

      <div ref={modalRef}
        onScroll={() => setScrolled((modalRef.current?.scrollTop ?? 0) > (heroRef.current?.offsetHeight ?? 224) * 0.85)}
        className="sm:my-8 rounded-2xl max-w-4xl w-full anim-scale modal-inner"
        style={{ background: MODAL.bg }}
        onClick={e => e.stopPropagation()}>

        {/* Mini-barra sticky — igual que SpeciesModal, aparece al hacer scroll */}
        <div className={`glass sticky top-0 z-20 flex items-center gap-3 px-4 overflow-hidden transition-all duration-200 sm:rounded-t-2xl ${scrolled ? 'max-h-20 py-3 opacity-100' : 'max-h-0 py-0 opacity-0 pointer-events-none'}`}
          style={{ borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
          <div className="flex-1 min-w-0">
            <p className="font-display text-xl font-semibold text-[#f4ebe1] truncate">{article.title}</p>
            <p className="text-[#d9cda1]/60 text-xs truncate">{article.subtitle}</p>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all shrink-0">
            {IC.close}
          </button>
        </div>

        {/* Hero foto — sin márgenes, igual que SpeciesModal */}
        <div ref={heroRef} className="relative overflow-hidden sm:rounded-t-2xl modal-header"
          style={{ minHeight: '224px', height: '52vh' }}>
          <img src={article.heroImage} className="w-full h-full object-cover object-center"
               alt={article.title} />
          <div className="absolute inset-0"
               style={{ background: 'linear-gradient(to top, rgb(48, 55, 42) 15%, rgba(48, 55, 42, 0.25) 60%, transparent 100%)' }} />
          {/* Texto del hero — abajo a la izquierda */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-8">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#8b7a5a' }}>
              {tagsLabel}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl text-[#f4ebe1] leading-tight mb-2 drop-shadow-lg">
              {article.title}
            </h1>
            <p className="text-[#d9cda1]/80 text-sm leading-relaxed max-w-2xl">
              {article.subtitle}
            </p>
            <div className="flex items-center gap-3 mt-4 text-xs" style={{ color: 'rgba(244,235,225,0.38)' }}>
              {dateLabel && <span>{dateLabel}</span>}
              {dateLabel && <span>·</span>}
              <span>{article.readingTime} min de lectura</span>
            </div>
          </div>
          {/* Botón cerrar — igual que SpeciesModal */}
          <button onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 text-white/50 hover:text-white transition-all">
            {IC.close}
          </button>
        </div>

        {/* Cuerpo del artículo */}
        {(() => { const Body = ARTICLE_REGISTRY[slug]; return Body ? <Body /> : null; })()}
      </div>
    </div>,
    document.body
  );
}
