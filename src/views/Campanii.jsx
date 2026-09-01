import { useMemo, useState } from 'react'
import { Megaphone, MousePointerClick, Pencil, Plus, Target, Wallet } from 'lucide-react'
import Card from '../components/ui/Card'
import ChipGroup from '../components/ui/ChipGroup'
import DataTable from '../components/ui/DataTable'
import SegmentedControl from '../components/ui/SegmentedControl'
import DownloadCsvButton from '../components/ui/DownloadCsvButton'
import StatTile from '../components/ui/StatTile'
import ChartFrame from '../components/charts/ChartFrame'
import RankBars from '../components/charts/RankBars'
import SeriesBars from '../components/charts/SeriesBars'
import CampaignDrawer from '../components/entry/CampaignDrawer'
import { NETWORK_BY_ID } from '../data/networks'
import { OBJECTIVES, STATUSES, STATUS_BY_ID } from '../data/campaigns'
import { MONTH_LABELS } from '../data/socialData'
import {
  campaignRows,
  campaignTotals,
  fmtCompact,
  fmtEur,
  fmtEur2,
  fmtInt,
  fmtPct,
  groupCampaigns,
} from '../data/selectors'

const OBJECTIVE_OPTIONS = [
  { value: null, label: 'Toate obiectivele' },
  ...OBJECTIVES.map((o) => ({ value: o.id, label: o.label })),
]

const STATUS_OPTIONS = [
  { value: null, label: 'Toate stările' },
  ...STATUSES.map((s) => ({ value: s.id, label: s.label })),
]

const SORTS = [
  { value: 'spend', label: 'Investiție' },
  { value: 'followersGained', label: 'Urmăritori' },
  { value: 'costPerFollower', label: 'Cost pe urmăritor' },
]

