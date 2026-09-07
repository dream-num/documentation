import assert from 'node:assert/strict'

import { UniverBoardsPlugin } from '@univerjs-pro/boards'
import { Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'

import { createData, STATES } from '../showcase/boards/create-save-and-restore-board/code/data.ts'

import '@univerjs-pro/boards/facade'

const univer = new Univer()
univer.registerPlugin(UniverBoardsPlugin)
const api = FUniver.newAPI(univer)
// JSON intentionally omits undefined optional fields; no persisted field is filtered.
const json = (value) => JSON.parse(JSON.stringify(value))
try {
  for (const state of STATES) {
    let board = api.createBoard(createData(state))
    const initial = board.save()
    assert.deepEqual(initial.pageOrder, createData(state).pageOrder)
    assert.equal(initial.activePageId, createData(state).activePageId)
    const id = state === 'boundary' ? 'handover' : 'supplies'
    if (state !== 'empty') {
      assert.equal(board.setElementTransform(id, { left: 370, top: 420 }), true)
      assert.equal(board.setTextContent(state === 'boundary' ? 'review-title' : 'title', 'Confirmed / 12 kits'), true)
      const edited = board.save()
      assert.equal(board.undo(), true)
      assert.equal(board.undo(), true)
      assert.deepEqual(json(board.save()), json(initial), 'Native history restores every serialized snapshot field')
      assert.equal(board.redo(), true)
      assert.equal(board.redo(), true)
      assert.deepEqual(json(board.save()), json(edited))
    }
    const saved = board.save()
    assert.equal(board.setElementTransform('missing-element', { left: 20 }), false)
    assert.deepEqual(board.save(), saved, 'Rejected target preserves complete snapshot')
    api.disposeUnit(board.getId())
    board = api.createBoard(JSON.parse(JSON.stringify(saved)))
    assert.deepEqual(
      JSON.parse(JSON.stringify(board.save())),
      JSON.parse(JSON.stringify(saved)),
      'JSON round trip preserves all serialized fields',
    )
    api.disposeUnit(board.getId())
    console.log('PASS', state, 'snapshot, active page, order, text, geometry and native history')
  }
} finally {
  api.dispose()
}
