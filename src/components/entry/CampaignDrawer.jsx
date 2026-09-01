import { useMemo, useState } from 'react'
import { Database } from 'lucide-react'
import { NETWORKS, NETWORK_BY_ID } from '../../data/networks'
import { OBJECTIVES, RESULT_FIELDS, STATUSES, STATUS_BY_ID } from '../../data/campaigns'
import { MONTH_LABELS_LONG, YEARS } from '../../data/socialData'
import { fmtDec2, fmtEur2, fmtPct } from '../../data/selectors'
import Drawer from '../ui/Drawer'
import SegmentedControl from '../ui/SegmentedControl'

const EMPTY = {
  name: '',
  networkId: 'instagram',
  objectiveId: 'urmaritori',
  month: 0,
  startDay: 1,
  days: 14,
  status: 'planificata',
  spend: '',
  impressions: '',
  reach: '',
  clicks: '',
  followersGained: '',
}

const RESULT_IDS = RESULT_FIELDS.map((f) => f.id)

/** El estado inicial se calcula al montar; el padre remonta con `key`. */
const initialForm = (campaign, defaultYear) =>
  campaign
    ? {
        ...EMPTY,
        ...campaign,
        year: campaign.year,
        ...Object.fromEntries(RESULT_IDS.map((id) => [id, String(campaign[id] ?? '')])),
      }
    : { ...EMPTY, year: defaultYear }

const Field = ({ label, hint, children }) => (
  <label className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-medium text-ink-800">{label}</span>
      {hint ? <span className="block text-xs text-ink-400">{hint}</span> : null}
    </span>
    <span className="shrink-0">{children}</span>
  </label>
)

const inputClass =
  'w-44 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-900 outline-none transition-colors focus:border-ink-600'

/**
 * Alta y edición de una campaña: ficha, resultados y estado.
 *
 * Todavía no guarda nada — el envío queda desactivado hasta que se conecte
 * Supabase — pero la validación y los indicadores derivados ya funcionan, así
 * que se ve al momento qué CTR o qué coste por seguidor sale de las cifras.
 */
