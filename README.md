# FrescoVerde · Panou rețele sociale

Dashboard de Instagram y TikTok: crecimiento, audiencia, interacciones e
inversión publicitaria, mes a mes, con resumen trimestral y anual.

**La interfaz está íntegramente en rumano.** Los comentarios del código y este
README están en español.

```bash
npm run dev        # desarrollo
npm run build      # producción
npm run lint       # oxlint
npm run check      # verifica la coherencia y recalcula cada indicador aparte
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

## Los datos no se pierden nunca

Hay dos formas de perder un dato: borrar la fila, o pisarla con una corrección.
Las dos están cerradas.

**No se puede borrar.** El permiso de borrado está retirado a nivel de tabla, no
solo de política. Aunque mañana alguien creara una política de `delete` por
error, Postgres seguiría denegándolo. Borrar solo es posible desde el panel de
Supabase, donde hace falta iniciar sesión de verdad — tiene que existir una
forma de arreglar un desastre, pero no desde la web.

**Corregir no destruye.** Cada modificación guarda la fila anterior completa, en
JSON, en `monthly_stats_history` o `campaigns_history`, con su fecha. Si alguien
corrige una cifra, la anterior sigue ahí. Esas tablas son de solo lectura para
la aplicación: las escribe un disparador, y nadie puede modificarlas ni
vaciarlas.

Para ver el histórico de un mes, en el SQL Editor:

```sql
select changed_at, operation, previous
from monthly_stats_history
where stats_id = (
  select id from monthly_stats
  where network = 'instagram' and year = 2026 and month = 8
)
order by changed_at desc;
```

## Cómo se calcula cada estadística

**La regla que gobierna todo:** los ratios se calculan **sobre totales ya
sumados**, nunca promediando los ratios de cada mes. La media de los CPM
mensuales no es el CPM del año — pesa igual un mes de 500 € que uno de 5.000 €.

| Indicador | Fórmula | Detalle |
|---|---|---|
| **Comunitate** | último mes del periodo | Es un saldo: no se suma entre meses |
| **Creștere netă** | Σ `net_growth` | Instagram lo deduce de altas − bajas; TikTok lo publica |
| **Rată de creștere** | Σ `net_growth` ÷ comunidad al **inicio** del periodo | No al final: si no, un crecimiento del 100 % saldría como 50 % |
| **Rată de interacțiune** | Σ `interactions` ÷ Σ `views` | |
| **Interacțiuni** | aprecieri + comentarii + distribuiri + salvări | Instagram da las piezas; TikTok, los totales |
| **Rată vizite profil** | Σ `profile_visits` ÷ Σ `views` | |
| **Conversie în urmăritor** | Σ `net_growth` ÷ Σ `profile_visits` | |
| **Investiție** | Σ del gasto de las campañas del mes | Nunca un dato aparte |
| **Cost pe urmăritor plătit** | Σ `spend` ÷ Σ `followers_gained` | El CPA real de la publicidad |
| **Cost pe urmăritor net** | Σ `spend` ÷ Σ `net_growth` | `null` si el neto es cero o negativo |
| **CPM** | Σ `spend` × 1000 ÷ Σ `impressions` | Impresiones, no alcance |
| **CPC** | Σ `spend` ÷ Σ `clicks` | |
| **CTR** | Σ `clicks` ÷ Σ `impressions` | |

Toda división comprueba que el denominador sea mayor que cero; si no, devuelve
`null` y la interfaz muestra `—`. Nunca sale un `Infinity` ni un `NaN`
disfrazado de cifra.

### Cómo está verificado

`npm run check` corre dos comprobaciones distintas:

**`check:data`** — 13 verificaciones estructurales: que cada red publique
exactamente los campos de su catálogo, que el gasto de un mes sea la suma de sus
campañas, que la comunidad sea continua entre meses, que un saldo no se sume,
que una métrica de una sola red no se agregue como si fuera de las dos, y que el
traductor de Supabase no pierda ningún campo por un nombre mal escrito.

**`check:math`** — un **recálculo independiente**. Parte de los datos crudos y
calcula cada indicador a mano, sin usar ninguna función del panel, y compara las
dos vías en los tres años. Si una fórmula estuviera mal, las cifras no
coincidirían. Comprueba además la identidad que lo ata todo:

```
comunidad al final = comunidad al inicio + Σ crecimiento neto
```

y que los trimestres y el año den exactamente lo mismo que la suma de los meses.

### Lo que el panel vigila con datos reales

Los datos de demostración son perfectos por construcción; los reales no. Dos
avisos aparecen en la esquina cuando algo no encaja:

- **Un mes con datos de una sola red no se muestra.** Rellenar la que falta con
  ceros inventaría cifras y daría saltos falsos en los gráficos.
- **La comunidad tiene que encajar de un mes al siguiente**: los seguidores de
  un mes deben ser los del anterior más lo que creció. Si no cuadra, hay un mes
  sin registrar en medio o una cifra mal tecleada, y los porcentajes de
  crecimiento saldrían mal en silencio. El aviso dice qué mes y qué red.


## En el móvil

El panel se usa igual desde el teléfono, no es una versión recortada.

**La navegación va en un panel lateral.** Ocho secciones no caben en una fila
de pestañas sin convertirse en un carrusel que hay que arrastrar a ciegas, así
que en pantallas pequeñas el botón de menú abre la misma lista del escritorio,
con la descripción de cada sección. Reutiliza el mismo `Drawer` que los
formularios, con Escape, foco atrapado y scroll bloqueado.

**Los gráficos se adaptan de verdad, no solo se encogen.** El eje vertical se
estrecha (de 64 a 56 px: a menos, «220,0 K» sale cortado), las etiquetas del eje
horizontal muestran un mes de cada dos para que no se pisen, y la altura baja a
240 px para que quepa algo más en pantalla.

**Los controles son para el dedo**, no para el ratón: los filtros de mes, red y
estado suben a 40 px de alto. La cifra principal pasa de 52 a 40 px y el aviso
fijo de abajo usa un texto más corto, para no comerse la pantalla.

**Cada sección se carga cuando se abre.** Con recharts dentro, cargarlas todas
de golpe son cientos de kilobytes que en el móvil se notan. Siendo honestos: el
primer pintado solo baja de 257 a ~240 kB comprimidos, porque recharts entra
igual con el resumen; lo que sí cambia es que moverse entre secciones ya solo
descarga unos pocos kilobytes.
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

Dos formularios que **guardan en Supabase**. El mensual usa `upsert`: si el mes
ya existe lo actualiza en vez de fallar, y precarga lo guardado para que enviar
el formulario a medias no lo sobrescriba con huecos. El de campañas inserta o
actualiza según se venga de «Campanie nouă» o del lápiz de una fila.

Ninguno de los dos borra nunca. Los errores de la base de datos se traducen a
rumano llano: en vez del texto de Postgres, «Postări + Reels + Stories trebuie
să dea 100 %».

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

### Acceso sin login

El panel lo usan tres personas por un enlace privado y se decidió no poner
login, así que el acceso va con la clave pública. Conviene tenerlo claro: esa
clave viaja dentro del JavaScript de la página, así que **un enlace privado no
es una barrera de seguridad** — quien llegue a la web puede leerla y consultar
la base de datos por su cuenta.

Lo que sí se evita es que ese acceso destruya nada: `anon` puede leer, insertar
y actualizar, pero no borrar. Ver «Los datos no se pierden nunca».

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
    layout/         barra lateral, barra superior, navegación móvil, aviso
    ui/             Drawer, Card, StatTile, DeltaBadge, Sparkline, tablas, filtros
    charts/         ChartFrame + tipos de gráfico + tema común de ejes y marcas
  views/            una por sección
scripts/
  check-data.mjs    13 verificaciones de coherencia de los cálculos
  check-math.mjs    recálculo independiente de cada indicador
supabase/
  migrations/       el esquema de la base de datos
```

El logo está en `public/logo.png`.
