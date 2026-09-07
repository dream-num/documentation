import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { readShowcaseSources } from './showcase-sources.mjs'

// Audit explicit, local SDK initialization objects, not runtime DOM. Unknown
// call shapes fail for review rather than silently inheriting a SDK default.
const slim = new Set(['sheets/slim-via-plugin', 'docs/slim-via-plugin'])
const sources = await readShowcaseSources()
const results = []
for (const { slug, authored, files } of sources) {
  const configurations = []
  for (const [name, code] of Object.entries(authored)) {
    if (!/\.[jt]sx?$/.test(name)) continue
    assert.equal(files[name], code, slug + ': exported initialization must match Preview source')
    const calls = [
      ...code.matchAll(/(?:Univer(?:Sheets|Docs)CorePreset\s*\(|\w+\.registerPlugin\(UniverUIPlugin,\s*)/g),
    ]
    const objects = [
      ...code.matchAll(
        /(?:Univer(?:Sheets|Docs)CorePreset\s*\(|\w+\.registerPlugin\(UniverUIPlugin,\s*)(\{[\s\S]*?\})\s*\)/g,
      ),
    ]
    assert.equal(objects.length, calls.length, slug + ': inspect nonliteral desktop UI options')
    for (const [, options] of objects) {
      const expected = slim.has(slug) ? 'classic' : 'grid'
      if (slug === 'sheets/custom-menu') {
        assert.match(options, /\bribbonType\s*[,}]/)
        assert.match(code, /ribbonType: 'grid' \| 'classic' = 'grid'/)
        const guide = files['/README.md']
        assert.ok(guide, 'custom-menu: export the real configuration example')
        assert.match(guide, /createDemo\(container, darkMode, locale, saved, 'classic', selection\)/)
        assert.match(guide, /structuredClone\(api\.getWorkbook\('harbor-orders'\)\.save\(\)\)/)
      } else
        assert.match(
          options,
          new RegExp("\\bribbonType: '" + expected + "'"),
          slug + ': set the explicit ribbon policy',
        )
      if (slug.startsWith('slides/')) {
        assert.doesNotMatch(
          options,
          /\b(?:header|toolbar):\s*false/,
          slug + ': native Slides ribbon must remain visible',
        )
      }
      configurations.push({
        name,
        default: expected,
        optionalClassic: slug === 'sheets/custom-menu',
        hidden: /header:\s*false|toolbar:\s*false/.test(options),
      })
    }
  }
  if (!configurations.length) {
    assert.ok(
      ['sheets/mobile-via-plugin', 'sheets/node-via-plugin', 'docs/node-via-plugin'].includes(slug),
      slug + ': classify missing desktop ribbon configuration',
    )
  }
  results.push({ slug, configurations })
}
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/showcase-ribbon')
await fs.mkdir(directory, { recursive: true })
await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify({ passed: true, results }, null, 2))
console.log(
  JSON.stringify(
    {
      cases: results.length,
      desktop: results.filter((r) => r.configurations.length).length,
      slimClassic: [...slim],
      optionalClassic: 'sheets/custom-menu',
      note: 'Source policy only; runtime layout/interaction needs selected browser tests.',
    },
    null,
    2,
  ),
)
