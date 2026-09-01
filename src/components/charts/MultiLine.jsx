import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChartTooltip from './ChartTooltip'
import { ANIM, LINE, activeDot, axisProps, cursorLine, gridProps, stagger, yAxisProps } from './chartTheme'

/** Una línea por red. Sin segundo eje: todas las series comparten escala. */
export default function MultiLine({ data, networks, metric, format, tickFormat, xKey = 'label' }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis {...yAxisProps} tickFormatter={tickFormat ?? format} />
        <Tooltip
          cursor={cursorLine}
          content={<ChartTooltip format={format} total={false} />}
          isAnimationActive={false}
        />
        {networks.map((n, i) => (
          <Line
            key={n.id}
            type="monotone"
            dataKey={`${n.id}_${metric}`}
            name={n.name}
            stroke={n.hex}
            {...LINE}
            activeDot={activeDot(n.hex)}
            animationDuration={ANIM}
            animationBegin={stagger(i)}
            animationEasing="ease-out"
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
