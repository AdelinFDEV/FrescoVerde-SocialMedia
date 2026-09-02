# FrescoVerde · Panou rețele sociale

Dashboard de Instagram y TikTok: crecimiento, audiencia, interacciones e
inversión publicitaria, mes a mes, con resumen trimestral y anual.

**La interfaz está íntegramente en rumano.** Los comentarios del código y este
README están en español.

```bash
npm run dev        # desarrollo
npm run build      # producción
npm run lint       # oxlint
npm run check:data # verifica la coherencia de todos los cálculos
```

## Secciones

| Sección | Qué responde |
|---|---|
| **Rezumat** | Estado general: comunidad, crecimiento neto, visualizaciones, inversión |
| **Creștere** | Cómo crece la comunidad, filtrable mes a mes, con detalle por red |
| **Audiență** | Quién ve el contenido y por dónde llega (formato, seguidores/no, "Para ti") |
| **Interacțiuni** | Me gusta, comentarios, compartidos y guardados, y su composición |
| **Investiție** | Presupuesto, coste por seguidor, CPM, CPC, CTR |
| **Campanii** | Resultados de cada campaña de publicidad por separado |
| **Trimestrial** | Síntesis por trimestre |
| **Anual** | Síntesis anual y comparación con el año anterior |

## Métricas

El catálogo vive en [`src/data/metrics.js`](src/data/metrics.js) y es la **única
fuente de verdad**: de ahí salen las tablas, los gráficos y el formulario de
entrada de datos. Cambiar un nombre o una unidad se hace en un solo sitio.

Las métricas que ambas redes reportan comparten nombre; `sourceLabel` guarda cómo
se llama en cada app para que quien introduce los datos sepa qué copiar.

**Comunes a Instagram y TikTok** — Vizualizări totale · Vizite pe profil ·
Urmăritori totali · Urmăritori câștigați net · Interacțiuni totale · Aprecieri ·
Comentarii · Distribuiri.

**Solo Instagram** — % de visualizaciones de seguidores y de no seguidores · %
por postări / Reels / Stories · Atingeri pe link · Salvări · desglose de me gusta
y compartidos por postări y Reels · Abonări y Dezabonări por separado · Conținut
distribuit.

**Solo TikTok** — Vizualizări din „Pentru tine" y din căutare · Spectatori totali
y Spectatori noi.

> **TikTok no publica altas y bajas por separado**, solo el neto. Todo gráfico
> que use `follows`/`unfollows` lleva la etiqueta **«Doar Instagram»** en el
> título. Nunca se suma un dato que solo reporta una red como si fuera el total.

### Porcentajes

Los porcentajes **no se guardan como porcentajes**: se guardan los recuentos y el
porcentaje se recalcula sobre el total del periodo. Promediar los porcentajes de
meses distintos daría cifras falsas. El formulario acepta el porcentaje tal como
lo da la app y lo convierte a recuento.

## Cómo se calcula el dinero

Las campañas son el origen del gasto: **la inversión mensual de una red es
exactamente la suma de sus campañas**, así que ningún coste puede descuadrar con
el detalle.

| Indicador | Fórmula | Qué significa |
|---|---|---|
| **Cost pe urmăritor plătit** | `investiție ÷ urmăritori din campanii` | El CPA real de la publicidad |
| **Cost pe urmăritor net** | `investiție ÷ creștere netă` | Lo que cuesta cada seguidor que de verdad se queda |
| **CPM** | `investiție ÷ afișări × 1000` | Coste por mil impresiones (impresiones, no alcance) |
| **CPC** | `investiție ÷ clicuri` | |
| **CTR** | `clicuri ÷ afișări` | |
| **Rată de interacțiune** | `interacțiuni ÷ vizualizări` | |
| **Rată de creștere** | `creștere netă ÷ comunitate la inicio del periodo` | |

