// =====================================================
// EditProfileModal — editar nombre, apellidos y fecha de nacimiento.
// El email es inmutable y no se muestra aquí.
// =====================================================
import { useState, useEffect } from 'react'
import { useApp } from '../../contexts/AppContext'
import { IC } from '../../lib/helpers'
import { MODAL } from '../../lib/constants'
import { translateApiError } from '../../services/authService'

export function EditProfileModal({ onClose }) {
  const { t, user, updateUserProfile, lightbox } = useApp()

  const [firstName, setFirstName] = useState(user?.first_name || '')
  const [lastName,  setLastName]  = useState(user?.last_name  || '')
  const [birthDate, setBirthDate] = useState(user?.birth_date || '')
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [saved,   setSaved]   = useState(false)

  // Close on ESC
  useEffect(() => {
    if (lightbox) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose, lightbox])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await updateUserProfile(firstName, lastName, birthDate || undefined)
      setSaved(true)
      setTimeout(() => { setSaved(false); onClose() }, 1200)
    } catch (err) {
      setError(translateApiError(err.message, t))
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-white/[0.04] rounded-xl px-4 py-2.5 text-cream text-sm outline-none focus:ring-1 focus:ring-bar/50 transition-all'
  const labelCls = 'text-muted text-xs uppercase tracking-wide block mb-1.5'

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 modal-outer"
      style={{ background: MODAL.overlay, backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative rounded-2xl w-full max-w-sm p-6 anim-scale" style={{ background: MODAL.bg }}>

        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-cream/40 hover:text-cream transition-colors p-1">
          {IC.close}
        </button>

        {/* Header */}
        <h2 className="font-display text-2xl font-semibold text-cream mb-1">
          {t.editarPerfil ?? 'Editar perfil'}
        </h2>
        <p className="text-cream/40 text-xs mb-6">{user?.email}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre + Apellidos */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t.nombre ?? 'Nombre'}</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>{t.apellidos ?? 'Apellidos'}</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
                autoComplete="family-name"
                className={inputCls}
              />
            </div>
          </div>

          {/* Fecha de nacimiento */}
          <div>
            <label className={labelCls}>
              {t.fechaNacimiento ?? 'Fecha de nacimiento'}
              <span className="normal-case ml-1 opacity-50">({t.opcional ?? 'Opcional'})</span>
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              autoComplete="bday"
              max={new Date().toISOString().split('T')[0]}
              className={inputCls}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 rounded-xl px-4 py-2.5">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || saved}
            className={`w-full py-3 rounded-xl text-sm font-medium transition-all disabled:cursor-not-allowed ${
              saved
                ? 'bg-emerald-600/20 text-emerald-400'
                : 'bg-bar hover:bg-[#a0834d] text-white disabled:opacity-60'
            }`}
          >
            {saved
              ? `✓ ${t.cambioGuardado ?? 'Cambios guardados'}`
              : loading ? '...' : (t.guardar ?? 'Guardar')
            }
          </button>
        </form>
      </div>
    </div>
  )
}
