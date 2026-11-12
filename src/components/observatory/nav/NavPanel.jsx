import { useApp } from '../../../contexts/AppContext'
import { fill } from '../../../lib/thermometer'
import { PanelSwitch } from './PanelSwitch'

/**
 * A tab's panel: its name and switch, then its content. With the switch off the content is still shown,
 * dimmed and out of reach (`inert`), under one transparent button that turns the switch on: a tap there
 * only switches the layer on, the control under it does not act (unticking a class to hide it must not
 * end up showing the forest). The exception is an element marked `data-wake-focus` (the species field):
 * a tap on it switches the layer on and leaves the focus in it.
 * `flat`: no surface of its own, for when it sits inside the phone's sheet.
 */
export function NavPanel({ id, title, on, onSwitch, children, flat = false, className = '' }) {
  const { t, lang } = useApp()

  function wake(e) {
    // The content is inert under the button, so the element is found by where the tap fell
    const inside = (el) => {
      const r = el.getBoundingClientRect()
      return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
    }
    const focusEl = [...(e.currentTarget.parentElement?.querySelectorAll('[data-wake-focus]') ?? [])].find(inside)
    onSwitch(true)
    if (focusEl) requestAnimationFrame(() => requestAnimationFrame(() => focusEl.focus()))
  }

  return (
    <section id={id} aria-label={title} className={`${flat ? '' : 'rounded-[22px] map-surface shadow-float'} p-4 flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[17px] font-semibold text-cream">{title}</h2>
        <PanelSwitch checked={on} onChange={onSwitch} label={fill(t.obsSwitchShow, { capa: title }, lang)} />
      </div>
      <div className="relative min-h-0">
        <div {...(on ? {} : { inert: '', 'aria-hidden': true })} className={`transition-opacity ${on ? '' : 'opacity-40'}`}>
          {children}
        </div>
        {!on && (
          <button
            type="button"
            onClick={wake}
            aria-label={fill(t.obsWake, { capa: title }, lang)}
            className="absolute inset-0 w-full rounded-xl cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-cream/50"
          />
        )}
      </div>
    </section>
  )
}