Todos los ratios se calculan **sobre totales ya sumados**, nunca promediando los
ratios mensuales. `npm run check:data` comprueba exactamente eso, entre otras 12
verificaciones (cuadre de campañas, continuidad de la comunidad entre meses,
que un saldo no se sume, que una métrica de una sola red no se agregue como si
fuera de las dos…).

## Comparativas honestas

- Un periodo **en curso no se compara** contra uno cerrado: el trimestre o el año
  incompleto muestra «fără comparație».
- Las cifras interanuales **recortan el año previo** al mismo número de meses que
  lleva el año en curso.
- Todo gráfico con relleno (barras, áreas) tiene la **línea base en cero**.
- **Un solo eje** por gráfico. Nunca dos escalas.

## Colores

| Rol | Valor | Uso |
|---|---|---|
| Primario | `#ffffff` | fondo de todas las superficies |
| Secundario | `#465564` (`ink-600`) | barra lateral, texto, ejes; escala `ink-50…900` |
| Terciario | `#13ff00` (`neon-400`) | acento — solo sobre `ink-600/700`, donde contrasta |

El verde neón no se usa como color de dato: sobre blanco tiene 1,3:1 de
contraste. Las series usan una paleta derivada de la marca, validada con los seis
controles de la guía de visualización (banda de luminosidad, croma, separación
bajo protanopia/deuteranopia, umbral de visión normal y contraste sobre blanco):

- **Redes** — Instagram `#12a147`, TikTok `#2f6f9f`
- **Altas / bajas** — `#12a147` / `#7a52c4` (verde↔ámbar colapsa en deuteranopía)
- **Formatos (3 series)** — `#00a0a0`, `#7a52c4`, `#c9701f`
- **Composición (4 series)** — `#2f6f9f`, `#c9701f`, `#00a0a0`, `#7a52c4`

El color va pegado a la entidad, no a su posición: filtrar redes no repinta las
que quedan visibles.

## Exportar a CSV

Cada gráfico con vista de tabla y cada tarjeta de tabla llevan un botón de
descarga. El archivo sale pensado para abrirse directo en Excel con
configuración rumana o española:

- separador `;`, porque la coma es el separador decimal;
- **números en crudo** con coma decimal y sin unidad ni miles, para que Excel los
  reconozca como números y se puedan sumar — la unidad va en la cabecera
  (`Investiție (€)`, `CTR (0-1)`);
- BOM UTF-8, para que las diacríticas rumanas no salgan rotas.

Las columnas que son solo interfaz (el botón de editar) se excluyen, y las que
pintan un componente (red, estado) exportan su texto. Ver
[`exportCsv.js`](src/data/exportCsv.js).

## Entrada de datos

Dos formularios, ambos con **el guardado desactivado a propósito** hasta que se
conecte Supabase. La validación y los cálculos derivados ya funcionan, así que el
esquema que necesitarán las tablas queda definido.

**«Adaugă date»** (barra superior) — estadísticas mensuales de una red, con
exactamente los campos que reporta cada app en su orden, y avisos de coherencia
(que los porcentajes sumen 100 %, que estén entre 0 y 100…).

**«Campanie nouă»** y el lápiz de cada fila (sección Campanii) — alta y edición
de campañas: ficha (nombre, red, objetivo, mes, periodo), resultados del
administrador de anuncios (inversión, afișări, alcance, clics, seguidores) y
**estado**: Planificată · Activă · În pauză · Finalizată. Muestra en vivo el CTR,
CPC, CPM, coste por seguidor y frecuencia que salen de las cifras introducidas, y
avisa de incoherencias (clics por encima de afișări, seguidores por encima de
clics, gasto en una campaña aún planificada…). La sección se puede filtrar
también por estado.

Los objetivos y estados viven en [`campaigns.js`](src/data/campaigns.js), y de
ahí los leen el generador de datos, el listado y el formulario.

