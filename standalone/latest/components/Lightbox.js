// ==================== LIGHTBOX ====================
function Lightbox({ fotos, initialIndex, onClose }) {
  const [idx, setIdx] = useState(initialIndex || 0);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const prev = useCallback(() => setIdx(i => (i - 1 + fotos.length) % fotos.length), [fotos.length]);
  const next = useCallback(() => setIdx(i => (i + 1) % fotos.length), [fotos.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [next, prev, onClose]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Solo swipe horizontal con desplazamiento mínimo de 40px
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) next(); else prev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const foto = fotos[idx];
  // Siempre usar la versión -large si existe
  const imgUrl = foto.largeUrl || foto.url;

  return (
    <div className="fixed inset-0 z-[10001] flex flex-col"
      style={{ background: 'rgba(0,0,0,0.96)' }}
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}
        onClick={e => e.stopPropagation()}>
        <span className="text-[#f4ebe1]/60 text-sm font-medium">{idx + 1} / {fotos.length}</span>
        <button onClick={onClose}
          className="p-2 rounded-xl hover:bg-white/10 text-[#f4ebe1]/70 hover:text-[#f4ebe1] transition-colors">
          {IC.close}
        </button>
      </div>

      {/* Área imagen — ocupa todo el espacio vertical */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Flechas — solo desktop */}
        {fotos.length > 1 && (
          <button onClick={prev}
            className="hidden sm:flex absolute left-4 z-10 w-12 h-12 rounded-full glass items-center justify-center text-[#f4ebe1]/70 hover:text-[#f4ebe1] hover:bg-white/10 transition-all">
            {IC.chevron('left')}
          </button>
        )}

        {/* Imagen: object-contain con 100% w y h → llena el eje mayor */}
        <img key={idx} src={imgUrl} alt={foto.caption || ''}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: '56px 0 80px',
          }} />

        {fotos.length > 1 && (
          <button onClick={next}
            className="hidden sm:flex absolute right-4 z-10 w-12 h-12 rounded-full glass items-center justify-center text-[#f4ebe1]/70 hover:text-[#f4ebe1] hover:bg-white/10 transition-all">
            {IC.chevron('right')}
          </button>
        )}
      </div>

      {/* Footer — caption + pager */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-5 pt-12 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }}>
        <div className="pointer-events-auto flex flex-col items-center gap-3 w-full px-4"
          onClick={e => e.stopPropagation()}>

          {foto.caption && (
            <p className="text-[#f4ebe1]/80 text-sm text-center">{foto.caption}</p>
          )}

          {fotos.length > 1 && (
            <>
              {/* Desktop: miniaturas */}
              <div className="hidden sm:flex gap-2">
                {fotos.map((f, i) => (
                  <button key={i} onClick={() => setIdx(i)}
                    className={`w-12 h-12 rounded-lg overflow-hidden transition-all flex-shrink-0 ${i === idx ? 'scale-110 ring-2 ring-white/50' : 'opacity-40 hover:opacity-75'}`}>
                    <img src={f.largeUrl || f.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Mobile: dot indicators */}
              <div className="flex sm:hidden gap-2 items-center">
                {fotos.map((_, i) => (
                  <button key={i} onClick={() => setIdx(i)}
                    className={`rounded-full transition-all duration-200 ${i === idx ? 'w-5 h-[7px] bg-white' : 'w-[7px] h-[7px] bg-white/35 hover:bg-white/60'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
