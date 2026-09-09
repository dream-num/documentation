import type { IDisposable } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import enUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType } from '@univerjs/presets'

import { createLocalSource, customSum } from './custom-function'
import { WORKBOOK_DATA } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false, _legacyLocale?: LocaleType) {
  const root = document.createElement('div')
  root.className = 'custom-formula-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.dataset.ready = 'false'
  root.innerHTML = `<div class="formula-source-controls" aria-label="Simulated local source">
    <button data-action="cached">Recalculate with cache</button>
    <button data-action="reload">Reload source</button>
    <button data-action="registration"></button>
    <span role="status" aria-live="polite"></span>
    <span>Requests: <span data-source="requests">0</span> · Cache hits: <span data-source="cacheHits">0</span> · Pending: <span data-source="pending">0</span></span></div>
    <div class="formula-editor"></div>`
  container.append(root)
  const status = root.querySelector<HTMLElement>('[role="status"]')!
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
  Object.assign(window, { univerAPI })
  let disposed = false
  let frame = 0
  let generation = 0
  let engineState: number | string = 'initializing'
  let lookups: IDisposable[] = []
  let workbook = univerAPI.createWorkbook(structuredClone(WORKBOOK_DATA))
  const refresh = () => {
    if (disposed) return
    const snapshot = source.snapshot()
    for (const key of ['requests', 'cacheHits', 'pending'] as const)
      root.querySelector(`[data-source="${key}"]`)!.textContent = String(snapshot[key])
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
    registration.dataset.registered = 'true'
    registration.title =
      'Re-registering preserves cell edits, but SDK beta.2 needs a workbook reload that discards Undo history.'
  }
  registerLookups()
  const subscriptions = [
    formula.calculationStart(() => {
      engineState = 'calculating'
      status.textContent = 'Calculating…'
      schedule()
    }),
    formula.calculationEnd((state) => {
      engineState = state
      schedule()
    }),
    formula.calculationResultApplied(() => {
      if (disposed) return
      root.dataset.ready = 'true'
      status.textContent = 'Results applied'
      refresh()
    }),
  ]
  const dom = new AbortController()
  for (const button of root.querySelectorAll<HTMLButtonElement>('[data-action]')) {
    button.addEventListener(
      'click',
      () => {
        if (disposed) return
        try {
          switch (button.dataset.action) {
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
                registration.textContent = 'Register & reload (clears Undo)'
                registration.dataset.registered = 'false'
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
          }
          status.textContent = 'Waiting for calculation…'
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
    setDarkMode(value: boolean) {
      root.dataset.theme = value ? 'dark' : 'light'
      univerAPI.toggleDarkMode(value)
    },
    dispose() {
      if (disposed) return
      disposed = true
      const exposed = window as Window & { univerAPI?: typeof univerAPI }
      if (exposed.univerAPI === univerAPI) delete exposed.univerAPI
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
