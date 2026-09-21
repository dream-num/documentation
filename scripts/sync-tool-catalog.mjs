import { existsSync, globSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

// Keep browser initialization choices aligned with the two SDK source repositories.
const installedRoot = process.argv[2]
if (!installedRoot)
  throw new Error(
    'Pass a node_modules directory containing the pinned SDK browser packages to verify published entry points.',
  )
const plugins = {}
const packages = []
const version = JSON.parse(readFileSync('package.json', 'utf8')).version
for (const repo of ['../univer', '../univer-pro']) {
  for (const manifest of globSync(`${repo}/packages/*/package.json`).toSorted()) {
    const directory = dirname(manifest)
    const pkg = JSON.parse(readFileSync(manifest, 'utf8'))
    if (pkg.private || ['@univerjs/slides', '@univerjs/slides-ui'].includes(pkg.name)) continue
    packages.push(pkg.name)
    const entryPath = `${directory}/src/index.ts`
    if (!existsSync(entryPath)) continue
    const entry = readFileSync(entryPath, 'utf8')
    const exports = [{ text: entry, names: [...entry.matchAll(/export class (Univer\w*Plugin)\b/g)].map((m) => m[1]) }]
    for (const match of entry.matchAll(/export\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g)) {
      const path = resolve(directory, 'src', `${match[2]}.ts`)
      if (existsSync(path))
        exports.push({
          text: readFileSync(path, 'utf8'),
          names: match[1]
            .split(',')
            .map((name) => name.trim())
            .filter((name) => /^Univer\w*Plugin$/.test(name)),
        })
    }
    for (const { text, names } of exports)
      for (const name of names) {
        if (/Remote|Worker|RPC|Node/.test(name)) continue
        const decorator = text.match(new RegExp(`@DependentOn\\(([^()]*)\\)\\s*export class ${name}\\b`))
        const dependencies = [...(decorator?.[1] ?? '').matchAll(/\b(Univer\w*Plugin)\b/g)].map((m) => m[1])
        plugins[name] = {
          package: pkg.name,
          dependencies,
          ...(existsSync(`${directory}/src/locale/en-US.ts`) ? { locale: true } : {}),
          ...(globSync(`${directory}/src/**/*.css`).length ? { css: true } : {}),
          ...(existsSync(`${directory}/src/facade/index.ts`) ? { facade: true } : {}),
        }
      }
  }
}
// Shape hosts also need Drawing's image IO provider, which is registered by examples
// outside the plugin decorator dependencies.
plugins.UniverShapeEditorPlugin.dependencies.push('UniverDrawingPlugin')
const availableClasses = Object.keys(plugins)
for (const [name, plugin] of Object.entries(plugins)) {
  if (name.includes('Mobile')) continue
  const mobile = availableClasses.find(
    (candidate) => candidate.includes('Mobile') && plugins[candidate].package === plugin.package,
  )
  if (mobile) plugin.mobile = mobile
}
for (const [name, plugin] of Object.entries(plugins)) {
  const root = resolve(installedRoot, plugin.package)
  if (
    existsSync(`${root}/package.json`) &&
    JSON.parse(readFileSync(`${root}/package.json`, 'utf8')).version !== version
  )
    throw new Error(`${plugin.package} must be installed at ${version}`)
  const typesPath = `${root}/lib/types/index.d.ts`
  const types = existsSync(typesPath) ? readFileSync(typesPath, 'utf8') : ''
  plugin.available = types.includes(name)
  plugin.locale = existsSync(`${root}/lib/es/locale/en-US.js`)
  plugin.css = existsSync(`${root}/lib/index.css`)
  plugin.facade = existsSync(`${root}/lib/es/facade.js`)
}
const output = { version, packages, plugins }
writeFileSync('lib/tools/plugin-catalog.json', `${JSON.stringify(output, null, 2)}\n`)
console.log(`Scanned ${packages.length} public packages; indexed ${availableClasses.length} browser plugin entries.`)
