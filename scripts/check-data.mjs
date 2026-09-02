import { DEMO_CAMPAIGNS as CAMPAIGNS, DEMO_MONTHLY as MONTHLY } from '../src/data/demoData.js'
import { METRICS, METRIC_IDS, reports } from '../src/data/metrics.js'
import { monthsFromDatabase } from '../src/data/fromDatabase.js'
import {
  aggregate,
  annualRows,
  campaignRows,
  campaignTotals,
  monthlyRows,
  networkSplit,
  quarterlyRows,
  yearOverYear,
} from '../src/data/selectors.js'

const IDS = ['instagram', 'tiktok']
const errs = []
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol

// 1) Cada red publica exactamente los campos que dice el catálogo, y ninguno más.
MONTHLY.forEach((m) => {
  IDS.forEach((id) => {
    const n = m.networks[id]
    METRIC_IDS.forEach((mid) => {
      const has = n[mid] != null
      if (reports(id, mid) && !has) errs.push(`falta ${mid} en ${id} ${m.key}`)
      if (!reports(id, mid) && has) errs.push(`sobra ${mid} en ${id} ${m.key}`)
    })
  })
})

// 2) El gasto y los resultados de pago salen de las campañas del mes.
MONTHLY.forEach((m) => {
  IDS.forEach((id) => {
    const cs = CAMPAIGNS.filter((c) => c.monthKey === m.key && c.networkId === id)
    const n = m.networks[id]
    if (cs.reduce((s, c) => s + c.spend, 0) !== n.spend) errs.push(`spend ${m.key} ${id}`)
    if (cs.reduce((s, c) => s + c.followersGained, 0) !== n.paidFollowers)
      errs.push(`paidFollowers ${m.key} ${id}`)
    if (cs.reduce((s, c) => s + c.impressions, 0) !== n.impressions) errs.push(`impressions ${m.key} ${id}`)
    if (cs.reduce((s, c) => s + c.clicks, 0) !== n.clicks) errs.push(`clicks ${m.key} ${id}`)
  })
})

// 3) Coherencia interna de cada red.
MONTHLY.forEach((m) => {
  const ig = m.networks.instagram
  if (ig.netGrowth !== ig.follows - ig.unfollows) errs.push(`ig netGrowth ${m.key}`)
  if (ig.followers !== ig.followersStart + ig.netGrowth) errs.push(`ig followers ${m.key}`)
  if (ig.follows < ig.paidFollowers) errs.push(`ig altas < altas de pago ${m.key}`)
  if (ig.likes !== ig.postLikes + ig.reelLikes) errs.push(`ig likes ${m.key}`)
  if (ig.shares !== ig.postShares + ig.reelShares) errs.push(`ig shares ${m.key}`)
  if (ig.interactions !== ig.likes + ig.comments + ig.shares + ig.saves) errs.push(`ig interactions ${m.key}`)
  if (ig.viewsFollowers + ig.viewsNonFollowers !== ig.views) errs.push(`ig reparto seguidores ${m.key}`)
  if (ig.viewsPosts + ig.viewsReels + ig.viewsStories !== ig.views) errs.push(`ig reparto formato ${m.key}`)

  const tt = m.networks.tiktok
  if (tt.followers !== tt.followersStart + tt.netGrowth) errs.push(`tt followers ${m.key}`)
  if (tt.interactions !== tt.likes + tt.comments + tt.shares) errs.push(`tt interactions ${m.key}`)
  if (tt.viewsForYou + tt.viewsSearch > tt.views) errs.push(`tt reparto origen ${m.key}`)
  if (tt.newViewers > tt.viewers) errs.push(`tt espectadores nuevos > totales ${m.key}`)
})

// 4) La comunidad es continua entre meses.
for (let i = 1; i < MONTHLY.length; i++) {
  IDS.forEach((id) => {
    if (MONTHLY[i].networks[id].followersStart !== MONTHLY[i - 1].networks[id].followers)
      errs.push(`continuidad ${MONTHLY[i].key} ${id}`)
  })
}

