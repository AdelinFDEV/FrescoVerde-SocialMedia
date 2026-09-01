import { CalendarClock, Coins, Target, UserPlus } from 'lucide-react'
import Card from '../components/ui/Card'
import DeltaBadge from '../components/ui/DeltaBadge'
import StatTile from '../components/ui/StatTile'
import TableCard from '../components/ui/TableCard'
import ChartFrame from '../components/charts/ChartFrame'
import GroupedBars from '../components/charts/GroupedBars'
import StackedBars from '../components/charts/StackedBars'
import {
  annualRows,
  delta,
  fmtCompact,
  fmtEur,
  fmtEur2,
  fmtEurCompact,
  fmtInt,
  fmtPct,
  fmtSignedInt,
  monthlyRows,
  yearOverYear,
} from '../data/selectors'

const YEAR_COLORS = { previous: '#a3adb8', spend: '#2f6f9f', growth: '#12a147' }

export default function Anual({ year, networks, activeIds }) {
  const years = annualRows(activeIds)
  const { current, previous, months, partial } = yearOverYear(year, activeIds)

  // La comparación anual solo es legítima entre años con el mismo número de meses.
  const yearsWithDelta = years.map((r, i) => {
    const prev = years[i - 1]
    const comparable = !!prev && prev.months === r.months
    return {
      ...r,
      comparable,
      spendDelta: comparable ? delta(r.spend, prev.spend) : null,
      noCompareReason: i === 0 ? '— fără an precedent' : '— an încă deschis',
    }
  })

  // Comparativa mes a mes: año seleccionado contra el anterior, alineados por mes.
  const currentMonths = monthlyRows(year, activeIds)
  const prevMonths = monthlyRows(year - 1, activeIds)
  const monthCompare = currentMonths.map((r, i) => ({
    key: r.key,
    label: r.label,
    actual_spend: r.spend,
    previo_spend: prevMonths[i]?.spend ?? null,
    actual_netGrowth: r.netGrowth,
    previo_netGrowth: prevMonths[i]?.netGrowth ?? null,
  }))

  const tiles = [
    {
      label: 'Investiție anuală',
      value: current.spend,
      format: (v) => fmtEur(v),
      delta: delta(current.spend, previous?.spend),
      icon: Coins,
      accent: 'var(--color-s2)',
      trend: currentMonths.map((r) => r.spend),
    },
    {
      label: 'Creștere netă anuală',
      value: current.netGrowth,
      format: (v) => fmtSignedInt(v),
      delta: delta(current.netGrowth, previous?.netGrowth),
      icon: UserPlus,
      accent: 'var(--color-s1)',
      trend: currentMonths.map((r) => r.netGrowth),
    },
    {
      label: 'Cost pe urmăritor plătit',
      value: current.costPerPaidFollower,
      format: (v) => fmtEur2(v),
      delta: delta(current.costPerPaidFollower, previous?.costPerPaidFollower),
      goodWhenDown: true,
      icon: Target,
      accent: 'var(--color-s3)',
      trend: currentMonths.map((r) => r.costPerPaidFollower),
    },
    {
      label: 'Luni înregistrate',
      value: months,
      format: (v) => fmtInt(v),
      footnote: partial ? `din 12 luni ale anului ${year}` : 'an complet',
      icon: CalendarClock,
      accent: 'var(--color-s4)',
    },
  ]

  return (
    <div className="space-y-5">
      {partial ? (
        <Card className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3 text-sm">
          <span className="rounded-full bg-neon-050 px-2 py-0.5 text-xs font-semibold text-[#0b7a35]">
            An în curs
          </span>
          <span className="text-ink-600">
            {year} are {months} luni înregistrate. Toate comparațiile anuale reduc {year - 1} la aceleași{' '}
            {months} luni.
          </span>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t, i) => (
          <StatTile key={t.label} {...t} delay={i * 60} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartFrame
          title="Investiție lună de lună: acest an față de precedentul"
          subtitle={`${year} comparat cu ${year - 1}, aliniat pe luni`}
          series={[
            { label: String(year - 1), color: YEAR_COLORS.previous },
            { label: String(year), color: YEAR_COLORS.spend },
          ]}
          delay={120}
          table={{
            columns: [
              { key: 'label', label: 'Luna' },
              {
                key: 'previo_spend',
                label: String(year - 1),
                color: YEAR_COLORS.previous,
                render: (r) => fmtEur(r.previo_spend),
              },
              {
                key: 'actual_spend',
                label: String(year),
                color: YEAR_COLORS.spend,
                render: (r) => fmtEur(r.actual_spend),
              },
            ],
            rows: monthCompare,
          }}
        >
          <GroupedBars
            data={monthCompare}
            series={[
              { key: 'previo_spend', label: String(year - 1), color: YEAR_COLORS.previous },
              { key: 'actual_spend', label: String(year), color: YEAR_COLORS.spend },
            ]}
            format={(v) => fmtEur(v)}
            tickFormat={(v) => fmtEurCompact(v)}
          />
        </ChartFrame>

        <ChartFrame
          title="Creștere netă lună de lună: acest an față de precedentul"
          subtitle={`Urmăritori câștigați net în ${year} față de ${year - 1}`}
          series={[
            { label: String(year - 1), color: YEAR_COLORS.previous },
            { label: String(year), color: YEAR_COLORS.growth },
          ]}
          delay={180}
          table={{
            columns: [
              { key: 'label', label: 'Luna' },
              {
                key: 'previo_netGrowth',
                label: String(year - 1),
                color: YEAR_COLORS.previous,
                render: (r) => fmtSignedInt(r.previo_netGrowth),
              },
              {
                key: 'actual_netGrowth',
                label: String(year),
                color: YEAR_COLORS.growth,
                render: (r) => fmtSignedInt(r.actual_netGrowth),
              },
            ],
            rows: monthCompare,
          }}
        >
          <GroupedBars
            data={monthCompare}
            series={[
              { key: 'previo_netGrowth', label: String(year - 1), color: YEAR_COLORS.previous },
              { key: 'actual_netGrowth', label: String(year), color: YEAR_COLORS.growth },
            ]}
            format={(v) => fmtInt(v)}
            tickFormat={(v) => fmtCompact(v)}
          />
        </ChartFrame>
      </div>

      <ChartFrame
        title="Investiție anuală pe rețea"
        subtitle="Cum s-a schimbat repartizarea bugetului între canale"
        series={networks.map((n) => ({ label: n.name, color: n.hex }))}
        delay={240}
        height={300}
        table={{
          columns: [
            { key: 'label', label: 'An' },
            ...networks.map((n) => ({
              key: `${n.id}_spend`,
              label: n.name,
              color: n.hex,
              render: (r) => fmtEur(r[`${n.id}_spend`]),
            })),
            { key: 'spend', label: 'Total', render: (r) => fmtEur(r.spend) },
          ],
          rows: years,
        }}
      >
        <StackedBars
          data={years}
          networks={networks}
          metric="spend"
          format={(v) => fmtEur(v)}
          tickFormat={(v) => fmtEurCompact(v)}
        />
      </ChartFrame>

      <TableCard
        title="Bilanț pe ani"
        subtitle="Anii marcați ca parțiali nu sunt încă încheiați."
        csvName="bilant-anual"
        delay={300}
        rows={yearsWithDelta}
        rowClassName={(r) => (r.year === year ? 'bg-neon-050/60' : 'hover:bg-ink-50/60')}
        columns={[
          {
            key: 'year',
            label: 'An',
            render: (r) => (
              <>
                {r.year}
                {r.partial ? (
                  <span className="ml-2 rounded-full bg-ink-100 px-1.5 py-0.5 text-xs font-medium text-ink-500">
                    parțial · {r.months} luni
                  </span>
                ) : null}
              </>
            ),
            csv: (r) => (r.partial ? `${r.year} (parțial, ${r.months} luni)` : r.year),
          },
          { key: 'spend', label: 'Investiție', csvLabel: 'Investiție (€)', render: (r) => fmtEur(r.spend) },
          { key: 'follows', label: 'Abonări (IG)', render: (r) => fmtInt(r.follows) },
          { key: 'unfollows', label: 'Dezabonări (IG)', render: (r) => fmtInt(r.unfollows) },
          { key: 'netGrowth', label: 'Creștere netă', render: (r) => fmtSignedInt(r.netGrowth) },
          {
            key: 'costPerPaidFollower',
            label: 'Cost pe urmăritor',
            csvLabel: 'Cost pe urmăritor (€)',
            render: (r) => fmtEur2(r.costPerPaidFollower),
          },
          {
            key: 'engagementRate',
            label: 'Interacțiune',
            csvLabel: 'Interacțiune (0-1)',
            render: (r) => fmtPct(r.engagementRate, 2),
          },
          {
            key: 'spendDelta',
            label: 'Investiție vs an precedent',
            csvLabel: 'Investiție vs an precedent (0-1)',
            // Un año parcial no se compara contra uno cerrado.
            render: (r) =>
              r.comparable ? (
                <DeltaBadge value={r.spendDelta} />
              ) : (
                <span className="text-sm text-ink-400">{r.noCompareReason}</span>
              ),
            csv: (r) => (r.comparable ? r.spendDelta : ''),
          },
        ]}
      />
    </div>
  )
}
