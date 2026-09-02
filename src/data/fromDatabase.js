import { monthMeta } from './calendar'
import { OBJECTIVE_BY_ID } from './campaigns'
import { NETWORKS } from './networks'

/**
 * Traduce lo que devuelve Supabase a la forma que consume el panel.
 *
 * Dos conversiones y ninguna más: los meses pasan de 1-12 a 0-11, y los nombres
 * de columna de `snake_case` a `camelCase`. Ningún número se recalcula aquí —
 * los totales ya vienen resueltos por la vista `monthly_metrics`.
 */

// Columna de la vista → campo que espera el panel.
const STAT_COLUMNS = {
  views: 'views',
  views_followers: 'viewsFollowers',
  views_non_followers: 'viewsNonFollowers',
  views_posts: 'viewsPosts',
  views_reels: 'viewsReels',
  views_stories: 'viewsStories',
  views_for_you: 'viewsForYou',
  views_search: 'viewsSearch',
  profile_visits: 'profileVisits',
  link_taps: 'linkTaps',
  viewers: 'viewers',
  new_viewers: 'newViewers',
  interactions: 'interactions',
  likes: 'likes',
  comments: 'comments',
  shares: 'shares',
  saves: 'saves',
  post_likes: 'postLikes',
  post_shares: 'postShares',
  reel_likes: 'reelLikes',
  reel_shares: 'reelShares',
  content_published: 'contentPublished',
  followers: 'followers',
  followers_start: 'followersStart',
  follows: 'follows',
  unfollows: 'unfollows',
  net_growth: 'netGrowth',
  spend: 'spend',
  impressions: 'impressions',
  clicks: 'clicks',
  paid_followers: 'paidFollowers',
}

// Las cifras llegan como texto cuando la columna es `numeric` o `bigint`.
const toNumber = (v) => (v == null ? null : Number(v))

function mapStatRow(row) {
  const stats = {}
  Object.entries(STAT_COLUMNS).forEach(([column, field]) => {
    stats[field] = toNumber(row[column])
  })
  return stats
}

/**
 * Agrupa las filas de `monthly_metrics` (una por red y mes) en los meses que
 * usa el panel.
 *
 * Un mes solo entra si TODAS las redes tienen datos. Rellenar la que falta con
 * ceros inventaría cifras, y comparar un mes de dos redes contra otro de una
 * sola daría saltos falsos en los gráficos. Los meses incompletos se devuelven
 * aparte para poder avisar de que faltan.
 */
export function monthsFromDatabase(rows) {
  const byPeriod = new Map()

  rows.forEach((row) => {
    const year = Number(row.year)
    const month = Number(row.month) - 1
    const key = `${year}-${month}`
    if (!byPeriod.has(key)) byPeriod.set(key, { year, month, networks: {} })
    byPeriod.get(key).networks[row.network] = mapStatRow(row)
  })

  const months = []
  const incomplete = []

  ;[...byPeriod.values()]
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .forEach((period) => {
      const missing = NETWORKS.filter((n) => !period.networks[n.id])
      if (missing.length) {
        incomplete.push({
          ...monthMeta(period.year, period.month),
          missing: missing.map((n) => n.name),
        })
        return
      }
      months.push({
        ...monthMeta(period.year, period.month),
        index: months.length,
        networks: period.networks,
      })
    })

  return { months, incomplete }
}

/** El panel muestra un código legible; en la base de datos la clave es el id. */
export const campaignCode = (id) => `C-${String(id).padStart(4, '0')}`

export function campaignsFromDatabase(rows) {
  return rows.map((row) => {
    const month = Number(row.month) - 1
    const meta = monthMeta(Number(row.year), month)
    return {
      id: campaignCode(row.id),
      dbId: row.id,
      name: row.name,
      networkId: row.network,
      objectiveId: row.objective,
      objective: OBJECTIVE_BY_ID[row.objective]?.label ?? row.objective,
      status: row.status,
      monthKey: meta.key,
      year: meta.year,
      month: meta.month,
      quarter: meta.quarter,
      monthLabel: meta.longLabel,
      startDay: Number(row.start_day),
      days: Number(row.days),
      spend: toNumber(row.spend),
      impressions: toNumber(row.impressions),
      reach: toNumber(row.reach),
      clicks: toNumber(row.clicks),
      followersGained: toNumber(row.followers_gained),
    }
  })
}
