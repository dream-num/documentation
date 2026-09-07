import assert from 'node:assert/strict'

import { UniverDocsColumnPlugin } from '@univerjs-pro/docs-column'
import { UniverDocsTablePlugin } from '@univerjs-pro/docs-table'
import { ImageSourceType, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverDocsDrawingPlugin, UniverDrawingPlugin } from '@univerjs/preset-docs-drawing'

import { BOOKINGS, createData, TOOLS_SVG } from '../showcase/docs-modern/column-layouts/code/data.ts'

import '@univerjs/docs/facade'
import '@univerjs-pro/docs-column/facade'
import '@univerjs-pro/docs-table/facade'

const univer = new Univer()
univer.registerPlugin(UniverRenderEnginePlugin)
univer.registerPlugin(UniverDocsPlugin)
univer.registerPlugin(UniverDrawingPlugin)
univer.registerPlugin(UniverDocsDrawingPlugin)
univer.registerPlugin(UniverDocsColumnPlugin)
univer.registerPlugin(UniverDocsTablePlugin)
const api = FUniver.newAPI(univer)
try {
  const doc = api.createDocument(createData(true))
  const group = doc.insertColumnGroup(2, { columnGroupId: 'resource-repro', columnIds: ['left', 'right'], offset: 0 })
  assert.ok(group)
  assert.ok(
    doc.insertTableFromData(
      BOOKINGS.map((row) => Array.from(row)),
      { tableId: 'nested-bookings', offset: group.getColumn(1).getInsertOffset() },
    ),
  )
  const offset = group.getColumn(0).getInsertOffset()
  const image = await doc.insertImage({
    source: 'data:image/svg+xml;base64,' + Buffer.from(TOOLS_SVG).toString('base64'),
    imageSourceType: ImageSourceType.BASE64,
    width: 100,
    height: 60,
    textRange: { startOffset: offset, endOffset: offset, collapsed: true },
  })
  assert.ok(image)
  assert.ok(doc.save().body.customBlocks.some((block) => block.blockId === image.getId()))
  assert.equal(group.remove(), true)
  assert.equal(doc.getTables().length, 0)
  assert.equal(
    doc.save().body.customBlocks.some((block) => block.blockId === image.getId()),
    false,
  )
  const orphanTable = Boolean(doc.save().tableSource?.['nested-bookings'])
  const orphanImage = Boolean(doc.save().drawings?.[image.getId()])
  console.log(JSON.stringify({ groupRemoved: !doc.getColumnGroup('resource-repro'), orphanTable, orphanImage }))
  assert.equal(orphanTable, false, 'Removing a column group must release the nested table source')
  assert.equal(orphanImage, false, 'Removing a column group must release the nested image resource')
} finally {
  api.dispose()
}
