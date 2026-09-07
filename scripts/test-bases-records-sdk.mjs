/* eslint-disable no-await-in-loop -- Each native history assertion depends on the preceding command. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { IUniverInstanceService, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'

import { createData, INTAKE, REVIEW_TIME } from '../showcase/bases/record-lifecycle/code/data.ts'

import '@univerjs-pro/bases/facade'

const univer = new Univer()
univer.registerPlugin(UniverBasesPlugin)
const api = FUniver.newAPI(univer)
const json = (value) => JSON.parse(JSON.stringify(value))
const observe = process.env.SHOWCASE_OBSERVE_KNOWN_DEFECTS === '1'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/base-records-sdk')
await fs.mkdir(directory, { recursive: true })
const report = { passed: false, states: [], defects: [] }
try {
  for (const state of ['default', 'empty', 'boundary', 'error']) {
    const base = api.createBase(createData(state)),
      table = base.getTableById('tasks')
    const initial = json(base.save())
    const records = table.addRecords(
      INTAKE.map((values, i) => ({
        values,
        record: { orderKey: `a000${i}`, createdAt: REVIEW_TIME, updatedAt: REVIEW_TIME },
      })),
    )
    assert.equal(table.getRecords().length, state === 'empty' ? 3 : 33)
    assert.deepEqual(
      table
        .getRecords()
        .slice(0, 3)
        .map((record) => record.getId()),
      records.map((record) => record.getId()),
    )
    const inserted = json(base.save())
    univer.__getInjector().get(IUniverInstanceService).focusUnit(base.getId())
    await api.undo()
    const undone = json(base.save())
    await fs.writeFile(
      path.join(directory, `${state}-insert-undo.json`),
      JSON.stringify({ before: initial, inserted, undone }, null, 2),
    )
    if (observe) {
      const expected = structuredClone(initial)
      expected.tables.tasks.resources = inserted.tables.tasks.resources
      assert.deepEqual(undone, expected, 'Known defect must be limited to retained attachment resource maps')
      assert.notDeepEqual(undone, initial)
      report.defects.push(
        state + ': insert Undo retains newly added attachment resources despite removing their records',
      )
    } else
      assert.deepEqual(
        undone,
        initial,
        'Bulk insert Undo must restore the full snapshot, including attachment resources',
      )
    await api.redo()
    assert.deepEqual(json(base.save()), inserted)
    const first = table.getRecordById(records[0].getId()),
      before = json(first.getValues())
    assert.equal(first.setValues({ status: 'review', hours: 6.5 }), true)
    assert.deepEqual(json(first.getValues()), { ...before, status: 'review', hours: 6.5 })
    const patch = json(base.save())
    await api.undo()
    assert.deepEqual(json(base.save()), inserted)
    await api.redo()
    assert.deepEqual(json(base.save()), patch)
    assert.deepEqual(table.getRange(0, 1, 3, 2).getValues(), [
      ['review', 6.5],
      ['active', 0.5],
      ['review', 2.5],
    ])
    assert.equal(
      table.getRange(0, 1, 3, 2).setValues([
        ['active', 1],
        ['review', 2],
        ['done', 3],
      ]),
      true,
    )
    const bulk = json(base.save())
    await api.undo()
    assert.deepEqual(json(base.save()), patch, 'Range write is one Undo')
    await api.redo()
    assert.deepEqual(json(base.save()), bulk)
    assert.equal(first.setOrderKey('z9999'), true)
    assert.equal(table.getRecords().at(-1).getId(), first.getId())
    const moved = json(base.save())
    await api.undo()
    assert.deepEqual(json(base.save()), bulk)
    await api.redo()
    assert.deepEqual(json(base.save()), moved)
    const copied = first.duplicate({
      values: { ...first.getValues(), title: 'Lantern fallback checklist' },
      orderKey: 'z9999-copy',
    })
    assert.notEqual(copied.getId(), first.getId())
    assert.equal(copied.getValue('title'), 'Lantern fallback checklist')
    const withCopy = json(base.save())
    assert.equal(table.deleteRecords([first.getId(), copied.getId()]), true)
    await api.undo()
    assert.deepEqual(json(base.save()), withCopy, 'Bulk delete restores every field and order')
    assert.throws(() => table.getRange(0, 1, 1, 1).setValues([['done', 2]]), /exceeds range/)
    assert.deepEqual(json(base.save()), withCopy, 'Invalid range preserves every field')
    api.disposeUnit(base.getId())
    const restored = api.createBase(withCopy)
    assert.deepEqual(json(restored.save()), withCopy)
    api.disposeUnit(restored.getId())
    console.log(
      'PASS',
      state,
      'bulk/partial/range writes, native atomic history, ordering, duplication, invalid shape and exact reload',
    )
    report.states.push(state)
  }
  report.passed = true
  report.status = observe ? 'passed-with-known-sdk-defect' : 'passed'
} catch (error) {
  report.failure = error.stack || String(error)
} finally {
  api.dispose()
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
}
console.log(JSON.stringify({ ...report, failure: report.failure?.slice(0, 2000) }, null, 2))
assert.ok(report.passed, 'Base record SDK checks failed; see report.json for exact evidence')
