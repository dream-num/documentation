import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { createRequire } from 'node:module'

import { readShowcaseSources } from './showcase-sources.mjs'

const require = createRequire(import.meta.url)
const allProducts = process.argv.includes('--all')
const directory = allProducts ? 'test-results/showcase-locale-packs' : 'test-results/embed-locale-packs'
const results = []
for (const { slug, files } of await readShowcaseSources()) {
  if (!allProducts && !slug.startsWith('embed/')) continue
  const source = Object.entries(files)
    .filter(([name]) => name.startsWith('/src/') && /\.tsx?$/.test(name))
    .map(([, code]) => code)
    .join('\n')
  if (!source) continue
  if (slug === 'docs/node-via-plugin') {
    // This exported Node script intentionally has no editor UI or UI locale packs.
    assert.ok(source.includes('UniverDocsPlugin'))
    assert.ok(!/from\s+['"]@univerjs(?:-pro)?\/[^'"]*(?:-ui|preset)[^'"]*['"]/.test(source))
    results.push({ slug, scope: 'headless-no-ui', englishPacks: 0, failures: [] })
    continue
  }
  const imports = new Map()
  const failures = []
  // These exported factories use explicit default imports and literal locale maps.
  // Fail closed on unsupported registration shapes instead of executing SDK code.
  const zhMerges = [...source.matchAll(/\[LocaleType\.ZH_CN\]\s*:\s*(?:mergeLocales\(([^)]*)\)|([\w$]+))/g)].map(
    (match) => match[1] || match[2],
  )
  for (const match of source.matchAll(
    /import\s+([\w$]+)\s+from\s+['"]([^'"]+\/(?:locale|locales)\/(?:en-US|zh-CN))['"]/g,
  )) {
    const [, binding, specifier] = match
    imports.set(specifier, binding)
    try {
      require.resolve(specifier)
    } catch {
      failures.push('Unresolvable official locale export: ' + specifier)
    }
  }
  // Workbook snapshots may legitimately carry their own number/date locale.
  // This gate checks the SDK UI constructor, not locale fields in sample data.
  const configurations = [...source.matchAll(/(?:new Univer|createUniver)\(\{([\s\S]*?)\blocales\s*:/g)]
  if (configurations.some((match) => /\blocale\s*:\s*LocaleType\.EN_US\b/.test(match[1])))
    failures.push('SDK locale is hardcoded to English')
  const en = [...imports.keys()].filter((specifier) => specifier.endsWith('/en-US'))
  for (const specifier of en) {
    const counterpart = specifier.replace(/en-US$/, 'zh-CN')
    const binding = imports.get(counterpart)
    if (!binding) failures.push('Missing Chinese counterpart: ' + counterpart)
    else if (!zhMerges.some((merge) => new RegExp('\\b' + binding + '\\b').test(merge)))
      failures.push('Chinese pack is not registered: ' + counterpart)
  }
  if (!en.length) failures.push('No official English plugin locales found')
  results.push({ slug, englishPacks: en.length, failures })
}
await fs.mkdir(directory, { recursive: true })
await fs.writeFile(`${directory}/report.json`, JSON.stringify({ results }, null, 2))
const failed = results.filter((result) => result.failures.length)
console.log(
  JSON.stringify(
    { checked: results.length, failed: failed.map(({ slug, failures }) => ({ slug, failures: failures.length })) },
    null,
    2,
  ),
)
assert.ok(results.length > 0)
assert.equal(failed.length, 0, 'SDK locale export/registration parity; not a runtime translation certificate')
