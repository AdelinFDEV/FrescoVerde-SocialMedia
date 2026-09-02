import { DEMO_MONTHLY } from '../src/data/demoData.js'
import { aggregate, monthlyRows, quarterlyRows, annualRows, yearOverYear } from '../src/data/selectors.js'

// Recálculo INDEPENDIENTE: se parte de los datos crudos y se calcula todo a
// mano, sin usar ninguna función del panel. Si las dos vías coinciden, las
// fórmulas del panel son correctas.
const IDS = ['instagram', 'tiktok']
const raw = (year) => DEMO_MONTHLY.filter((m) => m.year === year)
const bad = []
const near = (a, b, tol = 1e-9) => (a == null && b == null) || Math.abs(a - b) <= tol
const cmp = (name, mine, theirs) => { if (!near(mine, theirs)) bad.push(`${name}: manual ${mine} vs panel ${theirs}`) }

for (const year of [2024, 2025, 2026]) {
  const ms = raw(year)
  const sum = (f) => ms.reduce((s, m) => s + IDS.reduce((a, id) => a + (f(m.networks[id]) ?? 0), 0), 0)

  const views = sum((n) => n.views)
  const interactions = sum((n) => n.interactions)
  const spend = sum((n) => n.spend)
  const impressions = sum((n) => n.impressions)
  const clicks = sum((n) => n.clicks)
  const paid = sum((n) => n.paidFollowers)
  const net = sum((n) => n.netGrowth)
  const visits = sum((n) => n.profileVisits)
  const startPop = IDS.reduce((a, id) => a + ms[0].networks[id].followersStart, 0)
  const endPop = IDS.reduce((a, id) => a + ms[ms.length - 1].networks[id].followers, 0)

  const agg = aggregate(monthlyRows(year), IDS)

  cmp(`${year} vizualizări`, views, agg.views)
  cmp(`${year} interacțiuni`, interactions, agg.interactions)
  cmp(`${year} investiție`, spend, agg.spend)
  cmp(`${year} comunitate final`, endPop, agg.followers)
  cmp(`${year} comunitate inicial`, startPop, agg.followersStart)
  cmp(`${year} rată interacțiune`, interactions / views, agg.engagementRate)
  cmp(`${year} rată vizite profil`, visits / views, agg.profileVisitRate)
  cmp(`${year} conversie`, net / visits, agg.followerConversion)
  cmp(`${year} cost/urmăritor plătit`, spend / paid, agg.costPerPaidFollower)
  cmp(`${year} cost/urmăritor net`, spend / net, agg.costPerNetFollower)
  cmp(`${year} CPM`, (spend * 1000) / impressions, agg.cpm)
  cmp(`${year} CPC`, spend / clicks, agg.cpc)
  cmp(`${year} CTR`, clicks / impressions, agg.ctr)
  cmp(`${year} rată creștere`, net / startPop, agg.growthRate)

  // La identidad que lo ata todo: comunidad final = inicial + suma de netos.
  cmp(`${year} identitate comunitate`, endPop, startPop + net)

  // Trimestres y año tienen que dar lo mismo que los meses.
  const q = quarterlyRows(year, IDS)
  cmp(`${year} trimestre investiție`, spend, q.reduce((s, r) => s + r.spend, 0))
  cmp(`${year} trimestre net`, net, q.reduce((s, r) => s + r.netGrowth, 0))
  cmp(`${year} trimestre vizualizări`, views, q.reduce((s, r) => s + r.views, 0))
  cmp(`${year} trimestre comunitate`, endPop, q[q.length - 1].followers)

  const an = annualRows(IDS).find((r) => r.year === year)
  cmp(`${year} anual investiție`, spend, an.spend)
  cmp(`${year} anual comunitate`, endPop, an.followers)
  cmp(`${year} anual rată`, net / startPop, an.growthRate)

  // Cada red por separado tiene que sumar el total.
  const perNet = IDS.reduce((s, id) => s + aggregate(monthlyRows(year, [id]), [id]).spend, 0)
  cmp(`${year} suma por red`, spend, perNet)
}

// El interanual recorta el año previo al mismo número de meses.
const yoy = yearOverYear(2026, IDS)
const prev8 = raw(2025).slice(0, raw(2026).length)
const prevSpend = prev8.reduce((s, m) => s + IDS.reduce((a, id) => a + m.networks[id].spend, 0), 0)
cmp('yoy investiție previo', prevSpend, yoy.previous.spend)

console.log(bad.length ? `DESCUADRES (${bad.length}):\n` + bad.join('\n') : '✓ recálculo independiente: todo cuadra')