Ambos paneles usan [`Drawer.jsx`](src/components/ui/Drawer.jsx), que se encarga
de lo que un diálogo modal debe hacer: cerrar con `Escape`, llevar el foco
dentro al abrirse, no dejar que el tabulador se escape al fondo, devolverlo a
quien lo abrió al cerrar y bloquear el scroll de la página mientras está
abierto.

### Conectar Supabase

El esquema está en [`supabase/migrations`](supabase/migrations). Se pega entero
en **SQL Editor → Run** y crea:

- `campaigns` — una fila por campaña, con restricciones que impiden cifras
  imposibles (menos clics que impresiones, menos seguidores que clics…).
- `monthly_stats` — una fila por red y mes, con lo que se copia de cada app.
  Una restricción por red verifica que estén sus campos y ninguno del otro.
- `monthly_metrics` — la vista que lee el panel. Calcula aquí todo lo deducible
  en vez de guardarlo dos veces: los totales de interacciones, la comunidad al
  inicio del mes y **el gasto mensual, que siempre es la suma de las campañas de
  ese mes**. Así el detalle y el resumen no pueden contradecirse.

Después, copia `.env.example` a `.env.local` y rellena los dos valores de
**Project Settings → API**:

```
VITE_SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=la clave anon public
```

`.env.local` está en el `.gitignore`. Nunca pongas ahí la clave `service_role`:
se salta las reglas de seguridad y en una app de navegador quedaría a la vista.

### De dónde lee el panel

[`dataset.js`](src/data/dataset.js) decide el origen y lo publica a React con
`useSyncExternalStore`:

| Situación | Qué se muestra |
|---|---|
| Sin `.env.local` | Datos de demostración |
| Base de datos vacía | Datos de demostración |
| Consulta fallida | Datos de demostración, con el aviso cambiado a advertencia |
| Con datos | Los datos reales |

El aviso fijo de la esquina **cambia de texto según el origen**: solo dice que
las cifras son inventadas cuando de verdad lo son.

Dos detalles del traductor ([`fromDatabase.js`](src/data/fromDatabase.js)): los
meses pasan de 1-12 a 0-11, y **un mes al que le falte una red no se muestra**
— rellenarla con ceros inventaría cifras y daría saltos falsos en los gráficos.
Esos meses se cuentan en el aviso.

### Guardar desde el panel

Los dos formularios siguen con el botón desactivado. Ahora que las tablas
existen, activarlos es escribir el `insert`/`update` correspondiente en
[`DataEntryDrawer.jsx`](src/components/entry/DataEntryDrawer.jsx) y
[`CampaignDrawer.jsx`](src/components/entry/CampaignDrawer.jsx). Antes hay que
decidir cómo entra la gente: las políticas de seguridad solo dejan escribir a
usuarios con sesión iniciada, y el panel todavía no tiene login.

## Estructura

```
src/
  lib/
    supabase.js     cliente, o null si no hay .env.local
  data/
    metrics.js      catálogo de métricas y campos del formulario
    networks.js     redes, su color fijo y las paletas validadas
    campaigns.js    objetivos y estados de campaña
    calendar.js     meses en rumano
    demoData.js     generador determinista de datos de demostración
    fromDatabase.js traduce las filas de Supabase a la forma del panel
    dataset.js      decide el origen de los datos y lo publica a React
    selectors.js    agregación mensual / trimestral / anual + formato ro-RO
    exportCsv.js    volcado a CSV de cualquier tabla
    navigation.js   secciones del panel
  components/
    entry/          formularios de datos mensuales y de campañas
    layout/         barra lateral, barra superior, logo, aviso de pruebas
    ui/             Drawer, Card, StatTile, DeltaBadge, Sparkline, tablas, filtros
    charts/         ChartFrame + tipos de gráfico + tema común de ejes y marcas
  views/            una por sección
scripts/
  check-data.mjs    13 verificaciones de coherencia de los cálculos
supabase/
  migrations/       el esquema de la base de datos
```

El logo está en `public/logo.png`.
