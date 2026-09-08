import assert from 'node:assert/strict'

import { FORMAT_SAMPLES, createWorkbookData } from '../showcase/sheets/number-format-gallery/code/data.ts'

assert.equal(FORMAT_SAMPLES.length, 20)
assert.deepEqual(createWorkbookData(true), createWorkbookData(false))
assert.doesNotMatch(JSON.stringify(createWorkbookData()), /\p{Script=Han}/u)
for (const zh of [false, true]) {
  const data = createWorkbookData(zh)
  const cells = data.sheets.formats.cellData
  for (const [index, sample] of FORMAT_SAMPLES.entries()) {
    assert.equal(cells[index + 4][1].v, sample.value)
    assert.equal(cells[index + 4][2].v, sample.value)
    assert.equal(cells[index + 4][3].v, sample.pattern)
    assert.ok(cells[index + 4][0].v.length)
  }
  assert.equal(cells[12][2].v, cells[13][2].v)
  assert.equal(cells[12][3].v, '[h]:mm')
  assert.equal(cells[13][3].v, 'hh:mm')
  assert.equal(cells[17][2].v, 0)
}
assert.deepEqual(
  FORMAT_SAMPLES.slice(14).map((sample) => sample.value),
  [1234.5, -85.25, 0, 2.375, 2.375, 0.3333333333],
)
console.log('PASS: 20 numeric comparisons, English-only legacy arguments, accounting and fraction values')
