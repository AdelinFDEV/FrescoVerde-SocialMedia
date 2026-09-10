import useDataset from '../../data/useDataset'

/**
 * Aviso permanente de estado, siempre visible.
 *
 * En el móvil va clavado al borde inferior de la pantalla y no se mueve nunca;
 * en escritorio se retira al hueco libre de la barra lateral. Queda por debajo
 * de los formularios modales (z-40 frente a z-50).
 *
 * La luz de la izquierda dice de un vistazo si el panel está sano: verde
 * cuando la base de datos responde y las cifras cuadran, ámbar cuando hay algo
 * que revisar, rojo cuando no se ha podido cargar. No es un adorno — se
 * calcula del mismo estado con el que se dibujan los gráficos.
 */

const GREEN = '#13ff00'
const AMBER = '#ffd9a0'
const RED = '#ff8f9e'

function estado({ error, months, incomplete, inconsistent }) {
  if (error)
    return {
      light: RED,
      title: 'Baza de date nu răspunde',
      body: 'Reîncarcă pagina pentru a încerca din nou.',
      short: 'Baza de date nu răspunde.',
    }

  // Cifras que no encajan de un mes al siguiente: los porcentajes saldrían
  // mal en silencio, así que la luz deja de estar verde.
  if (inconsistent.length)
    return {
      light: AMBER,
      title: 'De verificat',
      body:
        inconsistent.length === 1
          ? `Cifrele din ${inconsistent[0].longLabel} (${inconsistent[0].network}) nu se leagă de luna precedentă.`
          : `${inconsistent.length} luni nu se leagă de luna precedentă. Verifică urmăritorii totali.`,
      short:
        inconsistent.length === 1
          ? '1 lună nu se leagă de cea precedentă.'
          : `${inconsistent.length} luni nu se leagă de cele precedente.`,
    }

  // Un mes con datos de una sola red no se muestra: mezclarlo con los
  // completos daría saltos falsos en los gráficos.
  if (incomplete.length)
    return {
      light: AMBER,
      title: 'De completat',
      body:
        incomplete.length === 1
          ? 'O lună are date doar pentru o rețea și nu se afișează.'
          : `${incomplete.length} luni au date doar pentru o rețea și nu se afișează.`,
      short:
        incomplete.length === 1
          ? '1 lună incompletă, neafișată.'
          : `${incomplete.length} luni incomplete, neafișate.`,
    }

  if (!months.length)
    return {
      light: GREEN,
      title: 'Totul funcționează corect',
      body: 'Baza de date răspunde. Încă nu există luni înregistrate.',
      short: 'Conectat. Fără luni înregistrate încă.',
    }

  return {
    light: GREEN,
    title: 'Totul funcționează corect',
    body: `Baza de date răspunde și cifrele se leagă. ${months.length} ${
      months.length === 1 ? 'lună înregistrată' : 'luni înregistrate'
    }.`,
    short: `Conectat · ${months.length} ${months.length === 1 ? 'lună' : 'luni'}`,
  }
}

export default function DemoNotice() {
  const data = useDataset()
  const { light, title, body, short } = estado(data)
  const verde = light === GREEN

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-label="Starea panoului"
      // Clavado al borde de abajo. `transform-gpu` lo sube a su propia capa:
      // en iOS, un elemento fijo que comparte capa con la página tiembla
      // mientras el scroll tiene inercia.
      className="fixed inset-x-0 bottom-0 z-40 transform-gpu sm:inset-x-auto sm:bottom-5 sm:right-5 sm:max-w-sm lg:bottom-4 lg:left-4 lg:right-auto lg:w-52"
    >
      {/* El relleno de zona segura va DENTRO de la caja oscura, no debajo: si
          fuera del recuadro, al esconder Safari su barra inferior el hueco que
          aparece (el del indicador de inicio) se vería transparente. */}
      <div className="flex items-start gap-3 border-t border-ink-600 bg-ink-700 px-4 pb-[calc(0.625rem+env(safe-area-inset-bottom))] pt-2.5 text-white shadow-[0_-4px_20px_-8px_rgba(28,35,43,0.45)] sm:rounded-2xl sm:border sm:pb-3 sm:pt-3 sm:shadow-[0_16px_40px_-16px_rgba(28,35,43,0.55)] lg:flex-col lg:gap-2 lg:shadow-none">
        {/* La luz: un punto lleno con un halo que late solo cuando está verde. */}
        <span className="relative mt-1 grid size-3 shrink-0 place-items-center lg:mt-0">
          {verde ? (
            // El halo late sin parar dentro de una barra fija: se anima solo
            // con transform y opacity, y en su propia capa, para que cada
            // fotograma no obligue a repintar la barra entera al desplazarse.
            <span
              className="absolute inset-0 rounded-full opacity-60 will-change-[transform,opacity]"
              style={{ background: light, animation: 'puls 2s ease-out infinite' }}
              aria-hidden="true"
            />
          ) : null}
          <span
            className="relative size-2.5 rounded-full"
            style={{ background: light, boxShadow: `0 0 8px ${light}` }}
            aria-hidden="true"
          />
        </span>

        <div className="min-w-0">
          <p className="text-xs font-semibold sm:text-sm" style={{ color: light }}>
            {title}
          </p>
          {/* En el móvil el aviso es una barra fija: si ocupa cuatro líneas se
              come la pantalla, así que ahí va el texto corto. */}
          <p className="mt-0.5 text-xs leading-relaxed text-ink-100 sm:text-sm lg:text-xs">
            <span className="sm:hidden">{short}</span>
            <span className="hidden sm:inline">{body}</span>
          </p>

          <p className="mt-1 text-[11px] font-medium text-ink-300 sm:mt-1.5 sm:text-xs">
            Versiune de test · uz intern · George Adelin
          </p>
        </div>
      </div>

      <style>{`@keyframes puls { 0% { transform: scale(1); opacity: .6 } 70%, 100% { transform: scale(2.2); opacity: 0 } }`}</style>
    </aside>
  )
}
