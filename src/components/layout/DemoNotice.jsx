import { Database, FlaskConical, TriangleAlert } from 'lucide-react'
import useDataset from '../../data/useDataset'

/**
 * Aviso permanente de que el panel es una versión de prueba.
 *
 * El texto cambia con el origen de los datos: si están llegando de Supabase no
 * puede seguir diciendo que son inventados, porque sería mentira.
 *
 * Va fijo y no se puede cerrar, a propósito. Se coloca donde no tape datos
 * —barra inferior en móvil y hueco libre de la barra lateral a partir de `lg`—
 * y queda por debajo de los formularios modales (z-40 frente a z-50).
 */
export default function DemoNotice() {
  const { source, error, incomplete } = useDataset()

  const variant = error
    ? {
        icon: TriangleAlert,
        title: 'Datele nu s-au încărcat',
        body: 'Baza de date nu a răspuns, așa că se afișează cifre inventate. Reîncarcă pagina pentru a încerca din nou.',
      }
    : source === 'supabase'
      ? {
          icon: Database,
          title: 'Versiune de test',
          body: 'Cifrele vin din baza de date. Panoul este încă în probe și nu este public.',
        }
      : {
          icon: FlaskConical,
          title: 'Versiune de test',
          body: 'Toate cifrele din acest panou sunt inventate și servesc doar pentru a demonstra funcționarea. Nu reprezintă date reale.',
        }

  const Icon = variant.icon

  return (
    <aside
      role="note"
      aria-label="Aviz: versiune de test"
      className="fixed inset-x-0 bottom-0 z-40 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:max-w-sm lg:bottom-4 lg:left-4 lg:right-auto lg:w-52"
    >
      <div className="flex items-start gap-3 border-t border-ink-600 bg-ink-700 px-4 py-3 text-white shadow-[0_-4px_20px_-8px_rgba(28,35,43,0.45)] sm:rounded-2xl sm:border sm:shadow-[0_16px_40px_-16px_rgba(28,35,43,0.55)] lg:flex-col lg:gap-2 lg:shadow-none">
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-ink-600 text-neon-400 lg:mt-0">
          <Icon size={15} strokeWidth={2.4} />
        </span>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-neon-400">{variant.title}</p>
          <p className="mt-0.5 text-sm leading-relaxed text-ink-100 lg:text-xs">{variant.body}</p>

          {/* Un mes con datos de una sola red no se muestra: mezclarlo con los
              completos daría saltos falsos en los gráficos. */}
          {!error && incomplete.length ? (
            <p className="mt-1.5 text-xs leading-relaxed text-ink-300">
              {incomplete.length === 1
                ? '1 lună are date doar pentru o rețea și nu se afișează.'
                : `${incomplete.length} luni au date doar pentru o rețea și nu se afișează.`}
            </p>
          ) : null}

          <p className="mt-1.5 text-xs font-medium text-ink-300">Realizat de George Adelin</p>
        </div>
      </div>
    </aside>
  )
}
