/**
 * Catálogo único de métricas. Todo lo que se muestra en tablas, gráficos y el
 * formulario de entrada de datos sale de aquí, así que un cambio de nombre o de
 * unidad se hace en un solo sitio.
 *
 * Las métricas que Instagram y TikTok reportan con nombres distintos pero que
 * significan lo mismo comparten `id` y etiqueta; `sourceLabel` guarda cómo se
 * llama en cada app para que quien introduce los datos sepa qué copiar.
 *
 * Los porcentajes NO se guardan como porcentajes: se guardan los recuentos y el
 * porcentaje se recalcula. Promediar porcentajes de meses distintos daría
 * cifras falsas.
 */

const M = (id, def) => [id, { id, ...def }]

export const METRICS = Object.fromEntries([
  /* ---- Audiencia ------------------------------------------------------ */
  M('views', {
    label: 'Vizualizări totale',
    agg: 'sum',
    networks: ['instagram', 'tiktok'],
    sourceLabel: {
      instagram: 'Vizualizări totale',
      tiktok: 'Vizualizări totale',
    },
  }),
  M('viewsFollowers', {
    label: 'Vizualizări de la urmăritori',
    agg: 'sum',
    networks: ['instagram'],
    sourceLabel: { instagram: '% din vizualizări de la urmăritori' },
  }),
  M('viewsNonFollowers', {
    label: 'Vizualizări de la non-urmăritori',
    agg: 'sum',
    networks: ['instagram'],
    sourceLabel: { instagram: '% din vizualizări de la non-urmăritori' },
  }),
  M('viewsPosts', {
    label: 'Vizualizări din postări',
    agg: 'sum',
    networks: ['instagram'],
    sourceLabel: { instagram: '% din public ajuns prin postări' },
  }),
  M('viewsReels', {
    label: 'Vizualizări din Reels',
    agg: 'sum',
    networks: ['instagram'],
    sourceLabel: { instagram: '% din public ajuns prin Reels' },
  }),
  M('viewsStories', {
    label: 'Vizualizări din Stories',
    agg: 'sum',
    networks: ['instagram'],
    sourceLabel: { instagram: '% din public ajuns prin Stories' },
  }),
  M('viewsForYou', {
    label: 'Vizualizări din „Pentru tine”',
    agg: 'sum',
    networks: ['tiktok'],
    sourceLabel: { tiktok: 'Ne-au găsit în secțiunea PENTRU TINE' },
  }),
  M('viewsSearch', {
    label: 'Vizualizări din căutare',
    agg: 'sum',
    networks: ['tiktok'],
    sourceLabel: { tiktok: 'Ne-au găsit prin CĂUTARE' },
  }),
  M('profileVisits', {
    label: 'Vizite pe profil',
    agg: 'sum',
    networks: ['instagram', 'tiktok'],
    sourceLabel: {
      instagram: 'Vizite totale pe profil',
      tiktok: 'Vizualizări ale profilului',
    },
  }),
  M('linkTaps', {
    label: 'Atingeri pe link',
    agg: 'sum',
    networks: ['instagram'],
    sourceLabel: { instagram: 'Atingeri pe link' },
  }),
  M('viewers', {
    label: 'Spectatori totali',
    agg: 'sum',
    networks: ['tiktok'],
    sourceLabel: { tiktok: 'Spectatori totali' },
  }),
  M('newViewers', {
    label: 'Spectatori noi',
    agg: 'sum',
    networks: ['tiktok'],
    sourceLabel: { tiktok: 'Spectatori noi' },
  }),

  /* ---- Interacciones -------------------------------------------------- */
  M('interactions', {
    label: 'Interacțiuni totale',
    agg: 'sum',
    networks: ['instagram', 'tiktok'],
    sourceLabel: {
      instagram: 'Interacțiuni totale',
      tiktok: 'Aprecieri + comentarii + distribuiri',
    },
  }),
  M('likes', {
    label: 'Aprecieri',
    agg: 'sum',
    networks: ['instagram', 'tiktok'],
    sourceLabel: { instagram: 'Aprecieri (postări + Reels)', tiktok: 'Aprecieri totale' },
  }),
  M('comments', {
    label: 'Comentarii',
    agg: 'sum',
    networks: ['instagram', 'tiktok'],
    sourceLabel: { instagram: 'Comentarii la postări', tiktok: 'Comentarii totale' },
  }),
  M('shares', {
    label: 'Distribuiri',
    agg: 'sum',
    networks: ['instagram', 'tiktok'],
    sourceLabel: { instagram: 'Distribuiri (postări + Reels)', tiktok: 'Distribuiri totale' },
  }),
  M('saves', {
    label: 'Salvări',
    agg: 'sum',
    networks: ['instagram'],
    sourceLabel: { instagram: 'Salvări Reels' },
  }),
  M('postLikes', {
    label: 'Aprecieri postări',
    agg: 'sum',
    networks: ['instagram'],
    sourceLabel: { instagram: 'Aprecieri la postări' },
  }),
  M('postShares', {
    label: 'Distribuiri postări',
    agg: 'sum',
    networks: ['instagram'],
    sourceLabel: { instagram: 'Distribuiri postări' },
  }),
  M('reelLikes', {
    label: 'Aprecieri Reels',
    agg: 'sum',
    networks: ['instagram'],
    sourceLabel: { instagram: 'Aprecieri Reels' },
  }),
  M('reelShares', {
    label: 'Distribuiri Reels',
    agg: 'sum',
    networks: ['instagram'],
    sourceLabel: { instagram: 'Distribuiri Reels' },
  }),
  M('contentPublished', {
    label: 'Conținut distribuit',
    agg: 'sum',
    networks: ['instagram'],
    sourceLabel: { instagram: 'Conținut distribuit' },
  }),

  /* ---- Crecimiento ---------------------------------------------------- */
  M('followers', {
    label: 'Urmăritori totali',
    agg: 'last', // es un saldo, no se suma
    networks: ['instagram', 'tiktok'],
    sourceLabel: { instagram: 'Urmăritori totali', tiktok: 'Urmăritori totali' },
  }),
  M('follows', {
    label: 'Abonări',
    agg: 'sum',
    networks: ['instagram'],
    sourceLabel: { instagram: 'Au început să te urmărească' },
  }),
  M('unfollows', {
    label: 'Dezabonări',
    agg: 'sum',
    networks: ['instagram'],
    sourceLabel: { instagram: 'Nu te mai urmăresc' },
  }),
  M('netGrowth', {
    label: 'Urmăritori câștigați net',
    agg: 'sum',
    networks: ['instagram', 'tiktok'],
    sourceLabel: {
      instagram: 'Urmăritori câștigați net',
      tiktok: 'Urmăritori câștigați net',
    },
  }),

  /* ---- Publicidad (viene del administrador de anuncios) --------------- */
  M('spend', {
    label: 'Investiție',
    agg: 'sum',
    networks: ['instagram', 'tiktok'],
  }),
  M('impressions', {
    label: 'Afișări plătite',
    agg: 'sum',
    networks: ['instagram', 'tiktok'],
  }),
  M('clicks', {
    label: 'Clicuri',
    agg: 'sum',
    networks: ['instagram', 'tiktok'],
  }),
  M('paidFollowers', {
    label: 'Urmăritori din campanii',
    agg: 'sum',
    networks: ['instagram', 'tiktok'],
  }),
])

