import { Eye, Link2, UserSearch, Users } from 'lucide-react'
import StatTile from '../components/ui/StatTile'
import TableCard from '../components/ui/TableCard'
import ChartFrame from '../components/charts/ChartFrame'
import SeriesBars from '../components/charts/SeriesBars'
import StackedBars from '../components/charts/StackedBars'
import TrendArea from '../components/charts/TrendArea'
import { FORMAT_COLORS, NETWORK_BY_ID, SOURCE_COLORS } from '../data/networks'
import { reports } from '../data/metrics'
import {
  delta,
  fmtCompact,
  fmtInt,
  fmtPct,
  monthlyRows,
  yearOverYear,
} from '../data/selectors'

export default function Audienta({ year, networks, activeIds }) {
  const rows = monthlyRows(year, activeIds)
  const { current, previous } = yearOverYear(year, activeIds)

  const hasIg = activeIds.includes('instagram')
  const hasTt = activeIds.includes('tiktok')

  const tiles = [
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
      label: 'Vizite pe profil',
      value: current.profileVisits,
      format: (v) => fmtCompact(v),
      delta: delta(current.profileVisits, previous?.profileVisits),
      icon: Users,
      accent: 'var(--color-s1)',
      trend: rows.map((r) => r.profileVisits),
    },
    {
      label: 'Din vizualizare în vizită',
      value: current.profileVisitRate,
      format: (v) => fmtPct(v, 2),
      delta: delta(current.profileVisitRate, previous?.profileVisitRate),
      deltaSuffix: 'din vizualizări',
      icon: UserSearch,
      accent: 'var(--color-s3)',
      trend: rows.map((r) => r.profileVisitRate),
    },
    reports('instagram', 'linkTaps') && hasIg
      ? {
          label: 'Atingeri pe link',
          value: current.linkTaps,
          format: (v) => fmtInt(v),
          delta: delta(current.linkTaps, previous?.linkTaps),
          deltaSuffix: 'doar Instagram',
          icon: Link2,
          accent: 'var(--color-s4)',
          trend: rows.map((r) => r.linkTaps),
        }
      : {
          label: 'Spectatori noi',
          value: current.newViewers,
          format: (v) => fmtCompact(v),
          delta: delta(current.newViewers, previous?.newViewers),
          deltaSuffix: 'doar TikTok',
          icon: Link2,
          accent: 'var(--color-s4)',
          trend: rows.map((r) => r.newViewers),
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
        title="Vizualizări lunare pe rețea"
        subtitle={`Cât conținut s-a văzut în fiecare lună din ${year}`}
        series={networks.map((n) => ({ label: n.name, color: n.hex }))}
        height={340}
        delay={120}
        table={{
          columns: [
            { key: 'label', label: 'Luna' },
            ...networks.map((n) => ({
              key: `${n.id}_views`,
              label: n.name,
              color: n.hex,
              render: (r) => fmtInt(r[`${n.id}_views`]),
            })),
            { key: 'views', label: 'Total', render: (r) => fmtInt(r.views) },
          ],
          rows,
        }}
      >
        <StackedBars
          data={rows}
          networks={networks}
          metric="views"
          format={(v) => fmtInt(v)}
          tickFormat={(v) => fmtCompact(v)}
        />
      </ChartFrame>

      {hasIg ? (
        <div className="grid gap-5 xl:grid-cols-2">
          <ChartFrame
            title="Vizualizări după format"
            note="Doar Instagram"
            subtitle="Ce parte din audiență ajunge prin postări, Reels și Stories"
            series={[
              { label: 'Postări', color: FORMAT_COLORS[0] },
              { label: 'Reels', color: FORMAT_COLORS[1] },
              { label: 'Stories', color: FORMAT_COLORS[2] },
            ]}
            delay={180}
            table={{
              columns: [
                { key: 'label', label: 'Luna' },
                {
                  key: 'instagram_viewsPosts',
                  label: 'Postări',
                  color: FORMAT_COLORS[0],
                  render: (r) => fmtInt(r.instagram_viewsPosts),
                },
                {
                  key: 'instagram_viewsReels',
                  label: 'Reels',
                  color: FORMAT_COLORS[1],
                  render: (r) => fmtInt(r.instagram_viewsReels),
                },
                {
                  key: 'instagram_viewsStories',
                  label: 'Stories',
                  color: FORMAT_COLORS[2],
                  render: (r) => fmtInt(r.instagram_viewsStories),
                },
                {
                  key: 'reelShare',
                  label: 'Pondere Reels',
                  render: (r) => fmtPct(r.instagram_viewsReels / r.instagram_views, 1),
                },
              ],
              rows,
            }}
          >
            <SeriesBars
              data={rows}
              series={[
                { key: 'instagram_viewsPosts', label: 'Postări', color: FORMAT_COLORS[0] },
                { key: 'instagram_viewsReels', label: 'Reels', color: FORMAT_COLORS[1] },
                { key: 'instagram_viewsStories', label: 'Stories', color: FORMAT_COLORS[2] },
              ]}
              format={(v) => fmtInt(v)}
              tickFormat={(v) => fmtCompact(v)}
            />
          </ChartFrame>

          <ChartFrame
            title="Urmăritori față de non-urmăritori"
            note="Doar Instagram"
            subtitle="Cât din audiență este public nou, care încă nu te urmărește"
            series={[
              { label: 'Urmăritori', color: SOURCE_COLORS.organic },
              { label: 'Non-urmăritori', color: SOURCE_COLORS.paid },
            ]}
            delay={240}
            table={{
              columns: [
                { key: 'label', label: 'Luna' },
                {
                  key: 'instagram_viewsFollowers',
                  label: 'Urmăritori',
                  color: SOURCE_COLORS.organic,
                  render: (r) => fmtInt(r.instagram_viewsFollowers),
                },
                {
                  key: 'instagram_viewsNonFollowers',
                  label: 'Non-urmăritori',
                  color: SOURCE_COLORS.paid,
                  render: (r) => fmtInt(r.instagram_viewsNonFollowers),
                },
                {
                  key: 'nonShare',
                  label: 'Pondere public nou',
                  render: (r) => fmtPct(r.instagram_viewsNonFollowers / r.instagram_views, 1),
                },
              ],
              rows,
            }}
          >
            <SeriesBars
              data={rows}
              series={[
                { key: 'instagram_viewsFollowers', label: 'Urmăritori', color: SOURCE_COLORS.organic },
                {
                  key: 'instagram_viewsNonFollowers',
                  label: 'Non-urmăritori',
                  color: SOURCE_COLORS.paid,
                },
              ]}
              format={(v) => fmtInt(v)}
              tickFormat={(v) => fmtCompact(v)}
            />
          </ChartFrame>
        </div>
      ) : null}

      {hasTt ? (
        <div className="grid gap-5 xl:grid-cols-2">
          <ChartFrame
            title="Cum ne găsesc pe TikTok"
            note="Doar TikTok"
            subtitle="Vizualizări din „Pentru tine” și din căutare — restul vine din profil sau din sunet"
            series={[
              { label: 'Pentru tine', color: FORMAT_COLORS[0] },
              { label: 'Căutare', color: FORMAT_COLORS[1] },
            ]}
            delay={300}
            table={{
              columns: [
                { key: 'label', label: 'Luna' },
                {
                  key: 'tiktok_viewsForYou',
                  label: 'Pentru tine',
                  color: FORMAT_COLORS[0],
                  render: (r) => fmtInt(r.tiktok_viewsForYou),
                },
                {
                  key: 'tiktok_viewsSearch',
                  label: 'Căutare',
                  color: FORMAT_COLORS[1],
                  render: (r) => fmtInt(r.tiktok_viewsSearch),
                },
                {
                  key: 'fyShare',
                  label: 'Pondere „Pentru tine”',
                  render: (r) => fmtPct(r.tiktok_viewsForYou / r.tiktok_views, 1),
                },
              ],
              rows,
            }}
          >
            <SeriesBars
              data={rows}
              series={[
                { key: 'tiktok_viewsForYou', label: 'Pentru tine', color: FORMAT_COLORS[0] },
                { key: 'tiktok_viewsSearch', label: 'Căutare', color: FORMAT_COLORS[1] },
              ]}
              stacked={false}
              format={(v) => fmtInt(v)}
              tickFormat={(v) => fmtCompact(v)}
            />
          </ChartFrame>

          <ChartFrame
            title="Spectatori totali și noi"
            note="Doar TikTok"
            subtitle="Câți oameni distincți au văzut conținutul și câți erau noi"
            series={[
              { label: 'Spectatori totali', color: NETWORK_BY_ID.tiktok.hex },
              { label: 'Spectatori noi', color: FORMAT_COLORS[1] },
            ]}
            delay={360}
            table={{
              columns: [
                { key: 'label', label: 'Luna' },
                {
                  key: 'tiktok_viewers',
                  label: 'Spectatori',
                  color: NETWORK_BY_ID.tiktok.hex,
                  render: (r) => fmtInt(r.tiktok_viewers),
                },
                {
                  key: 'tiktok_newViewers',
                  label: 'Noi',
                  color: FORMAT_COLORS[1],
                  render: (r) => fmtInt(r.tiktok_newViewers),
                },
                {
                  key: 'newShare',
                  label: 'Pondere noi',
                  render: (r) => fmtPct(r.tiktok_newViewers / r.tiktok_viewers, 1),
                },
              ],
              rows,
            }}
          >
            <SeriesBars
              data={rows}
              series={[
                { key: 'tiktok_viewers', label: 'Spectatori totali', color: NETWORK_BY_ID.tiktok.hex },
                { key: 'tiktok_newViewers', label: 'Spectatori noi', color: FORMAT_COLORS[1] },
              ]}
              stacked={false}
              format={(v) => fmtInt(v)}
              tickFormat={(v) => fmtCompact(v)}
            />
          </ChartFrame>
        </div>
      ) : null}

      <ChartFrame
        title="Din vizualizare în vizită pe profil"
        subtitle="Ce parte din vizualizări ajunge să deschidă profilul"
        delay={420}
        height={280}
        table={{
          columns: [
            { key: 'label', label: 'Luna' },
            { key: 'views', label: 'Vizualizări', render: (r) => fmtInt(r.views) },
            { key: 'profileVisits', label: 'Vizite pe profil', render: (r) => fmtInt(r.profileVisits) },
            { key: 'profileVisitRate', label: 'Rată', render: (r) => fmtPct(r.profileVisitRate, 2) },
          ],
          rows,
        }}
      >
        <TrendArea
          data={rows}
          dataKey="profileVisitRate"
          name="Rată de vizită pe profil"
          color="#12a147"
          format={(v) => fmtPct(v, 2)}
        />
      </ChartFrame>

      <TableCard
        title="Tabel lunar de audiență"
        subtitle={`Cifrele agregate ale rețelelor active în ${year}.`}
        csvName="audienta"
        year={year}
        delay={480}
        rows={rows}
        columns={[
          { key: 'label', label: 'Luna' },
          { key: 'views', label: 'Vizualizări', render: (r) => fmtInt(r.views) },
          { key: 'profileVisits', label: 'Vizite pe profil', render: (r) => fmtInt(r.profileVisits) },
          {
            key: 'profileVisitRate',
            label: 'Rată vizite',
            csvLabel: 'Rată vizite (0-1)',
            render: (r) => fmtPct(r.profileVisitRate, 2),
          },
          ...(hasIg
            ? [{ key: 'linkTaps', label: 'Atingeri pe link (IG)', render: (r) => fmtInt(r.linkTaps) }]
            : []),
          ...(hasTt
            ? [
                { key: 'viewers', label: 'Spectatori (TT)', render: (r) => fmtInt(r.viewers) },
                { key: 'newViewers', label: 'Spectatori noi (TT)', render: (r) => fmtInt(r.newViewers) },
              ]
            : []),
        ]}
      />
    </div>
  )
}
