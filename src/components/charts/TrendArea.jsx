import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChartTooltip from './ChartTooltip'
import { ANIM, SURFACE, axisProps, cursorLine, gridProps, yAxisProps } from './chartTheme'

/** Serie única: sin leyenda (el título nombra la métrica), relleno al 10 %. */
export default function TrendArea({ data, dataKey, name, color = '#12a147', format, tickFormat, xKey = 'label' }) {
  const gradientId = `fill-${dataKey}`
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis {...yAxisProps} tickFormatter={tickFormat ?? format} />
        <Tooltip
          cursor={cursorLine}
          content={<ChartTooltip format={format} total={false} />}
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          name={name}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          activeDot={{ r: 5, fill: color, stroke: SURFACE, strokeWidth: 2 }}
          animationDuration={ANIM}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
