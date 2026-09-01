import { OBJECTIVES } from './campaigns'
import { NETWORKS } from './networks'

/**
 * Datos de demostración deterministas (LCG con semilla fija) para que el panel
 * sea estable entre recargas. Se sustituyen conectando Supabase; ver README.
 *
 * Dos orígenes distintos, como en la realidad:
 *  - Estadísticas de la app (Instagram / TikTok): audiencia, interacciones y
 *    seguidores. Cada red reporta un conjunto de campos DISTINTO — TikTok, por
 *    ejemplo, solo da el neto de seguidores, no altas y bajas por separado.
 *  - Administrador de anuncios: campañas, con su gasto y sus resultados. El
 *    gasto mensual de una red es exactamente la suma de sus campañas.
 */
function lcg(seed) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

export const MONTH_LABELS = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec']
export const MONTH_LABELS_LONG = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie',
]

const START_YEAR = 2024
const MONTHS = 32 // ian-2024 → aug-2026

// Estacionalidad del negocio hortofrutícola: pico en primavera y verano.
const SEASON = [0.86, 0.9, 1.02, 1.1, 1.18, 1.24, 1.16, 0.94, 1.08, 1.05, 0.98, 1.12]

const PROFILE = {
  instagram: {
    followers0: 18400,
    budget: 2600,
    organicFollowRate: 0.011,
    churnRate: 0.0062,
    viewsPerFollower: 6.4,
    profileVisitRate: 0.026,
    linkTapRate: 0.058,
    cpm: 4.6,
    frequency: 2.1,
    ctr: 0.0135,
    followerPerClick: 0.19,
  },
  tiktok: {
    followers0: 9200,
    budget: 1900,
    organicFollowRate: 0.034,
    churnRate: 0.0091,
    viewsPerFollower: 11.5,
    profileVisitRate: 0.014,
    cpm: 2.9,
    frequency: 1.6,
    ctr: 0.0092,
    followerPerClick: 0.34,
  },
}

const CAMPAIGN_NAMES = [
  ['Legume de iarnă', 'Coșul de sezon', 'Rețete calde'],
  ['Prospețime de februarie', 'Citrice de sezon', 'Livrare rapidă'],
  ['Primăvara în coș', 'Verdețuri proaspete', 'Salate de primăvară'],
  ['Căpșuni de sezon', 'Coșul de Paște', 'Fructe timpurii'],
  ['Roșii de grădină', 'Legume bio', 'Piața de mai'],
  ['Fructe de vară', 'Pepeni și caise', 'Coșul de vacanță'],
  ['Prospețime de vară', 'Livrare la domiciliu', 'Salate reci'],
  ['Recolta de august', 'Coșul familiei', 'Legume pentru conserve'],
  ['Toamna în coș', 'Struguri și prune', 'Rețete de toamnă'],
  ['Recolta de toamnă', 'Dovleac și mere', 'Coșul de octombrie'],
  ['Legume de sezon rece', 'Coșul sănătos', 'Prospețime de noiembrie'],
  ['Coșul de sărbători', 'Fructe de iarnă', 'Cadouri gustoase'],
]

function buildMonths() {
  const rows = []
  for (let i = 0; i < MONTHS; i++) {
    const year = START_YEAR + Math.floor(i / 12)
    const month = i % 12
    rows.push({
      key: `${year}-${String(month + 1).padStart(2, '0')}`,
      index: i,
      year,
      month,
      quarter: Math.floor(month / 3) + 1,
      label: MONTH_LABELS[month],
      longLabel: `${MONTH_LABELS[month]} ${year}`,
      fullLabel: `${MONTH_LABELS_LONG[month]} ${year}`,
      networks: {},
    })
  }
  return rows
}

/** Reparte el presupuesto del mes en 1-3 campañas con objetivos distintos. */
function splitBudget(total, rand) {
  const count = total > 3200 ? 3 : total > 1800 ? 2 : 1
  const weights = Array.from({ length: count }, () => 0.6 + rand() * 0.8)
  const sum = weights.reduce((a, b) => a + b, 0)
  const parts = weights.map((w) => Math.round((total * w) / sum / 10) * 10)
  parts[0] += total - parts.reduce((a, b) => a + b, 0)
  return parts
}

/** Reparte un total en porcentajes que suman exactamente el total. */
function splitExact(total, weights) {
  const sum = weights.reduce((a, b) => a + b, 0)
  const parts = weights.map((w) => Math.round((total * w) / sum))
  parts[0] += total - parts.reduce((a, b) => a + b, 0)
  return parts
}

