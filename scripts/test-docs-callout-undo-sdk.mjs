// Strict SDK gate: text-color Undo must preserve one block and restore its previous color.
import assert from 'node:assert/strict'

import { UniverDocsCalloutPlugin } from '@univerjs-pro/docs-callout'
import { IUndoRedoService, IUniverInstanceService, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { DocStateChangeManagerService, UniverDocsPlugin } from '@univerjs/docs'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'

import { createData, PRIMARY_ID } from '../showcase/docs-modern/callout-blocks/code/data.ts'

import '@univerjs/docs/facade'
import '@univerjs-pro/docs-callout/facade'

const univer = new Univer()
univer.registerPlugin(UniverRenderEnginePlugin)
univer.registerPlugin(UniverDocsPlugin)
univer.registerPlugin(UniverDocsCalloutPlugin)
const api = FUniver.newAPI(univer)
univer.__getInjector().get(IUndoRedoService)
univer.__getInjector().get(DocStateChangeManagerService)
try {
  const doc = api.createDocument(createData())
  assert.ok(
    doc.insertCallout(doc.findParagraphByText('[RISK]'), {
      blockId: PRIMARY_ID,
      config: { backgroundColor: '#FEF0C7' },
    }),
  )
  const callout = () => doc.getCallout(PRIMARY_ID)
  assert.ok(callout().setTextColor('#78350F'))
  univer.__getInjector().get(IUndoRedoService).clearUndoRedo(doc.getId())
  const before = structuredClone(doc.save().body)
  assert.ok(callout().setTextColor('#14532D'))
  univer.__getInjector().get(IUniverInstanceService).focusUnit(doc.getId())
  const undoResult = doc.undo()
  const after = doc.save().body
  console.log(
    JSON.stringify(
      { undoResult, before: before.blockRanges, after: after.blockRanges, color: callout().getStyle().textColor },
      null,
      2,
    ),
  )
  assert.deepEqual(after.blockRanges, before.blockRanges, 'Undo must not duplicate callout block ranges')
  assert.deepEqual(after.textRuns, before.textRuns, 'Undo must restore text color and inline emphasis')
  assert.equal(undoResult, true)
  assert.equal(after.dataStream, before.dataStream)
  console.log('PASS Callout text-color Undo preserves document structure')
} finally {
  api.dispose()
}
