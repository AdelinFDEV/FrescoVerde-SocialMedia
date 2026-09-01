/**
 * Sparkline de 12 puntos: el trazo va en gris de apoyo y el último punto en el
 * color de acento, para que el periodo actual se lea sin leyenda.
 */
export default function Sparkline({ data, color = 'var(--color-ink-300)', accent = 'var(--color-s1)', width = 132, height = 34 }) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const stepX = width / (data.length - 1)
  const y = (v) => height - 3 - ((v - min) / span) * (height - 6)
  const points = data.map((v, i) => [i * stepX, y(v)])
  const d = points.map(([x, yy], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${yy.toFixed(1)}`).join(' ')
  const last = points[points.length - 1]

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="overflow-visible">
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
        style={{
          strokeDasharray: 1,
          strokeDashoffset: 0,
          animation: 'sparkdraw 1.1s cubic-bezier(0.22,1,0.36,1) backwards',
        }}
      />
      <circle cx={last[0]} cy={last[1]} r="4" fill={accent} stroke="#ffffff" strokeWidth="2" />
      <style>{`@keyframes sparkdraw { from { stroke-dashoffset: 1 } to { stroke-dashoffset: 0 } }`}</style>
    </svg>
  )
}
