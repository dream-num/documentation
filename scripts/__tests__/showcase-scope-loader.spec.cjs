const assert = require('node:assert/strict')
const fs = require('node:fs')
const scopeLoader = require('../showcase-scope-loader.cjs')

const source = fs.readFileSync('showcase/data.ts', 'utf8')
const selected = ['bases/content-pipeline']
const scoped = scopeLoader.filterRegistry(source, selected)
assert.deepEqual(
  [...scoped.matchAll(/import\('\.\/([^']+)'\)/g)].map((match) => match[1]),
  selected,
)
assert.equal(scoped.split('\n').length, source.split(/\r?\n/).length, 'Preserve line numbers')
assert.doesNotMatch(scoped, /sheets\/big-data|slides\/|pdfs\//)
assert.throws(() => scopeLoader.filterRegistry(source, []), /at least one/)
assert.throws(() => scopeLoader.filterRegistry(source, ['bases/not-a-demo']), /Unknown Showcase/)
for (const newline of ['\n', '\r\n']) {
  const wrapped = `'a/one': () =>${newline}  import('./a/one'),${newline}'b/two': () => import('./b/two'),`
  const result = scopeLoader.filterRegistry(wrapped, ['a/one'])
  assert.deepEqual(
    [...result.matchAll(/import\('([^']+)'\)/g)].map((match) => match[1]),
    ['./a/one'],
  )
  assert.equal(result.split('\n').length, wrapped.split(newline).length)
  assert.doesNotMatch(scopeLoader.filterRegistry(wrapped, ['b/two']), /a\/one/)
}
console.log('PASS selected imports, invalid selections, and multiline registry entries')
