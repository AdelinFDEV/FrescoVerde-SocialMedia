import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChartTooltip from './ChartTooltip'
import { ANIM, BAR, axisProps, cursorFill, gridProps, stagger, yAxisProps } from './chartTheme'

/** Columnas agrupadas para comparar periodos (trimestres, años). */
export default function GroupedBars({ data, series, format, tickFormat, xKey = 'label', labelLast = false }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 24, right: 16, bottom: 0, left: 0 }} barGap={6} barCategoryGap="26%">
        <CartesianGrid {...gridProps} />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis {...yAxisProps} tickFormatter={tickFormat ?? format} />
        <Tooltip
          cursor={cursorFill}
          content={<ChartTooltip format={format} total={false} />}
          isAnimationActive={false}
        />
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            fill={s.color}
            maxBarSize={BAR.maxBarSize}
            radius={BAR.radius}
            animationDuration={ANIM}
            animationBegin={stagger(i)}
            animationEasing="ease-out"
          >
            {labelLast && i === series.length - 1 ? (
              <LabelList
                dataKey={s.key}
                position="top"
                offset={8}
                formatter={format}
                className="tnum"
                fill="#37424e"
                fontSize={11}
                fontWeight={600}
              />
            ) : null}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
