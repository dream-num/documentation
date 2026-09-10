import assert from 'node:assert/strict'

import { createLocalSource, customSum } from '../custom-function.ts'

assert.equal(customSum([[12], [0], [18]], 5), 35)
assert.equal(customSum(null, undefined, '', 0), 0)
assert.equal(customSum(-2, 0.5), -1.5)
assert.equal(customSum('12'), '#VALUE!')
assert.equal(customSum(true), '#VALUE!')
assert.equal(customSum(Number.POSITIVE_INFINITY), '#NUM!')
const source = createLocalSource(() => {})
try {
  const first = source.lookup([['NORTH']])
  assert.equal(source.lookup('NORTH'), first, 'Concurrent lookups share a single pending request')
  assert.equal(source.snapshot().requests, 1)
  assert.equal(source.snapshot().pending, 1)
  const resolved = await first
  assert.deepEqual(await source.lookup('NORTH'), resolved)
  assert.equal(source.snapshot().requests, 1)
  assert.equal(source.snapshot().cacheHits, 1)
  assert.equal((await source.lookup([['NORTH', 'EAST']])).error, '#VALUE!')
  source.clearCache()
  await source.lookup('NORTH')
  assert.equal(source.snapshot().requests, 2)
  assert.equal((await source.lookup('EMPTY')).data.stops.length, 0)
  assert.equal((await source.lookup('MISSING')).error, '#N/A')
  assert.equal((await source.lookup('FAULT')).error, '#VALUE!')
  assert.equal((await source.lookup('TIMEOUT')).error, '#N/A')
  source.clearCache()
  const pending = [source.lookup('NORTH'), source.lookup('TIMEOUT')]
  source.dispose()
  assert.deepEqual(await Promise.all(pending), [{ error: '#N/A' }, { error: '#N/A' }])
  assert.equal(source.snapshot().pending, 0)
  assert.equal((await source.lookup('EAST')).error, '#N/A')
  console.log(
    'PASS strict sum, scalar-reference conversion, source sharing/cache/errors/timeout and pending cancellation',
  )
} finally {
  source.dispose()
}