export const METRIC_IDS = Object.keys(METRICS)
/** ¿Reporta esta red esta métrica? */
export const reports = (networkId, metricId) => METRICS[metricId]?.networks.includes(networkId) ?? false

/** Redes activas que sí reportan la métrica. */
export const reportersOf = (activeIds, metricId) => activeIds.filter((id) => reports(id, metricId))

/** Campos del formulario de entrada, por red y en el orden en que los da la app. */
export const ENTRY_FIELDS = {
  instagram: [
    { id: 'views', type: 'int' },
    { id: 'viewsFollowers', type: 'pct', of: 'views' },
    { id: 'viewsNonFollowers', type: 'pct', of: 'views' },
    { id: 'viewsPosts', type: 'pct', of: 'views' },
    { id: 'viewsReels', type: 'pct', of: 'views' },
    { id: 'viewsStories', type: 'pct', of: 'views' },
    { id: 'profileVisits', type: 'int' },
    { id: 'linkTaps', type: 'int' },
    { id: 'postLikes', type: 'int' },
    { id: 'comments', type: 'int' },
    { id: 'postShares', type: 'int' },
    { id: 'reelLikes', type: 'int' },
    { id: 'saves', type: 'int' },
    { id: 'reelShares', type: 'int' },
    { id: 'followers', type: 'int' },
    { id: 'follows', type: 'int' },
    { id: 'unfollows', type: 'int' },
    { id: 'contentPublished', type: 'int' },
  ],
  tiktok: [
    { id: 'followers', type: 'int' },
    { id: 'views', type: 'int' },
    { id: 'profileVisits', type: 'int' },
    { id: 'likes', type: 'int' },
    { id: 'comments', type: 'int' },
    { id: 'shares', type: 'int' },
    { id: 'viewsForYou', type: 'pct', of: 'views' },
    { id: 'viewsSearch', type: 'pct', of: 'views' },
    { id: 'viewers', type: 'int' },
    { id: 'newViewers', type: 'int' },
    { id: 'netGrowth', type: 'int' },
  ],
}

/** Campos que el panel calcula solo y por eso no se piden en el formulario. */
export const DERIVED_NOTE = {
  instagram: ['interactions', 'likes', 'shares', 'netGrowth'],
  tiktok: ['interactions'],
}
