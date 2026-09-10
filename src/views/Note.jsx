import { useEffect, useState } from 'react'
import { Check, Loader2, Pencil, Plus, StickyNote, TriangleAlert } from 'lucide-react'
import Card from '../components/ui/Card'
import ChipGroup from '../components/ui/ChipGroup'
import { MONTH_LABELS_LONG, yearOptions } from '../data/calendar'
import { NETWORKS, NETWORK_BY_ID } from '../data/networks'
import { createNote, fetchNotes, readAuthor, rememberAuthor, setNoteActive, updateNote } from '../data/notes'
import useDataset from '../data/useDataset'
import { isSupabaseConfigured } from '../lib/supabase'

const FILTERS = [
  { value: 'toate', label: 'Toate' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Dezactivate' },
]

const inputClass =
  'w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-base text-ink-900 outline-none transition-colors focus:border-ink-600 sm:text-sm'

const selectClass =
  'min-h-11 rounded-lg border border-ink-200 bg-white px-2.5 text-base text-ink-800 outline-none focus:border-ink-600 sm:min-h-0 sm:py-1.5 sm:text-sm'

const fmtDate = (iso) =>
  new Intl.DateTimeFormat('ro-RO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))

/** Las etiquetas de una nota: quién, cuándo, y a qué se refiere si se ató. */
function Tags({ note }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-400">
      <span className="font-medium text-ink-500">{note.author}</span>
      <span aria-hidden="true">·</span>
      <span>{fmtDate(note.createdAt)}</span>
      {note.edited ? <span className="text-ink-300">(modificată)</span> : null}

      {note.networkId ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-50 px-2 py-0.5 font-medium text-ink-600">
          <span
            className="size-2 rounded-full"
            style={{ background: NETWORK_BY_ID[note.networkId].hex }}
            aria-hidden="true"
          />
          {note.networkName}
        </span>
      ) : null}

      {note.periodLabel ? (
        <span className="rounded-full bg-ink-50 px-2 py-0.5 font-medium text-ink-600">
          {note.periodLabel}
        </span>
      ) : null}
    </div>
  )
}

