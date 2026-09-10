import { Database, FlaskConical, TriangleAlert } from 'lucide-react'
import useDataset from '../../data/useDataset'

/**
 * Aviso permanente de que el panel es una versión de prueba.
 *
 * Ya no hay datos inventados, así que el texto no puede decir que los haya: se
 * limita a avisar de que el panel está en pruebas y a señalar lo que no cuadra
 * en los datos reales.
 *
 * Va fijo y no se puede cerrar, a propósito. Se coloca donde no tape datos
 * —barra inferior en móvil y hueco libre de la barra lateral a partir de `lg`—
 * y queda por debajo de los formularios modales (z-40 frente a z-50).
 */
export default function DemoNotice() {
  const { error, incomplete, inconsistent, months } = useDataset()

  const variant = error
    ? {
        icon: TriangleAlert,
        title: 'Datele nu s-au încărcat',
        body: 'Baza de date nu a răspuns. Reîncarcă pagina pentru a încerca din nou.',
        short: 'Baza de date nu a răspuns.',
      }
    : months.length
      ? {
          icon: Database,
          title: 'Versiune de test',
          body: 'Cifrele vin din baza de date. Panoul este pentru uz intern și nu este public.',
          short: 'Cifre reale. Panou intern, în probe.',
        }
      : {
          icon: FlaskConical,
          title: 'Versiune de test',
          body: 'Panoul este pentru uz intern și nu este public. Încă nu există luni înregistrate.',
          short: 'Panou intern, în probe. Fără date încă.',
        }

  const Icon = variant.icon

  return (
    <aside
      role="note"
      aria-label="Aviz: versiune de test"
      className="fixed inset-x-0 bottom-0 z-40 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:max-w-sm lg:bottom-4 lg:left-4 lg:right-auto lg:w-52"
    >
      <div className="flex items-start gap-2.5 border-t border-ink-600 bg-ink-700 px-3.5 py-2.5 text-white shadow-[0_-4px_20px_-8px_rgba(28,35,43,0.45)] sm:gap-3 sm:rounded-2xl sm:border sm:px-4 sm:py-3 sm:shadow-[0_16px_40px_-16px_rgba(28,35,43,0.55)] lg:flex-col lg:gap-2 lg:shadow-none">
        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg bg-ink-600 text-neon-400 sm:size-7 lg:mt-0">
          <Icon size={14} strokeWidth={2.4} />
        </span>

        <div className="min-w-0">
          <p className="text-xs font-semibold text-neon-400 sm:text-sm">{variant.title}</p>
          {/* En el móvil el aviso es una barra fija: si ocupa cuatro líneas se
              come la pantalla, así que ahí va el texto corto. */}
          <p className="mt-0.5 text-xs leading-relaxed text-ink-100 sm:text-sm lg:text-xs">
            <span className="sm:hidden">{variant.short}</span>
            <span className="hidden sm:inline">{variant.body}</span>
          </p>

          {/* Un mes con datos de una sola red no se muestra: mezclarlo con los
              completos daría saltos falsos en los gráficos. */}
          {!error && incomplete.length ? (
            <p className="mt-1.5 text-xs leading-relaxed text-ink-300">
              {incomplete.length === 1
                ? '1 lună are date doar pentru o rețea și nu se afișează.'
                : `${incomplete.length} luni au date doar pentru o rețea și nu se afișează.`}
            </p>
          ) : null}

          {/* Si la comunidad no encaja de un mes al siguiente, los porcentajes
              de crecimiento saldrían mal en silencio. Mejor decirlo. */}
          {!error && inconsistent.length ? (
            <p className="mt-1.5 text-xs leading-relaxed text-[#ffd9a0]">
              {inconsistent.length === 1
                ? `Cifrele din ${inconsistent[0].longLabel} (${inconsistent[0].network}) nu se leagă de luna precedentă.`
                : `${inconsistent.length} luni nu se leagă de luna precedentă. Verifică urmăritorii totali.`}
            </p>
          ) : null}

          <p className="mt-1 text-[11px] font-medium text-ink-300 sm:mt-1.5 sm:text-xs">
            Realizat de George Adelin
          </p>
        </div>
      </div>
    </aside>
  )
}
