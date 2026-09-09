import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { UniverSheetsFilterPreset } from '@univerjs/preset-sheets-filter'
import filterEnUS from '@univerjs/preset-sheets-filter/locales/en-US'
import { createUniver, LifecycleStages, LocaleType, mergeLocales } from '@univerjs/presets'

import { createWorkbookData } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-filter/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'aggregate-subtotal-formulas'
  container.append(root)
  let instance: ReturnType<typeof createUniver>
  try {
    instance = createUniver({
      darkMode,
      locale: LocaleType.EN_US,
      locales: { [LocaleType.EN_US]: mergeLocales(coreEnUS, filterEnUS) },
      presets: [UniverSheetsCorePreset({ container: root, ribbonType: 'grid' }), UniverSheetsFilterPreset()],
    })
  } catch (error) {
    root.remove()
    throw error
  }
  const { univer, univerAPI } = instance
  const owner = window as typeof window & { univerAPI?: typeof univerAPI }
  let disposed = false
  let initialized = false
  const initialize = () => {
    if (disposed || initialized || univerAPI.getCurrentLifecycleStage() < LifecycleStages.Steady) return
    initialized = true
    try {
      const sheet = univerAPI.getActiveWorkbook()!.getSheetBySheetId('visibility')!
      if (!sheet.getRange('A4:C10').createFilter()) throw new Error('Native filter creation failed')
      sheet.getRange('F14').activate()
      root.dataset.ready = 'true'
    } catch (error) {
      root.dataset.error = String(error)
      const alert = document.createElement('p')
      alert.setAttribute('role', 'alert')
      alert.textContent = 'Aggregation demo setup failed. Reload to retry.'
      root.prepend(alert)
      console.error(error)
    }
  }
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, initialize)
  const dispose = () => {
    if (disposed) return
    disposed = true
    lifecycle.dispose()
    if (owner.univerAPI === univerAPI) delete owner.univerAPI
    try {
      univer.dispose()
    } finally {
      root.remove()
    }
  }
  try {
    univerAPI.createWorkbook(createWorkbookData())
    owner.univerAPI = univerAPI
    initialize()
    return { univerAPI, dispose }
  } catch (error) {
    try {
      dispose()
    } catch (cleanupError) {
      // eslint-disable-next-line preserve-caught-error -- Initialization is the primary cause; both errors are retained.
      throw new AggregateError([error, cleanupError], 'Aggregation initialization and cleanup failed', { cause: error })
    }
    throw error
  }
}
