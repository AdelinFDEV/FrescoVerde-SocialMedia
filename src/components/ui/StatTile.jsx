import Card from './Card'
import DeltaBadge from './DeltaBadge'
import Sparkline from './Sparkline'
import useCountUp from './useCountUp'

export default function StatTile({
  label,
  value,
  format,
  delta,
  deltaSuffix,
  footnote,
  goodWhenDown = false,
  trend,
  accent = 'var(--color-s1)',
  icon: Icon,
  delay = 0,
}) {
  const animated = useCountUp(value)

  return (
    <Card className="p-5" delay={delay}>
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-ink-500">{label}</span>
        {Icon ? (
          <span className="rounded-lg bg-ink-50 p-1.5 text-ink-600">
            <Icon size={16} strokeWidth={2.2} />
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">{format(animated)}</p>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
        {footnote ? (
          <span className="text-sm text-ink-500">{footnote}</span>
        ) : (
          <DeltaBadge value={delta} goodWhenDown={goodWhenDown} suffix={deltaSuffix} />
        )}
        {trend ? <Sparkline data={trend} accent={accent} /> : null}
      </div>
    </Card>
  )
}
