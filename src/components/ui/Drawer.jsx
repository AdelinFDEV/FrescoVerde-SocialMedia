import { useCallback, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Panel lateral modal, común a los formularios.
 *
 * Se encarga de lo que un diálogo debe hacer y es fácil olvidar: cerrar con
 * Escape, llevar el foco dentro al abrirse, no dejar que el tabulador se escape
 * al fondo, devolver el foco a quien lo abrió y bloquear el scroll de la página.
 */
export default function Drawer({
  open,
  onClose,
  title,
  subtitle,
  toolbar,
  footer,
  side = 'right',
  width = 'max-w-xl',
  children,
}) {
  const fromLeft = side === 'left'
  const panelRef = useRef(null)
  const openerRef = useRef(null)

  // Escape cierra; el tabulador circula solo por dentro del panel.
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const items = [...(panelRef.current?.querySelectorAll(FOCUSABLE) ?? [])]
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) return

    openerRef.current = document.activeElement
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    // El primer control del panel, no el botón de cerrar: se entra al contenido.
    const items = panelRef.current?.querySelectorAll(FOCUSABLE)
    const target = items?.[1] ?? items?.[0]
    target?.focus({ preventScroll: true })

    return () => {
      document.body.style.overflow = overflow
      // Devolver el foco a quien abrió el panel, si sigue en la página.
      const opener = openerRef.current
      if (opener instanceof HTMLElement && document.contains(opener)) {
        opener.focus({ preventScroll: true })
      }
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex ${fromLeft ? 'justify-start' : 'justify-end'}`}
      onKeyDown={onKeyDown}
    >
      <button className="absolute inset-0 bg-ink-900/40" onClick={onClose} aria-label="Închide formularul" />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex h-full w-full ${width} flex-col bg-white shadow-2xl`}
        style={{ animation: `${fromLeft ? 'drawerInLeft' : 'drawerIn'} 0.3s cubic-bezier(0.22,1,0.36,1)` }}
      >
        <style>{`
          @keyframes drawerIn { from { transform: translateX(24px); opacity: 0 } }
          @keyframes drawerInLeft { from { transform: translateX(-24px); opacity: 0 } }
        `}</style>

        <header className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-ink-900">{title}</h2>
            {subtitle ? <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p> : null}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-800"
            aria-label="Închide"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </header>

        {toolbar}

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        <footer className="border-t border-ink-100 px-6 py-4">{footer}</footer>
      </aside>
    </div>
  )
}
