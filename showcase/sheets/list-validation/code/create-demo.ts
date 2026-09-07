import type { DataValidationRenderMode } from '@univerjs/core'
import { UniverSheetsCorePreset, serializeListOptions } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { UniverSheetsDataValidationPreset } from '@univerjs/preset-sheets-data-validation'
import validationEnUS from '@univerjs/preset-sheets-data-validation/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { CATEGORIES, WORKBOOK_DATA } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-data-validation/lib/index.css'
import './styles.css'

const isEmpty = (value: unknown) => value === null || value === undefined || value === ''

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'list-validation-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.dataset.ready = 'false'
  root.innerHTML = `<details class="list-validation-controls" open><summary>List validation · Morrow Museum intake</summary>
    <p>Classify 30 objects in B2:B31. Click a native cell dropdown to choose a material. B4 is invalid, B5 is blank and B31 contains two materials.</p>
    <fieldset><legend>Reproducible fixture</legend>
      <label>Fixture to load <select aria-label="Fixture to load"><option value="default">Mixed initial intake</option><option value="empty">Blank categories</option><option value="error">Invalid batch</option><option value="removed">No validation rule</option></select></label>
      <button data-action="state">Load fixture</button><button data-action="download">Download snapshot JSON</button>
      <span>Loading replaces edits and restores the review date. JSON is a Univer snapshot, not XLSX.</span>
    </fieldset>
    <fieldset><legend>Rule for B2:B31</legend>
      <label>Selection <select aria-label="List selection"><option value="single">Single select</option><option value="multiple">Multiple select</option></select></label>
      <label>Options <select aria-label="List source"><option value="literal">Fixed category list</option><option value="range">Live cells H2:H6</option></select></label>
      <label>Appearance <select aria-label="List appearance"><option value="2">Chips</option><option value="1">Arrow</option><option value="0">Plain text</option></select></label>
      <label><input aria-label="Allow blank" type="checkbox" checked> Allow blank</label>
      <label><input aria-label="Allow invalid input" type="checkbox" checked> Allow invalid input</label>
      <button data-action="apply">Apply rule</button><button data-action="remove">Remove rule</button>
    </fieldset>
    <fieldset><legend>Compare data and validation</legend>
      <label>Target <select aria-label="Target cell"><option>B2</option><option>B4</option><option>B5</option><option>B31</option></select></label>
      <button data-action="select">Select target</button><button data-action="valid">Write Paper sample</button><button data-action="invalid">Write Unknown sample</button><button data-action="blank">Clear target</button>
      <button data-action="reload">Save &amp; reload</button><button data-action="empty">Empty categories</button><button data-action="reset">Reset intake</button>
    </fieldset>
    <p>Samples use Facade writes: Paper (Paper,Textiles in multi-select) or Unknown. Their validity depends on the current source. To test native rejection, disable Allow invalid input, apply and type an unknown category. Reload preserves data and rules, clearing history; Reset restores the review snapshot.</p>
    <p>SDK beta.2 limitation: immediate teardown after a rule change can throw from pending automatic row-height calculation. This demo does not suppress that error.</p>
    <p>Windows clipboard limitation in beta.2: multiline plain-text paste can add trailing spaces to CRLF-separated rows, making an otherwise valid category invalid. Inspect exact values; the demo does not trim them.</p>
  </details>
  <p class="list-validation-status" role="status" aria-live="polite">Waiting for validation plugin…</p>
  <details class="list-validation-readback"><summary>Read current SDK values, rules and validation</summary><pre aria-label="List validation readback"></pre></details>
  <div class="list-validation-editor"></div>`
  container.append(root)
  const status = root.querySelector<HTMLElement>('[role="status"]')!
  const output = root.querySelector<HTMLElement>('pre')!
  const controls = root.querySelector<HTMLElement>('.list-validation-controls')!
  const mode = root.querySelector<HTMLSelectElement>('[aria-label="List selection"]')!
  const source = root.querySelector<HTMLSelectElement>('[aria-label="List source"]')!
  const appearance = root.querySelector<HTMLSelectElement>('[aria-label="List appearance"]')!
  const blank = root.querySelector<HTMLInputElement>('[aria-label="Allow blank"]')!
  const allowInvalid = root.querySelector<HTMLInputElement>('[aria-label="Allow invalid input"]')!
  const target = root.querySelector<HTMLSelectElement>('[aria-label="Target cell"]')!
  const fixture = root.querySelector<HTMLSelectElement>('[aria-label="Fixture to load"]')!
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergeLocales(coreEnUS, validationEnUS) },
    presets: [
      UniverSheetsCorePreset({
        ribbonType: 'grid',
        container: root.querySelector<HTMLElement>('.list-validation-editor')!,
      }),
      UniverSheetsDataValidationPreset(),
    ],
  })
  let disposed = false
  let ready = false
  let frame = 0
  let revision = 0
  let reading = false
  let dirty = false
  let loadedFixture = 'default'
  const pending = new Set<Promise<unknown>>()
  let workbook = univerAPI.createWorkbook(structuredClone(WORKBOOK_DATA))
  const sheet = () => workbook.getActiveSheet()!
  const area = () => sheet().getRange('B2:B31')
  const cell = () => sheet().getRange(target.value)
  const setControls = (disabled: boolean) => {
    controls
      .querySelectorAll<HTMLButtonElement | HTMLSelectElement | HTMLInputElement>('button, select, input')
      .forEach((el) => {
        el.disabled = disabled
      })
  }
  const applyRule = () => {
    const builder = univerAPI.newDataValidation()
    if (source.value === 'range')
      builder.requireValueInRange(sheet().getRange('H2:H6'), mode.value === 'multiple', true)
    else builder.requireValueInList(CATEGORIES, mode.value === 'multiple', true)
    area().setDataValidation(
      builder
        .setAllowBlank(blank.checked)
        .setAllowInvalid(allowInvalid.checked)
        .setOptions({
          renderMode: Number(appearance.value) as DataValidationRenderMode,
          showErrorMessage: true,
          errorTitle: 'Material category',
          error: 'Choose a material from the configured list.',
        })
        .build(),
    )
  }
  const syncInputs = () => {
    const rule = area().getDataValidation()?.rule
    if (!rule) return
    mode.value = rule.type === 'listMultiple' ? 'multiple' : 'single'
    source.value = rule.formula1?.startsWith('=') ? 'range' : 'literal'
    appearance.value = String(rule.renderMode ?? 2)
    blank.checked = Boolean(rule.allowBlank)
    allowInvalid.checked = area().getDataValidation()!.getAllowInvalid()
  }
  const restoreFixture = (state: string) => {
    if (!['default', 'empty', 'error', 'removed'].includes(state)) throw new Error('Unknown fixture state.')
    const snapshot = structuredClone(WORKBOOK_DATA)
    const cells = snapshot.sheets!.intake.cellData!
    if (state === 'empty') {
      for (let row = 1; row <= 30; row++) cells[row][1] = { v: '' }
    } else if (state === 'error') {
      cells[1][1] = { v: 'Glass' }
      cells[2][1] = { v: 'ceramic' }
      cells[5][1] = { v: 0 }
    }
    univerAPI.disposeUnit(workbook.getId())
    workbook = univerAPI.createWorkbook(snapshot)
    mode.value = 'single'
    source.value = 'literal'
    appearance.value = '2'
    blank.checked = state !== 'error'
    allowInvalid.checked = true
    target.value = 'B2'
    fixture.value = state
    loadedFixture = state
    if (state !== 'removed') applyRule()
    cell().activate()
  }
  const refresh = () => {
    if (disposed || !ready) return
    if (reading) {
      dirty = true
      return
    }
    reading = true
    dirty = false
    const captured = revision
    const active = sheet()
    const values = active.getRange('A1:E31').getRawValues()
    const rules = area()
      .getDataValidations()
      .map((rule) => rule.rule)
    const task = area()
      .getValidatorStatus()
      .then((validation) => {
        if (disposed || captured !== revision) return
        output.textContent = JSON.stringify(
          {
            reviewDate: active.getRange('B34').getRawValue(),
            loadedFixture,
            values,
            rules,
            validation,
            validationByCell: Object.fromEntries(validation.flat().map((value, index) => [`B${index + 2}`, value])),
            target: { address: target.value, value: cell().getRawValue() },
            selection: active.getSelection()?.getActiveRange()?.getRange(),
            sourceValues: active.getRange('H2:H6').getRawValues(),
          },
          null,
          2,
        )
        root.querySelector<HTMLButtonElement>('[data-action="remove"]')!.disabled = rules.length === 0
        const sample =
          area().getDataValidation()?.getCriteriaType() === 'listMultiple'
            ? serializeListOptions(['Paper', 'Textiles'])
            : 'Paper'
        root.querySelector<HTMLButtonElement>('[data-action="valid"]')!.disabled = cell().getRawValue() === sample
        root.querySelector<HTMLButtonElement>('[data-action="invalid"]')!.disabled = cell().getRawValue() === 'Unknown'
        root.querySelector<HTMLButtonElement>('[data-action="blank"]')!.disabled = isEmpty(cell().getRawValue())
        root.querySelector<HTMLButtonElement>('[data-action="empty"]')!.disabled = values
          .slice(1)
          .every((row) => isEmpty(row[1]))
      })
      .catch((error: unknown) => {
        if (!disposed) status.textContent = `Validation read failed: ${String(error)}`
      })
      .finally(() => {
        pending.delete(task)
        reading = false
        if (dirty && !disposed) schedule()
      })
    pending.add(task)
  }
  const schedule = () => {
    dirty = true
    cancelAnimationFrame(frame)
    if (!disposed) frame = requestAnimationFrame(refresh)
  }
  const initialize = () => {
    if (disposed || ready || univerAPI.getCurrentLifecycleStage() < univerAPI.Enum.LifecycleStages.Steady) return
    applyRule()
    ready = true
    root.dataset.ready = 'true'
    setControls(false)
    cell().activate()
    status.textContent = 'Single-select chips applied to B2:B31. Compare B4, B5 and B31.'
    schedule()
  }
  const subscriptions = [
    univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, initialize),
    univerAPI.addEvent(univerAPI.Event.CommandExecuted, schedule),
    univerAPI.addEvent(univerAPI.Event.SelectionChanged, schedule),
  ]
  const events = new AbortController()
  target.addEventListener('change', schedule, { signal: events.signal })
  controls.addEventListener(
    'click',
    (event) => {
      const action = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-action]')?.dataset.action
      if (!action || !ready || disposed) return
      try {
        revision++
        switch (action) {
          case 'state':
            restoreFixture(fixture.value)
            status.textContent = `Loaded ${loadedFixture} fixture; edits replaced and review date restored.`
            break
          case 'download': {
            const href = URL.createObjectURL(
              new Blob([JSON.stringify(workbook.save(), null, 2)], { type: 'application/json' }),
            )
            const link = document.createElement('a')
            link.href = href
            link.download = 'morrow-museum-validation.json'
            root.append(link)
            link.click()
            link.remove()
            setTimeout(() => URL.revokeObjectURL(href), 1000)
            status.textContent = 'Snapshot JSON download requested from the live workbook; no Office conversion.'
            break
          }
          case 'apply':
            applyRule()
            status.textContent = 'Rule applied to B2:B31; existing values retained.'
            break
          case 'remove':
            area().setDataValidation(null)
            status.textContent = 'Validation removed from B2:B31; values retained.'
            break
          case 'select':
            cell().activate()
            sheet().scrollToCell(cell().getRow(), 1)
            status.textContent = `${target.value} selected in Univer.`
            break
          case 'valid': {
            const multiple = area().getDataValidation()?.getCriteriaType() === 'listMultiple'
            cell().setValue(multiple ? serializeListOptions(['Paper', 'Textiles']) : 'Paper')
            status.textContent = `Sample written to ${target.value}; SDK validation is shown in readback.`
            break
          }
          case 'invalid':
            cell().setValue('Unknown')
            status.textContent = `Unknown written to ${target.value}; inspect its native validation marker.`
            break
          case 'blank':
            cell().clearContent()
            status.textContent = `${target.value} cleared; compare Allow blank.`
            break
          case 'empty':
            area().clearContent()
            status.textContent = 'All 30 category cells cleared; objects and rules retained.'
            break
          case 'reload': {
            const snapshot = workbook.save()
            univerAPI.disposeUnit(workbook.getId())
            workbook = univerAPI.createWorkbook(snapshot)
            syncInputs()
            cell().activate()
            status.textContent = 'Live values and validation resources reloaded; history cleared.'
            break
          }
          case 'reset':
            restoreFixture('default')
            status.textContent = 'Original intake data, rule and review date restored.'
            break
        }
      } catch (error) {
        status.textContent = `Action failed: ${error instanceof Error ? error.message : String(error)}`
      }
      schedule()
    },
    { signal: events.signal },
  )
  setControls(true)
  initialize()
  return {
    dispose() {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(frame)
      events.abort()
      subscriptions.forEach((handle) => handle.dispose())
      root.remove()
      if (pending.size) void Promise.allSettled(pending).then(() => univer.dispose())
      else univer.dispose()
    },
  }
}
