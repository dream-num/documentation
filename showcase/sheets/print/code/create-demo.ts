import type { IWorkbookData } from '@univerjs/presets'
import {
  UniverExchangeClientPlugin,
  UniverSheetsExchangeClientPlugin,
  UniverSheetsAdvancedPreset,
} from '@univerjs/preset-sheets-advanced'
import sheetsAdvancedEnUS from '@univerjs/preset-sheets-advanced/locales/en-US'
import { UniverSheetsCorePreset, unmount } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { UniverSheetsDrawingPreset } from '@univerjs/preset-sheets-drawing'
import sheetsDrawingEnUS from '@univerjs/preset-sheets-drawing/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { WORKBOOK_DATA } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-drawing/lib/index.css'
import '@univerjs/preset-sheets-advanced/lib/index.css'
import './styles.css'

import '@univerjs-pro/sheets-print/facade'

export function validateSnapshot(data: Partial<IWorkbookData>) {
  if (!data.id || !data.sheetOrder?.length || !data.sheetOrder.every((id) => data.sheets?.[id]?.id === id))
    throw new Error('Restore a workbook snapshot with an ID and every ordered worksheet.')
}
export function createPrintDemo(
  container: HTMLElement,
  darkMode = false,
  _legacyLocale: LocaleType = LocaleType.EN_US,
  saved?: Partial<IWorkbookData>,
) {
  const data = structuredClone(saved ?? WORKBOOK_DATA)
  validateSnapshot(data)
  const root = document.createElement('div')
  root.className = 'print-demo'
  root.dataset.ready = 'false'
  container.append(root)
  // Print is frontend-only. Do not register the advanced preset's HTTP Exchange clients.
  const advanced = UniverSheetsAdvancedPreset()
  advanced.plugins = advanced.plugins.filter((entry) => {
    const plugin = Array.isArray(entry) ? entry[0] : entry
    return plugin !== UniverExchangeClientPlugin && plugin !== UniverSheetsExchangeClientPlugin
  })
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(sheetsCoreEnUS, sheetsDrawingEnUS, sheetsAdvancedEnUS),
    },
    presets: [UniverSheetsCorePreset({ ribbonType: 'grid', container: root }), UniverSheetsDrawingPreset(), advanced],
  })
  const owner = window as Window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  let disposed = false,
    frame = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let finish!: () => void
  const ready = new Promise<void>((resolve) => {
    finish = resolve
  })
  function startupError(error: unknown) {
    root.dataset.error = String(error)
    const alert = document.createElement('p')
    alert.setAttribute('role', 'alert')
    alert.textContent = 'The Portfolio portfolio could not start. Reload to retry; details are in the console.'
    root.prepend(alert)
  }
  function waitForCanvas() {
    if (disposed || root.dataset.error) return
    const canvas = root.querySelector<HTMLCanvasElement>('canvas')
    if (
      canvas &&
      canvas.width > 0 &&
      canvas.height > 0 &&
      !root.querySelector('[data-u-comp="workbench-skeleton-content"]')
    ) {
      clearTimeout(timer)
      root.dataset.ready = 'true'
      finish()
    } else frame = requestAnimationFrame(waitForCanvas)
  }
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (stage === univerAPI.Enum.LifecycleStages.Rendered && !disposed) frame = requestAnimationFrame(waitForCanvas)
  })
  function dispose() {
    if (disposed) return
    disposed = true
    lifecycle.dispose()
    cancelAnimationFrame(frame)
    clearTimeout(timer)
    finish()
    const errors: unknown[] = []
    for (const release of [() => unmount(root), () => univerAPI.disposeUnit(data.id!), () => univer.dispose()]) {
      try {
        release()
      } catch (error) {
        errors.push(error)
      }
    }
    if (owner.univerAPI === univerAPI) delete owner.univerAPI
    root.remove()
    if (errors.length) throw new AggregateError(errors, 'Portfolio cleanup failed')
  }
  try {
    timer = setTimeout(() => {
      if (disposed) return
      cancelAnimationFrame(frame)
      const error = new Error('Portfolio native canvas did not become ready within 20 seconds.')
      startupError(error)
      console.error(error)
      finish()
    }, 20000)
    univerAPI.createWorkbook(data)
    return { univerAPI, ready, dispose }
  } catch (error) {
    dispose()
    container.append(root)
    startupError(error)
    throw error
  }
}
