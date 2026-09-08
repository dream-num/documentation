import assert from 'node:assert/strict'
import fs from 'node:fs'

import { readShowcaseSources } from './showcase-sources.mjs'

const sources = await readShowcaseSources()
let checked = 0
for (const { slug, files } of sources) {
  for (const [name, source] of Object.entries(files)) {
    if (!/\.tsx?$/.test(name)) continue
    assert.doesNotMatch(source, /Relational Tables?|Canvases/, `${slug}${name}: aliases belong only to the tree`)
    assert.doesNotMatch(source, /Demo-only product names/, `${slug}${name}: use official SDK locale packs`)
    checked++
  }
}
const home = fs.readFileSync('components/univer/univer.tsx', 'utf8')
assert.doesNotMatch(home, /Relational Tables?|Canvases|Demo-only product names/)
console.log(`PASS ${checked} exported source files: tree aliases do not alter demo internals or SDK locales`)
