import { Database, Plus, TriangleAlert } from 'lucide-react'
import { NETWORKS } from '../../data/networks'
import { isSupabaseConfigured } from '../../lib/supabase'
import Card from '../ui/Card'

/**
 * Lo que se ve cuando todavía no hay ninguna lună completa.
 *
 * No hay datos de relleno: si no hay cifras, no se enseñan cifras. En vez de
 * eso se dice qué falta exactamente y se ofrece el botón para meterlo.
 */
export default function EmptyState({ error, incomplete, onAddData }) {
  const variant = !isSupabaseConfigured
    ? {
        icon: TriangleAlert,
        title: 'Baza de date nu este configurată',
        body: 'Pagina nu vede baza de date. Reîncarcă pagina; dacă tot nu merge, verifică variabilele de mediu.',
      }
    : error
      ? {
          icon: TriangleAlert,
          title: 'Datele nu s-au încărcat',
          body: 'Baza de date nu a răspuns. Reîncarcă pagina pentru a încerca din nou.',
        }
      : {
          icon: Database,
          title: 'Încă nu există date',
          body: 'Adaugă cifrele unei luni și panoul prinde viață. Nu se afișează nimic inventat până atunci.',
        }

  const Icon = variant.icon

  return (
    <Card className="mx-auto max-w-xl p-6 text-center sm:p-10">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-ink-50 text-ink-600">
        <Icon size={22} strokeWidth={2.2} />
      </span>

      <h2 className="mt-4 text-lg font-semibold tracking-tight text-ink-900">{variant.title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">{variant.body}</p>

      {isSupabaseConfigured && !error ? (
        <>
          <ul className="mx-auto mt-5 max-w-sm space-y-2 text-left">
            {NETWORKS.map((n) => {
              const pending = incomplete.some((m) => m.missing.includes(n.name))
              return (
                <li
                  key={n.id}
                  className="flex items-center gap-2.5 rounded-xl border border-ink-100 px-3.5 py-2.5 text-sm"
                >
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: n.hex }} />
                  <span className="font-medium text-ink-800">{n.name}</span>
                  <span className="ml-auto text-xs text-ink-400">
                    {pending ? 'lipsesc datele' : 'de completat'}
                  </span>
                </li>
              )
            })}
          </ul>

          {/* La regla que más desconcierta al principio: un mes con datos de
              una sola red no aparece, porque rellenar la otra con ceros
              inventaría cifras. */}
          <p className="mx-auto mt-4 max-w-md text-xs leading-relaxed text-ink-400">
            {incomplete.length
              ? `${incomplete.length === 1 ? 'O lună are' : `${incomplete.length} luni au`} date doar pentru o rețea. O lună apare în panou doar când ambele rețele sunt completate.`
              : 'O lună apare în panou doar când ambele rețele sunt completate.'}
          </p>

          <button
            onClick={onAddData}
            className="mx-auto mt-5 flex items-center gap-1.5 rounded-xl bg-ink-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-700"
          >
            <Plus size={16} strokeWidth={2.6} className="text-neon-400" />
            Adaugă date
          </button>
        </>
      ) : null}
    </Card>
  )
}
