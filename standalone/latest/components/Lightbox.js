// ==================== LIGHTBOX ====================
function Lightbox({ fotos, initialIndex, onClose }) {
  const [idx, setIdx] = useState(initialIndex || 0);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % fotos.length);
      if (e.key === 'ArrowLeft') setIdx(i => (i - 1 + fotos.length) % fotos.length);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [fotos, onClose]);

  const foto = fotos[idx];

  return (
    <div className="fixed inset-0 z-[10001] flex flex-col items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.96)' }}
      onClick={onClose}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}
        onClick={e => e.stopPropagation()}>
        <span className="text-[#f4ebe1]/60 text-sm">{idx + 1} / {fotos.length}</span>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-[#f4ebe1]/70 hover:text-[#f4ebe1] transition-colors">
          {IC.close}
        </button>
      </div>

      {/* Imagen principal */}
      <div className="relative flex items-center justify-center w-full h-full px-16"
        onClick={e => e.stopPropagation()}>
        {fotos.length > 1 && (
          <button onClick={() => setIdx(i => (i - 1 + fotos.length) % fotos.length)}
            className="absolute left-4 z-10 w-12 h-12 rounded-full glass flex items-center justify-center text-[#f4ebe1]/70 hover:text-[#f4ebe1] hover:bg-white/10 transition-all">
            {IC.chevron('left')}
          </button>
        )}
        <img key={idx} src={foto.url} alt={foto.caption}
          className="lightbox-img max-h-[80vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
          style={{ boxShadow: '0 0 80px rgba(0,0,0,0.8)' }} />
        {fotos.length > 1 && (
          <button onClick={() => setIdx(i => (i + 1) % fotos.length)}
            className="absolute right-4 z-10 w-12 h-12 rounded-full glass flex items-center justify-center text-[#f4ebe1]/70 hover:text-[#f4ebe1] hover:bg-white/10 transition-all">
            {IC.chevron('right')}
          </button>
        )}
      </div>

      {/* Caption */}
      {foto.caption && (
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-6 pt-12"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}
          onClick={e => e.stopPropagation()}>
          <p className="text-[#f4ebe1]/80 text-sm text-center px-4">{foto.caption}</p>
          {/* Miniaturas */}
          {fotos.length > 1 && (
            <div className="flex gap-2 mt-3">
              {fotos.map((f, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`w-12 h-12 rounded-lg overflow-hidden transition-all ${i === idx ? 'scale-110' : 'opacity-50 hover:opacity-80'}`}>
                  <img src={f.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
