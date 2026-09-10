import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

import { readShowcaseSources } from '../showcase-sources.mjs'

const expected = (await readShowcaseSources()).map(({ slug, metadata }) => ({ slug, metadata }))
const actual = JSON.parse(await fs.readFile('showcase/catalog.generated.json', 'utf8'))
assert.deepEqual(actual, JSON.parse(JSON.stringify(expected)), 'Regenerate full navigation after metadata changes')
assert.equal(new Set(actual.map(({ slug }) => slug)).size, actual.length)
console.log(`PASS all ${actual.length} registered demos appear exactly once in full navigation`)
