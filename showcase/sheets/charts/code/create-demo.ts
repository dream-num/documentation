/* eslint-disable no-await-in-loop -- Activate and insert each native worksheet chart in order. */
import { UniverSheetsAdvancedPreset } from '@univerjs/preset-sheets-advanced'
import advancedEnUS from '@univerjs/preset-sheets-advanced/locales/en-US'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { UniverSheetsDrawingPreset } from '@univerjs/preset-sheets-drawing'
import drawingEnUS from '@univerjs/preset-sheets-drawing/locales/en-US'
import { createUniver, LifecycleStages, LocaleType, mergeLocales } from '@univerjs/presets'

import { createWorkbookData, VARIANTS } from './data'
import { buildChart } from './function'
import themeJson from './theme.json'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-drawing/lib/index.css'
import '@univerjs/preset-sheets-advanced/lib/index.css'
import './styles.css'
export function createDemo(container: HTMLElement, darkMode = false, _legacyLocale: LocaleType = LocaleType.EN_US) {
  const root = document.createElement('div')
  root.className = 'sheet-charts-demo'
  root.dataset.ready = 'false'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(coreEnUS, drawingEnUS, advancedEnUS),
    },
    presets: [
      UniverSheetsCorePreset({ ribbonType: 'grid', container: root }),
      UniverSheetsDrawingPreset(),
      UniverSheetsAdvancedPreset(),
    ],
  })
  const workbook = univerAPI.createWorkbook(createWorkbookData())
  const owner = window as Window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  const listeners = new AbortController()
  let disposed = false
  let initialized = false
  let frame = 0
  let pending = Promise.resolve()
  // Prevent native edits racing initialization without replacing any SDK UI.
  const gate = (event: Event) => {
    if (!initialized) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }
  for (const event of ['pointerdown', 'keydown', 'beforeinput', 'paste', 'drop'])
    root.addEventListener(event, gate, { capture: true, signal: listeners.signal })
  function initialize() {
    if (disposed) return
    if (univerAPI.getCurrentLifecycleStage() < LifecycleStages.Steady) {
      frame = requestAnimationFrame(initialize)
      return
    }
    pending = (async () => {
      try {
        univerAPI.registerTheme('aster-warm', themeJson)
        for (const [variant] of VARIANTS) {
          if (disposed) return
          const sheet = workbook.getSheetBySheetId(variant)!
          workbook.setActiveSheet(variant)
          try {
            await sheet.insertChart(buildChart(sheet, univerAPI, variant))
          } catch (error) {
            if (disposed) return
            // Keep other native variants available. A rejected chart is never replaced
            // with a host-rendered imitation or counted as a successful insertion.
            sheet.getRange('F3').setValue('SDK could not create this chart. Check chart-type licensing.')
            sheet.getRange('F4').setValue(String(error))
            root.dataset.failedVariants = [root.dataset.failedVariants, variant].filter(Boolean).join(',')
          }
        }
        if (!disposed) {
          workbook.setActiveSheet('column')
          initialized = true
          root.dataset.ready = 'true'
        }
      } catch (error) {
        if (!disposed) {
          root.dataset.error = 'true'
          const status = document.createElement('p')
          status.setAttribute('role', 'alert')
          status.textContent = 'Chart initialization failed: ' + String(error)
          root.prepend(status)
        }
      }
    })()
  }
  frame = requestAnimationFrame(initialize)
  return {
    univerAPI,
    workbook,
    dispose() {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(frame)
      listeners.abort()
      if (owner.univerAPI === univerAPI) delete owner.univerAPI
      root.remove()
      // SDK has no cancellation API: finish an in-flight insertion before disposal.
      void pending.finally(() => univer.dispose())
    },
  }
}
