// A strict regression check: fails on beta.2 until live sort invalidation is fixed.
// No UI, host controls, renderer, license bypass, or custom sorting implementation.
import assert from 'node:assert/strict'

import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { BaseSortDirection, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'

import { DATA } from '../showcase/bases/multi-field-sort/code/data.ts'

import '@univerjs-pro/bases/facade'

const univer = new Univer()
univer.registerPlugin(UniverBasesPlugin)
const api = FUniver.newAPI(univer)
try {
  const table = api.createBase(structuredClone(DATA)).getTableById('records')
  const view = table.getViewById('working')
  assert.equal(view.setSort([{ fieldId: 'score', direction: BaseSortDirection.DESC }]), true)
  assert.equal(view.getProjection().rows[0].recordId, 'r02')
  assert.equal(table.getRecordById('r01').setValue('score', 98), true)
  assert.equal(table.getRecordById('r01').getValue('score'), 98)
  const rows = view.getProjection().rows
  console.log(
    JSON.stringify(
      rows.map(({ recordId, values }) => ({ recordId, score: values.score })),
      null,
      2,
    ),
  )
  assert.equal(rows[0].recordId, 'r01', 'A changed sort key must reposition Meridian (98) ahead of Atlas (95)')
  console.log('PASS Bases live sort after a cell edit')
} finally {
  api.dispose()
}
