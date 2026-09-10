import { monthMeta } from './calendar'
import { NETWORK_BY_ID } from './networks'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

/**
 * Notas: el contexto que las cifras no cuentan.
 *
 * Van aparte del resto de datos y se leen a demanda, no en la carga inicial:
 * el panel tiene que poder enseñar las cifras aunque las notas fallen.
 */

const AUTHOR_KEY = 'frescoverde:autor'

/** El nombre de quien escribe se recuerda para no teclearlo cada vez. */
export function readAuthor() {
  try {
    return localStorage.getItem(AUTHOR_KEY) ?? ''
  } catch {
    return ''
  }
}

export function rememberAuthor(author) {
  try {
    localStorage.setItem(AUTHOR_KEY, author)
  } catch {
    // Sin almacenamiento hay que escribirlo cada vez; nada se rompe.
  }
}

function fromRow(row) {
  const hasPeriod = row.year != null && row.month != null
  return {
    id: row.id,
    body: row.body,
    author: row.author,
    networkId: row.network,
    networkName: row.network ? NETWORK_BY_ID[row.network]?.name : null,
    year: row.year,
    // En la base de datos los meses van de 1 a 12; en el panel, de 0 a 11.
    month: row.month == null ? null : row.month - 1,
    periodLabel: hasPeriod ? monthMeta(row.year, row.month - 1).longLabel : null,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    edited: row.updated_at !== row.created_at,
  }
}

export async function fetchNotes() {
  if (!isSupabaseConfigured) return { notes: [], error: 'no-config' }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('active', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return { notes: [], error: error.message }
  return { notes: (data ?? []).map(fromRow), error: null }
}

/** Fila lista para guardar. Los campos vacíos van a `null`, no a cadena vacía. */
function toRow({ body, author, networkId, year, month }) {
  return {
    body: body.trim(),
    author: author.trim(),
    network: networkId || null,
    year: year ?? null,
    month: month == null ? null : month + 1,
  }
}

export async function createNote(note) {
  const { error } = await supabase.from('notes').insert(toRow(note))
  return error
}

export async function updateNote(id, note) {
  const { error } = await supabase.from('notes').update(toRow(note)).eq('id', id)
  return error
}

/**
 * Activa o desactiva una nota.
 *
 * Desactivar no la borra ni la esconde: sigue en la lista, apagada. Una nota
 * que explica por qué cayó un mes sigue explicándolo aunque ya no aplique.
 */
export async function setNoteActive(id, active) {
  const { error } = await supabase.from('notes').update({ active }).eq('id', id)
  return error
}
