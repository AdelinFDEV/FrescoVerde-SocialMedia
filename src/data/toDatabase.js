/**
 * Traduce lo que se teclea en los formularios a filas de Supabase.
 *
 * Es el reflejo de `fromDatabase.js`, con las mismas dos conversiones: los
 * meses vuelven de 0-11 a 1-12 y los nombres pasan de `camelCase` a
 * `snake_case`. Nada se calcula aquí — los totales los deriva la vista.
 */

/** Campo del formulario → columna. Los ids son únicos entre las dos redes. */
const STAT_COLUMNS = {
  views: 'views',
  viewsFollowers: 'views_followers_pct',
  viewsNonFollowers: 'views_non_followers_pct',
  viewsPosts: 'views_posts_pct',
  viewsReels: 'views_reels_pct',
  viewsStories: 'views_stories_pct',
  viewsForYou: 'views_for_you_pct',
  viewsSearch: 'views_search_pct',
  profileVisits: 'profile_visits',
  linkTaps: 'link_taps',
  viewers: 'viewers',
  newViewers: 'new_viewers',
  likes: 'likes',
  comments: 'comments',
  shares: 'shares',
  saves: 'saves',
  postLikes: 'post_likes',
  postShares: 'post_shares',
  reelLikes: 'reel_likes',
  reelShares: 'reel_shares',
  contentPublished: 'content_published',
  followers: 'followers',
  follows: 'follows',
  unfollows: 'unfollows',
  netGrowth: 'net_growth',
}

export const statColumn = (fieldId) => STAT_COLUMNS[fieldId]

/** Columna → campo, para rellenar el formulario con lo ya guardado. */
export const STAT_FIELDS = Object.fromEntries(
  Object.entries(STAT_COLUMNS).map(([field, column]) => [column, field]),
)

/**
 * Fila de `monthly_stats`. Solo se envían las columnas de la red elegida: las
 * de la otra deben quedar en `NULL` o la restricción de la tabla lo rechaza.
 */
export function statsRow({ network, year, month, fields, valueOf }) {
  const row = { network, year, month: month + 1 }
  fields.forEach((f) => {
    row[STAT_COLUMNS[f.id]] = valueOf(f.id)
  })
  return row
}

/** Fila de `campaigns`. */
export function campaignRow(form) {
  return {
    name: form.name.trim(),
    network: form.networkId,
    objective: form.objectiveId,
    status: form.status,
    year: form.year,
    month: form.month + 1,
    start_day: form.startDay,
    days: form.days,
    spend: form.spend,
    impressions: form.impressions,
    reach: form.reach,
    clicks: form.clicks,
    followers_gained: form.followersGained,
  }
}

/**
 * Traduce el error de Postgres a algo que se entienda sin saber SQL.
 *
 * Las restricciones de la base de datos son la última red de seguridad: si algo
 * llega hasta aquí es que el aviso del formulario no lo cazó, así que el
 * mensaje tiene que decir qué pasa, no soltar el texto de Postgres.
 */
export function explainError(error) {
  if (!error) return null
  const detail = `${error.message ?? ''}`

  if (error.code === '42501') return 'Baza de date nu permite salvarea. Verifică politicile de securitate.'
  if (error.code === '23505') return 'Există deja date pentru această rețea și lună.'
  if (error.code === '23514') {
    if (detail.includes('follower_split')) return 'Urmăritori + non-urmăritori trebuie să dea 100 %.'
    if (detail.includes('format_split')) return 'Postări + Reels + Stories trebuie să dea 100 %.'
    if (detail.includes('tiktok_source_split')) return '„Pentru tine" + căutare nu pot depăși 100 %.'
    if (detail.includes('instagram_fields') || detail.includes('tiktok_fields'))
      return 'Lipsesc câmpuri obligatorii pentru rețeaua aleasă.'
    if (detail.includes('clicks_within_impressions')) return 'Clicurile nu pot depăși afișările.'
    if (detail.includes('reach_within_impressions')) return 'Persoanele acoperite nu pot depăși afișările.'
    if (detail.includes('followers_within_clicks')) return 'Urmăritorii câștigați nu pot depăși clicurile.'
    if (detail.includes('planned_has_no_results'))
      return 'O campanie planificată nu poate avea deja rezultate.'
    if (detail.includes('period_within_month')) return 'Perioada campaniei iese din lună.'
    if (detail.includes('name_check')) return 'Campania are nevoie de un nume.'
    return 'Cifrele nu trec verificările bazei de date.'
  }
  if (error.code === '23502') return 'Toate câmpurile rețelei alese sunt obligatorii.'

  return detail || 'Nu s-a putut salva.'
}