export default function CampaignDrawer({ open, onClose, campaign, defaultYear }) {
  const isEdit = !!campaign
  const [form, setForm] = useState(() => initialForm(campaign, defaultYear))

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const num = (k) => {
    const raw = String(form[k] ?? '').replace(',', '.').trim()
    if (raw === '') return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
  }

  // Los mismos ratios que usa el panel, calculados en vivo sobre lo tecleado.
  const derived = useMemo(() => {
    const spend = num('spend')
    const impressions = num('impressions')
    const r = (a, b) => (a != null && b != null && b > 0 ? a / b : null)
    return {
      ctr: r(num('clicks'), impressions),
      cpc: r(spend, num('clicks')),
      cpm: spend != null && impressions > 0 ? (spend * 1000) / impressions : null,
      costPerFollower: r(spend, num('followersGained')),
      frequency: r(impressions, num('reach')),
    }
  }, [form]) // eslint-disable-line react-hooks/exhaustive-deps

  const warnings = useMemo(() => {
    const w = []
    if (!form.name.trim()) w.push('Campania are nevoie de un nume.')
    RESULT_FIELDS.forEach((f) => {
      const v = num(f.id)
      if (v != null && v < 0) w.push(`«${f.label}» nu poate fi negativ.`)
    })
    const impressions = num('impressions')
    const reach = num('reach')
    const clicks = num('clicks')
    const followers = num('followersGained')
    if (reach != null && impressions != null && reach > impressions)
      w.push('Persoanele acoperite nu pot depăși afișările.')
    if (clicks != null && impressions != null && clicks > impressions)
      w.push('Clicurile nu pot depăși afișările.')
    if (followers != null && clicks != null && followers > clicks)
      w.push('Urmăritorii câștigați nu pot depăși clicurile.')
    if (form.startDay + form.days > 32) w.push('Perioada campaniei iese din lună.')
    if (form.status === 'planificata' && num('spend') > 0)
      w.push('O campanie planificată nu ar trebui să aibă deja investiție.')
    return w
  }, [form]) // eslint-disable-line react-hooks/exhaustive-deps

  const net = NETWORK_BY_ID[form.networkId]

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editează campania' : 'Campanie nouă'}
      subtitle={
        isEdit
          ? `${campaign.id} · ${NETWORK_BY_ID[campaign.networkId].name} · ${campaign.monthLabel}`
          : 'Definește campania și, pe măsură ce rulează, completează rezultatele.'
      }
      footer={
        <>
          <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-dashed border-ink-200 px-3.5 py-3">
            <Database size={16} strokeWidth={2.2} className="mt-0.5 shrink-0 text-ink-400" />
            <p className="text-sm leading-relaxed text-ink-500">
              Salvarea este dezactivată până la conectarea bazei de date Supabase. Investiția lunară a
              rețelei <strong className="font-semibold text-ink-700">{net.name}</strong> se va recalcula
              automat din campanii.
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
              {isEdit ? 'Salvează modificările' : 'Creează campania'}
            </button>
          </div>
        </>
      }
    >
      <div className="space-y-6">
        {/* ---- Ficha ------------------------------------------------------ */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400">Campania</h3>

          <Field label="Nume">
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Coșul de toamnă"
              className={inputClass}
            />
          </Field>

          <Field label="Rețea">
            <SegmentedControl
              size="sm"
              label="Rețea"
              options={NETWORKS.map((n) => ({ value: n.id, label: n.name }))}
              value={form.networkId}
              onChange={(v) => set('networkId', v)}
            />
          </Field>

          <Field label="Obiectiv">
            <select
              value={form.objectiveId}
              onChange={(e) => set('objectiveId', e.target.value)}
              className={inputClass}
            >
              {OBJECTIVES.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Luna">
            <span className="flex gap-2">
              <select
                value={form.month}
                onChange={(e) => set('month', Number(e.target.value))}
                aria-label="Luna"
                className="rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-sm text-ink-900"
              >
                {MONTH_LABELS_LONG.map((m, i) => (
                  <option key={m} value={i}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={form.year}
                onChange={(e) => set('year', Number(e.target.value))}
                aria-label="An"
                className="rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-sm text-ink-900"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </span>
          </Field>

          <Field label="Perioada" hint="Ziua de start și câte zile rulează">
            <span className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="31"
                value={form.startDay}
                onChange={(e) => set('startDay', Number(e.target.value))}
                aria-label="Ziua de start"
                className={`${inputClass} w-20 text-right`}
              />
              <span className="text-sm text-ink-400">+</span>
              <input
                type="number"
                min="1"
                max="31"
                value={form.days}
                onChange={(e) => set('days', Number(e.target.value))}
                aria-label="Zile"
                className={`${inputClass} w-20 text-right`}
              />
              <span className="text-sm text-ink-500">zile</span>
            </span>
          </Field>
        </section>

        {/* ---- Estado ----------------------------------------------------- */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400">Stare</h3>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => {
              const active = s.id === form.status
              return (
                <button
                  key={s.id}
                  onClick={() => set('status', s.id)}
                  aria-pressed={active}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'border-ink-600 bg-ink-600 text-white'
                      : 'border-ink-100 bg-white text-ink-500 hover:border-ink-200 hover:text-ink-800'
                  }`}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
          <p className="text-sm text-ink-500">{STATUS_BY_ID[form.status].help}</p>
        </section>

        {/* ---- Resultados -------------------------------------------------- */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Rezultate din administratorul de reclame
          </h3>
          {RESULT_FIELDS.map((f) => (
            <Field key={f.id} label={f.label}>
              <span className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={form[f.id]}
                  onChange={(e) => set(f.id, e.target.value)}
                  placeholder="0"
                  className={`tnum ${inputClass} pr-8 text-right`}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">
                  {f.unit === 'eur' ? '€' : ''}
                </span>
              </span>
            </Field>
          ))}

          <div className="rounded-xl border border-ink-100 bg-ink-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Calculat de panou</p>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3">
              {[
                ['CTR', fmtPct(derived.ctr, 2)],
                ['CPC', fmtEur2(derived.cpc)],
                ['CPM', fmtEur2(derived.cpm)],
                ['Cost pe urmăritor', fmtEur2(derived.costPerFollower)],
                ['Frecvență', derived.frequency == null ? '—' : `${fmtDec2(derived.frequency)}×`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-2">
                  <dt className="text-ink-500">{k}</dt>
                  <dd className="tnum font-semibold text-ink-900">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {warnings.length ? (
          <ul className="space-y-1.5 rounded-xl border border-[#e2d5f5] bg-[#f7f3fd] px-4 py-3">
            {warnings.map((w) => (
              <li key={w} className="text-sm text-[#5b3a9e]">
                {w}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Drawer>
  )
}
