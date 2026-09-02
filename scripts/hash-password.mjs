import { createHash } from 'node:crypto'
import { createInterface } from 'node:readline'

/**
 * Genera la huella de la contraseña de acceso.
 *
 *   npm run hash-password
 *
 * La contraseña se escribe aquí, en el terminal, y no sale de esta máquina:
 * lo único que se copia a Vercel es la huella. Tiene que coincidir con lo que
 * calcula `src/lib/accessGate.js`.
 */
const SALT = 'frescoverde-panou-2026'

const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true })

// Oculta lo que se teclea, como hace cualquier terminal al pedir una contraseña.
const mute = () => {
  rl.output.write('Contraseña: ')
  rl._writeToOutput = (s) => {
    if (s.includes('Contraseña:')) rl.output.write(s)
  }
}

mute()

rl.question('', (password) => {
  rl.output.write('\n')
  rl.close()

  const clean = password.trim()
  if (!clean) {
    console.error('\nNo se ha introducido ninguna contraseña.')
    process.exit(1)
  }
  if (clean.length < 8) {
    console.error('\nUsa al menos 8 caracteres: esta pantalla es una cortina, no conviene')
    console.error('que además la contraseña sea trivial.')
    process.exit(1)
  }

  const hash = createHash('sha256').update(`${SALT}:${clean}`).digest('hex')

  console.log('\nCopia esto en Vercel → Settings → Environment Variables:\n')
  console.log('  Nombre:  VITE_ACCESS_PASSWORD_HASH')
  console.log(`  Valor:   ${hash}\n`)
  console.log('Después vuelve a desplegar: Vite mete las variables al construir,')
  console.log('así que un despliegue que ya existe no las coge.\n')
})