export default function Note() {
  const { months } = useDataset()
  const years = yearOptions([...new Set(months.map((m) => m.year))])

  const [notes, setNotes] = useState([])
  const [state, setState] = useState('loading')
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('toate')

  const [body, setBody] = useState('')
  const [author, setAuthor] = useState(readAuthor)
  const [networkId, setNetworkId] = useState('')
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [saving, setSaving] = useState(false)

  // Edición en el sitio: sin borrado, corregir una errata tiene que ser fácil.
  const [editingId, setEditingId] = useState(null)
  const [editBody, setEditBody] = useState('')

  async function reload() {
    const { notes: loaded, error: err } = await fetchNotes()
    setNotes(loaded)
    setError(err === 'no-config' ? null : err)
    setState('ready')
  }

  // Traer las notas al abrir la sección: sincronizar con la base de datos es
  // justo el caso para el que existe el efecto.
  useEffect(() => {
    let gone = false
    fetchNotes().then(({ notes: loaded, error: err }) => {
      if (gone) return
      setNotes(loaded)
      setError(err === 'no-config' ? null : err)
      setState('ready')
    })
    return () => {
      gone = true
    }
  }, [])

  async function add() {
    if (!body.trim() || !author.trim()) return
    setSaving(true)

    const err = await createNote({
      body,
      author,
      networkId,
      year: year === '' ? null : Number(year),
      month: month === '' ? null : Number(month),
    })

    setSaving(false)
    if (err) {
      setError(err.message ?? String(err))
      return
    }

    rememberAuthor(author.trim())
    setBody('')
    setNetworkId('')
    setYear('')
    setMonth('')
    setError(null)
    reload()
  }

  async function toggle(note) {
    const err = await setNoteActive(note.id, !note.active)
    if (err) setError(err.message ?? String(err))
    else reload()
  }

  async function saveEdit(note) {
    if (!editBody.trim()) return
    const err = await updateNote(note.id, { ...note, body: editBody })
    if (err) setError(err.message ?? String(err))
    else {
      setEditingId(null)
      reload()
    }
  }

  const visible = notes.filter((n) =>
    filter === 'active' ? n.active : filter === 'inactive' ? !n.active : true,
  )
  const activeCount = notes.filter((n) => n.active).length

  if (!isSupabaseConfigured) {
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <p className="text-sm text-ink-500">
          Baza de date nu este configurată, așa că notele nu se pot salva.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      {/* ---- Añadir ------------------------------------------------------ */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-base font-semibold tracking-tight text-ink-900">Notă nouă</h2>
        <p className="mt-0.5 text-sm text-ink-500">
          Idei, ce s-a schimbat și de ce, ce rămâne de făcut.
        </p>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Ce vrei să reții despre proiect…"
          className={`${inputClass} mt-4 resize-y`}
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Numele tău"
            aria-label="Numele tău"
            className={`${selectClass} w-40`}
          />

          {/* Opcional: la mayoría de las notas hablan del proyecto en general. */}
          <select
            value={networkId}
            onChange={(e) => setNetworkId(e.target.value)}
            aria-label="Rețea (opțional)"
            className={selectClass}
          >
            <option value="">Fără rețea</option>
            {NETWORKS.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>

          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            aria-label="Luna (opțional)"
            className={selectClass}
          >
            <option value="">Fără lună</option>
            {MONTH_LABELS_LONG.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            aria-label="An (opțional)"
            className={selectClass}
          >
            <option value="">Fără an</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={add}
            disabled={!body.trim() || !author.trim() || saving}
            className={`ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold transition-colors sm:min-h-0 sm:py-2 ${
              body.trim() && author.trim() && !saving
                ? 'bg-ink-600 text-white hover:bg-ink-700'
                : 'cursor-not-allowed bg-ink-200 text-ink-500'
            }`}
          >
            {saving ? (
              <Loader2 size={15} strokeWidth={2.6} className="animate-spin" />
            ) : (
              <Plus size={15} strokeWidth={2.6} className={body.trim() ? 'text-neon-400' : ''} />
            )}
            Adaugă nota
          </button>
        </div>

        {/* Un mes sin año no identifica nada: la base de datos lo rechaza. */}
        {month !== '' && year === '' ? (
          <p className="mt-2 text-sm text-[#5b3a9e]">Dacă alegi o lună, alege și anul.</p>
        ) : null}

        {error ? (
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-[#e2d5f5] bg-[#f7f3fd] px-3.5 py-3">
            <TriangleAlert size={16} strokeWidth={2.2} className="mt-0.5 shrink-0 text-[#5b3a9e]" />
            <p className="text-sm leading-relaxed text-[#5b3a9e]">{error}</p>
          </div>
        ) : null}
      </Card>

      {/* ---- Lista ------------------------------------------------------- */}
      <Card className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-5">
        <ChipGroup label="Stare" options={FILTERS} value={filter} onChange={setFilter} />
        <span className="ml-auto text-xs text-ink-400">
          {activeCount} active din {notes.length}
        </span>
      </Card>

      {state === 'loading' ? (
        <p className="py-8 text-center text-sm text-ink-400">Se încarcă notele…</p>
      ) : !visible.length ? (
        <Card className="mx-auto max-w-lg p-8 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-2xl bg-ink-50 text-ink-500">
            <StickyNote size={20} strokeWidth={2.2} />
          </span>
          <p className="mt-3 text-sm text-ink-500">
            {notes.length ? 'Nicio notă cu acest filtru.' : 'Încă nu există note.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map((note, i) => (
            <Card
              key={note.id}
              delay={i * 40}
              // Desactivada sigue a la vista, apagada: no desaparece.
              className={`p-4 sm:p-5 ${note.active ? '' : 'border-dashed bg-ink-50/60'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {editingId === note.id ? (
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={3}
                      className={`${inputClass} resize-y`}
                    />
                  ) : (
                    <p
                      className={`whitespace-pre-wrap text-sm leading-relaxed ${
                        note.active ? 'text-ink-800' : 'text-ink-400'
                      }`}
                    >
                      {note.body}
                    </p>
                  )}
                  <div className="mt-2">
                    <Tags note={note} />
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {editingId === note.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="min-h-11 rounded-lg border border-ink-200 px-3 text-xs font-medium text-ink-600 transition-colors hover:bg-ink-50 sm:min-h-0 sm:px-2.5 sm:py-1.5"
                      >
                        Anulează
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit(note)}
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-ink-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-ink-700 sm:min-h-0 sm:px-2.5 sm:py-1.5"
                      >
                        <Check size={13} strokeWidth={2.6} />
                        Salvează
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(note.id)
                          setEditBody(note.body)
                        }}
                        aria-label={`Editează nota lui ${note.author}`}
                        className="grid min-h-11 min-w-11 place-items-center rounded-lg border border-ink-100 text-ink-400 transition-colors hover:border-ink-200 hover:text-ink-800 sm:min-h-0 sm:min-w-0 sm:p-1.5"
                      >
                        <Pencil size={14} strokeWidth={2.2} />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggle(note)}
                        aria-pressed={note.active}
                        className={`min-h-11 whitespace-nowrap rounded-full px-3 text-xs font-semibold transition-colors sm:min-h-0 sm:px-2.5 sm:py-1 ${
                          note.active
                            ? 'bg-neon-050 text-[#0b7a35] hover:opacity-80'
                            : 'bg-ink-100 text-ink-500 hover:bg-ink-200'
                        }`}
                      >
                        {note.active ? 'Activă' : 'Dezactivată'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
