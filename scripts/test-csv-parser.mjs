import assert from 'node:assert/strict'

import { parseCsv, readCsvFile, MAX_BYTES } from '../showcase/sheets/csv-import-plugin/code/csv-plugin/utils.ts'
import { CSV_SAMPLES } from '../showcase/sheets/csv-import-plugin/code/data.ts'

const sample = (id) => CSV_SAMPLES.find((entry) => entry.id === id)
const quoted = parseCsv(sample('quoted').text)
assert.equal(quoted.length, 5)
assert.deepEqual(quoted[1], ['0007', 'Radio, pocket', '0.5', 'Léa', 'Needs "A" battery'])
assert.equal(quoted[2][4], 'Cable checked\r\nFuse pending')
assert.equal(quoted[3][2], '')
assert.equal(quoted[4][2], '-1')
assert.equal(parseCsv(sample('semicolon').text, ';')[0][0], 'Part')
assert.equal(parseCsv(sample('tab').text, '\t')[2][0], 'Noé')
assert.equal(parseCsv(sample('literal').text)[1][1], '=1+1')
assert.equal(parseCsv(sample('literal').text)[3][1], '12345678901234567890')
const ragged = parseCsv(sample('ragged').text)
assert.deepEqual(ragged[1], ['Lamp', '2', '', ''])
assert.equal(ragged[3][0], '   ')
assert.equal(parseCsv(sample('ragged').text, ',', false).length, 6)
assert.throws(() => parseCsv(''), /empty/)
assert.throws(() => parseCsv('\uFEFF'), /empty/)
assert.throws(() => parseCsv(sample('malformed').text), /quote/i)
assert.throws(() => parseCsv('x'.repeat(MAX_BYTES + 1)), /MiB/)
assert.throws(() => parseCsv('a\n'.repeat(2001)), /limit/)
assert.throws(() => parseCsv(Array(101).fill('a').join(',')), /limit/)
assert.throws(() => parseCsv((Array(100).fill('a').join(',') + '\n').repeat(101)), /limit/)
assert.throws(() => parseCsv('a,b', '|'), /Choose/)
assert.equal(await readCsvFile(new File(['\uFEFFa,b\n1,2'], 'bom.csv')), 'a,b\n1,2')
await assert.rejects(readCsvFile(new File([new Uint8Array([0xff, 0xfe, 65, 0])], 'utf16.csv')))
await assert.rejects(readCsvFile(new File(['x'.repeat(MAX_BYTES + 1)], 'large.csv')), /MiB/)
console.log(
  'PASS CSV quotes, multiline, BOM, delimiters, literal text, ragged/empty rows, malformed input, UTF-8 and limits',
)
