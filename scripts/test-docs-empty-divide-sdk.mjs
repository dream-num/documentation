// Run the exact installed SDK helper implicated by the browser stack, without replacing or patching it.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import vm from 'node:vm'

const require = createRequire(import.meta.url)
const entry = require
  .resolve('@univerjs/engine-render')
  .replace(`${path.sep}cjs${path.sep}`, `${path.sep}es${path.sep}`)
const source = fs.readFileSync(entry, 'utf8')
const match = source.match(/function _getConsecutiveHyphenLineCount\(divide\) \{[\s\S]*?\n\}/)
assert.ok(match, 'SDK helper layout changed; inspect the actual new implementation instead of skipping this gate')
const count = vm.runInNewContext(`(${match[0]})`, {}, { timeout: 1000 })
const divide = (lines) => ({ parent: { parent: { lines } } })
assert.equal(count({}), 0)
assert.equal(count(divide([{ divides: [{ breakType: 'Hyphen' }] }, { divides: [{ breakType: 'Hyphen' }] }])), 2)
assert.equal(count(divide([{ divides: [{ breakType: 'Hyphen' }] }, { divides: [{ breakType: 'Normal' }] }])), 0)
const emptyLine = divide([{ divides: [] }])
console.log(
  JSON.stringify({ sdkEntry: entry, sourceLine: source.slice(0, match.index).split('\n').length, input: emptyLine }),
)
if (process.env.SHOWCASE_OBSERVE_KNOWN_DEFECTS === '1') {
  assert.throws(() => count(emptyLine), /Cannot read properties of undefined \(reading 'breakType'\)/)
  console.log('OBSERVED SDK empty-divide exception; this is not layout acceptance')
} else {
  assert.doesNotThrow(
    () => count(emptyLine),
    'An empty line has no final divide; it must terminate the consecutive-hyphen run',
  )
  assert.equal(count(emptyLine), 0)
  console.log('PASS SDK empty lines terminate consecutive hyphen counting')
}
