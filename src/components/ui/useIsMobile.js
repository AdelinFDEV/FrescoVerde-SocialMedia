import { useSyncExternalStore } from 'react'

// Los gráficos necesitan alturas y anchos de eje en números, no en clases CSS,
// así que la consulta de medios se lee desde JavaScript. Coincide con el punto
// de corte `sm` de Tailwind.
const query = '(max-width: 639px)'

const subscribe = (fn) => {
  const mq = window.matchMedia(query)
  mq.addEventListener('change', fn)
  return () => mq.removeEventListener('change', fn)
}

const getSnapshot = () => window.matchMedia(query).matches

/** `true` en pantallas de móvil. */
export default function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
