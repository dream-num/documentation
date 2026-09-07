import type { IDisposable } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import enUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType } from '@univerjs/presets'

import { createLocalSource, customSum } from './custom-function'
import { WORKBOOK_DATA } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'custom-formula-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.dataset.ready = 'false'
  root.innerHTML = `<p>Juniper cycle deliveries · fictional frontend source (400ms response / 800ms timeout). Scalar/table functions share requests and cache. In beta.2, re-registering reloads the current snapshot to clear stale #NAME? calculations: cell edits are preserved, Undo history is discarded.</p>
    <fieldset><label>Route <select aria-label="Route key"><option>NORTH</option><option>EAST</option><option>EMPTY</option><option>MISSING</option><option>FAULT</option><option>TIMEOUT</option></select></label>
    <button data-action="apply">Apply route</button><button data-action="cached">Recalculate with cache</button><button data-action="reload">Reload source</button><button data-action="registration">Unregister lookups</button><button data-action="reset">Reset deliveries</button></fieldset>
    <p role="status" aria-live="polite">Waiting for the SDK to apply formula results…</p>
    <details><summary>SDK results and separately labeled source diagnostics</summary><pre aria-label="Custom formula readback"></pre></details>
    <div class="formula-editor"></div>`
  container.append(root)
  const status = root.querySelector<HTMLElement>('[role="status"]')!
  const output = root.querySelector<HTMLElement>('pre')!
  const choice = root.querySelector<HTMLSelectElement>('select')!
  const apply = root.querySelector<HTMLButtonElement>('[data-action="apply"]')!
  const registration = root.querySelector<HTMLButtonElement>('[data-action="registration"]')!
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: enUS },
    presets: [
      UniverSheetsCorePreset({ ribbonType: 'grid', container: root.querySelector<HTMLElement>('.formula-editor')! }),
    ],
  })
  const formula = univerAPI.getFormula()
  let disposed = false
  let frame = 0
  let generation = 0
  let engineState: number | string = 'initializing'
  let lookups: IDisposable[] = []
  let workbook = univerAPI.createWorkbook(structuredClone(WORKBOOK_DATA))
  const refresh = () => {
    if (disposed) return
    const sheet = workbook.getActiveSheet()!
    const range = sheet.getRange(0, 0, Math.min(16, sheet.getMaxRows()), Math.min(6, sheet.getMaxColumns()))
    apply.disabled = sheet.getRange('B4').getRawValue() === choice.value
    output.textContent = JSON.stringify(
      {
        hostRegistration: lookups.length ? 'registered' : 'unregistered',
        sdkCalculationState: engineState,
        sourceDiagnostics: source.snapshot(),
        values: range.getValues(),
        rawValues: range.getRawValues(),
        formulas: range.getFormulas(),
      },
      null,
      2,
    )
  }
  const schedule = () => {
    cancelAnimationFrame(frame)
    if (!disposed) frame = requestAnimationFrame(refresh)
  }
  const source = createLocalSource(schedule)
  const sum = formula.registerFunction(
    'CUSTOMSUM',
    customSum,
    'Strict numeric sum: ignores blanks, rejects text and booleans. Accepts values and ranges.',
  )
  const registerLookups = () => {
    lookups = [
      formula.registerAsyncFunction(
        'CUSTOM_ASYNC_OBJECT',
        async (key) => {
          const result = await source.lookup(key)
          return result.error ?? result.data!.status
        },
        'Looks up a fictional route status. NORTH, EAST, EMPTY, MISSING, FAULT, TIMEOUT. Local source only.',
      ),
      formula.registerAsyncFunction(
        'CUSTOM_ASYNC_ARRAY',
        async (key) => {
          const result = await source.lookup(key)
          return result.error ?? [['Stop', 'Minutes'], ...result.data!.stops]
        },
        'Spills a two-column fictional stop table. EMPTY returns only its header. Local source only.',
      ),
    ]
    registration.textContent = 'Unregister lookups'
  }
  registerLookups()
  const subscriptions = [
    formula.calculationStart(() => {
      engineState = 'calculating'
      schedule()
    }),
    formula.calculationEnd((state) => {
      engineState = state
      schedule()
    }),
    formula.calculationResultApplied(() => {
      if (disposed) return
      root.dataset.ready = 'true'
      status.textContent =
        'SDK formula results applied. Edit yellow cells natively; CUSTOMSUM intentionally rejects text. Reset and theme changes discard edits.'
      refresh()
    }),
    univerAPI.addEvent(univerAPI.Event.SheetValueChanged, schedule),
  ]
  const dom = new AbortController()
  choice.addEventListener('change', refresh, { signal: dom.signal })
  for (const button of root.querySelectorAll<HTMLButtonElement>('[data-action]')) {
    button.addEventListener(
      'click',
      () => {
        if (disposed) return
        try {
          switch (button.dataset.action) {
            case 'apply':
              workbook.getActiveSheet()!.getRange('B4').setValue(choice.value)
              break
            case 'cached':
              formula.executeCalculation()
              break
            case 'reload':
              source.clearCache()
              formula.executeCalculation()
              break
            case 'registration':
              if (lookups.length) {
                lookups.forEach((handle) => handle.dispose())
                lookups = []
                registration.textContent = 'Register & reload snapshot'
              } else {
                registerLookups()
                // Recalculation alone leaves previously unknown function nodes stale in beta.2.
                // Recreate through Facade, preserving authored edits but discarding old history.
                const snapshot = workbook.save()
                formula.stopCalculation()
                univerAPI.disposeUnit(workbook.getId())
                workbook = univerAPI.createWorkbook({ ...snapshot, id: `juniper-${++generation}` })
              }
              formula.executeCalculation()
              break
            case 'reset':
              formula.stopCalculation()
              source.clearCache()
              univerAPI.disposeUnit(workbook.getId())
              if (!lookups.length) registerLookups()
              workbook = univerAPI.createWorkbook({ ...structuredClone(WORKBOOK_DATA), id: `juniper-${++generation}` })
              choice.value = 'NORTH'
              break
          }
          status.textContent =
            'Action sent through Facade; waiting for SDK formula application. Source progress is available in diagnostics.'
          refresh()
        } catch (error) {
          status.textContent = `Action failed: ${error instanceof Error ? error.message : String(error)}`
        }
      },
      { signal: dom.signal },
    )
  }
  schedule()
  return {
    dispose() {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(frame)
      dom.abort()
      subscriptions.forEach((handle) => handle.dispose())
      root.remove()
      const release = () => {
        lookups.forEach((handle) => handle.dispose())
        sum.dispose()
        univer.dispose()
      }
      // beta.2 leaves a progress timer behind if its owner is destroyed mid-calculation.
      // Cancel our source immediately, but let the engine consume its settled promises
      // and emit calculationEnd before releasing the owner. No arbitrary timeout.
      if (engineState === 'calculating' || engineState === 'initializing' || source.snapshot().pending > 0) {
        const ended = formula.calculationEnd(() => {
          ended.dispose()
          queueMicrotask(release)
        })
      } else release()
      source.dispose()
    },
  }
}
