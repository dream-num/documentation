// Fault injection executes the actual demo factory with SDK boundaries stubbed;
// it does not patch SDK code or establish native interaction acceptance.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import vm from 'node:vm'

const source = fs.readFileSync('showcase/sheets/validation-error-messages/code/create-demo.ts', 'utf8')
assert.ok(source.includes('export function createDemo'))
const code = stripTypeScriptTypes(source.slice(source.indexOf('export function createDemo'))).replace(
  'export function createDemo',
  'exports.createDemo = function createDemo',
)
for (const phase of ['workbook', 'validation', 'event', 'cleanup']) {
  let disposed = 0,
    released = 0,
    removed = 0,
    callback
  const startup = new Error(phase)
  const cleanup = new Error('cleanup')
  const root = {
    dataset: {},
    remove() {
      removed++
    },
  }
  let stage = phase === 'event' ? 0 : 4
  const api = {
    Enum: { LifecycleStages: { Steady: 4 } },
    Event: { LifeCycleChanged: 'lifecycle' },
    getCurrentLifecycleStage: () => stage,
    addEvent(_event, handler) {
      callback = handler
      return {
        dispose() {
          released++
        },
      }
    },
    createWorkbook() {
      if (phase === 'workbook' || phase === 'cleanup') throw startup
    },
    getWorkbook() {
      throw startup
    },
  }
  const exported = {}
  const owner = {}
  vm.runInNewContext(code, {
    exports: exported,
    window: owner,
    document: { createElement: () => root },
    AggregateError,
    coreEnUS: {},
    validationEnUS: {},
    createWorkbookData: () => ({}),
    LocaleType: { EN_US: 'enUS' },
    mergeLocales: () => ({}),
    UniverSheetsCorePreset: () => ({}),
    UniverSheetsDataValidationPreset: () => ({}),
    createUniver: () => ({
      univerAPI: api,
      univer: {
        dispose() {
          disposed++
          if (phase === 'cleanup') throw cleanup
        },
      },
    }),
  })
  const start = () => exported.createDemo({ append() {} })
  if (phase === 'event') {
    const demo = start()
    assert.equal(owner.univerAPI, api)
    stage = 4
    assert.throws(callback, (error) => error === startup)
    demo.dispose()
  } else if (phase === 'cleanup') {
    assert.throws(
      start,
      (error) => error instanceof AggregateError && error.errors[0] === startup && error.errors[1] === cleanup,
    )
  } else assert.throws(start, (error) => error === startup)
  assert.deepEqual([disposed, released, removed, owner.univerAPI], [1, 1, 1, undefined], phase)
}
console.log('PASS workbook, validation, deferred lifecycle and cleanup-error ownership')