function generate() {
  const months = buildMonths()
  const campaigns = []
  let campaignSeq = 0

  NETWORKS.forEach((net, netIndex) => {
    const p = PROFILE[net.id]
    const rand = lcg(20240101 + netIndex * 7919)
    let followers = p.followers0

    months.forEach((m) => {
      const season = SEASON[m.month]
      const budgetLift = 1 + (m.year - START_YEAR) * 0.22
      const monthBudget = Math.round((p.budget * season * budgetLift * (0.92 + rand() * 0.16)) / 10) * 10

      // ---- Campañas del mes (administrador de anuncios) ----------------
      const parts = splitBudget(monthBudget, rand)
      const monthCampaigns = parts.map((spend, ci) => {
        const objective = OBJECTIVES[Math.floor(rand() * OBJECTIVES.length)]
        const name = CAMPAIGN_NAMES[m.month][ci % CAMPAIGN_NAMES[m.month].length]
        const noise = 0.88 + rand() * 0.24

        const cpm = p.cpm * objective.cpmMult * (1 + (m.year - START_YEAR) * 0.07) * noise
        const impressions = Math.round((spend / cpm) * 1000)
        const reach = Math.round(impressions / (p.frequency * (0.92 + rand() * 0.16)))
        const clicks = Math.round(impressions * p.ctr * objective.ctrMult * (0.9 + rand() * 0.2))
        const followersGained = Math.round(
          clicks * p.followerPerClick * objective.followerMult * (0.9 + rand() * 0.2),
        )

        const days = 12 + Math.floor(rand() * 14)
        const startDay = 1 + Math.floor(rand() * (28 - days))

        campaignSeq += 1
        return {
          id: `C-${String(campaignSeq).padStart(4, '0')}`,
          name,
          networkId: net.id,
          objectiveId: objective.id,
          objective: objective.label,
          monthKey: m.key,
          year: m.year,
          month: m.month,
          quarter: m.quarter,
          monthLabel: m.longLabel,
          startDay,
          days,
          spend,
          impressions,
          reach,
          clicks,
          followersGained,
          // El último mes registrado es el que está en curso.
          status: m.index === MONTHS - 1 ? 'activa' : 'finalizata',
        }
      })
      campaigns.push(...monthCampaigns)

      const spend = monthCampaigns.reduce((s, c) => s + c.spend, 0)
      const impressions = monthCampaigns.reduce((s, c) => s + c.impressions, 0)
      const clicks = monthCampaigns.reduce((s, c) => s + c.clicks, 0)
      const paidFollowers = monthCampaigns.reduce((s, c) => s + c.followersGained, 0)

      // ---- Estadísticas de la app --------------------------------------
      const followersStart = followers
      const views = Math.round(followers * p.viewsPerFollower * season * (0.86 + rand() * 0.3))
      const profileVisits = Math.round(views * p.profileVisitRate * (0.85 + rand() * 0.3))
      const organicFollows = Math.round(followers * p.organicFollowRate * season * (0.85 + rand() * 0.3))

      const stats = { views, profileVisits, spend, impressions, clicks, paidFollowers, followersStart }

      if (net.id === 'instagram') {
        const [viewsFollowers, viewsNonFollowers] = splitExact(views, [0.34 + rand() * 0.08, 0.62])
        const [viewsPosts, viewsReels, viewsStories] = splitExact(views, [
          0.2 + rand() * 0.06,
          0.55 + rand() * 0.08,
          0.18 + rand() * 0.05,
        ])

        const postLikes = Math.round(viewsPosts * (0.042 + rand() * 0.016))
        const comments = Math.round(postLikes * (0.03 + rand() * 0.025))
        const postShares = Math.round(postLikes * (0.06 + rand() * 0.05))
        const reelLikes = Math.round(viewsReels * (0.028 + rand() * 0.012))
        const saves = Math.round(reelLikes * (0.09 + rand() * 0.07))
        const reelShares = Math.round(reelLikes * (0.11 + rand() * 0.08))

        const follows = organicFollows + paidFollowers
        const unfollows = Math.round(followers * p.churnRate * (0.8 + rand() * 0.4))
        const netGrowth = follows - unfollows
        followers += netGrowth

        Object.assign(stats, {
          viewsFollowers,
          viewsNonFollowers,
          viewsPosts,
          viewsReels,
          viewsStories,
          linkTaps: Math.round(profileVisits * p.linkTapRate * (0.8 + rand() * 0.4)),
          postLikes,
          comments,
          postShares,
          reelLikes,
          saves,
          reelShares,
          likes: postLikes + reelLikes,
          shares: postShares + reelShares,
          interactions: postLikes + comments + postShares + reelLikes + saves + reelShares,
          contentPublished: 11 + Math.floor(rand() * 14),
          follows,
          unfollows,
          netGrowth,
          followers,
        })
      } else {
        // No es un reparto exhaustivo: el resto llega desde el perfil, la
        // pestaña «Urmărire» o el sonido, y TikTok no lo desglosa.
        const viewsForYou = Math.round(views * (0.72 + rand() * 0.1))
        const viewsSearch = Math.round(views * (0.05 + rand() * 0.04))
        const likes = Math.round(views * (0.048 + rand() * 0.022))
        const comments = Math.round(likes * (0.018 + rand() * 0.016))
        const shares = Math.round(likes * (0.045 + rand() * 0.035))
        const viewers = Math.round(views / (2.2 + rand() * 0.8))

        // TikTok solo publica el neto: no hay altas y bajas por separado.
        const netGrowth = organicFollows + paidFollowers - Math.round(followers * p.churnRate * (0.8 + rand() * 0.4))
        followers += netGrowth

        Object.assign(stats, {
          viewsForYou,
          viewsSearch,
          viewers,
          newViewers: Math.round(viewers * (0.48 + rand() * 0.18)),
          likes,
          comments,
          shares,
          interactions: likes + comments + shares,
          netGrowth,
          followers,
        })
      }

      m.networks[net.id] = stats
    })
  })

  return { months, campaigns }
}

const generated = generate()

export const MONTHLY = generated.months
export const CAMPAIGNS = generated.campaigns

export const YEARS = [...new Set(MONTHLY.map((m) => m.year))]
export const CURRENT_YEAR = YEARS[YEARS.length - 1]