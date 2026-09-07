// Strict regression: one Quote style command must undo both colors without altering content.
import assert from 'node:assert/strict'

import { UniverDocsQuotePlugin } from '@univerjs-pro/docs-quote'
import { IUndoRedoService, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { DocStateChangeManagerService, UniverDocsPlugin } from '@univerjs/docs'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'

import { createData, PRIMARY_ID } from '../showcase/docs-modern/quote-blocks/code/data.ts'

import '@univerjs/docs/facade'
import '@univerjs-pro/docs-quote/facade'

const univer = new Univer()
univer.registerPlugin(UniverRenderEnginePlugin)
univer.registerPlugin(UniverDocsPlugin)
univer.registerPlugin(UniverDocsQuotePlugin)
const api = FUniver.newAPI(univer)
univer.__getInjector().get(IUndoRedoService)
univer.__getInjector().get(DocStateChangeManagerService)
try {
  const doc = api.createDocument(createData())
  assert.ok(doc.insertQuote(doc.findParagraphByText('[VOICE]'), { blockId: PRIMARY_ID }))
  const quote = () => doc.getQuote(PRIMARY_ID)
  assert.ok(quote().setStyle({ lineColor: '#2563EB', textColor: '#1E3A8A' }))
  univer.__getInjector().get(IUndoRedoService).clearUndoRedo(doc.getId())
  const before = { style: quote().getStyle(), body: structuredClone(doc.save().body) }
  assert.ok(quote().setStyle({ lineColor: '#16A34A', textColor: '#14532D' }))
  const undoResult = doc.undo()
  const after = { style: quote().getStyle(), body: doc.save().body }
  console.log(
    JSON.stringify(
      {
        undoResult,
        beforeStyle: before.style,
        afterStyle: after.style,
        beforeBlocks: before.body.blockRanges,
        afterBlocks: after.body.blockRanges,
      },
      null,
      2,
    ),
  )
  assert.deepEqual(after.style, before.style, 'Quote Undo must restore both colors')
  assert.deepEqual(after.body.blockRanges, before.body.blockRanges)
  assert.deepEqual(after.body.textRuns, before.body.textRuns)
  assert.equal(after.body.dataStream, before.body.dataStream)
  assert.equal(undoResult, true)
  console.log('PASS Quote style Undo')
} finally {
  api.dispose()
}