// 5) Los ratios agregados se derivan de totales, no de promediar ratios.
const rows = monthlyRows(2026)
const agg = aggregate(rows)
const sum = (k) => rows.reduce((s, r) => s + r[k], 0)
if (!near(agg.costPerPaidFollower, sum('spend') / sum('paidFollowers'))) errs.push('costPerPaidFollower')
if (!near(agg.costPerNetFollower, sum('spend') / sum('netGrowth'))) errs.push('costPerNetFollower')
if (!near(agg.cpm, (sum('spend') * 1000) / sum('impressions'))) errs.push('cpm')
if (!near(agg.cpc, sum('spend') / sum('clicks'))) errs.push('cpc')
if (!near(agg.ctr, sum('clicks') / sum('impressions'))) errs.push('ctr')
if (!near(agg.engagementRate, sum('interactions') / sum('views'))) errs.push('engagementRate')
if (!near(agg.growthRate, sum('netGrowth') / rows[0].followersStart)) errs.push('growthRate')

// 6) Un saldo no se suma: la comunidad del periodo es la del último mes.
if (agg.followers !== rows[rows.length - 1].followers) errs.push('followers = último mes')
if (agg.followers !== agg.followersStart + sum('netGrowth')) errs.push('cuadre comunidad')

// 7) Métricas que solo reporta una red no se agregan como si fueran de las dos.
const igOnly = monthlyRows(2026, ['instagram'])
if (agg.unfollows !== igOnly.reduce((s, r) => s + r.unfollows, 0))
  errs.push('unfollows debería venir solo de Instagram')
const ttOnly = aggregate(monthlyRows(2026, ['tiktok']), ['tiktok'])
if (ttOnly.unfollows != null) errs.push('TikTok no reporta dezabonări')
if (ttOnly.viewers == null) errs.push('TikTok debería reportar spectatori')
if (aggregate(igOnly, ['instagram']).viewers != null) errs.push('Instagram no reporta spectatori')

// 8) Las campañas del año cuadran con el gasto y las altas de pago del año.
const camps = campaignRows({ year: 2026 })
const ct = campaignTotals(camps)
if (ct.spend !== agg.spend) errs.push(`campañas gasto ${ct.spend} vs ${agg.spend}`)
if (ct.followersGained !== agg.paidFollowers) errs.push('campañas altas de pago')
if (!near(ct.costPerFollower, agg.costPerPaidFollower)) errs.push('campañas coste/seguidor')

// 9) Trimestres y años suman lo mismo que los meses.
const q = quarterlyRows(2026)
if (q.reduce((s, r) => s + r.spend, 0) !== agg.spend) errs.push('trimestres gasto')
if (q.reduce((s, r) => s + r.netGrowth, 0) !== agg.netGrowth) errs.push('trimestres neto')
if (q[q.length - 1].followers !== agg.followers) errs.push('trimestres comunidad')
const y = annualRows().find((r) => r.year === 2026)
if (y.spend !== agg.spend) errs.push('anual gasto')
if (y.followers !== agg.followers) errs.push('anual comunidad')

// 10) El reparto por red suma el 100 % y cuadra con el total.
const split = networkSplit(agg, IDS, 'spend')
if (split.reduce((s, r) => s + r.value, 0) !== agg.spend) errs.push('split gasto')
if (!near(split.reduce((s, r) => s + r.share, 0), 1)) errs.push('split share')

// 11) El interanual recorta el año previo al mismo número de meses.
const yoy = yearOverYear(2026)
if (yoy.previousRows.length !== yoy.currentRows.length) errs.push('yoy meses')

// 12) Un solo filtro de red devuelve exactamente los datos de esa red.
const igSpend = MONTHLY.filter((m) => m.year === 2026).reduce((s, m) => s + m.networks.instagram.spend, 0)
if (aggregate(igOnly, ['instagram']).spend !== igSpend) errs.push('filtro instagram')

console.log(errs.length ? `FALLOS (${errs.length}):\n` + errs.slice(0, 15).join('\n') : '✓ 12/12 comprobaciones OK')

