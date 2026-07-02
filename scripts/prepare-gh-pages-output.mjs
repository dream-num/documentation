import { cp, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const outDir = 'out'
const defaultLocaleDir = join(outDir, 'en-US')
const githubPagesBasePath = '/documentation/v0.25'
const textExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.txt',
  '.xml',
])

async function assertDirectory(path) {
  const info = await stat(path)
  if (!info.isDirectory()) {
    throw new Error(`${path} is not a directory`)
  }
}

await assertDirectory(outDir)
await assertDirectory(defaultLocaleDir)

async function rewriteAbsoluteAssetPaths(path) {
  const info = await stat(path)
  if (info.isDirectory()) {
    for (const entry of await readdir(path)) {
      await rewriteAbsoluteAssetPaths(join(path, entry))
    }
    return
  }

  const extension = path.slice(path.lastIndexOf('.'))
  if (!textExtensions.has(extension)) {
    return
  }

  const original = await readFile(path, 'utf8')
  const updated = original.replaceAll('/assets/', `${githubPagesBasePath}/assets/`)

  if (updated !== original) {
    await writeFile(path, updated)
  }
}

for (const entry of await readdir(defaultLocaleDir)) {
  await cp(join(defaultLocaleDir, entry), join(outDir, entry), {
    recursive: true,
    force: true,
  })
}

await rewriteAbsoluteAssetPaths(outDir)
await writeFile(join(outDir, '.nojekyll'), '')
