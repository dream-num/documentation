import { FormulaExecutedStateType, UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType } from '@univerjs/presets'

import type { Currency } from './data'
import { CURRENCIES, QUOTE_DATA } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

import '@univerjs/sheets/facade'
import '@univerjs/engine-formula/facade'
import '@univerjs/sheets-numfmt/facade'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'crm-quote'
  root.dataset.state = 'calculating'
  root.innerHTML = `<aside class="quote-sidebar">
    <p class="eyebrow">Orbit CRM · fictional opportunity</p>
    <h2>Northstar Robotics</h2>
    <p>Commercial review · Maya Chen</p>
    <dl>
      <dt>Annual subscription</dt><dd><output aria-label="Subscription subtotal">Calculating…</output></dd>
      <dt>First-year contract</dt><dd><output aria-label="First-year contract">Calculating…</output></dd>
    </dl>
    <p class="hint">The first year includes migration and workflow design.</p>
    <fieldset disabled>
      <legend>Quote assumptions</legend>
      <label>Product<select name="plan"><option>Business</option><option>Enterprise</option><option>Starter</option></select></label>
      <label>Quantity / seats<input name="seats" type="number" min="0" max="1000000" step="1" value="48" required></label>
      <label>Monthly price / USD<input name="monthlyRate" type="number" min="0" max="1000000" step="0.01" value="32" required></label>
      <label>Discount / %<input name="discount" type="number" min="0" max="100" step="0.01" value="12" required></label>
      <label>Quote currency<select name="currency"><option>USD</option><option>EUR</option><option>JPY</option></select></label>
      <label>Illustrative FX / USD<input name="fx" type="number" min="0.000001" max="1000000" step="any" value="1" required></label>
      <button type="button" data-action="apply" title="FRange.setValues() + setNumberFormat()">Apply host inputs</button>
      <button type="button" data-action="sync" title="FRange.getRawValues()">Read sheet into form</button>
    </fieldset>
    <p role="status">Waiting for SDK calculation…</p><p role="alert" hidden></p>
    <p class="hint">FX rates are illustrative. All source prices are USD. Native edits update these totals; your draft changes only when you read the sheet into the form.</p>
  </aside><section class="quote-workspace" aria-label="Quote workbook"><div class="quote-editor"></div></section>`
  container.append(root)
  const editor = root.querySelector<HTMLElement>('.quote-editor')!
  const controls = root.querySelector('fieldset')!
  const applyButton = root.querySelector<HTMLButtonElement>('[data-action="apply"]')!
  const syncButton = root.querySelector<HTMLButtonElement>('[data-action="sync"]')!
  const field = (name: string) => controls.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${name}"]`)!
  const status = root.querySelector<HTMLElement>('[role="status"]')!
  const alert = root.querySelector<HTMLElement>('[role="alert"]')!
  const subtotal = root.querySelector<HTMLOutputElement>('[aria-label="Subscription subtotal"]')!
  const contract = root.querySelector<HTMLOutputElement>('[aria-label="First-year contract"]')!
  const events = new AbortController()
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: sheetsCoreEnUS },
    presets: [UniverSheetsCorePreset({ ribbonType: 'grid', container: editor })],
  })
  const owner = window as typeof window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  const formula = univerAPI.getFormula()
  const workbookId = 'embedded-quote-calculator'
  let disposed = false
  let pending = true
  let rendered = false
  let syncAfterCalculation = true
  let hostError = ''
  let readFrame = 0
  // Native tabs can change focus. The CRM always targets its own source sheet.
  function quoteSheet() {
    return univerAPI.getWorkbook(workbookId)?.getSheetBySheetId('quote')
  }

  function syncForm() {
    const sheet = quoteSheet()
    if (!sheet) throw new Error('The quote source is unavailable. Restore it before applying this draft.')
    const values = sheet.getRange('A4:G4').getRawValues()[0]
    for (const [name, value] of Object.entries({
      plan: values[0],
      seats: values[1],
      monthlyRate: values[2],
      discount: typeof values[3] === 'number' ? values[3] * 100 : values[3],
      currency: values[5],
      fx: values[6],
    }))
      field(name).value = String(value ?? '')
  }

  function draft() {
    return [
      field('plan').value,
      Number(field('seats').value),
      Number(field('monthlyRate').value),
      Number(field('discount').value) / 100,
      field('currency').value,
      Number(field('fx').value),
    ]
  }

  function readback() {
    if (disposed) return
    const sheet = quoteSheet()
    if (!sheet) {
      controls.disabled = true
      subtotal.textContent = contract.textContent = 'Source unavailable'
      status.textContent = 'The quote source is unavailable.'
      alert.hidden = false
      alert.textContent = 'Restore the quote sheet to continue. No previous amount is substituted.'
      root.dataset.state = 'error'
      root.dataset.ready = String(rendered)
      return
    }
    // Raw values retain numeric types; display values may contain currency/percent formatting.
    const inputs = sheet.getRange('A4:D4').getRawValues()[0]
    const subscription = sheet.getRange('E4').getRawValue()
    const firstYear = sheet.getRange('E11').getRawValue()
    const currency = sheet.getRange('F4').getRawValue()
    const fx = sheet.getRange('G4').getRawValue()
    const displays = {
      subscription: sheet.getRange('E4').getDisplayValue(),
      firstYear: sheet.getRange('E11').getDisplayValue(),
    }
    if (!pending && syncAfterCalculation) {
      syncForm()
      syncAfterCalculation = false
    }
    const draftMatches =
      [...controls.querySelectorAll<HTMLInputElement>('input')].every((input) => input.validity.valid) &&
      draft().every((value, index) => value === [...inputs, currency, fx][index])
    const pattern = CURRENCIES[field('currency').value as Currency]?.pattern
    const formatMatches = ['E4', 'E8', 'E9', 'E11'].every(
      (address) => sheet.getRange(address).getNumberFormat() === pattern,
    )
    const valid =
      typeof subscription === 'number' &&
      Number.isFinite(subscription) &&
      typeof firstYear === 'number' &&
      Number.isFinite(firstYear)
    applyButton.disabled = pending || (draftMatches && formatMatches)
    syncButton.disabled = pending || draftMatches
    controls.disabled = !rendered || pending
    subtotal.textContent = pending ? 'Calculating…' : displays.subscription || 'No result'
    contract.textContent = pending ? 'Calculating…' : displays.firstYear || 'No result'
    root.dataset.state = pending ? 'calculating' : hostError || !valid ? 'error' : 'synced'
    root.dataset.ready = String(rendered && !pending)
    status.textContent = pending
      ? 'SDK calculation pending…'
      : valid
        ? draftMatches
          ? 'Your draft matches the current quote.'
          : 'Totals show the current quote. Your draft is not applied.'
        : 'The sheet has a missing or invalid formula result.'
    alert.hidden = !hostError && (pending || valid)
    alert.textContent =
      hostError || (valid ? '' : 'Fix the source inputs or formulas. No previous amount is substituted.')
  }
  function scheduleReadback() {
    if (disposed) return
    cancelAnimationFrame(readFrame)
    readFrame = requestAnimationFrame(readback)
  }
  const started = formula.calculationStart(() => {
    if (disposed) return
    pending = true
    scheduleReadback()
  })
  const applied = formula.calculationResultApplied(() => {
    if (disposed) return
    pending = false
    scheduleReadback()
  })
  // Format/label-only commands can start a pass that has no dirty formulas.
  // That pass ends with NOT_EXECUTED and emits no resultApplied callback.
  const ended = formula.calculationEnd((state) => {
    if (disposed || state !== FormulaExecutedStateType.NOT_EXECUTED) return
    pending = false
    scheduleReadback()
  })
  // Format-only edits need a read even when no formula calculation is scheduled.
  const changes = univerAPI.addEvent(univerAPI.Event.CommandExecuted, scheduleReadback)
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (stage !== univerAPI.Enum.LifecycleStages.Rendered || disposed) return
    rendered = true
    scheduleReadback()
  })
  controls.addEventListener(
    'input',
    () => {
      hostError = ''
      scheduleReadback()
    },
    { signal: events.signal },
  )
  controls.addEventListener(
    'change',
    (event) => {
      hostError = ''
      if (event.target === field('currency')) {
        const currency = field('currency').value as Currency
        if (Object.hasOwn(CURRENCIES, currency)) field('fx').value = String(CURRENCIES[currency].rate)
      }
      scheduleReadback()
    },
    { signal: events.signal },
  )
  controls.addEventListener(
    'click',
    (event) => {
      const action = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]')?.dataset.action
      if (!action || disposed || pending) return
      try {
        hostError = ''
        if (action === 'apply') {
          const invalid = [...controls.querySelectorAll<HTMLInputElement>('input')].find(
            (input) => !input.checkValidity(),
          )
          if (invalid) {
            invalid.focus()
            throw new Error(
              `Invalid ${invalid.name}: enter a number from ${invalid.min} to ${invalid.max}${invalid.step === 'any' ? '' : ` in steps of ${invalid.step}`}. No workbook values were written.`,
            )
          }
          const currency = field('currency').value as Currency
          if (
            !['Business', 'Enterprise', 'Starter'].includes(field('plan').value) ||
            !Object.hasOwn(CURRENCIES, currency)
          )
            throw new Error('Choose a supported product and currency. No workbook values were written.')
          const values = draft()
          const sheet = quoteSheet()
          if (!sheet) throw new Error('The quote source is unavailable. No workbook values were written.')
          const existing = [...sheet.getRange('A4:D4').getRawValues()[0], ...sheet.getRange('F4:G4').getRawValues()[0]]
          if (!values.every((value, index) => value === existing[index])) {
            sheet.getRange('A4:D4').setValues([values.slice(0, 4)])
            sheet.getRange('F4:G4').setValues([values.slice(4)])
          }
          sheet.getRange('E4:E11').setNumberFormat(CURRENCIES[currency].pattern)
        } else if (action === 'sync') {
          syncForm()
        }
        readback()
      } catch (cause) {
        hostError = cause instanceof Error ? cause.message : String(cause)
        readback()
      }
    },
    { signal: events.signal },
  )
  univerAPI.createWorkbook(structuredClone(QUOTE_DATA))
  readback()
  return {
    univerAPI,
    dispose() {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(readFrame)
      events.abort()
      started.dispose()
      applied.dispose()
      ended.dispose()
      changes.dispose()
      lifecycle.dispose()
      if (owner.univerAPI === univerAPI) delete owner.univerAPI
      univer.dispose()
      root.remove()
    },
  }
}
