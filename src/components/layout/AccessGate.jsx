import { useState } from 'react'
import { Loader2, Lock } from 'lucide-react'
import { checkPassword, hasAccess, isGateEnabled, rememberAccess } from '../../lib/accessGate'
import Logo from './Logo'

/**
 * Pantalla de contraseña previa al panel.
 *
 * Sin `VITE_ACCESS_PASSWORD_HASH` configurado no aparece, para que el
 * desarrollo local no pida nada. Ver `accessGate.js` para qué protege de
 * verdad — y qué no.
 */
export default function AccessGate({ children }) {
  const [unlocked, setUnlocked] = useState(() => !isGateEnabled || hasAccess())
  const [password, setPassword] = useState('')
  const [state, setState] = useState('idle')

  if (unlocked) return children

  async function submit(event) {
    event.preventDefault()
    setState('checking')

    if (await checkPassword(password)) {
      rememberAccess()
      setUnlocked(true)
      return
    }

    setState('wrong')
    setPassword('')
  }

  return (
    <div className="grid min-h-full place-items-center bg-ink-600 px-5 py-10">
      <div className="w-full max-w-sm animate-rise">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-white p-1">
            <Logo size={30} />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">FrescoVerde</p>
            <p className="text-xs text-ink-200">Panou rețele sociale</p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 rounded-2xl bg-white p-6 shadow-2xl">
          <span className="grid size-9 place-items-center rounded-xl bg-ink-50 text-ink-600">
            <Lock size={17} strokeWidth={2.3} />
          </span>

          <h1 className="mt-3 text-lg font-semibold tracking-tight text-ink-900">Panou intern</h1>
          <p className="mt-1 text-sm leading-relaxed text-ink-500">
            Introdu parola de acces pentru a vedea statisticile.
          </p>

          <label className="mt-5 block">
            <span className="text-sm font-medium text-ink-800">Parolă</span>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setState('idle')
              }}
              autoFocus
              autoComplete="current-password"
              className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition-colors focus:border-ink-600"
            />
          </label>

          {state === 'wrong' ? (
            <p className="mt-2.5 text-sm font-medium text-[#5b3a9e]">Parolă greșită. Încearcă din nou.</p>
          ) : null}

          <button
            type="submit"
            disabled={!password || state === 'checking'}
            className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              password && state !== 'checking'
                ? 'bg-ink-600 text-white hover:bg-ink-700'
                : 'cursor-not-allowed bg-ink-200 text-ink-500'
            }`}
          >
            {state === 'checking' ? <Loader2 size={15} strokeWidth={2.6} className="animate-spin" /> : null}
            Intră
          </button>
        </form>

        <p className="mt-4 text-center text-xs leading-relaxed text-ink-200">
          Versiune de test · date pentru uz intern
          <br />
          Realizat de George Adelin
        </p>
      </div>
    </div>
  )
}
