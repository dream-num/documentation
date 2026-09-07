// Strict SDK regression: layout configuration must update the derived paragraph inset.
import assert from 'node:assert/strict'

import { UniverDocsCalloutPlugin } from '@univerjs-pro/docs-callout'
import { Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'

import { createData, PRIMARY_ID } from '../showcase/docs-modern/callout-blocks/code/data.ts'

import '@univerjs/docs/facade'
import '@univerjs-pro/docs-callout/facade'

const univer = new Univer()
univer.registerPlugin(UniverRenderEnginePlugin)
univer.registerPlugin(UniverDocsPlugin)
univer.registerPlugin(UniverDocsCalloutPlugin)
const api = FUniver.newAPI(univer)
try {
  const doc = api.createDocument(createData())
  assert.ok(doc.insertCallout(doc.findParagraphByText('[RISK]'), { blockId: PRIMARY_ID, config: { paddingLeft: 20 } }))
  const inset = () => doc.findParagraphByText('[RISK]').getInfo().paragraph.paragraphStyle.indentStart.v
  const before = inset()
  assert.ok(doc.getCallout(PRIMARY_ID).updateConfig({ paddingLeft: 28 }))
  const after = inset()
  console.log(JSON.stringify({ before, after, config: doc.getCallout(PRIMARY_ID).getConfig() }, null, 2))
  assert.equal(after, before + 8, 'Updating left padding must update the derived text inset')
  console.log('PASS Callout padding updates document layout')
} finally {
  api.dispose()
}
