import { useState } from 'react'
import { ArrowUpRight, Percent, UserMinus, Users } from 'lucide-react'
import Card from '../components/ui/Card'
import ChipGroup from '../components/ui/ChipGroup'
import DataTable from '../components/ui/DataTable'
import DeltaBadge from '../components/ui/DeltaBadge'
import SegmentedControl from '../components/ui/SegmentedControl'
import StatTile from '../components/ui/StatTile'
import TableCard from '../components/ui/TableCard'
import ChartFrame from '../components/charts/ChartFrame'
import FlowBars from '../components/charts/FlowBars'
import MultiLine from '../components/charts/MultiLine'
import StackedBars from '../components/charts/StackedBars'
import TrendArea from '../components/charts/TrendArea'
import { FLOW_COLORS, NETWORK_BY_ID } from '../data/networks'
import { reportersOf } from '../data/metrics'
import {
  aggregate,
  delta,
  fmtCompact,
  fmtEur2,
  fmtInt,
  fmtPct,
  fmtSignedInt,
  monthlyRows,
  yearOverYear,
} from '../data/selectors'

const METRICS = [
  { value: 'followers', label: 'Comunitate' },
  { value: 'netGrowth', label: 'Creștere netă' },
  { value: 'profileVisits', label: 'Vizite pe profil' },
]

/** Desglose del mes elegido, red por red. */
function MonthDetail({ row, networks, previous, hasFlow }) {
  return (
    <Card className="p-5 sm:p-6" delay={40}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-ink-900">{row.fullLabel}</h2>
          <p className="mt-0.5 text-sm text-ink-500">Detaliul lunii selectate, pe rețea</p>
        </div>
        <DeltaBadge
          value={delta(row.netGrowth, previous?.netGrowth)}
          suffix="creștere netă vs luna precedentă"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <dl className="grid grid-cols-2 gap-3 self-start">
          {[
            { t: 'Comunitate la final', v: fmtInt(row.followers) },
            { t: 'Creștere netă', v: fmtSignedInt(row.netGrowth) },
            { t: 'Rată de creștere', v: fmtPct(row.growthRate, 2) },
            { t: 'Vizite pe profil', v: fmtInt(row.profileVisits) },
            ...(hasFlow
              ? [
                  { t: 'Abonări (IG)', v: fmtInt(row.follows) },
                  { t: 'Dezabonări (IG)', v: fmtInt(row.unfollows) },
                ]
              : []),
          ].map((x) => (
            <div key={x.t} className="rounded-xl bg-ink-50 px-3 py-2.5">
              <dt className="text-xs font-medium text-ink-500">{x.t}</dt>
              <dd className="tnum mt-0.5 text-lg font-semibold text-ink-900">{x.v}</dd>
            </div>
          ))}
        </dl>

        <DataTable
          columns={[
            { key: 'name', label: 'Rețea' },
            { key: 'followersStart', label: 'La început', render: (r) => fmtInt(r.followersStart) },
            { key: 'netGrowth', label: 'Creștere netă', render: (r) => fmtSignedInt(r.netGrowth) },
            { key: 'followers', label: 'La final', render: (r) => fmtInt(r.followers) },
            { key: 'growthRate', label: 'Rată', render: (r) => fmtPct(r.growthRate, 2) },
            { key: 'paidFollowers', label: 'Din campanii', render: (r) => fmtInt(r.paidFollowers) },
          ]}
          rows={networks.map((n) => ({
            key: n.id,
            name: n.name,
            followersStart: row[`${n.id}_followersStart`],
            netGrowth: row[`${n.id}_netGrowth`],
            followers: row[`${n.id}_followers`],
            growthRate: row[`${n.id}_growthRate`],
            paidFollowers: row[`${n.id}_paidFollowers`],
          }))}
        />
      </div>
    </Card>
  )
}

