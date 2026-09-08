// Strict SDK-only reproduction. No UI, synthetic group headers or license bypass.
import assert from 'node:assert/strict'

import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { BaseSortDirection, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'

import { createData } from './fixtures/base-groups-empty-options.ts'

import '@univerjs-pro/bases/facade'

const univer = new Univer()
univer.registerPlugin(UniverBasesPlugin)
const api = FUniver.newAPI(univer)
try {
  const data = createData()
  const fixture = data.tables.returns
  fixture.recordOrder = ['r001', 'r002', 'r004', 'r007']
  fixture.records = Object.fromEntries(fixture.recordOrder.map((id) => [id, fixture.records[id]]))
  const table = api.createBase(data).getTableById('returns')
  const view = table.getViewById('working')
  const groups = () => view.getProjection().groups ?? []
  const summary = () => groups().map((group) => ({ key: group.key, recordIds: group.recordIds }))
  const failures = []
  assert.equal(view.setGroup([{ fieldId: 'status', direction: BaseSortDirection.ASC, hideEmptyGroup: false }]), true)
  assert.ok(table.getTable().fields.status.config.options.some((option) => option.id === 'Archived'))
  const initial = summary()
  if (!groups().some((g) => g.key === 'Archived' && g.recordIds.length === 0))
    failures.push('Unused Archived option has no zero-record group')
  assert.equal(table.getRecordById('r007').setValue('status', 'Archived'), true)
  assert.deepEqual(groups().find((g) => g.key === 'Archived').recordIds, ['r007'])
  assert.equal(table.getRecordById('r007').setValue('status', 'Repair'), true)
  const emptied = summary()
  if (!groups().some((g) => g.key === 'Archived' && g.recordIds.length === 0))
    failures.push('Moving the last Archived record removes the group despite hideEmptyGroup=false')
  assert.equal(view.setGroup([{ fieldId: 'status', direction: BaseSortDirection.ASC, hideEmptyGroup: true }]), true)
  assert.ok(!groups().some((g) => g.key === 'Archived'))
  assert.deepEqual(
    groups().find((g) => g.key === '').recordIds,
    ['r001'],
    'A populated blank-value bucket is not a zero-record group',
  )
  console.log(JSON.stringify({ initial, emptied, failures }, null, 2))
  assert.deepEqual(failures, [], 'SDK projection must expose zero-record option groups when explicitly requested')
} finally {
  api.dispose()
}
