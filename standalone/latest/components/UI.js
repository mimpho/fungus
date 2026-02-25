// ==================== FILTER PANEL ====================
// Desktop: inline colapsable justo donde se renderiza
// Mobile: portal bottom-sheet con backdrop fade + slide-up + drag-to-close
function FilterPanel({ isOpen, onClose, children }) {
  const dragStartY = useRef(0);
  const [dragY, setDragY]     = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const drawerRef = useRef(null);

  // Bloquear scroll body solo en mobile (bottom-sheet), no en desktop (inline)
  useEffect(() => {
    const isMobile = window.innerWidth < 640;
    if (isOpen && isMobile) document.body.style.overflow = 'hidden';
    else                    document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ── Drag handlers ──────────────────────────────────────────
  const onTouchStart = (e) => {
    dragStartY.current = e.touches[0].clientY;
    setDragY(0);
    setIsDragging(true);
  };
  const onTouchMove = (e) => {
    const delta = Math.max(0, e.touches[0].clientY - dragStartY.current);
    setDragY(delta);
  };
  const onTouchEnd = () => {
    const h = drawerRef.current?.offsetHeight || 400;
    setIsDragging(false);
    if (dragY > h * 0.5) { setDragY(0); onClose(); }
    else                  { setDragY(0); }
  };

  const drawerStyle = isDragging
    ? { transform: `translateY(${dragY}px)`, transition: 'none',    background: MODAL.bg }
    : { transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.35s cubic-bezier(0.32,0.72,0,1)', background: MODAL.bg };

  // ── Desktop panel (inline, sin portal) ────────────────────
  const desktopPanel = (
    <div className={`hidden sm:block overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
      <div className="glass rounded-2xl p-5 mt-2">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-display text-lg font-semibold text-[#f4ebe1]">Filtrar y ordenar</h4>
          <button onClick={onClose} className="p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all">{IC.close}</button>
        </div>
        {children}
      </div>
    </div>
  );

  // ── Mobile bottom-sheet (portal) ──────────────────────────
  const mobileSheet = ReactDOM.createPortal(
    <div className="sm:hidden">
      {/* Backdrop — fade */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ background: MODAL.overlay, backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      {/* Drawer — slide */}
      <div ref={drawerRef} className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl" style={drawerStyle}>
        {/* Handle draggable */}
        <div
          className="pt-4 pb-2 flex flex-col items-center touch-none cursor-grab select-none"
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        {/* Header con X */}
        <div className="flex items-center justify-between px-5 pb-3">
          <h4 className="font-display text-xl font-semibold text-[#f4ebe1]">Filtrar y ordenar</h4>
          <button onClick={onClose} className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all">{IC.close}</button>
        </div>
        {/* Contenido scrollable */}
        <div className="px-5 pb-8 overflow-y-auto" style={{ maxHeight: '65dvh' }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );

  return <>{desktopPanel}{mobileSheet}</>;
}

// Alias de compatibilidad para código existente
const BottomPillPortal = FilterPanel;

// ==================== ACTIVE FILTER CHIP ====================
// Uso: <ActiveFilterChip label="Tóxicas" emoji="⚠️" color="amber" onRemove={() => ...} />
// color: 'amber' (default, marrón acento) | 'yellow' | 'emerald'
function ActiveFilterChip({ label, emoji, color = 'amber', onRemove }) {
  const colors = {
    amber:   'bg-[#887b4b]/15 text-[#c4a06b]',
    yellow:  'bg-yellow-400/15 text-yellow-400',
    emerald: 'bg-[#4a7c59]/15 text-emerald-400',
    blue:    'bg-sky-400/15 text-sky-400',
  };
  return (
    <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${colors[color] ?? colors.amber}`}>
      {emoji && <span>{emoji}</span>}
      {label}
      <button
        onClick={onRemove}
        className="hover:text-white -mr-1 p-1 rounded-full hover:bg-white/10 transition-all leading-none">
        ×
      </button>
    </span>
  );
}

// ==================== SEARCH FILTER BAR ====================
// variant="full"  → solo búsqueda, pill completo (ej. mapa)
// variant="split" → búsqueda + botón Filtrar integrado con corte de 2px (ej. listados)
// Focus: al enfocar el input, el botón Filtrar se oculta con animación y la lupa
// aparece a la derecha como botón de submit. Al perder el foco, vuelve al estado normal.
function SearchFilterBar({ value, onChange, onClear, placeholder, onFilterClick, activeFilters = 0, variant = 'full', className = '' }) {
  const H = '52px';
  const R = '26px';
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  // preventDefault en mousedown evita que el input pierda el foco al hacer clic en submit;
  // luego el onClick llama blur() manualmente para cerrar el teclado móvil y restaurar el estado.
  const handleSubmitMouseDown = (e) => e.preventDefault();
  const handleSubmitClick     = () => inputRef.current?.blur();

  const submitBtn = (
    <button
      type="button"
      onMouseDown={handleSubmitMouseDown}
      onClick={handleSubmitClick}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#f4ebe1]/75 hover:text-[#f4ebe1] transition-colors">
      {IC.search}
    </button>
  );

  if (variant === 'full') {
    return (
      <div className={`relative ${className}`}>
        {!focused && (
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#f4ebe1]/75 pointer-events-none">{IC.search}</span>
        )}
        <input
          ref={inputRef}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full glass text-[#f4ebe1] text-sm outline-none placeholder-[#f4ebe1]/30 transition-all duration-200 ${focused ? 'pl-5 pr-12' : 'pl-12 pr-10'}`}
          style={{ height: H, borderRadius: R }}
        />
        {focused && submitBtn}
        {!focused && value && (
          <button onClick={onClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#f4ebe1]/40 hover:text-[#f4ebe1]/70 transition-colors text-lg leading-none">×</button>
        )}
      </div>
    );
  }

  // variant === 'split'
  return (
    <div className={`flex ${className}`} style={{ gap: focused ? 0 : '2px' }}>
      {/* Input */}
      <div className="relative flex-1">
        {!focused && (
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#f4ebe1]/75 pointer-events-none">{IC.search}</span>
        )}
        <input
          ref={inputRef}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full glass text-[#f4ebe1] text-sm outline-none placeholder-[#f4ebe1]/30 transition-all duration-200 ${focused ? 'pl-5 pr-12' : 'pl-12 pr-10'}`}
          style={{ height: H, borderRadius: focused ? R : `${R} 0 0 ${R}` }}
        />
        {focused && submitBtn}
        {!focused && value && (
          <button onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#f4ebe1]/40 hover:text-[#f4ebe1]/70 transition-colors text-lg leading-none">×</button>
        )}
      </div>
      {/* Botón Filtrar — se colapsa con animación al enfocar el input */}
      <div
        className="overflow-hidden shrink-0"
        style={{ maxWidth: focused ? 0 : '160px', opacity: focused ? 0 : 1, transition: 'max-width 0.2s ease, opacity 0.15s ease' }}>
        <button
          onClick={onFilterClick}
          className="px-5 glass text-[#f4ebe1]/85 hover:text-[#c4a06b] transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap"
          style={{ height: H, borderRadius: `0 ${R} ${R} 0` }}>
          {IC.filter}
          <span>Filtrar</span>
          {activeFilters > 0 && (
            <span className="px-1.5 py-0.5 bg-[#887b4b] text-white rounded-full text-[10px] font-bold leading-none">{activeFilters}</span>
          )}
        </button>
      </div>
    </div>
  );
}

// ==================== TABS COMPONENT ====================
function Tabs({ options, selected, onChange, size = 'md', variant = 'default' }) {
  // size: 'sm' | 'md' | 'lg'
  // variant: 'default' | 'compact'
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };
  
  const containerClasses = variant === 'compact' 
    ? 'flex gap-1'
    : 'flex bg-white/[0.04] rounded-xl p-1 gap-1';
  
  const buttonBaseClasses = 'rounded-lg font-medium transition-all';
  const buttonActiveClasses = variant === 'compact'
    ? 'bg-[#887b4b]/90 text-white shadow-md'
    : 'bg-[#887b4b] text-white shadow-sm';
  const buttonInactiveClasses = variant === 'compact'
    ? 'bg-white/[0.08] text-[#f4ebe1]/60 hover:text-[#f4ebe1] hover:bg-white/[0.12]'
    : 'text-[#f4ebe1]/60 hover:text-[#f4ebe1]';
  
  return (
    <div className={containerClasses}>
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`${buttonBaseClasses} ${sizeClasses[size]} ${
            selected === opt.id ? buttonActiveClasses : buttonInactiveClasses
          }`}>
          {opt.icon && <span className="mr-1.5">{opt.icon}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
