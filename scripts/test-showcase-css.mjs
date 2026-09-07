// Read actual catalog file maps without loading or compiling any Preview/SDK runtime.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'

import { readShowcaseSources } from './showcase-sources.mjs'

const require = createRequire(import.meta.url)
const issues = [],
  cases = []
for (const { slug, authored, files } of await readShowcaseSources()) {
  const cssImports = []
  for (const [name, source] of Object.entries(authored)) {
    if (!/\.[cm]?[jt]sx?$/.test(name)) continue
    for (const [, css] of source.matchAll(/import\s*['"]([^'"]+\.css(?:\?[^'"]*)?)['"]/g)) {
      cssImports.push(css)
      if (css.startsWith('.')) {
        const target = path.posix.join(path.posix.dirname(name), css.split('?')[0])
        if (!(target in files)) issues.push({ slug, kind: 'local-css', message: name + ': missing ' + target })
      } else {
        try {
          require.resolve(css.split('?')[0])
        } catch {
          issues.push({ slug, kind: 'sdk-css', message: name + ': unresolved ' + css })
        }
      }
    }
    for (const [, url] of source.matchAll(/href=["'](https?:\/\/[^"']+\.css)["']/g))
      issues.push({ slug, kind: 'remote-css', message: name + ': external stylesheet ' + url })
  }
  const preview = fs.readFileSync('showcase/' + slug + '/preview/main.tsx', 'utf8')
  for (const [, css] of preview.matchAll(/import\s*['"](@[^'"]+\.css)['"]/g))
    if (!cssImports.includes(css)) issues.push({ slug, kind: 'preview-only-css', message: css })
  cases.push({ slug, cssImports, files: Object.keys(files) })
}
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/showcase-css')
fs.mkdirSync(directory, { recursive: true })
// A reused results directory may already hold native runtime/export evidence.
fs.writeFileSync(path.join(directory, 'css-report.json'), JSON.stringify({ cases, issues }, null, 2))
console.log(JSON.stringify({ checked: cases.length, issues }, null, 2))
assert.ok(cases.length > 0, 'The actual catalog must not be empty')
assert.deepEqual(issues, [], 'Every exported case must carry resolvable CSS and dependency declarations')