function StatusPill({ status }) {
  const s = STATUS_BY_ID[status]
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${s.className}`}>
      {s.label}
    </span>
  )
}

export default function Campanii({ year, networks, activeIds }) {
  const [objective, setObjective] = useState(null)
  const [month, setMonth] = useState(null)
  const [status, setStatus] = useState(null)
  const [sort, setSort] = useState('spend')
  const [editing, setEditing] = useState(null) // objeto campaña, o 'new', o null

  const all = useMemo(() => campaignRows({ year, activeIds }), [year, activeIds])
  const monthsWithData = useMemo(() => [...new Set(all.map((c) => c.month))].sort((a, b) => a - b), [all])

  const filtered = all.filter(
    (c) =>
      (objective == null || c.objectiveId === objective) &&
      (month == null || c.month === month) &&
      (status == null || c.status === status),
  )
  const totals = campaignTotals(filtered)

  // Menor coste por seguidor = mejor; solo entre campañas que captaron alguno.
  const ranked = [...filtered]
    .filter((c) => c.followersGained > 0)
    .sort((a, b) => a.costPerFollower - b.costPerFollower)
  const bestCampaign = ranked[0]
  const worstCampaign = ranked[ranked.length - 1]

  const byObjective = groupCampaigns(filtered, (c) => c.objectiveId, (c) => c.objective)

  const byMonth = monthsWithData.map((m) => {
    const row = { key: `m-${m}`, label: MONTH_LABELS[m] }
    activeIds.forEach((id) => {
      row[`${id}_spend`] = filtered
        .filter((c) => c.month === m && c.networkId === id)
        .reduce((s, c) => s + c.spend, 0)
    })
    row.count = filtered.filter((c) => c.month === m).length
    return row
  })

  const sorted = [...filtered].sort((a, b) =>
    sort === 'costPerFollower' ? a.costPerFollower - b.costPerFollower : b[sort] - a[sort],
  )

  const campaignColumns = [
    {
      key: 'name',
      label: 'Campanie',
      render: (r) => (
        <span className="flex flex-col">
          <span>{r.name}</span>
          <span className="tnum text-xs font-normal text-ink-400">{r.id}</span>
        </span>
      ),
      csv: (r) => `${r.name} (${r.id})`,
    },
    {
      key: 'networkId',
      label: 'Rețea',
      render: (r) => (
        <span className="inline-flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-full"
            style={{ background: NETWORK_BY_ID[r.networkId].hex }}
            aria-hidden="true"
          />
          {NETWORK_BY_ID[r.networkId].name}
        </span>
      ),
      csv: (r) => NETWORK_BY_ID[r.networkId].name,
    },
    { key: 'objective', label: 'Obiectiv' },
    { key: 'monthLabel', label: 'Luna' },
    { key: 'spend', label: 'Investiție', csvLabel: 'Investiție (€)', render: (r) => fmtEur(r.spend) },
    { key: 'impressions', label: 'Afișări', render: (r) => fmtInt(r.impressions) },
    { key: 'clicks', label: 'Clicuri', render: (r) => fmtInt(r.clicks) },
    { key: 'ctr', label: 'CTR', csvLabel: 'CTR (0-1)', render: (r) => fmtPct(r.ctr, 2) },
    { key: 'cpc', label: 'CPC', csvLabel: 'CPC (€)', render: (r) => fmtEur2(r.cpc) },
    { key: 'followersGained', label: 'Urmăritori', render: (r) => fmtInt(r.followersGained) },
    {
      key: 'costPerFollower',
      label: 'Cost pe urmăritor',
      csvLabel: 'Cost pe urmăritor (€)',
      render: (r) => fmtEur2(r.costPerFollower),
    },
    {
      key: 'status',
      label: 'Stare',
      render: (r) => <StatusPill status={r.status} />,
      csv: (r) => STATUS_BY_ID[r.status].label,
    },
    {
      key: 'edit',
      label: 'Editează',
      csv: false,
      render: (r) => (
        <button
          onClick={() => setEditing(r)}
          title={`Editează ${r.name}`}
          aria-label={`Editează campania ${r.name}`}
          className="rounded-lg border border-ink-100 p-1.5 text-ink-400 transition-colors hover:border-ink-200 hover:text-ink-800"
        >
          <Pencil size={14} strokeWidth={2.2} />
        </button>
      ),
    },
  ]

  const filters = (
    <Card className="space-y-3 px-5 py-4">
      {[
        { label: 'Obiectiv', node: <ChipGroup label="Obiectiv" options={OBJECTIVE_OPTIONS} value={objective} onChange={setObjective} /> },
        {
          label: 'Luna',
          node: (
            <ChipGroup
              label="Luna"
              value={month}
              onChange={setMonth}
              options={[
                { value: null, label: `Tot anul ${year}` },
                ...monthsWithData.map((m) => ({ value: m, label: MONTH_LABELS[m] })),
              ]}
            />
          ),
        },
        { label: 'Stare', node: <ChipGroup label="Stare" options={STATUS_OPTIONS} value={status} onChange={setStatus} /> },
      ].map((f) => (
        <div key={f.label} className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="w-16 shrink-0 text-xs font-medium uppercase tracking-wide text-ink-400">
            {f.label}
          </span>
          {f.node}
        </div>
      ))}
    </Card>
  )

  const newButton = (
    <button
      onClick={() => setEditing('new')}
      className="flex shrink-0 items-center gap-1.5 rounded-xl bg-ink-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink-700"
    >
      <Plus size={16} strokeWidth={2.6} className="text-neon-400" />
      Campanie nouă
    </button>
  )

  const drawer = (
    // La key remonta el formulario al cambiar de campaña: el estado inicial se
    // calcula al montar, sin sincronizarlo después con un efecto.
    <CampaignDrawer
      key={editing === 'new' ? 'new' : (editing?.id ?? 'closed')}
      open={editing != null}
      campaign={editing === 'new' ? null : editing}
      onClose={() => setEditing(null)}
      defaultYear={year}
    />
  )

  if (!totals) {
    return (
      <div className="space-y-5">
        <div className="flex justify-end">{newButton}</div>
        {filters}
        <Card className="p-8 text-center">
          <p className="text-sm text-ink-500">Nicio campanie pentru filtrele selectate.</p>
        </Card>
        {drawer}
      </div>
    )
  }

  const tiles = [
    {
      label: 'Investiție în campanii',
      value: totals.spend,
      format: (v) => fmtEur(v),
      footnote: `${totals.count} campanii`,
      icon: Wallet,
      accent: 'var(--color-s2)',
    },
    {
      label: 'Urmăritori din campanii',
      value: totals.followersGained,
      format: (v) => fmtInt(v),
      footnote: `din ${fmtCompact(totals.clicks)} clicuri`,
      icon: Megaphone,
      accent: 'var(--color-s1)',
    },
    {
      label: 'Cost pe urmăritor',
      value: totals.costPerFollower,
      format: (v) => fmtEur2(v),
      footnote: 'investiție ÷ urmăritori câștigați',
      icon: Target,
      accent: 'var(--color-s3)',
    },
    {
      label: 'CTR mediu',
      value: totals.ctr,
      format: (v) => fmtPct(v, 2),
      footnote: `CPC ${fmtEur2(totals.cpc)} · CPM ${fmtEur2(totals.cpm)}`,
      icon: MousePointerClick,
      accent: 'var(--color-s4)',
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex justify-end">{newButton}</div>

      {filters}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t, i) => (
          <StatTile key={t.label} {...t} delay={i * 60} />
        ))}
      </div>

      {bestCampaign && worstCampaign && bestCampaign !== worstCampaign ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            { c: bestCampaign, title: 'Cea mai eficientă campanie', tone: 'border-l-4 border-l-[#12a147]' },
            { c: worstCampaign, title: 'Cea mai scumpă campanie', tone: 'border-l-4 border-l-[#7a52c4]' },
          ].map(({ c, title, tone }, i) => (
            <Card key={title} className={`p-5 ${tone}`} delay={240 + i * 60}>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{title}</p>
              <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-base font-semibold text-ink-900">
                  {c.name}
                  <span className="tnum ml-2 text-sm font-normal text-ink-400">{c.id}</span>
                </h3>
                <span className="tnum text-lg font-semibold text-ink-900">
                  {fmtEur2(c.costPerFollower)}
                  <span className="ml-1 text-sm font-medium text-ink-500">pe urmăritor</span>
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-500">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: NETWORK_BY_ID[c.networkId].hex }}
                    aria-hidden="true"
                  />
                  {NETWORK_BY_ID[c.networkId].name}
                </span>
                {' · '}
                {c.objective} · {c.monthLabel} · {fmtEur(c.spend)} · {fmtInt(c.followersGained)} urmăritori
              </p>
            </Card>
          ))}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartFrame
          title="Investiție pe obiectiv"
          subtitle="Cât s-a cheltuit pe fiecare tip de campanie și ce a costat un urmăritor"
          delay={300}
          height={300}
        >
          <RankBars
            items={byObjective.map((o) => ({
              id: o.key,
              label: o.label,
              color: '#12a147',
              value: o.spend,
              share: totals.spend ? o.spend / totals.spend : null,
              note: `${fmtEur2(o.costPerFollower)} pe urmăritor · ${fmtInt(o.followersGained)} urmăritori · CTR ${fmtPct(o.ctr, 2)}`,
            }))}
            format={(v) => fmtEur(v)}
          />
        </ChartFrame>

        <ChartFrame
          title="Investiție lunară în campanii"
          subtitle="Bugetul campaniilor filtrate, repartizat pe rețea"
          series={networks.map((n) => ({ label: n.name, color: n.hex }))}
          delay={360}
          height={300}
          table={{
            columns: [
              { key: 'label', label: 'Luna' },
              ...networks.map((n) => ({
                key: `${n.id}_spend`,
                label: n.name,
                color: n.hex,
                render: (r) => fmtEur(r[`${n.id}_spend`]),
              })),
              { key: 'count', label: 'Campanii', render: (r) => fmtInt(r.count) },
            ],
            rows: byMonth,
          }}
        >
          <SeriesBars
            data={byMonth}
            series={networks.map((n) => ({ key: `${n.id}_spend`, label: n.name, color: n.hex }))}
            format={(v) => fmtEur(v)}
            tickFormat={(v) => fmtEur(v)}
          />
        </ChartFrame>
      </div>

      <Card className="p-5 sm:p-6" delay={420}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-ink-900">
              Toate campaniile ({sorted.length})
            </h2>
            <p className="mt-0.5 text-sm text-ink-500">
              Fiecare rând este o campanie reală; totalurile de mai sus sunt suma acestor rânduri.
              Apasă pe creion ca să editezi rezultatele sau starea.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <SegmentedControl size="sm" label="Ordonare" options={SORTS} value={sort} onChange={setSort} />
            <DownloadCsvButton columns={campaignColumns} rows={sorted} name="campanii" year={year} />
          </div>
        </div>

        <div className="mt-4">
          <DataTable columns={campaignColumns} rows={sorted} />
        </div>
      </Card>

      {drawer}
    </div>
  )
}
