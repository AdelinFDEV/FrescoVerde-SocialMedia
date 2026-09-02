import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChartTooltip from './ChartTooltip'
import useIsMobile from '../ui/useIsMobile'
import { ANIM, BAR, STACK_GAP, cursorFill, gridProps, stagger, useResponsiveAxes } from './chartTheme'

/**
 * Columnas para series arbitrarias (no solo redes). Apiladas llevan 2 px de
 * superficie entre tramos; agrupadas se separan con aire, sin borde.
 */
export default function SeriesBars({
  data,
  series,
  format,
  tickFormat,
  xKey = 'label',
  stacked = true,
  showTotal = true,
}) {
  const axes = useResponsiveAxes(useIsMobile())
  const last = series.length - 1
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={axes.margin}
        barCategoryGap="28%"
        barGap={6}
      >
        <CartesianGrid {...gridProps} />
        <XAxis dataKey={xKey} {...axes.x} />
        <YAxis {...axes.y} tickFormatter={tickFormat ?? format} />
        <Tooltip
          cursor={cursorFill}
          content={<ChartTooltip format={format} total={stacked && showTotal} />}
          isAnimationActive={false}
        />
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            stackId={stacked ? 'a' : undefined}
            fill={s.color}
            maxBarSize={BAR.maxBarSize}
            radius={!stacked || i === last ? BAR.radius : 0}
            {...(stacked ? STACK_GAP : {})}
            animationDuration={ANIM}
            animationBegin={stagger(i)}
            animationEasing="ease-out"
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
