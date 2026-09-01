import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChartTooltip from './ChartTooltip'
import {
  ANIM,
  AXIS_TEXT,
  BAR,
  LINE,
  SURFACE,
  axisProps,
  cursorFill,
  gridProps,
  stagger,
} from './chartTheme'

/**
 * Flujo de comunidad: altas por encima de cero, bajas por debajo y la línea de
 * crecimiento neto encima. Todo comparte unidad (personas) y un único eje, así
 * que la línea sobre las barras no es un segundo eje encubierto.
 */
export default function FlowBars({
  data,
  gained,
  lost,
  net,
  format,
  tickFormat,
  xKey = 'label',
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }} barCategoryGap="30%">
        <CartesianGrid {...gridProps} />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: AXIS_TEXT }}
          width={64}
          tickFormatter={tickFormat ?? format}
        />
        <Tooltip
          cursor={cursorFill}
          content={<ChartTooltip format={format} total={false} />}
          isAnimationActive={false}
        />
        <ReferenceLine y={0} stroke="#a3adb8" strokeWidth={1} />
        <Bar
          dataKey={gained.key}
          name={gained.label}
          fill={gained.color}
          maxBarSize={BAR.maxBarSize}
          radius={[4, 4, 0, 0]}
          animationDuration={ANIM}
          animationEasing="ease-out"
        />
        <Bar
          dataKey={lost.key}
          name={lost.label}
          fill={lost.color}
          maxBarSize={BAR.maxBarSize}
          radius={[0, 0, 4, 4]}
          animationDuration={ANIM}
          animationBegin={stagger(1)}
          animationEasing="ease-out"
        />
        <Line
          type="monotone"
          dataKey={net.key}
          name={net.label}
          stroke={net.color}
          {...LINE}
          // La línea neta pasa muy cerca de la punta de las barras de altas:
          // los puntos con anillo de superficie la mantienen legible al cruzarlas.
          dot={{ r: 4, fill: net.color, stroke: SURFACE, strokeWidth: 2 }}
          activeDot={{ r: 6, fill: net.color, stroke: SURFACE, strokeWidth: 2 }}
          animationDuration={ANIM}
          animationBegin={stagger(2)}
          animationEasing="ease-out"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
