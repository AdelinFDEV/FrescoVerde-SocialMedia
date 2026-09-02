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

/** Columnas apiladas por red. El apilado lleva 2 px de superficie entre tramos. */
export default function StackedBars({ data, networks, metric, format, tickFormat, xKey = 'label' }) {
  const axes = useResponsiveAxes(useIsMobile())
  const last = networks.length - 1
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={axes.margin} barCategoryGap="28%">
        <CartesianGrid {...gridProps} />
        <XAxis dataKey={xKey} {...axes.x} />
        <YAxis {...axes.y} tickFormatter={tickFormat ?? format} />
        <Tooltip
          cursor={cursorFill}
          content={<ChartTooltip format={format} total />}
          isAnimationActive={false}
        />
        {networks.map((n, i) => (
          <Bar
            key={n.id}
            dataKey={`${n.id}_${metric}`}
            name={n.name}
            stackId="a"
            fill={n.hex}
            maxBarSize={BAR.maxBarSize}
            radius={i === last ? BAR.radius : 0}
            {...STACK_GAP}
            animationDuration={ANIM}
            animationBegin={stagger(i)}
            animationEasing="ease-out"
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
