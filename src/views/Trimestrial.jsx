import Card from '../components/ui/Card'
import DeltaBadge from '../components/ui/DeltaBadge'
import ChartFrame from '../components/charts/ChartFrame'
import FlowBars from '../components/charts/FlowBars'
import GroupedBars from '../components/charts/GroupedBars'
import StackedBars from '../components/charts/StackedBars'
import { FLOW_COLORS } from '../data/networks'
import {
  delta,
  fmtCompact,
  fmtEur,
  fmtEur2,
  fmtEurCompact,
  fmtInt,
  fmtPct,
  fmtSignedInt,
  quarterlyRows,
} from '../data/selectors'

function QuarterCard({ row, previous, delay }) {
  // Un trimestre incompleto no se compara contra uno cerrado: la caída sería
  // solo el mes que falta, no un cambio real de inversión.
  const partial = row.months < 3
  const comparable = previous && previous.months === row.months

  return (
    <Card className={`p-5 ${partial ? 'border-dashed' : ''}`} delay={delay}>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-400">{row.longLabel}</h3>
        <span className="shrink-0 text-xs text-ink-400">
          {partial ? `${row.months} din 3 luni` : '3 luni'}
        </span>
      </div>

      <p className="mt-3 text-2xl font-semibold tracking-tight text-ink-900">{fmtEur(row.spend)}</p>
      <p className="text-sm text-ink-500">investiți</p>

      <div className="mt-3">
        {comparable ? (
          <DeltaBadge value={delta(row.spend, previous.spend)} suffix="vs trimestrul precedent" />
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-50 px-2 py-0.5 text-xs font-medium text-ink-500">
            Trimestru în curs — fără comparație
          </span>
        )}
      </div>

      <dl className="mt-4 space-y-2 border-t border-ink-100 pt-3 text-sm">
        {[
          ['Creștere netă', fmtSignedInt(row.netGrowth)],
          ['Abonări (IG)', fmtInt(row.follows)],
          ['Dezabonări (IG)', fmtInt(row.unfollows)],
          ['Cost pe urmăritor', fmtEur2(row.costPerPaidFollower)],
          ['Rată de creștere', fmtPct(row.growthRate, 2)],
        ].map(([t, v]) => (
          <div key={t} className="flex items-baseline justify-between gap-3">
            <dt className="text-ink-500">{t}</dt>
            <dd className="tnum font-semibold text-ink-900">{v}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}

export default function Trimestrial({ year, networks, activeIds }) {
  const rows = quarterlyRows(year, activeIds)
  const prevYear = quarterlyRows(year - 1, activeIds)

  // El comparativo de T1 es el T4 del año anterior, no "sin dato".
  const previousOf = (i) => (i > 0 ? rows[i - 1] : (prevYear[prevYear.length - 1] ?? null))

  const last = rows[rows.length - 1]
  const partialNote =
    last && last.months < 3 ? ` · ${last.label} este încă în curs (${last.months} din 3 luni)` : ''

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {rows.map((row, i) => (
          <QuarterCard key={row.quarter} row={row} previous={previousOf(i)} delay={i * 70} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartFrame
          title="Investiție pe trimestru"
          subtitle={`Repartizare pe rețea în ${year}${partialNote}`}
          series={networks.map((n) => ({ label: n.name, color: n.hex }))}
          delay={120}
          table={{
            columns: [
              { key: 'label', label: 'Trimestru' },
              ...networks.map((n) => ({
                key: `${n.id}_spend`,
                label: n.name,
                color: n.hex,
                render: (r) => fmtEur(r[`${n.id}_spend`]),
              })),
              { key: 'spend', label: 'Total', render: (r) => fmtEur(r.spend) },
            ],
            rows,
          }}
        >
          <StackedBars
            data={rows}
            networks={networks}
            metric="spend"
            format={(v) => fmtEur(v)}
            tickFormat={(v) => fmtEurCompact(v)}
          />
        </ChartFrame>

        <ChartFrame
          title="Creștere netă pe trimestru"
          subtitle={`Urmăritori câștigați, după scăderea dezabonărilor${partialNote}`}
          series={networks.map((n) => ({ label: n.name, color: n.hex }))}
          delay={180}
          table={{
            columns: [
              { key: 'label', label: 'Trimestru' },
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
      </div>

      <ChartFrame
        title="Fluxul comunității pe trimestru"
        note="Abonări/dezabonări doar Instagram"
        subtitle={`Doar Instagram publică abonările și dezabonările separat; TikTok dă doar netul${partialNote}`}
        series={[
          { label: 'Abonări', color: FLOW_COLORS.gained },
          { label: 'Dezabonări', color: FLOW_COLORS.lost },
          { label: 'Creștere netă', color: '#465564' },
        ]}
        delay={240}
        height={300}
        table={{
          columns: [
            { key: 'label', label: 'Trimestru' },
            { key: 'follows', label: 'Abonări', render: (r) => fmtInt(r.follows) },
            { key: 'unfollows', label: 'Dezabonări', render: (r) => fmtInt(r.unfollows) },
            { key: 'netGrowth', label: 'Creștere netă', render: (r) => fmtSignedInt(r.netGrowth) },
            { key: 'growthRate', label: 'Rată', render: (r) => fmtPct(r.growthRate, 2) },
          ],
          rows,
        }}
      >
        <FlowBars
          data={rows}
          gained={{ key: 'follows', label: 'Abonări', color: FLOW_COLORS.gained }}
          lost={{ key: 'unfollowsNegative', label: 'Dezabonări', color: FLOW_COLORS.lost }}
          net={{ key: 'netGrowth', label: 'Creștere netă', color: '#465564' }}
          format={(v) => fmtInt(Math.abs(v))}
          tickFormat={(v) => fmtCompact(v)}
        />
      </ChartFrame>

      <ChartFrame
        title="Cost pe urmăritor plătit, pe trimestru"
        subtitle={`Cât a costat un urmăritor în fiecare parte a anului — mai jos este mai bine${partialNote}`}
        delay={300}
        height={280}
        table={{
          columns: [
            { key: 'label', label: 'Trimestru' },
            { key: 'spend', label: 'Investiție', render: (r) => fmtEur(r.spend) },
            { key: 'paidFollowers', label: 'Urmăritori din campanii', render: (r) => fmtInt(r.paidFollowers) },
            {
              key: 'costPerPaidFollower',
              label: 'Cost pe urmăritor',
              render: (r) => fmtEur2(r.costPerPaidFollower),
            },
            {
              key: 'costPerNetFollower',
              label: 'Cost pe urmăritor net',
              render: (r) => fmtEur2(r.costPerNetFollower),
            },
          ],
          rows,
        }}
      >
        <GroupedBars
          data={rows}
          series={[{ key: 'costPerPaidFollower', label: 'Cost pe urmăritor', color: '#c9701f' }]}
          format={(v) => fmtEur2(v)}
          labelLast
        />
      </ChartFrame>
    </div>
  )
}
