import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export function readShowcaseFiles(importMetaUrl: string, files: Record<string, string>) {
  const directory = path.dirname(fileURLToPath(importMetaUrl))
  return Object.fromEntries(
    Object.entries(files).map(([name, relativePath]) => [
      name,
      fs.readFileSync(path.resolve(directory, relativePath), 'utf8'),
    ]),
  )
}
