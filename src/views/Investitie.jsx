import { Coins, Gauge, MousePointerClick, Target } from 'lucide-react'
import StatTile from '../components/ui/StatTile'
import TableCard from '../components/ui/TableCard'
import ChartFrame from '../components/charts/ChartFrame'
import MultiLine from '../components/charts/MultiLine'
import RankBars from '../components/charts/RankBars'
import StackedBars from '../components/charts/StackedBars'
import TrendArea from '../components/charts/TrendArea'
import {
  delta,
  fmtCompact,
  fmtEur,
  fmtEur2,
  fmtEurCompact,
  fmtInt,
  fmtPct,
  monthlyRows,
  networkSplit,
  yearOverYear,
} from '../data/selectors'

export default function Investitie({ year, networks, activeIds }) {
  const rows = monthlyRows(year, activeIds)
  const { current, previous } = yearOverYear(year, activeIds)
  const split = networkSplit(rows, activeIds, 'spend')
  const best = [...split].sort((a, b) => a.costPerPaidFollower - b.costPerPaidFollower)[0]
  const bestNet = networks.find((n) => n.id === best.id)

  const tiles = [
    {
      label: 'Investiție totală',
      value: current.spend,
      format: (v) => fmtEur(v),
      delta: delta(current.spend, previous?.spend),
      icon: Coins,
      accent: 'var(--color-s2)',
      trend: rows.map((r) => r.spend),
    },
    {
      label: 'Investiție medie lunară',
      value: current.spend / current.months,
      format: (v) => fmtEur(v),
      delta: previous ? delta(current.spend / current.months, previous.spend / previous.months) : null,
      icon: Gauge,
      accent: 'var(--color-s3)',
      trend: rows.map((r) => r.spend),
    },
    {
      label: 'Cost pe urmăritor plătit',
      value: current.costPerPaidFollower,
      format: (v) => fmtEur2(v),
      delta: delta(current.costPerPaidFollower, previous?.costPerPaidFollower),
      goodWhenDown: true,
      icon: Target,
      accent: 'var(--color-s1)',
      trend: rows.map((r) => r.costPerPaidFollower),
    },
    {
      label: 'Cost pe clic',
      value: current.cpc,
      format: (v) => fmtEur2(v),
      delta: delta(current.cpc, previous?.cpc),
      goodWhenDown: true,
      icon: MousePointerClick,
      accent: 'var(--color-s4)',
      trend: rows.map((r) => r.cpc),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t, i) => (
          <StatTile key={t.label} {...t} delay={i * 60} />
        ))}
      </div>

      <ChartFrame
        title="Investiție lunară pe rețea"
        subtitle={`Buget executat în ${year} — suma campaniilor fiecărei luni`}
        series={networks.map((n) => ({ label: n.name, color: n.hex }))}
        height={360}
        delay={120}
        table={{
          columns: [
            { key: 'label', label: 'Luna' },
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

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <ChartFrame
          title="Repartizarea bugetului"
          subtitle={`Cea mai eficientă rețea este ${bestNet.name}, cu ${fmtEur2(best.costPerPaidFollower)} pe urmăritor`}
          delay={180}
          height={300}
        >
          <RankBars
            items={split.map((s) => {
              const net = networks.find((n) => n.id === s.id)
              return {
                id: s.id,
                label: net.name,
                color: net.hex,
                value: s.value,
                share: s.share,
                note: `${fmtEur2(s.costPerPaidFollower)} pe urmăritor plătit · ${fmtInt(s.paidFollowers)} abonări`,
              }
            })}
            format={(v) => fmtEur(v)}
          />
        </ChartFrame>

        <ChartFrame
          title="Afișări plătite pe rețea"
          subtitle="Cât ajunge reclama în fața oamenilor, lună de lună"
          series={networks.map((n) => ({ label: n.name, color: n.hex }))}
          delay={240}
          height={300}
          table={{
            columns: [
              { key: 'label', label: 'Luna' },
              ...networks.map((n) => ({
                key: `${n.id}_impressions`,
                label: n.name,
                color: n.hex,
                render: (r) => fmtInt(r[`${n.id}_impressions`]),
              })),
            ],
            rows,
          }}
        >
          <MultiLine
            data={rows}
            networks={networks}
            metric="impressions"
            format={(v) => fmtInt(v)}
            tickFormat={(v) => fmtCompact(v)}
          />
        </ChartFrame>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartFrame
          title="Eficiența cheltuielii"
          subtitle="Cost pe mia de afișări (CPM), lună de lună — mai jos este mai bine"
          delay={280}
          height={280}
          table={{
            columns: [
              { key: 'label', label: 'Luna' },
              { key: 'spend', label: 'Investiție', render: (r) => fmtEur(r.spend) },
              { key: 'impressions', label: 'Afișări', render: (r) => fmtInt(r.impressions) },
              { key: 'cpm', label: 'CPM', render: (r) => fmtEur2(r.cpm) },
            ],
            rows,
          }}
        >
          <TrendArea data={rows} dataKey="cpm" name="CPM" color="#2f6f9f" format={(v) => fmtEur2(v)} />
        </ChartFrame>

        <ChartFrame
          title="Cost pe urmăritor, pe rețea"
          subtitle="Care canal aduce urmăritori mai ieftin în fiecare lună"
          series={networks.map((n) => ({ label: n.name, color: n.hex }))}
          delay={320}
          height={280}
          table={{
            columns: [
              { key: 'label', label: 'Luna' },
              ...networks.map((n) => ({
                key: `${n.id}_costPerPaidFollower`,
                label: n.name,
                color: n.hex,
                render: (r) => fmtEur2(r[`${n.id}_costPerPaidFollower`]),
              })),
              {
                key: 'costPerPaidFollower',
                label: 'Total',
                render: (r) => fmtEur2(r.costPerPaidFollower),
              },
            ],
            rows,
          }}
        >
          <MultiLine
            data={rows}
            networks={networks}
            metric="costPerPaidFollower"
            format={(v) => fmtEur2(v)}
          />
        </ChartFrame>
      </div>

      <TableCard
        title="Randamentul lunar al reclamelor"
        subtitle={`Toți indicatorii de cost ai anului ${year}, calculați din totalurile lunii, nu din medii de rate.`}
        csvName="investitie"
        year={year}
        delay={360}
        rows={rows}
        columns={[
          { key: 'label', label: 'Luna' },
          { key: 'spend', label: 'Investiție', csvLabel: 'Investiție (€)', render: (r) => fmtEur(r.spend) },
          { key: 'impressions', label: 'Afișări', render: (r) => fmtInt(r.impressions) },
          { key: 'clicks', label: 'Clicuri', render: (r) => fmtInt(r.clicks) },
          { key: 'ctr', label: 'CTR', csvLabel: 'CTR (0-1)', render: (r) => fmtPct(r.ctr, 2) },
          { key: 'cpc', label: 'CPC', csvLabel: 'CPC (€)', render: (r) => fmtEur2(r.cpc) },
          { key: 'cpm', label: 'CPM', csvLabel: 'CPM (€)', render: (r) => fmtEur2(r.cpm) },
          { key: 'paidFollowers', label: 'Urmăritori din campanii', render: (r) => fmtInt(r.paidFollowers) },
          {
            key: 'costPerPaidFollower',
            label: 'Cost pe urmăritor',
            csvLabel: 'Cost pe urmăritor (€)',
            render: (r) => fmtEur2(r.costPerPaidFollower),
          },
        ]}
      />
    </div>
  )
}
