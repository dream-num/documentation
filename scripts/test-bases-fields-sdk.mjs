/* eslint-disable no-await-in-loop -- Compare each real field mutation with its native Undo. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { UniverBasesPlugin, formatBaseNumberValue } from '@univerjs-pro/bases'
import { BaseFieldType, IUniverInstanceService, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'

import { ADDED_FIELDS, createData, NUMBER_CONFIG } from '../showcase/bases/text-number-currency/code/data.ts'

import '@univerjs-pro/bases/facade'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/base-fields-sdk')
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
      table = base.getTableById('repairs')
    univer.__getInjector().get(IUniverInstanceService).focusUnit(base.getId())
    const initial = json(base.save())
    const added = ADDED_FIELDS.map((field, index) =>
      table.addField(field.name, field.type, { index: index + 2, field }),
    )
    assert.deepEqual(
      added.map((field) => field.getDefaultValue()),
      ['Needs triage', 2, 12.5],
    )
    assert.ok(
      table
        .getRecords()
        .every((record) =>
          added.every(
            (field) => record.getValue(field.getId()) === null && !Object.hasOwn(record.getValues(), field.getId()),
          ),
        ),
      'Missing cells read as null; new defaults never backfill existing records',
    )
    const schema = json(base.save())
    for (const field of added.toReversed()) {
      assert.ok(table.getFieldById(field.getId()))
      await api.undo()
      assert.equal(table.getFieldById(field.getId()), null)
    }
    assert.deepEqual(json(base.save()), initial, 'Creating three fields has three actual Undo steps')
    for (let i = 0; i < 3; i++) await api.redo()
    assert.deepEqual(json(base.save()), schema)
    const units = table.getFieldById('units'),
      beforeCurrency = json(base.save())
    assert.equal(units.changeType(BaseFieldType.Currency, { ...NUMBER_CONFIG, currencySymbol: '$' }), true)
    assert.deepEqual(
      json(table.getTable().records),
      beforeCurrency.tables.repairs.records,
      'Currency type does not multiply or round stored values',
    )
    const currency = json(base.save())
    await api.undo()
    assert.deepEqual(json(base.save()), beforeCurrency)
    await api.redo()
    assert.deepEqual(json(base.save()), currency)
    assert.equal(units.setConfig({ ...units.getConfig(), decimalPlaces: 1, separatorStyle: 'periodComma' }), true)
    assert.equal(formatBaseNumberValue(1250.75, units.getConfig()), '$1.250,8')
    assert.deepEqual(json(table.getTable().records), beforeCurrency.tables.repairs.records)
    const first = table.getRecords()[0] ?? table.addRecord({ title: 'Empty-state intake probe' })
    assert.equal(first.setValue('units', '1250.75'), true)
    assert.equal(first.getValue('units'), 1250.75)
    const beforeInvalid = json(base.save())
    assert.equal(first.setValue('units', '12kg'), false)
    assert.deepEqual(json(base.save()), beforeInvalid, 'SDK rejection preserves the full snapshot')
    assert.equal(units.setConfig({ ...units.getConfig(), allowNegative: false }), true)
    const beforeNegative = json(base.save())
    assert.equal(first.setValue('units', -1), false)
    assert.deepEqual(json(base.save()), beforeNegative)
    assert.equal(first.setValue('units', ''), true)
    assert.equal(first.getValue('units'), null)
    const count = table.getRecords().length
    const withDefaults = table.addRecord({ title: 'Default-value inspection' })
    assert.deepEqual(
      added.map((field) => withDefaults.getValue(field.getId())),
      ['Needs triage', 2, 12.5],
    )
    const explicit = table.addRecord({
      title: 'Explicit blank and zero',
      [added[0].getId()]: '',
      [added[1].getId()]: 0,
      [added[2].getId()]: null,
    })
    assert.equal(explicit.getValue(added[1].getId()), 0)
    assert.equal(explicit.getValue(added[2].getId()), null)
    assert.equal(table.getRecords().length, count + 2)
    const quote = table.getFieldById('quote'),
      beforeType = json(base.save())
    assert.equal(quote.changeType(BaseFieldType.Number, NUMBER_CONFIG), true)
    const afterType = json(base.save())
    assert.deepEqual(
      afterType.tables.repairs.records,
      beforeType.tables.repairs.records,
      'Observed beta.2 type change leaves every old stored value untouched',
    )
    const numericText = Object.values(beforeType.tables.repairs.records).find(
      (record) =>
        typeof record.values.quote === 'string' &&
        record.values.quote.trim() !== '' &&
        Number.isFinite(Number(record.values.quote)),
    )
    if (numericText)
      report.defects.push({
        state,
        kind: 'type-normalization',
        recordId: numericText.id,
        actual: table.getRecordById(numericText.id).getValue('quote'),
        expected: Number(numericText.values.quote),
      })
    const unsafe = added[1],
      beforeDefault = json(base.save())
    assert.equal(unsafe.setDefaultValue('not a number'), true, 'Observed beta.2 accepts an invalid numeric default')
    const unsafeRecord = table.addRecord({ title: 'Unsafe default probe' })
    assert.equal(unsafeRecord.getValue(unsafe.getId()), 'not a number')
    report.defects.push({
      state,
      kind: 'invalid-default',
      fieldId: unsafe.getId(),
      recordId: unsafeRecord.getId(),
      actual: unsafeRecord.getValue(unsafe.getId()),
      expected: 'Reject invalid numeric defaults before record creation',
    })
    await fs.writeFile(
      path.join(directory, `${state}-evidence.json`),
      JSON.stringify({ beforeType, afterType, beforeDefault, unsafe: json(base.save()) }, null, 2),
    )
    const snapshot = json(base.save())
    api.disposeUnit(base.getId())
    const restored = api.createBase(snapshot)
    assert.deepEqual(
      json(restored.save()),
      snapshot,
      'Reload is not implicit cleanup of malformed defaults or old values',
    )
    api.disposeUnit(restored.getId())
    report.states.push(state)
  }
  report.passed = observe || report.defects.length === 0
  report.status = report.defects.length ? 'known-sdk-defects-observed' : 'passed'
} catch (error) {
  report.failure = error.stack || String(error)
} finally {
  api.dispose()
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
}
console.log(JSON.stringify(report, null, 2))
assert.ok(
  report.passed,
  'Field acceptance is incomplete; strict mode rejects missing type normalization and unsafe numeric defaults',
)
