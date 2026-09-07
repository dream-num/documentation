import assert from 'node:assert/strict'

import { UniverDocsTablePlugin } from '@univerjs-pro/docs-table'
import { IUndoRedoService, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'

import { createData, PRIMARY_ID, SAMPLES } from '../showcase/docs-modern/document-tables/code/data.ts'

import '@univerjs/docs/facade'
import '@univerjs-pro/docs-table/facade'

const univer = new Univer()
univer.registerPlugin(UniverRenderEnginePlugin)
univer.registerPlugin(UniverDocsPlugin)
univer.registerPlugin(UniverDocsTablePlugin)
const api = FUniver.newAPI(univer)
try {
  const doc = api.createDocument(createData())
  const table = doc.insertTableFromData(
    SAMPLES[0].rows.map((row) => Array.from(row)),
    { tableId: PRIMARY_ID, offset: 0, headerRowCount: 1 },
  )
  assert.ok(table)
  univer.__getInjector().get(IUndoRedoService).clearUndoRedo(doc.getId())
  assert.equal(table.setCellText(1, 1, 'Mara Chen'), true)
  const undo = doc.undo()
  console.log(JSON.stringify({ undo, actual: table.getCellText(1, 1), expected: 'Mara' }))
  assert.equal(undo, true, 'Undo must restore a successful Facade cell text edit')
  assert.equal(table.getCellText(1, 1), 'Mara')
} finally {
  api.dispose()
}
