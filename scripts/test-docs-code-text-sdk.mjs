// Strict SDK regression: getText must preserve paragraph breaks and blank code lines.
import assert from 'node:assert/strict'

import { UniverDocsCodePlugin } from '@univerjs-pro/docs-code'
import { Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'

import { createData, PRIMARY_ID, SAMPLES } from '../showcase/docs-modern/code-blocks/code/data.ts'

import '@univerjs/docs/facade'
import '@univerjs-pro/docs-code/facade'

const univer = new Univer()
univer.registerPlugin(UniverRenderEnginePlugin)
univer.registerPlugin(UniverDocsPlugin)
univer.registerPlugin(UniverDocsCodePlugin)
const api = FUniver.newAPI(univer)
try {
  const doc = api.createDocument(createData())
  const paragraphs = doc.getParagraphs()
  const first = doc.findParagraphByText('02 · Ingestion example').getInfo().paragraphIndex + 1
  const last = doc.findParagraphByText('03 · Review rules').getInfo().paragraphIndex - 1
  const code = doc.insertCode({
    blockId: PRIMARY_ID,
    startOffset: paragraphs[first].getRange().startOffset,
    endOffset: paragraphs[last].getRange().endOffset,
    config: { language: 'typescript' },
  })
  assert.ok(code)
  const range = code.getRange()
  const raw = doc.save().body.dataStream.slice(range.startIndex + 1, range.endIndex)
  const expected = SAMPLES[0].lines.join('\n')
  const actual = code.getText()
  console.log(JSON.stringify({ expected, actual, raw }, null, 2))
  assert.equal(actual, expected, 'Code getText must preserve every line break and blank line')
  console.log('PASS code text preserves whitespace')
} finally {
  api.dispose()
}
