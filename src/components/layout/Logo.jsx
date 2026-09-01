import { useState } from 'react'

/**
 * Usa /public/logo.png si existe; si no, cae en una marca tipográfica con los
 * colores de marca, para que el panel nunca muestre una imagen rota.
 */
export default function Logo({ size = 36, inverted = false }) {
  const [failed, setFailed] = useState(false)

  if (!failed) {
    return (
      <img
        src="/logo.png"
        alt="FrescoVerde"
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className="object-contain"
        style={{ height: size, width: 'auto' }}
      />
    )
  }

  return (
    <span
      className={`grid place-items-center rounded-xl font-bold ${
        inverted ? 'bg-white text-ink-600' : 'bg-ink-600 text-white'
      }`}
      style={{ height: size, width: size, fontSize: size * 0.5 }}
      aria-label="FrescoVerde"
    >
      V
    </span>
  )
}
