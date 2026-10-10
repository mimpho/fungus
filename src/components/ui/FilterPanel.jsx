import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { IC, MODAL } from '../../lib/helpers'

// Desktop: inline colapsable  (hideDesktop=true para suprimir cuando la sticky bar tiene su propio dropdown)
// Mobile: portal bottom-sheet con drag-to-close (siempre activo)
export function FilterPanel({ isOpen, onClose, children, hideDesktop = false }) {
  const dragStartY  = useRef(0)
  const drawerRef   = useRef(null)
  const [dragY, setDragY]         = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const onTouchStart = e => { dragStartY.current = e.touches[0].clientY; setDragY(0); setIsDragging(true) }
  const onTouchMove  = e => { setDragY(Math.max(0, e.touches[0].clientY - dragStartY.current)) }
  const onTouchEnd   = () => {
    const h = drawerRef.current?.offsetHeight || 400
    setIsDragging(false)
    if (dragY > h * 0.5) { setDragY(0); onClose() }
    else                  { setDragY(0) }
  }

  const drawerStyle = isDragging
    ? { transform: `translateY(${dragY}px)`, transition: 'none',    background: MODAL.bg }
    : { transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.35s cubic-bezier(0.32,0.72,0,1)', background: MODAL.bg }

  return (
    <>
      {/* Desktop inline — oculto cuando la sticky bar gestiona su propio dropdown */}
      <div className={`hidden sm:block overflow-hidden transition-all duration-300 ${hideDesktop ? 'max-h-0 opacity-0 pointer-events-none' : isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
        <div className="glass rounded-2xl p-5 mt-2">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-display text-lg font-semibold text-cream">Filtrar y ordenar</h4>
            <button onClick={onClose} className="p-1.5 rounded-xl text-cream/50 hover:text-cream hover:bg-cream/10 transition-all">{IC.close}</button>
          </div>
          {children}
        </div>
      </div>

      {/* Mobile bottom-sheet portal */}
      {createPortal(
        <div className="sm:hidden">
          <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            style={{ background: MODAL.overlay, backdropFilter: 'blur(8px)' }}
            onClick={onClose} />
          <div ref={drawerRef} className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl flex flex-col" style={{ ...drawerStyle, maxHeight: 'calc(100dvh - 50px)' }}>
            <div className="pt-4 pb-2 flex flex-col items-center touch-none cursor-grab select-none shrink-0"
              onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
              <div className="w-10 h-1 rounded-full bg-cream/20" />
            </div>
            <div className="flex items-center justify-between px-5 pb-3 shrink-0">
              <h4 className="font-display text-xl font-semibold text-cream">Filtrar y ordenar</h4>
              <button onClick={onClose} className="p-2 rounded-xl text-cream/50 hover:text-cream hover:bg-cream/10 transition-all">{IC.close}</button>
            </div>
            <div className="px-5 pb-8 overflow-y-auto">
              {children}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
