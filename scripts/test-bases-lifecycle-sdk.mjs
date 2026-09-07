/* eslint-disable no-await-in-loop -- Check native history and recreation in dependent order. */
import assert from 'node:assert/strict'

import { formatBaseDateValue, formatBaseNumberValue, UniverBasesPlugin } from '@univerjs-pro/bases'
import { BaseFieldType, IUniverInstanceService, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'

import { createData } from '../showcase/bases/create-base-and-tables/code/data.ts'

import '@univerjs-pro/bases/facade'

const univer = new Univer()
univer.registerPlugin(UniverBasesPlugin)
const api = FUniver.newAPI(univer)
const json = (value) => JSON.parse(JSON.stringify(value))
try {
  for (const state of ['default', 'empty', 'boundary', 'error']) {
    let base = api.createBase(createData(state))
    const baseline = json(base.save())
    for (const table of base.getTables()) {
      for (const record of table.getRecords()) {
        const values = json(record.getValues())
        assert.equal(record.setValues(values), true, `${table.getId()}/${record.getId()}: Facade typed write`)
        assert.deepEqual(json(record.getValues()), values, 'Typed values must survive the actual Facade write path')
      }
    }
    assert.equal(
      base.getTables().reduce((sum, table) => sum + table.getRecords().length, 0),
      state === 'empty' ? 0 : 60,
    )
    const projects = base.getTableById('projects')
    assert.equal(projects.getFieldById('owner').getType(), BaseFieldType.Person)
    assert.equal(projects.getFieldById('brief').getType(), BaseFieldType.Attachment)
    if (state !== 'empty') {
      assert.deepEqual(base.getTableById('tasks').getRecordById('tasks-01').getLinkedRecordIds('project'), [
        'projects-01',
      ])
      const values = projects.getRecordById('projects-01').getValues()
      assert.deepEqual(values.owner, ['nia', 'imani'])
      assert.equal(projects.getFieldById('owner').getConfig().allowMultiple, true)
      assert.equal(formatBaseDateValue(values.due, projects.getFieldById('due').getConfig()), '2027-03-23')
      assert.equal(formatBaseNumberValue(12.5, projects.getFieldById('budget').getConfig()), '12.50')
      assert.equal(formatBaseNumberValue(12.5, base.getTableById('tasks').getFieldById('hours').getConfig()), '12.5')
      assert.ok(projects.getRecordById('projects-01').getValue('brief')[0].source.startsWith('data:'))
    }
    const created = base.insertTable('Finishing checklist', { index: 1, primaryFieldName: 'Check item' })
    assert.equal(base.getTables()[1].getId(), created.getId())
    const formulaName = created.getFormulaName()
    assert.equal(created.setName('Opening checklist'), true)
    assert.equal(created.getFormulaName(), formulaName, 'Display rename must not break stable formula identity')
    const beforeInvalid = json(base.save())
    assert.throws(() => base.insertTable('Bad/name'))
    assert.throws(() => base.insertTable('OPENING CHECKLIST'))
    assert.deepEqual(json(base.save()), beforeInvalid, 'Rejected table names preserve every snapshot field')
    assert.equal(base.deleteTable(created), true)
    univer.__getInjector().get(IUniverInstanceService).focusUnit(base.getId())
    await api.undo()
    assert.deepEqual(json(base.save()), beforeInvalid, 'Undo table deletion restores the full snapshot')
    await api.redo()
    const saved = json(base.save())
    api.disposeUnit(base.getId())
    base = api.createBase(saved)
    assert.deepEqual(json(base.save()), saved, 'All serialized Base/table/resource data survives re-creation')
    assert.deepEqual(
      base.getTables().map((table) => table.getId()),
      baseline.tableOrder,
    )
    api.disposeUnit(base.getId())
    console.log(
      'PASS',
      state,
      'typed fixture, insertion position, rename identity, invalid names, delete/history and exact JSON reload',
    )
  }
} finally {
  api.dispose()
}
