// Strict SDK regression: no React, canvas, or host hierarchy cache.
import assert from 'node:assert/strict'

import { UniverBoardsPlugin } from '@univerjs-pro/boards'
import { Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'

import { DATA, MEDIA_IDS } from './fixtures/board-groups-mixed-data.ts'

import '@univerjs-pro/boards/facade'

const univer = new Univer()
univer.registerPlugin(UniverBoardsPlugin)
const api = FUniver.newAPI(univer)
try {
  const board = api.createBoard(structuredClone(DATA))
  assert.equal(board.wrapElementsInContainer([...MEDIA_IDS], { title: 'Media package' }), true)
  const mediaGroupId = board.getElementParentChain('caption')[0]
  assert.ok(mediaGroupId)
  assert.equal(board.wrapElementsInContainer([mediaGroupId, 'priority'], { title: 'Campaign package' }), true)
  const campaignGroupId = board.getElementParentChain(mediaGroupId)[0]
  assert.ok(campaignGroupId)
  const before = board.getElementOrder()
  const childrenBefore = board.getContainerChildren(campaignGroupId).map(({ id }) => id)
  assert.equal(board.disbandContainer(campaignGroupId), true)
  assert.equal(board.disbandContainer(mediaGroupId), true)
  assert.equal(board.undo(), true)
  assert.equal(board.undo(), true)
  const after = board.getElementOrder()
  const childrenAfter = board.getContainerChildren(campaignGroupId).map(({ id }) => id)
  console.log(JSON.stringify({ before, after, childrenBefore, childrenAfter }, null, 2))
  assert.deepEqual(childrenAfter, childrenBefore, 'Undo disband must restore sibling z-order')
  assert.deepEqual(after, before, 'Undo disband must restore the complete element order')
  console.log('PASS Boards nested disband Undo preserves layer order')
} finally {
  api.dispose()
}
