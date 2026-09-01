import { FlaskConical } from 'lucide-react'

/**
 * Aviso permanente de que el panel es una demostración con datos inventados.
 *
 * Va fijo y no se puede cerrar, a propósito: tiene que verse en cualquier
 * sección. Se coloca donde no tape datos — barra inferior en móvil, y a partir
 * de `lg` dentro del hueco libre de la barra lateral. Queda por debajo de los
 * formularios modales (z-40 frente a z-50) para no bloquearlos.
 */
export default function DemoNotice() {
  return (
    <aside
      role="note"
      aria-label="Aviz: versiune de test"
      className="fixed inset-x-0 bottom-0 z-40 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:max-w-sm lg:bottom-4 lg:left-4 lg:right-auto lg:w-52"
    >
      <div className="flex items-start gap-3 border-t border-ink-600 bg-ink-700 px-4 py-3 text-white shadow-[0_-4px_20px_-8px_rgba(28,35,43,0.45)] sm:rounded-2xl sm:border sm:shadow-[0_16px_40px_-16px_rgba(28,35,43,0.55)] lg:flex-col lg:gap-2 lg:shadow-none">
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-ink-600 text-neon-400 lg:mt-0">
          <FlaskConical size={15} strokeWidth={2.4} />
        </span>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-neon-400">Versiune de test</p>
          <p className="mt-0.5 text-sm leading-relaxed text-ink-100 lg:text-xs">
            Toate cifrele din acest panou sunt inventate și servesc doar pentru a demonstra
            funcționarea. Nu reprezintă date reale.
          </p>
          <p className="mt-1.5 text-xs font-medium text-ink-300">Realizat de George Adelin</p>
        </div>
      </div>
    </aside>
  )
}
