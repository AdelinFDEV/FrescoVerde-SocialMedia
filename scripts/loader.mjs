import { existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
export function resolve(specifier, context, next) {
  if (specifier.startsWith('.') && !specifier.endsWith('.js')) {
    const base = new URL(specifier, context.parentURL)
    const withExt = new URL(base.href + '.js')
    if (existsSync(fileURLToPath(withExt))) return next(withExt.href, context)
  }
  return next(specifier, context)
}
void pathToFileURL
