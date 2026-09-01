import { useMemo, useState } from 'react'
import { Database, Info } from 'lucide-react'
import { NETWORKS, NETWORK_BY_ID } from '../../data/networks'
import { DERIVED_NOTE, ENTRY_FIELDS, METRICS } from '../../data/metrics'
import { MONTH_LABELS_LONG, YEARS } from '../../data/socialData'
import Drawer from '../ui/Drawer'
import SegmentedControl from '../ui/SegmentedControl'

/**
 * Formulario de introducción manual de las estadísticas de un mes.
 *
 * Todavía no guarda nada: la validación y el resumen funcionan, pero el envío
 * queda desactivado hasta que se conecte Supabase. El objetivo es que el
 * formulario ya tenga exactamente los campos que la tabla necesitará.
 */
export default function DataEntryDrawer({ open, onClose, defaultYear }) {
  const [network, setNetwork] = useState('instagram')
  const [year, setYear] = useState(defaultYear)
  const [month, setMonth] = useState(new Date().getMonth())
  const [values, setValues] = useState({})

  const fields = ENTRY_FIELDS[network]
  const keyOf = (id) => `${network}-${year}-${month}-${id}`

  const get = (id) => values[keyOf(id)] ?? ''
  const set = (id, v) => setValues((prev) => ({ ...prev, [keyOf(id)]: v }))

  const num = (id) => {
    const raw = String(get(id)).replace(',', '.').trim()
    if (raw === '') return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
  }

  // Avisos de coherencia: los mismos que aplica el panel al calcular.
  const warnings = useMemo(() => {
    const w = []
    const views = num('views')

    fields
      .filter((f) => f.type === 'pct')
      .forEach((f) => {
        const v = num(f.id)
        if (v != null && (v < 0 || v > 100))
          w.push(`«${METRICS[f.id].label}» trebuie să fie între 0 și 100 %.`)
      })
    if (views != null && views < 0) w.push('Vizualizările nu pot fi negative.')

    if (network === 'instagram') {
      const a = num('viewsFollowers')
      const b = num('viewsNonFollowers')
      if (a != null && b != null && Math.abs(a + b - 100) > 1)
        w.push('Urmăritori + non-urmăritori ar trebui să dea 100 %.')
      const p = num('viewsPosts')
      const r = num('viewsReels')
      const s = num('viewsStories')
      if ([p, r, s].every((x) => x != null) && Math.abs(p + r + s - 100) > 1)
        w.push('Postări + Reels + Stories ar trebui să dea 100 %.')
    } else {
      const fy = num('viewsForYou')
      const se = num('viewsSearch')
      if (fy != null && se != null && fy + se > 100)
        w.push('„Pentru tine" + căutare nu pot depăși 100 %.')
    }
    return w
  }, [values, network, year, month]) // eslint-disable-line react-hooks/exhaustive-deps

  const filled = fields.filter((f) => num(f.id) != null).length

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Adaugă date lunare"
      subtitle="Copiază cifrele din statisticile aplicației pentru luna aleasă."
      toolbar={
        <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 bg-ink-50/60 px-6 py-3">
          <SegmentedControl
            size="sm"
            label="Rețea"
            options={NETWORKS.map((n) => ({ value: n.id, label: n.name }))}
            value={network}
            onChange={setNetwork}
          />
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            aria-label="Luna"
            className="rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-sm font-medium text-ink-800"
          >
            {MONTH_LABELS_LONG.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            aria-label="An"
            className="rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-sm font-medium text-ink-800"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <span className="ml-auto text-xs font-medium text-ink-400">
            {filled} din {fields.length} câmpuri
          </span>
        </div>
      }
      footer={
        <>
          <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-dashed border-ink-200 px-3.5 py-3">
            <Database size={16} strokeWidth={2.2} className="mt-0.5 shrink-0 text-ink-400" />
            <p className="text-sm leading-relaxed text-ink-500">
              Salvarea este dezactivată până la conectarea bazei de date Supabase. Până atunci panoul
              folosește datele demonstrative.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-50"
            >
              Anulează
            </button>
            <button
              disabled
              title="Se activează după conectarea Supabase"
              className="cursor-not-allowed rounded-xl bg-ink-200 px-4 py-2 text-sm font-semibold text-ink-500"
            >
              Salvează luna
            </button>
          </div>
        </>
      }
    >
      <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-ink-100 bg-ink-50 px-3.5 py-3">
        <Info size={16} strokeWidth={2.2} className="mt-0.5 shrink-0 text-ink-500" />
        <p className="text-sm leading-relaxed text-ink-600">
          Panoul calculează singur{' '}
          <strong className="font-semibold text-ink-800">
            {DERIVED_NOTE[network].map((id) => METRICS[id].label.toLowerCase()).join(', ')}
          </strong>
          , așa că nu apar mai jos. Procentele se transformă automat în număr de vizualizări.
        </p>
      </div>

      <div className="space-y-3">
        {fields.map((f) => {
          const metric = METRICS[f.id]
          const source = metric.sourceLabel?.[network]
          return (
            <label key={f.id} className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-ink-800">{metric.label}</span>
                {source && source !== metric.label ? (
                  <span className="block text-xs text-ink-400">
                    în {NETWORK_BY_ID[network].name}: {source}
                  </span>
                ) : null}
              </span>
              <span className="relative shrink-0">
                <input
                  type="text"
                  inputMode="decimal"
                  value={get(f.id)}
                  onChange={(e) => set(f.id, e.target.value)}
                  placeholder={f.type === 'pct' ? '0,0' : '0'}
                  className="tnum w-36 rounded-lg border border-ink-200 bg-white py-1.5 pl-3 pr-8 text-right text-sm text-ink-900 outline-none transition-colors focus:border-ink-600"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">
                  {f.type === 'pct' ? '%' : ''}
                </span>
              </span>
            </label>
          )
        })}
      </div>

      {warnings.length ? (
        <ul className="mt-5 space-y-1.5 rounded-xl border border-[#e2d5f5] bg-[#f7f3fd] px-4 py-3">
          {warnings.map((w) => (
            <li key={w} className="text-sm text-[#5b3a9e]">
              {w}
            </li>
          ))}
        </ul>
      ) : null}
    </Drawer>
  )
}
