// Orden fijo de slots categóricos. El color sigue a la entidad, nunca a su
// posición en un filtro: si se oculta una red, la visible conserva su color.
export const NETWORKS = [
  { id: 'instagram', name: 'Instagram', hex: '#12a147' },
  { id: 'tiktok', name: 'TikTok', hex: '#2f6f9f' },
]

export const NETWORK_BY_ID = Object.fromEntries(NETWORKS.map((n) => [n.id, n]))
export const ALL_NETWORK_IDS = NETWORKS.map((n) => n.id)

// Pares validados para encodings que no son identidad de red.
// (Seis controles de la guía de dataviz, superficie #ffffff, --pairs all.)
export const SOURCE_COLORS = {
  organic: '#00a0a0', // teal
  paid: '#7a52c4', // violeta
}

export const FLOW_COLORS = {
  gained: '#12a147', // verde — abonări
  lost: '#7a52c4', // violeta — dezabonări (verde↔ámbar colapsa en deuteranopía)
}

// Paletas para encodings que no son identidad de red. Cada una validada con
// los seis controles de la guía de dataviz sobre superficie blanca.
export const FORMAT_COLORS = ['#00a0a0', '#7a52c4', '#c9701f'] // 3 series
export const COMPOSITION_COLORS = ['#2f6f9f', '#c9701f', '#00a0a0', '#7a52c4'] // 4 series
