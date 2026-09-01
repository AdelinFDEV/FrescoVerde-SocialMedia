import { Coins, Eye, HeartHandshake, UserPlus } from 'lucide-react'
import Card from '../components/ui/Card'
import DeltaBadge from '../components/ui/DeltaBadge'
import StatTile from '../components/ui/StatTile'
import useCountUp from '../components/ui/useCountUp'
import ChartFrame from '../components/charts/ChartFrame'
import FlowBars from '../components/charts/FlowBars'
import MultiLine from '../components/charts/MultiLine'
import RankBars from '../components/charts/RankBars'
import StackedBars from '../components/charts/StackedBars'
import TrendArea from '../components/charts/TrendArea'
import { FLOW_COLORS, NETWORK_BY_ID } from '../data/networks'
import { reportersOf } from '../data/metrics'
import {
  delta,
  fmtCompact,
  fmtEur,
  fmtEur2,
  fmtEurCompact,
  fmtInt,
  fmtPct,
  fmtSignedInt,
  monthlyRows,
  networkSplit,
  yearOverYear,
} from '../data/selectors'

export default function Rezumat({ year, networks, activeIds }) {
  const rows = monthlyRows(year, activeIds)
  const { current, previous, months, partial } = yearOverYear(year, activeIds)
  const split = networkSplit(current, activeIds, 'spend')
  const hero = useCountUp(current.followers, 1100)

  const perioada = partial ? `în ${months} luni din ${year}` : `în anul ${year}`
  // Instagram es la única red que publica altas y bajas por separado.
  const flowNets = reportersOf(activeIds, 'unfollows')
  const flowNote = flowNets.length ? `Doar ${flowNets.map((id) => NETWORK_BY_ID[id].name).join(' + ')}` : null

  const tiles = [
    {
      label: 'Creștere netă',
      value: current.netGrowth,
      format: (v) => fmtSignedInt(v),
      delta: delta(current.netGrowth, previous?.netGrowth),
      icon: UserPlus,
      accent: 'var(--color-s1)',
      trend: rows.map((r) => r.netGrowth),
    },
    {
      label: 'Vizualizări totale',
      value: current.views,
      format: (v) => fmtCompact(v),
      delta: delta(current.views, previous?.views),
      icon: Eye,
      accent: 'var(--color-s2)',
      trend: rows.map((r) => r.views),
    },
    {
      label: 'Rată de interacțiune',
      value: current.engagementRate,
      format: (v) => fmtPct(v, 2),
      delta: delta(current.engagementRate, previous?.engagementRate),
      deltaSuffix: 'din vizualizări',
      icon: HeartHandshake,
      accent: 'var(--color-s4)',
      trend: rows.map((r) => r.engagementRate),
    },
    {
      label: 'Investiție cumulată',
      value: current.spend,
      format: (v) => fmtEur(v),
      delta: delta(current.spend, previous?.spend),
      icon: Coins,
      accent: 'var(--color-s3)',
      trend: rows.map((r) => r.spend),
    },
  ]

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-center">
          <div>
            <p className="text-sm font-medium text-ink-500">Comunitate totală · la final de perioadă</p>
            <p className="mt-2 text-[52px] font-semibold leading-none tracking-tight text-ink-900">
              {fmtInt(hero)}
            </p>
            <div className="mt-4">
              <DeltaBadge value={current.growthRate} suffix={perioada} size="md" />
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-500">
              {fmtSignedInt(current.netGrowth)} urmăritori câștigați net cu o investiție de{' '}
              {fmtEur(current.spend)} — {fmtEur2(current.costPerNetFollower)} de fiecare urmăritor păstrat,
              din {fmtCompact(current.views)} vizualizări.
            </p>
          </div>

          <div className="h-56 lg:h-64">
            <TrendArea
              data={rows}
              dataKey="followers"
              name="Urmăritori"
              color="#12a147"
              format={(v) => fmtInt(v)}
              tickFormat={(v) => fmtCompact(v)}
            />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t, i) => (
          <StatTile key={t.label} {...t} delay={60 + i * 60} />
        ))}
      </div>

      <ChartFrame
        title="Creștere netă lunară pe rețea"
        subtitle="Câți urmăritori a câștigat fiecare canal în fiecare lună"
        series={networks.map((n) => ({ label: n.name, color: n.hex }))}
        delay={140}
        height={320}
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
          title="Fluxul comunității"
          note={flowNote}
          subtitle="Abonări deasupra liniei, dezabonări sub ea și creșterea netă ca linie"
          series={[
            { label: 'Abonări', color: FLOW_COLORS.gained },
            { label: 'Dezabonări', color: FLOW_COLORS.lost },
            { label: 'Creștere netă', color: '#465564' },
          ]}
          delay={200}
          height={320}
          table={{
            columns: [
              { key: 'label', label: 'Luna' },
              { key: 'follows', label: 'Abonări', render: (r) => fmtInt(r.follows) },
              { key: 'unfollows', label: 'Dezabonări', render: (r) => fmtInt(r.unfollows) },
              {
                key: 'igNet',
                label: 'Net',
                render: (r) => fmtSignedInt(r.follows - r.unfollows),
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
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <ChartFrame
          title="Investiție lunară pe rețea"
          subtitle={`Repartizarea bugetului în ${year}`}
          series={networks.map((n) => ({ label: n.name, color: n.hex }))}
          delay={260}
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

        <ChartFrame
          title="Unde se duce bugetul"
          subtitle={`Cumulat ${year}, cu costul pe urmăritor al fiecărei rețele`}
          delay={320}
          height={320}
        >
          <RankBars
            items={split.map((s) => ({
              id: s.id,
              label: NETWORK_BY_ID[s.id].name,
              color: NETWORK_BY_ID[s.id].hex,
              value: s.value,
              share: s.share,
              note: `${fmtEur2(s.costPerPaidFollower)} pe urmăritor plătit · ${fmtInt(s.paidFollowers)} din campanii`,
            }))}
            format={(v) => fmtEur(v)}
          />
        </ChartFrame>
      </div>

      <ChartFrame
        title="Cost pe urmăritor, pe rețea"
        subtitle="Cât costă un urmăritor adus de campanii — mai jos este mai bine"
        series={networks.map((n) => ({ label: n.name, color: n.hex }))}
        delay={380}
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
  )
}
