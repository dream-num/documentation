/* eslint-disable no-await-in-loop -- Build only explicit selections, one process at a time. */
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

import { readShowcaseSources } from './showcase-sources.mjs'

// Reuse exact installed versions without changing the repository lockfile.
// This verifies exported builds, not a clean package-manager installation.
const slugs = [...new Set(process.argv.slice(2))]
assert.ok(slugs.length, 'Pass explicit registered demo slugs; never build the whole catalog')
const sources = await readShowcaseSources()
for (const slug of slugs)
  assert.ok(
    sources.some((source) => source.slug === slug),
    `Unknown demo: ${slug}`,
  )
const parent = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results')
await fs.mkdir(parent, { recursive: true })
const output = await fs.mkdtemp(path.join(parent, 'selected-export-builds-'))
const manifest = []
console.log(`Evidence: ${output}`)
for (const slug of slugs) {
  const source = sources.find((entry) => entry.slug === slug)
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'univer-selected-export-'))
  const entry = { slug, directory, passed: false, dependencyMode: 'exact-version-local-junctions', links: [] }
  manifest.push(entry)
  try {
    for (const [name, content] of Object.entries(source.files)) {
      assert.ok(name.startsWith('/'), 'Export paths must be root-relative')
      const target = path.resolve(directory, name.slice(1))
      assert.ok(target.startsWith(directory + path.sep), 'Export stays inside its fresh directory')
      await fs.mkdir(path.dirname(target), { recursive: true })
      await fs.writeFile(target, content)
    }
    const pkg = JSON.parse(source.files['/package.json'])
    for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
      const target =
        name === 'vite' && process.env.SHOWCASE_VITE_DIR
          ? path.resolve(process.env.SHOWCASE_VITE_DIR)
          : path.resolve('node_modules', name)
      const installed = JSON.parse(await fs.readFile(path.join(target, 'package.json'), 'utf8'))
      assert.equal(installed.version, version, `${name}: exact exported dependency version`)
      const destination = path.resolve(directory, 'node_modules', name)
      assert.ok(destination.startsWith(path.join(directory, 'node_modules') + path.sep))
      await fs.mkdir(path.dirname(destination), { recursive: true })
      await fs.symlink(target, destination, 'junction')
      entry.links.push({ name, version, target })
    }
    const result = spawnSync(process.execPath, [path.join(directory, 'node_modules/vite/bin/vite.js'), 'build'], {
      cwd: directory,
      encoding: 'utf8',
      timeout: 180000,
      maxBuffer: 8 * 1024 * 1024,
      windowsHide: true,
    })
    await fs.writeFile(path.join(output, slug.replaceAll('/', '-') + '.log'), result.stdout + result.stderr)
    if (result.error) throw result.error
    assert.equal(result.status, 0, `${slug}: exported Vite build must succeed; inspect log`)
    entry.passed = true
  } catch (error) {
    entry.failure = error.stack || String(error)
  }
  await fs.writeFile(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(JSON.stringify(entry))
}
assert.ok(
  manifest.every((entry) => entry.passed),
  'Every selected export must build',
)
