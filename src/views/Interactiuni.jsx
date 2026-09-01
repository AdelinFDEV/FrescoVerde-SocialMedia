import { Bookmark, Heart, MessageCircle, Share2 } from 'lucide-react'
import StatTile from '../components/ui/StatTile'
import TableCard from '../components/ui/TableCard'
import ChartFrame from '../components/charts/ChartFrame'
import RankBars from '../components/charts/RankBars'
import SeriesBars from '../components/charts/SeriesBars'
import StackedBars from '../components/charts/StackedBars'
import TrendArea from '../components/charts/TrendArea'
import { COMPOSITION_COLORS, FORMAT_COLORS } from '../data/networks'
import {
  delta,
  fmtCompact,
  fmtInt,
  fmtPct,
  monthlyRows,
  yearOverYear,
} from '../data/selectors'

export default function Interactiuni({ year, networks, activeIds }) {
  const rows = monthlyRows(year, activeIds)
  const { current, previous } = yearOverYear(year, activeIds)
  const hasIg = activeIds.includes('instagram')

  const tiles = [
    {
      label: 'Interacțiuni totale',
      value: current.interactions,
      format: (v) => fmtCompact(v),
      delta: delta(current.interactions, previous?.interactions),
      icon: Heart,
      accent: 'var(--color-s1)',
      trend: rows.map((r) => r.interactions),
    },
    {
      label: 'Rată de interacțiune',
      value: current.engagementRate,
      format: (v) => fmtPct(v, 2),
      delta: delta(current.engagementRate, previous?.engagementRate),
      deltaSuffix: 'din vizualizări',
      icon: MessageCircle,
      accent: 'var(--color-s2)',
      trend: rows.map((r) => r.engagementRate),
    },
    {
      label: 'Distribuiri',
      value: current.shares,
      format: (v) => fmtInt(v),
      delta: delta(current.shares, previous?.shares),
      icon: Share2,
      accent: 'var(--color-s3)',
      trend: rows.map((r) => r.shares),
    },
    hasIg
      ? {
          label: 'Salvări',
          value: current.saves,
          format: (v) => fmtInt(v),
          delta: delta(current.saves, previous?.saves),
          deltaSuffix: 'doar Instagram',
          icon: Bookmark,
          accent: 'var(--color-s4)',
          trend: rows.map((r) => r.saves),
        }
      : {
          label: 'Comentarii',
          value: current.comments,
          format: (v) => fmtInt(v),
          delta: delta(current.comments, previous?.comments),
          icon: Bookmark,
          accent: 'var(--color-s4)',
          trend: rows.map((r) => r.comments),
        },
  ]

  // El desglose por tipo depende de qué reporta cada red: Instagram añade
  // salvări, TikTok no las publica.
  const composition = [
    { key: 'likes', label: 'Aprecieri', color: COMPOSITION_COLORS[0] },
    { key: 'comments', label: 'Comentarii', color: COMPOSITION_COLORS[1] },
    { key: 'shares', label: 'Distribuiri', color: COMPOSITION_COLORS[2] },
    ...(hasIg ? [{ key: 'saves', label: 'Salvări', color: COMPOSITION_COLORS[3] }] : []),
  ]

  const totals = composition.map((c) => ({
    id: c.key,
    label: c.label,
    color: c.color,
    value: current[c.key] ?? 0,
    share: current.interactions ? (current[c.key] ?? 0) / current.interactions : null,
  }))

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t, i) => (
          <StatTile key={t.label} {...t} delay={i * 60} />
        ))}
      </div>

      <ChartFrame
        title="Interacțiuni lunare pe rețea"
        subtitle={`Aprecieri, comentarii, distribuiri și salvări în ${year}`}
        series={networks.map((n) => ({ label: n.name, color: n.hex }))}
        height={340}
        delay={120}
        table={{
          columns: [
            { key: 'label', label: 'Luna' },
            ...networks.map((n) => ({
              key: `${n.id}_interactions`,
              label: n.name,
              color: n.hex,
              render: (r) => fmtInt(r[`${n.id}_interactions`]),
            })),
            { key: 'interactions', label: 'Total', render: (r) => fmtInt(r.interactions) },
          ],
          rows,
        }}
      >
        <StackedBars
          data={rows}
          networks={networks}
          metric="interactions"
          format={(v) => fmtInt(v)}
          tickFormat={(v) => fmtCompact(v)}
        />
      </ChartFrame>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <ChartFrame
          title="Din ce sunt făcute interacțiunile"
          subtitle="Compoziția lunară a interacțiunilor, pe tip"
          series={composition.map((c) => ({ label: c.label, color: c.color }))}
          delay={180}
          table={{
            columns: [
              { key: 'label', label: 'Luna' },
              ...composition.map((c) => ({
                key: c.key,
                label: c.label,
                color: c.color,
                render: (r) => fmtInt(r[c.key]),
              })),
              { key: 'interactions', label: 'Total', render: (r) => fmtInt(r.interactions) },
            ],
            rows,
          }}
        >
          <SeriesBars
            data={rows}
            series={composition}
            format={(v) => fmtInt(v)}
            tickFormat={(v) => fmtCompact(v)}
          />
        </ChartFrame>

        <ChartFrame
          title="Ponderea fiecărui tip"
          subtitle={`Cumulat ${year}`}
          delay={240}
          height={320}
        >
          <RankBars items={totals} format={(v) => fmtInt(v)} />
        </ChartFrame>
      </div>

      {hasIg ? (
        <ChartFrame
          title="Postări față de Reels"
          note="Doar Instagram"
          subtitle="Unde se concentrează interacțiunea: în feed sau în Reels"
          series={[
            { label: 'Postări', color: FORMAT_COLORS[0] },
            { label: 'Reels', color: FORMAT_COLORS[1] },
          ]}
          delay={300}
          height={300}
          table={{
            columns: [
              { key: 'label', label: 'Luna' },
              {
                key: 'instagram_postLikes',
                label: 'Aprecieri postări',
                color: FORMAT_COLORS[0],
                render: (r) => fmtInt(r.instagram_postLikes),
              },
              {
                key: 'instagram_postShares',
                label: 'Distribuiri postări',
                render: (r) => fmtInt(r.instagram_postShares),
              },
              {
                key: 'instagram_reelLikes',
                label: 'Aprecieri Reels',
                color: FORMAT_COLORS[1],
                render: (r) => fmtInt(r.instagram_reelLikes),
              },
              {
                key: 'instagram_reelShares',
                label: 'Distribuiri Reels',
                render: (r) => fmtInt(r.instagram_reelShares),
              },
              { key: 'instagram_saves', label: 'Salvări Reels', render: (r) => fmtInt(r.instagram_saves) },
            ],
            rows,
          }}
        >
          <SeriesBars
            data={rows.map((r) => ({
              ...r,
              postTotal: r.instagram_postLikes + r.instagram_postShares,
              reelTotal: r.instagram_reelLikes + r.instagram_reelShares + r.instagram_saves,
            }))}
            series={[
              { key: 'postTotal', label: 'Postări', color: FORMAT_COLORS[0] },
              { key: 'reelTotal', label: 'Reels', color: FORMAT_COLORS[1] },
            ]}
            stacked={false}
            format={(v) => fmtInt(v)}
            tickFormat={(v) => fmtCompact(v)}
          />
        </ChartFrame>
      ) : null}

      <ChartFrame
        title="Rata de interacțiune"
        subtitle="Interacțiuni raportate la vizualizări, lună de lună"
        delay={360}
        height={280}
        table={{
          columns: [
            { key: 'label', label: 'Luna' },
            { key: 'views', label: 'Vizualizări', render: (r) => fmtInt(r.views) },
            { key: 'interactions', label: 'Interacțiuni', render: (r) => fmtInt(r.interactions) },
            { key: 'engagementRate', label: 'Rată', render: (r) => fmtPct(r.engagementRate, 2) },
          ],
          rows,
        }}
      >
        <TrendArea
          data={rows}
          dataKey="engagementRate"
          name="Rată de interacțiune"
          color="#7a52c4"
          format={(v) => fmtPct(v, 2)}
        />
      </ChartFrame>

      <TableCard
        title="Tabel lunar de interacțiuni"
        subtitle={`Cifrele agregate ale rețelelor active în ${year}.${
          hasIg ? ' Salvările și conținutul distribuit vin doar de la Instagram.' : ''
        }`}
        csvName="interactiuni"
        year={year}
        delay={420}
        rows={rows}
        columns={[
          { key: 'label', label: 'Luna' },
          { key: 'likes', label: 'Aprecieri', render: (r) => fmtInt(r.likes) },
          { key: 'comments', label: 'Comentarii', render: (r) => fmtInt(r.comments) },
          { key: 'shares', label: 'Distribuiri', render: (r) => fmtInt(r.shares) },
          ...(hasIg
            ? [
                { key: 'saves', label: 'Salvări (IG)', render: (r) => fmtInt(r.saves) },
                {
                  key: 'contentPublished',
                  label: 'Conținut distribuit (IG)',
                  render: (r) => fmtInt(r.contentPublished),
                },
              ]
            : []),
          { key: 'interactions', label: 'Total', render: (r) => fmtInt(r.interactions) },
          {
            key: 'engagementRate',
            label: 'Rată',
            csvLabel: 'Rată (0-1)',
            render: (r) => fmtPct(r.engagementRate, 2),
          },
        ]}
      />
    </div>
  )
}