export default function Crestere({ year, networks, activeIds }) {
  const [metric, setMetric] = useState('followers')
  const [selectedMonth, setSelectedMonth] = useState(null)

  const rows = monthlyRows(year, activeIds)
  const { current, previous } = yearOverYear(year, activeIds)

  const monthIndex = rows.findIndex((r) => r.month === selectedMonth)
  const monthRow = monthIndex >= 0 ? rows[monthIndex] : null
  const prevMonthRow = monthIndex > 0 ? rows[monthIndex - 1] : null

  // Las tarjetas siguen el filtro: mes elegido, o el año completo si no hay.
  const scope = monthRow ? aggregate([monthRow], activeIds) : current
  const scopePrev = monthRow ? (prevMonthRow ? aggregate([prevMonthRow], activeIds) : null) : previous
  const scopeLabel = monthRow ? 'vs luna precedentă' : 'vs anul precedent'
  const metricLabel = METRICS.find((m) => m.value === metric).label

  const flowNets = reportersOf(activeIds, 'unfollows')
  const flowNote = flowNets.length ? `Doar ${flowNets.map((id) => NETWORK_BY_ID[id].name).join(' + ')}` : null

  const tiles = [
    {
      label: 'Comunitate la final',
      value: scope.followers,
      format: (v) => fmtInt(v),
      delta: delta(scope.followers, scopePrev?.followers),
      deltaSuffix: scopeLabel,
      icon: Users,
      accent: 'var(--color-s1)',
      trend: rows.map((r) => r.followers),
    },
    {
      label: 'Creștere netă',
      value: scope.netGrowth,
      format: (v) => fmtSignedInt(v),
      delta: delta(scope.netGrowth, scopePrev?.netGrowth),
      deltaSuffix: scopeLabel,
      icon: ArrowUpRight,
      accent: 'var(--color-s2)',
      trend: rows.map((r) => r.netGrowth),
    },
    {
      label: 'Rată de creștere',
      value: scope.growthRate,
      format: (v) => fmtPct(v, 2),
      delta: delta(scope.growthRate, scopePrev?.growthRate),
      deltaSuffix: scopeLabel,
      icon: Percent,
      accent: 'var(--color-s3)',
      trend: rows.map((r) => r.growthRate),
    },
    flowNote
      ? {
          label: 'Dezabonări',
          value: scope.unfollows,
          format: (v) => fmtInt(v),
          delta: delta(scope.unfollows, scopePrev?.unfollows),
          deltaSuffix: scopeLabel,
          goodWhenDown: true,
          icon: UserMinus,
          accent: 'var(--color-s4)',
          trend: rows.map((r) => r.unfollows),
        }
      : {
          label: 'Urmăritori din campanii',
          value: scope.paidFollowers,
          format: (v) => fmtInt(v),
          delta: delta(scope.paidFollowers, scopePrev?.paidFollowers),
          deltaSuffix: scopeLabel,
          icon: UserMinus,
          accent: 'var(--color-s4)',
          trend: rows.map((r) => r.paidFollowers),
        },
  ]

  return (
    <div className="space-y-5">
      <Card className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-400">Luna</span>
        <ChipGroup
          label="Luna"
          value={selectedMonth}
          onChange={setSelectedMonth}
          options={[
            { value: null, label: `Tot anul ${year}` },
            ...rows.map((r) => ({ value: r.month, label: r.label })),
          ]}
        />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t, i) => (
          <StatTile key={t.label} {...t} delay={i * 60} />
        ))}
      </div>

      {monthRow ? (
        <MonthDetail row={monthRow} networks={networks} previous={prevMonthRow} hasFlow={!!flowNote} />
      ) : null}

      <ChartFrame
        title={`${metricLabel} pe rețea`}
        subtitle={`Evoluție lunară în ${year} — o singură scală, fără axe duble`}
        series={networks.map((n) => ({ label: n.name, color: n.hex }))}
        height={360}
        delay={80}
        actions={
          <SegmentedControl size="sm" label="Indicator" options={METRICS} value={metric} onChange={setMetric} />
        }
        table={{
          columns: [
            { key: 'label', label: 'Luna' },
            ...networks.map((n) => ({
              key: `${n.id}_${metric}`,
              label: n.name,
              color: n.hex,
              render: (r) => fmtInt(r[`${n.id}_${metric}`]),
            })),
          ],
          rows,
        }}
      >
        <MultiLine
          data={rows}
          networks={networks}
          metric={metric}
          format={(v) => fmtInt(v)}
          tickFormat={(v) => fmtCompact(v)}
        />
      </ChartFrame>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartFrame
          title="Contribuția fiecărei rețele"
          subtitle="Din ce canal vine creșterea netă a fiecărei luni"
          series={networks.map((n) => ({ label: n.name, color: n.hex }))}
          delay={140}
          table={{
            columns: [
              { key: 'label', label: 'Luna' },
              ...networks.map((n) => ({
                key: `${n.id}_netGrowth`,
                label: n.name,
                color: n.hex,
                render: (r) => fmtSignedInt(r[`${n.id}_netGrowth`]),
              })),
              { key: 'netGrowth', label: 'Total', render: (r) => fmtSignedInt(r.netGrowth) },
            ],
            rows,
          }}
        >
          <StackedBars
            data={rows}
            networks={networks}
            metric="netGrowth"
            format={(v) => fmtInt(v)}
            tickFormat={(v) => fmtCompact(v)}
          />
        </ChartFrame>

        {flowNote ? (
          <ChartFrame
            title="Fluxul de urmăritori"
            note={flowNote}
            subtitle="Cine intră, cine pleacă și cât rămâne în fiecare lună"
            series={[
              { label: 'Abonări', color: FLOW_COLORS.gained },
              { label: 'Dezabonări', color: FLOW_COLORS.lost },
              { label: 'Creștere netă', color: '#465564' },
            ]}
            delay={200}
            table={{
              columns: [
                { key: 'label', label: 'Luna' },
                { key: 'follows', label: 'Abonări', render: (r) => fmtInt(r.follows) },
                { key: 'unfollows', label: 'Dezabonări', render: (r) => fmtInt(r.unfollows) },
                { key: 'igNet', label: 'Net', render: (r) => fmtSignedInt(r.follows - r.unfollows) },
                {
                  key: 'ret',
                  label: 'Retenție',
                  render: (r) => fmtPct(1 - r.unfollows / r.follows, 1),
                },
              ],
              rows,
            }}
          >
            <FlowBars
              data={rows.map((r) => ({ ...r, igNet: r.follows - r.unfollows }))}
              gained={{ key: 'follows', label: 'Abonări', color: FLOW_COLORS.gained }}
              lost={{ key: 'unfollowsNegative', label: 'Dezabonări', color: FLOW_COLORS.lost }}
              net={{ key: 'igNet', label: 'Creștere netă', color: '#465564' }}
              format={(v) => fmtInt(Math.abs(v))}
              tickFormat={(v) => fmtCompact(v)}
            />
          </ChartFrame>
        ) : (
          <ChartFrame
            title="Urmăritori din campanii"
            subtitle="Partea de creștere care vine din publicitate plătită"
            series={networks.map((n) => ({ label: n.name, color: n.hex }))}
            delay={200}
            table={{
              columns: [
                { key: 'label', label: 'Luna' },
                ...networks.map((n) => ({
                  key: `${n.id}_paidFollowers`,
                  label: n.name,
                  color: n.hex,
                  render: (r) => fmtInt(r[`${n.id}_paidFollowers`]),
                })),
              ],
              rows,
            }}
          >
            <StackedBars
              data={rows}
              networks={networks}
              metric="paidFollowers"
              format={(v) => fmtInt(v)}
              tickFormat={(v) => fmtCompact(v)}
            />
          </ChartFrame>
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartFrame
          title="Ritmul de creștere"
          subtitle="Creșterea netă a lunii raportată la comunitatea de la începutul ei"
          delay={260}
          height={280}
          table={{
            columns: [
              { key: 'label', label: 'Luna' },
              { key: 'followersStart', label: 'La început', render: (r) => fmtInt(r.followersStart) },
              { key: 'netGrowth', label: 'Creștere netă', render: (r) => fmtSignedInt(r.netGrowth) },
              { key: 'growthRate', label: 'Rată', render: (r) => fmtPct(r.growthRate, 2) },
            ],
            rows,
          }}
        >
          <TrendArea
            data={rows}
            dataKey="growthRate"
            name="Rată de creștere"
            color="#2f6f9f"
            format={(v) => fmtPct(v, 2)}
          />
        </ChartFrame>

        <ChartFrame
          title="Din vizită pe profil în urmăritor"
          subtitle="Ce parte din vizitele pe profil s-a transformat în creștere netă"
          delay={320}
          height={280}
          table={{
            columns: [
              { key: 'label', label: 'Luna' },
              { key: 'profileVisits', label: 'Vizite pe profil', render: (r) => fmtInt(r.profileVisits) },
              { key: 'netGrowth', label: 'Creștere netă', render: (r) => fmtSignedInt(r.netGrowth) },
              {
                key: 'followerConversion',
                label: 'Conversie',
                render: (r) => fmtPct(r.followerConversion, 2),
              },
            ],
            rows,
          }}
        >
          <TrendArea
            data={rows}
            dataKey="followerConversion"
            name="Conversie"
            color="#7a52c4"
            format={(v) => fmtPct(v, 2)}
          />
        </ChartFrame>
      </div>

      <TableCard
        title="Tabel lunar complet"
        subtitle={`Toate cifrele de creștere ale anului ${year}, cu costul fiecărei luni.${
          flowNote ? ' Abonările și dezabonările vin doar de la Instagram.' : ''
        }`}
        csvName="crestere"
        year={year}
        delay={380}
        rows={rows}
        columns={[
          { key: 'label', label: 'Luna' },
          { key: 'followersStart', label: 'La început', render: (r) => fmtInt(r.followersStart) },
          ...(flowNote
            ? [
                { key: 'follows', label: 'Abonări (IG)', render: (r) => fmtInt(r.follows) },
                { key: 'unfollows', label: 'Dezabonări (IG)', render: (r) => fmtInt(r.unfollows) },
              ]
            : []),
          { key: 'paidFollowers', label: 'Din campanii', render: (r) => fmtInt(r.paidFollowers) },
          { key: 'netGrowth', label: 'Creștere netă', render: (r) => fmtSignedInt(r.netGrowth) },
          { key: 'followers', label: 'La final', render: (r) => fmtInt(r.followers) },
          { key: 'growthRate', label: 'Rată', csvLabel: 'Rată (0-1)', render: (r) => fmtPct(r.growthRate, 2) },
          {
            key: 'costPerNetFollower',
            label: 'Cost pe urmăritor net',
            csvLabel: 'Cost pe urmăritor net (€)',
            render: (r) => fmtEur2(r.costPerNetFollower),
          },
        ]}
      />
    </div>
  )
}
