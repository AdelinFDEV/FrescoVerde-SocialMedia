export const SURFACE = '#ffffff'
export const GRID = '#e6eaee'
export const AXIS_TEXT = '#7a8794'

export const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 12, fill: AXIS_TEXT },
  dy: 8,
}

// Las marcas con relleno (barras, áreas) crecen desde una única línea base en
// cero: un eje truncado exageraría las diferencias.
export const yAxisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 12, fill: AXIS_TEXT },
  width: 64,
  domain: [0, 'auto'],
}

export const gridProps = {
  stroke: GRID,
  strokeDasharray: '0',
  vertical: false,
}

export const cursorLine = {
  stroke: '#a3adb8',
  strokeWidth: 1,
  strokeDasharray: '4 4',
}

export const cursorFill = { fill: 'rgba(70,85,100,0.06)' }

export const ANIM = 900
export const stagger = (i) => i * 90

/* Especificaciones de marca fijas (skill de dataviz) */
export const BAR = { maxBarSize: 24, radius: [4, 4, 0, 0] }
export const STACK_GAP = { stroke: SURFACE, strokeWidth: 2 }
export const LINE = { strokeWidth: 2, dot: false, strokeLinecap: 'round', strokeLinejoin: 'round' }
export const activeDot = (color) => ({
  r: 5,
  fill: color,
  stroke: SURFACE,
  strokeWidth: 2,
})
