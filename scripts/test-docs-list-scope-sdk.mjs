// Strict SDK regression: changing one item must not mutate a neighboring custom list definition.
import assert from 'node:assert/strict'

import { DocsListSelectionMode, UniverDocsListPlugin } from '@univerjs-pro/docs-list'
import { ListGlyphType, PresetListType, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'

import { createData } from '../showcase/docs-modern/lists-task-items/code/data.ts'

import '@univerjs/docs/facade'
import '@univerjs-pro/docs-list/facade'

const univer = new Univer()
univer.registerPlugin(UniverRenderEnginePlugin)
univer.registerPlugin(UniverDocsPlugin)
univer.registerPlugin(UniverDocsListPlugin)
const api = FUniver.newAPI(univer)
try {
  const doc = api.createDocument(createData())
  const first = doc.findParagraphByText('[FLOOR]').getRange()
  const last = doc.findParagraphByText('[OPEN]').getRange()
  assert.ok(
    doc.insertList({
      startOffset: first.startOffset,
      endOffset: last.endOffset,
      listId: 'mosaic-install',
      listType: PresetListType.ORDER_LIST,
    }),
  )
  const item = (marker) => doc.findListItemByText(marker)
  assert.equal(item('[LABEL]').demote({ mode: DocsListSelectionMode.Item }), true)
  assert.equal(item('[LIGHT]').demote({ mode: DocsListSelectionMode.Item }), true)
  assert.equal(item('[LABEL]').setGlyphType(ListGlyphType.UPPER_LETTER, { mode: DocsListSelectionMode.Level }), true)
  const before = item('[LIGHT]').describe()
  assert.equal(item('[LABEL]').setGlyphType(ListGlyphType.LOWER_ROMAN, { mode: DocsListSelectionMode.Item }), true)
  const after = item('[LIGHT]').describe()
  console.log(JSON.stringify({ before, after }, null, 2))
  assert.equal(item('[LABEL]').describe().glyphType, ListGlyphType.LOWER_ROMAN)
  assert.equal(after.glyphType, before.glyphType, 'Single-item marker edit must preserve the other same-level item')
  console.log('PASS Docs list item marker scope')
} finally {
  api.dispose()
}
