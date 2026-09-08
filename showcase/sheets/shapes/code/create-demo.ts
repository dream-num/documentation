import { UniverSheetsAdvancedPreset } from '@univerjs/preset-sheets-advanced'
import advancedEnUS from '@univerjs/preset-sheets-advanced/locales/en-US'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { UniverSheetsDrawingPreset } from '@univerjs/preset-sheets-drawing'
import drawingEnUS from '@univerjs/preset-sheets-drawing/locales/en-US'
import { createUniver, LifecycleStages, LocaleType, mergeLocales } from '@univerjs/presets'

import { createWorkbookData } from './data'
import { seedGallery } from './function'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-drawing/lib/index.css'
import '@univerjs/preset-sheets-advanced/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false, _legacyLocale: LocaleType = LocaleType.EN_US) {
  const root = document.createElement('div')
  root.className = 'sheet-shapes-demo'
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
  const ownerWindow = window as typeof window & { univerAPI?: typeof univerAPI }
  let frame = 0
  let disposed = false
  const workbook = univerAPI.createWorkbook(createWorkbookData())
  ownerWindow.univerAPI = univerAPI
  function initialize() {
    if (disposed) return
    if (univerAPI.getCurrentLifecycleStage() < LifecycleStages.Steady) {
      frame = requestAnimationFrame(initialize)
      return
    }
    try {
      seedGallery(univerAPI)
      workbook.setActiveSheet('geometry')
      root.dataset.ready = 'true'
    } catch (error) {
      root.dataset.ready = 'error'
      console.error(error)
    }
  }
  frame = requestAnimationFrame(initialize)
  return {
    univerAPI,
    workbook,
    dispose() {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(frame)
      if (ownerWindow.univerAPI === univerAPI) delete ownerWindow.univerAPI
      univer.dispose()
      root.remove()
    },
  }
}
