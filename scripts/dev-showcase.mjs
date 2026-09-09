import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import scopeLoader from './showcase-scope-loader.cjs'

const slugs = [...new Set(process.argv.slice(2))]
// Validate before launching a server; misspellings must not silently compile the full catalog.
scopeLoader.filterRegistry(fs.readFileSync('showcase/data.ts', 'utf8'), slugs)
await import('./generate-showcase-catalog.mjs')
const port = Number(process.env.SHOWCASE_PORT || 3030)
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('SHOWCASE_PORT must be a valid TCP port.')
console.log(`Developing only: ${slugs.join(', ')}`)
for (const slug of slugs) console.log(`http://localhost:${port}/en-US/playground/${slug}`)
const child = spawn(
  process.execPath,
  [path.resolve('node_modules/next/dist/bin/next'), 'dev', '--turbopack', '--port', String(port)],
  {
    stdio: 'inherit',
    env: { ...process.env, UNIVER_SHOWCASE_DEMOS: slugs.join(',') },
  },
)
child.on('error', (error) => {
  console.error(error)
  process.exitCode = 1
})
child.on('exit', (code) => {
  process.exitCode = code ?? 1
})
process.on('SIGINT', () => child.kill('SIGINT'))
process.on('SIGTERM', () => child.kill('SIGTERM'))
