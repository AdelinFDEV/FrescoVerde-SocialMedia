import { ALL_NETWORK_IDS } from './networks'
import { METRICS, METRIC_IDS, reportersOf } from './metrics'
import { CAMPAIGNS, MONTHLY } from './socialData'

const ratio = (num, den) => (den > 0 ? num / den : null)

// Se suman los recuentos; los saldos (urmăritori) se toman del último mes.
const SUM_IDS = METRIC_IDS.filter((id) => METRICS[id].agg === 'sum')
const LAST_IDS = METRIC_IDS.filter((id) => METRICS[id].agg === 'last')

/**
 * Ratios derivados. Se calculan SIEMPRE sobre totales ya sumados, nunca
 * promediando ratios de meses distintos: la media de porcentajes mensuales no
 * es el porcentaje del periodo.
 */
function derive(t) {
  return {
    ...t,
    unfollowsNegative: t.unfollows == null ? null : -t.unfollows,
    // Interacciones sobre visualizaciones: la tasa de interacción del periodo.
    engagementRate: ratio(t.interactions, t.views),
    profileVisitRate: ratio(t.profileVisits, t.views),
    followerConversion: ratio(t.netGrowth, t.profileVisits),
    // Coste real de la publicidad: gasto contra seguidores captados pagando.
    costPerPaidFollower: ratio(t.spend, t.paidFollowers),
    // Coste del crecimiento neto: reparte el gasto sobre lo que de verdad creció.
    costPerNetFollower: t.netGrowth > 0 ? t.spend / t.netGrowth : null,
    cpm: ratio(t.spend * 1000, t.impressions),
    cpc: ratio(t.spend, t.clicks),
    ctr: ratio(t.clicks, t.impressions),
    growthRate: ratio(t.netGrowth, t.followersStart),
    retentionRate: t.follows > 0 ? 1 - t.unfollows / t.follows : null,
  }
}

/** Suma una métrica sobre las redes activas que la reportan. `null` si ninguna. */
function sumOver(source, activeIds, id) {
  const reporters = reportersOf(activeIds, id)
  if (!reporters.length) return null
  return reporters.reduce((s, netId) => s + (source[netId][id] ?? 0), 0)
}

/** Filas mensuales de un año, con totales y una columna por red. */
export function monthlyRows(year, activeIds = ALL_NETWORK_IDS) {
  return MONTHLY.filter((m) => m.year === year).map((m) => {
    const row = {
      key: m.key,
      label: m.label,
      longLabel: m.longLabel,
      fullLabel: m.fullLabel,
      month: m.month,
      quarter: m.quarter,
      year: m.year,
    }

    ;[...SUM_IDS, ...LAST_IDS].forEach((id) => {
      row[id] = sumOver(m.networks, activeIds, id)
      reportersOf(activeIds, id).forEach((netId) => {
        row[`${netId}_${id}`] = m.networks[netId][id]
      })
    })

    row.followersStart = activeIds.reduce((s, netId) => s + m.networks[netId].followersStart, 0)
    activeIds.forEach((netId) => {
      row[`${netId}_followersStart`] = m.networks[netId].followersStart
      row[`${netId}_growthRate`] = ratio(m.networks[netId].netGrowth, m.networks[netId].followersStart)
      row[`${netId}_costPerPaidFollower`] = ratio(m.networks[netId].spend, m.networks[netId].paidFollowers)
      row[`${netId}_engagementRate`] = ratio(m.networks[netId].interactions, m.networks[netId].views)
    })

    return derive(row)
  })
}

/** Agrega filas mensuales en un único bloque de totales. */
export function aggregate(rows, activeIds = ALL_NETWORK_IDS) {
  if (!rows.length) return null
  const total = { months: rows.length }

  SUM_IDS.forEach((id) => {
    total[id] = rows[0][id] == null ? null : rows.reduce((s, r) => s + r[id], 0)
  })
  // Un saldo no se suma entre meses: vale el del último mes del periodo.
  LAST_IDS.forEach((id) => {
    total[id] = rows[rows.length - 1][id]
  })
  total.followersStart = rows[0].followersStart

  activeIds.forEach((netId) => {
    SUM_IDS.forEach((id) => {
      if (rows[0][`${netId}_${id}`] != null) {
        total[`${netId}_${id}`] = rows.reduce((s, r) => s + r[`${netId}_${id}`], 0)
      }
    })
    LAST_IDS.forEach((id) => {
      total[`${netId}_${id}`] = rows[rows.length - 1][`${netId}_${id}`]
    })
    total[`${netId}_followersStart`] = rows[0][`${netId}_followersStart`]
    total[`${netId}_growthRate`] = ratio(
      total[`${netId}_netGrowth`],
      rows[0][`${netId}_followersStart`],
    )
    total[`${netId}_costPerPaidFollower`] = ratio(total[`${netId}_spend`], total[`${netId}_paidFollowers`])
    total[`${netId}_engagementRate`] = ratio(total[`${netId}_interactions`], total[`${netId}_views`])
  })

  return derive(total)
}

/** Resumen por trimestre de un año. */
export function quarterlyRows(year, activeIds = ALL_NETWORK_IDS) {
  const rows = monthlyRows(year, activeIds)
  return [1, 2, 3, 4]
    .map((q) => {
      const slice = rows.filter((r) => r.quarter === q)
      if (!slice.length) return null
      return {
        key: `${year}-T${q}`,
        quarter: q,
        label: `T${q}`,
        longLabel: `T${q} ${year}`,
        year,
        ...aggregate(slice, activeIds),
      }
    })
    .filter(Boolean)
}

