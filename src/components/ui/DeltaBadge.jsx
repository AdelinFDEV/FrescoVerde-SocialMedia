import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { fmtSignedPct } from '../../data/selectors'

/**
 * `goodWhenDown` invierte el color para métricas donde bajar es bueno
 * (coste por seguidor, CPM). El icono y el signo acompañan siempre al color.
 */
export default function DeltaBadge({ value, goodWhenDown = false, suffix, size = 'sm' }) {
  if (value == null || !Number.isFinite(value)) {
    return <span className="text-sm text-ink-400">— fără comparație</span>
  }
  const flat = Math.abs(value) < 0.001
  const positive = value > 0
  const good = flat ? null : goodWhenDown ? !positive : positive
  const Icon = flat ? Minus : positive ? ArrowUpRight : ArrowDownRight

  const tone = flat
    ? 'bg-ink-50 text-ink-500'
    : good
      ? 'bg-neon-050 text-[#0b7a35]'
      : 'bg-[#f3eefb] text-[#5b3a9e]'

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full font-semibold ${tone} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      }`}
    >
      <Icon size={size === 'sm' ? 13 : 15} strokeWidth={2.6} />
      <span className="tnum">{fmtSignedPct(value)}</span>
      {suffix ? <span className="font-medium opacity-70">{suffix}</span> : null}
    </span>
  )
}
