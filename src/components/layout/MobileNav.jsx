import { VIEWS } from '../../data/navigation'
import Drawer from '../ui/Drawer'
import Logo from './Logo'

/**
 * Navegación en móvil.
 *
 * Ocho secciones no caben en una fila de pestañas sin convertirse en un carrusel
 * que hay que arrastrar a ciegas, así que en pantallas pequeñas se listan en un
 * panel que se abre desde la izquierda. Reutiliza `Drawer`, que ya se encarga de
 * cerrar con Escape, atrapar el foco y bloquear el scroll del fondo.
 */
export default function MobileNav({ open, onClose, view, onChange }) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="left"
      width="max-w-[17rem]"
      title="Secțiuni"
      subtitle="FrescoVerde · Panou rețele sociale"
    >
      <nav className="-mx-2 flex flex-col gap-1">
        {VIEWS.map(({ id, label, icon: Icon, subtitle }) => {
          const active = id === view
          return (
            <button
              key={id}
              onClick={() => {
                onChange(id)
                onClose()
              }}
              aria-current={active ? 'page' : undefined}
              className={`flex items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                active ? 'bg-ink-600 text-white' : 'text-ink-700 hover:bg-ink-50'
              }`}
            >
              <Icon
                size={18}
                strokeWidth={2.2}
                className={`mt-0.5 shrink-0 ${active ? 'text-neon-400' : 'text-ink-400'}`}
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{label}</span>
                <span className={`block text-xs ${active ? 'text-ink-200' : 'text-ink-400'}`}>
                  {subtitle}
                </span>
              </span>
            </button>
          )
        })}
      </nav>

      <div className="mt-6 flex items-center gap-2.5 border-t border-ink-100 pt-4">
        <Logo size={24} />
        <p className="text-xs leading-relaxed text-ink-400">
          Versiune de test · date demonstrative până la primele luni înregistrate
        </p>
      </div>
    </Drawer>
  )
}
