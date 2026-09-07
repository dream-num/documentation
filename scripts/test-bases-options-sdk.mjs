/* eslint-disable no-await-in-loop -- Compare actual SDK history and independent fixtures sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { IUniverInstanceService, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'

import { createData, NEW_OPTION, optionIds } from '../showcase/bases/select-options/code/data.ts'

import '@univerjs-pro/bases/facade'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/base-options-sdk')
await fs.mkdir(directory, { recursive: true })
const observe = process.env.SHOWCASE_OBSERVE_KNOWN_DEFECTS === '1'
const report = { passed: false, states: [], defects: [] }
const json = (value) => JSON.parse(JSON.stringify(value))
const univer = new Univer()
univer.registerPlugin(UniverBasesPlugin)
const api = FUniver.newAPI(univer)
try {
  for (const state of ['default', 'empty', 'boundary', 'error']) {
    const base = api.createBase(createData(state)),
      table = base.getTableById('surveys')
    univer.__getInjector().get(IUniverInstanceService).focusUnit(base.getId())
    const initial = json(base.save()),
      evidence = []
    assert.equal(Object.keys(initial.tables.sites.records).length, 12)
    assert.equal(Object.keys(initial.tables.samples.records).length, 18)
    for (const id of ['priority', 'habitats']) {
      const field = table.getFieldById(id),
        original = json(base.save()),
        options = field.getConfig().options
      const firstId = options[0].id
      assert.equal(field.setConfig({ ...field.getConfig(), options: [...options, NEW_OPTION] }), true)
      assert.deepEqual(json(table.getTable().records), original.tables.surveys.records)
      const created = json(base.save())
      await api.undo()
      assert.deepEqual(json(base.save()), original)
      await api.redo()
      assert.deepEqual(json(base.save()), created)
      const renamed = structuredClone(field.getConfig().options)
      Object.assign(
        renamed.find((item) => item.id === firstId),
        { name: 'Critical', color: '#db2777' },
      )
      assert.equal(field.setConfig({ ...field.getConfig(), options: renamed }), true)
      assert.deepEqual(
        json(table.getTable().records),
        original.tables.surveys.records,
        'Rename/color preserve every stored ID',
      )
      assert.equal(field.setConfig({ ...field.getConfig(), options: renamed.toReversed() }), true)
      assert.deepEqual(
        field.getConfig().options.map((item) => item.id),
        renamed.toReversed().map((item) => item.id),
      )
      assert.deepEqual(
        json(table.getTable().records),
        original.tables.surveys.records,
        'Option ordering does not reorder records',
      )
      const beforeUnused = json(base.save())
      assert.equal(
        field.setConfig({
          ...field.getConfig(),
          options: field.getConfig().options.filter((item) => item.id !== NEW_OPTION.id),
        }),
        true,
      )
      assert.deepEqual(json(table.getTable().records), beforeUnused.tables.surveys.records)
      await api.undo()
      assert.deepEqual(json(base.save()), beforeUnused)
      await api.redo()
      const beforeRemoval = json(base.save())
      assert.equal(
        field.setConfig({
          ...field.getConfig(),
          options: field.getConfig().options.filter((item) => item.id !== firstId),
        }),
        true,
      )
      const orphanRows = table.getRecords().filter((record) => optionIds(record.getValue(id)).includes(firstId))
      if (orphanRows.length)
        report.defects.push({
          state,
          field: id,
          kind: 'used-option-deletion',
          actual: orphanRows.map((record) => record.getId()),
          expected: 'No records reference the removed option',
        })
      const orphanDefault = optionIds(field.getDefaultValue()).includes(firstId)
      if (orphanDefault)
        report.defects.push({
          state,
          field: id,
          kind: 'deleted-option-default',
          actual: field.getDefaultValue(),
          expected: 'Default references only retained options',
        })
      evidence.push({ id, beforeRemoval, afterRemoval: json(base.save()) })
      await api.undo()
      assert.deepEqual(json(base.save()), beforeRemoval, 'Native Undo restores complete option config and references')
      const record = table.getRecords()[0] ?? table.addRecord({ title: 'Empty-state option probe' })
      const beforeWrite = json(base.save())
      assert.equal(record.setValue(id, id === 'priority' ? firstId : [firstId, options[1].id]), true)
      assert.deepEqual(record.getValue(id), id === 'priority' ? firstId : [firstId, options[1].id])
      await api.undo()
      assert.deepEqual(json(base.save()), beforeWrite)
      const raw = id === 'priority' ? 'retired-option-probe' : [firstId, 'retired-option-probe']
      const accepted = record.setValue(id, raw)
      if (accepted && optionIds(record.getValue(id)).includes('retired-option-probe'))
        report.defects.push({
          state,
          field: id,
          kind: 'unknown-id-write',
          actual: record.getValue(id),
          expected: 'Reject unknown option IDs',
        })
      evidence.push({ id, unknownWrite: { accepted, value: record.getValue(id), snapshot: json(base.save()) } })
      assert.deepEqual(
        json(base.save().tables.sites),
        original.tables.sites,
        'The other table has an independent option config',
      )
      assert.deepEqual(json(base.save().tables.samples), original.tables.samples)
    }
    const saved = json(base.save())
    api.disposeUnit(base.getId())
    const restored = api.createBase(saved)
    assert.deepEqual(json(restored.save()), saved, 'Reload preserves complete data, including SDK defects')
    api.disposeUnit(restored.getId())
    await fs.writeFile(path.join(directory, `${state}.json`), JSON.stringify({ initial, evidence, saved }, null, 2))
    report.states.push(state)
  }
  report.status = report.defects.length ? 'known-sdk-defects-observed' : 'passed'
  report.passed = observe || report.defects.length === 0
} catch (error) {
  report.failure = error.stack || String(error)
} finally {
  api.dispose()
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
}
console.log(JSON.stringify(report, null, 2))
assert.ok(
  report.passed,
  'Strict acceptance requires no orphan references after deletion and rejection of unknown option IDs',
)
