import { useEffect, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Interpola hasta `target` con easing out-quart. Reinicia al cambiar el valor.
 *
 * Con «reducir movimiento» activado no anima ni monta el bucle: devuelve el
 * valor final directamente.
 */
export default function useCountUp(target, duration = 900) {
  const [reduced] = useState(prefersReducedMotion)
  const [value, setValue] = useState(reduced ? target : 0)
  const [from, setFrom] = useState(0)

  useEffect(() => {
    if (reduced) return

    const start = performance.now()
    let frame
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 4)
      setValue(from + (target - from) * eased)
      if (t < 1) frame = requestAnimationFrame(tick)
      else setFrom(target)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
    // `from` se fija al terminar la animación; incluirlo la reiniciaría en bucle.
  }, [target, duration, reduced]) // eslint-disable-line react-hooks/exhaustive-deps

  return reduced ? target : value
}
