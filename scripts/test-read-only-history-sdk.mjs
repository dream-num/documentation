// Strict SDK-only regression: beta.2 replays existing edits after setReadOnly().
// No host history guard, DOM, renderer, snapshot rewriting, or backend.
import assert from 'node:assert/strict'

import { LocaleType, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import enUS from '@univerjs/sheets/locale/en-US'

import '@univerjs/sheets/facade'

const univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS } })
univer.registerPlugin(UniverSheetsPlugin)
const api = FUniver.newAPI(univer)
try {
  const workbook = api.createWorkbook({
    id: 'viewer-history',
    sheetOrder: ['schedule'],
    sheets: {
      schedule: { id: 'schedule', name: 'Schedule', rowCount: 10, columnCount: 10, cellData: { 0: { 0: { v: 18 } } } },
    },
  })
  const cell = workbook.getActiveSheet().getRange('A1')
  cell.setValue(7)
  assert.equal(cell.getValue(), 7)
  workbook.undo()
  assert.equal(cell.getValue(), 18, 'The focused workbook must have an actual undoable edit')
  workbook.redo()
  assert.equal(cell.getValue(), 7)
  await workbook.getWorkbookPermission().setReadOnly()
  assert.equal(workbook.getWorkbookPermission().canEdit(), false)
  workbook.undo()
  console.log(JSON.stringify({ canEdit: workbook.getWorkbookPermission().canEdit(), valueAfterUndo: cell.getValue() }))
  assert.equal(cell.getValue(), 7, 'Viewer permissions must prevent replaying an earlier edit via Undo')
} finally {
  univer.dispose()
}