/** Resumen por año completo (el último puede estar en curso). */
export function annualRows(activeIds = ALL_NETWORK_IDS) {
  const years = [...new Set(MONTHLY.map((m) => m.year))]
  return years.map((year) => {
    const rows = monthlyRows(year, activeIds)
    return {
      key: String(year),
      year,
      label: String(year),
      partial: rows.length < 12,
      ...aggregate(rows, activeIds),
    }
  })
}

/** Reparto de una métrica entre las redes que la reportan, de mayor a menor. */
export function networkSplit(total, activeIds = ALL_NETWORK_IDS, metric = 'spend') {
  const reporters = reportersOf(activeIds, metric)
  const values = reporters.map((id) => ({
    id,
    value: total[`${id}_${metric}`] ?? 0,
    spend: total[`${id}_spend`] ?? 0,
    paidFollowers: total[`${id}_paidFollowers`] ?? 0,
    netGrowth: total[`${id}_netGrowth`] ?? 0,
    views: total[`${id}_views`] ?? 0,
    interactions: total[`${id}_interactions`] ?? 0,
  }))
  const sum = values.reduce((s, v) => s + v.value, 0)
  return values
    .map((v) => ({
      ...v,
      share: ratio(v.value, sum),
      costPerPaidFollower: ratio(v.spend, v.paidFollowers),
      costPerNetFollower: v.netGrowth > 0 ? v.spend / v.netGrowth : null,
      engagementRate: ratio(v.interactions, v.views),
    }))
    .sort((a, b) => b.value - a.value)
}

/**
 * Comparativa interanual honesta: recorta el año anterior al mismo número de
 * meses que lleva el año en curso, para no comparar 8 meses contra 12.
 */
export function yearOverYear(year, activeIds = ALL_NETWORK_IDS) {
  const currentRows = monthlyRows(year, activeIds)
  const previousRows = monthlyRows(year - 1, activeIds).slice(0, currentRows.length)
  return {
    current: aggregate(currentRows, activeIds),
    previous: previousRows.length ? aggregate(previousRows, activeIds) : null,
    currentRows,
    previousRows,
    partial: currentRows.length < 12,
    months: currentRows.length,
  }
}

/* ---- Campañas ---------------------------------------------------------- */

export function campaignRows({ year, quarter = null, month = null, activeIds = ALL_NETWORK_IDS }) {
  return CAMPAIGNS.filter(
    (c) =>
      activeIds.includes(c.networkId) &&
      c.year === year &&
      (quarter == null || c.quarter === quarter) &&
      (month == null || c.month === month),
  ).map((c) => ({
    ...c,
    cpm: ratio(c.spend * 1000, c.impressions),
    cpc: ratio(c.spend, c.clicks),
    ctr: ratio(c.clicks, c.impressions),
    costPerFollower: ratio(c.spend, c.followersGained),
    frequency: ratio(c.impressions, c.reach),
  }))
}

export function campaignTotals(rows) {
  if (!rows.length) return null
  const t = ['spend', 'impressions', 'reach', 'clicks', 'followersGained'].reduce(
    (acc, k) => ({ ...acc, [k]: rows.reduce((s, r) => s + r[k], 0) }),
    {},
  )
  return {
    ...t,
    count: rows.length,
    cpm: ratio(t.spend * 1000, t.impressions),
    cpc: ratio(t.spend, t.clicks),
    ctr: ratio(t.clicks, t.impressions),
    costPerFollower: ratio(t.spend, t.followersGained),
    frequency: ratio(t.impressions, t.reach),
  }
}

export function groupCampaigns(rows, keyFn, labelFn) {
  const map = new Map()
  rows.forEach((r) => {
    const k = keyFn(r)
    if (!map.has(k)) map.set(k, [])
    map.get(k).push(r)
  })
  return [...map.entries()]
    .map(([k, list]) => ({ key: k, label: labelFn(list[0]), ...campaignTotals(list) }))
    .sort((a, b) => b.spend - a.spend)
}

export function delta(current, previous) {
  if (current == null || previous == null || previous === 0) return null
  return (current - previous) / previous
}

/* ---- Formato (ro-RO) --------------------------------------------------- */

const nf = new Intl.NumberFormat('ro-RO')
const nf1 = new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// Espacio duro antes de la unidad: recharts envuelve las etiquetas directas al
// ancho de la barra, y "1,33 €" se partiría en dos líneas con un espacio normal.
const NB = ' '

export const fmtInt = (v) => (v == null ? '—' : nf.format(Math.round(v)))

export function fmtCompact(v) {
  if (v == null) return '—'
  const n = Math.abs(v)
  if (n >= 1_000_000) return `${nf1.format(v / 1_000_000)}${NB}mil.`
  if (n >= 10_000) return `${nf1.format(v / 1000)}${NB}K`
  return nf.format(Math.round(v))
}

export const fmtSignedInt = (v) => (v == null ? '—' : `${v > 0 ? '+' : ''}${nf.format(Math.round(v))}`)
export const fmtEur = (v) => (v == null ? '—' : `${nf.format(Math.round(v))}${NB}€`)
export const fmtEurCompact = (v) =>
  v == null ? '—' : Math.abs(v) >= 10_000 ? `${fmtCompact(v)}${NB}€` : fmtEur(v)
export const fmtDec2 = (v) => (v == null ? '—' : nf2.format(v))
export const fmtEur2 = (v) => (v == null ? '—' : `${nf2.format(v)}${NB}€`)
export const fmtPct = (v, d = 1) => (v == null ? '—' : `${(d === 1 ? nf1 : nf2).format(v * 100)}${NB}%`)
export const fmtSignedPct = (v) =>
  v == null ? '—' : `${v >= 0 ? '+' : '−'}${nf1.format(Math.abs(v) * 100)}${NB}%`
