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
import { ANIM, BAR, STACK_GAP, axisProps, cursorFill, gridProps, stagger, yAxisProps } from './chartTheme'

/** Columnas apiladas por red. El apilado lleva 2 px de superficie entre tramos. */
export default function StackedBars({ data, networks, metric, format, tickFormat, xKey = 'label' }) {
  const last = networks.length - 1
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }} barCategoryGap="28%">
        <CartesianGrid {...gridProps} />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis {...yAxisProps} tickFormatter={tickFormat ?? format} />
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
