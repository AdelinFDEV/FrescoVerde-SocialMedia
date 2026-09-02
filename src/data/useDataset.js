import { useSyncExternalStore } from 'react'
import { getSnapshot, subscribe } from './dataset'

/** Conecta el almacén de datos (externo a React) con los componentes. */
export default function useDataset() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