const eur = (v) => `${v.toFixed(2)} €`
const pct = (v) => `${(v * 100).toFixed(2)} %`
const igAgg = aggregate(igOnly, ['instagram'])
console.log('\n=== 2026 · 8 meses · ambas redes ===')
console.log('comunidad .............', agg.followersStart, '→', agg.followers, `(${pct(agg.growthRate)})`)
console.log('creștere netă .........', agg.netGrowth)
console.log('vizualizări ...........', agg.views)
console.log('interacțiuni ..........', agg.interactions, `(${pct(agg.engagementRate)} din vizualizări)`)
console.log('vizite pe profil ......', agg.profileVisits, `(${pct(agg.profileVisitRate)} din vizualizări)`)
console.log('investiție ............', agg.spend, '€ în', ct.count, 'campanii')
console.log('urmăritori din campanii', agg.paidFollowers)
console.log('cost/urmăritor plătit .', eur(agg.costPerPaidFollower))
console.log('cost/urmăritor net ....', eur(agg.costPerNetFollower))
console.log('CPM / CPC / CTR .......', eur(agg.cpm), '/', eur(agg.cpc), '/', pct(agg.ctr))
console.log('\n=== Instagram ===')
console.log('abonări / dezabonări ..', igAgg.follows, '/', igAgg.unfollows, `→ net ${igAgg.netGrowth}`)
console.log('retenție ..............', pct(igAgg.retentionRate))
console.log('vizualizări urmăritori.', pct(igAgg.viewsFollowers / igAgg.views))
console.log('Reels / postări / stories',
  pct(igAgg.viewsReels / igAgg.views), '/', pct(igAgg.viewsPosts / igAgg.views), '/', pct(igAgg.viewsStories / igAgg.views))
console.log('\n=== TikTok ===')
console.log('creștere netă .........', ttOnly.netGrowth)
console.log('„Pentru tine" / căutare',
  pct(ttOnly.viewsForYou / ttOnly.views), '/', pct(ttOnly.viewsSearch / ttOnly.views))
console.log('spectatori / noi ......', ttOnly.viewers, '/', ttOnly.newViewers)
void METRICS

// 13) El traductor de Supabase deja cada campo que el panel espera.
//     Un nombre de columna mal escrito daría `null` en silencio y rompería
//     los gráficos sin decir por qué, así que aquí se comprueba uno a uno.
const dbRow = (network, extra) => ({
  network,
  year: 2026,
  month: 8, // en la base de datos los meses van de 1 a 12
  views: '1000',
  profile_visits: '100',
  interactions: '80',
  likes: '50',
  comments: '10',
  shares: '20',
  followers: '5000',
  followers_start: '4900',
  net_growth: '100',
  spend: '250.00',
  impressions: '60000',
  clicks: '700',
  paid_followers: '90',
  ...extra,
})

const mapped = monthsFromDatabase([
  dbRow('instagram', {
    views_followers: '400',
    views_non_followers: '600',
    views_posts: '220',
    views_reels: '580',
    views_stories: '200',
    link_taps: '30',
    saves: '15',
    post_likes: '20',
    post_shares: '8',
    reel_likes: '30',
    reel_shares: '12',
    content_published: '14',
    follows: '130',
    unfollows: '30',
  }),
  dbRow('tiktok', {
    views_for_you: '750',
    views_search: '60',
    viewers: '420',
    new_viewers: '210',
  }),
])

if (mapped.months.length !== 1) errs.push('el traductor debería devolver 1 mes completo')
if (mapped.incomplete.length !== 0) errs.push('el mes tenía las dos redes: no debería quedar incompleto')

const mappedMonth = mapped.months[0]
if (mappedMonth.month !== 7) errs.push('los meses deberían pasar de 1-12 a 0-11')
if (mappedMonth.key !== '2026-08') errs.push('clave de mes mal formada')

IDS.forEach((id) => {
  METRIC_IDS.forEach((mid) => {
    const value = mappedMonth.networks[id]?.[mid]
    if (reports(id, mid) && typeof value !== 'number')
      errs.push(`el traductor pierde ${mid} de ${id}`)
  })
  if (typeof mappedMonth.networks[id]?.followersStart !== 'number')
    errs.push(`el traductor pierde followersStart de ${id}`)
})

// Un mes al que le falta una red no se muestra: rellenarla con ceros
// inventaría cifras y daría saltos falsos en los gráficos.
const partial = monthsFromDatabase([dbRow('tiktok', { views_for_you: '1', views_search: '1', viewers: '1', new_viewers: '1' })])
if (partial.months.length !== 0) errs.push('un mes sin todas las redes no debería mostrarse')
if (partial.incomplete.length !== 1) errs.push('el mes incompleto debería reportarse')

console.log(
  errs.length
    ? `\nFALLOS DEL TRADUCTOR (${errs.length}):\n` + errs.slice(0, 10).join('\n')
    : '\n✓ traductor de Supabase OK',
)
