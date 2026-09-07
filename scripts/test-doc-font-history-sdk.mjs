// Compare the installed direct range setter with an explicitly registered SDK command boundary.
import assert from 'node:assert/strict'

import { CommandType, ICommandService, IUndoRedoService, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { DocStateChangeManagerService, UniverDocsPlugin } from '@univerjs/docs'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'

import { createData } from '../showcase/docs-traditional/fonts-fallback-and-glyphs/code/data.ts'

import '@univerjs/docs/facade'

const univer = new Univer()
univer.registerPlugin(UniverRenderEnginePlugin)
univer.registerPlugin(UniverDocsPlugin)
const api = FUniver.newAPI(univer)
const injector = univer.__getInjector()
injector.get(IUndoRedoService)
injector.get(DocStateChangeManagerService)
try {
  const doc = api.createDocument(createData())
  const range = () => doc.getTextRange(0, 10)
  assert.ok(range().setTextStyle({ ff: 'Georgia, serif' }))
  const directUndo = doc.undo()
  assert.equal(directUndo, false, 'Observed beta.2 limitation: direct range style has no history command trigger')
  const before = structuredClone(doc.save().body)
  const id = 'demo.command.typography'
  injector.get(ICommandService).registerCommand({
    id,
    type: CommandType.COMMAND,
    handler: () => range().setTextStyle({ ff: 'Courier New, monospace', fs: 20, bl: 1 }),
  })
  assert.ok(api.syncExecuteCommand(id))
  const changed = structuredClone(doc.save().body)
  assert.ok(doc.undo())
  assert.deepEqual(doc.save().body, before)
  assert.ok(doc.redo())
  assert.deepEqual(doc.save().body, changed)
  console.log(JSON.stringify({ passed: true, directUndo, commandBoundaryUndoRedo: true }))
} finally {
  api.dispose()
}
