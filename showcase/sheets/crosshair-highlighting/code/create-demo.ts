import type { IWorkbookData } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LifecycleStages, LocaleType, mergeLocales } from '@univerjs/presets'
import { UniverSheetsCrosshairHighlightPlugin } from '@univerjs/sheets-crosshair-highlight'
import crosshairEnUS from '@univerjs/sheets-crosshair-highlight/locale/en-US'

import { createFixture } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/sheets-crosshair-highlight/lib/index.css'
import './styles.css'

import '@univerjs/sheets-crosshair-highlight/facade'

export function createDemo(container: HTMLElement, darkMode = false, saved?: IWorkbookData) {
  if (
    saved !== undefined &&
    (saved?.id !== 'oriole-rehearsals' ||
      !Array.isArray(saved.sheetOrder) ||
      ![1, 2].includes(saved.sheetOrder.length) ||
      saved.sheetOrder[0] !== 'rooms' ||
      (saved.sheetOrder.length === 2 && saved.sheetOrder[1] !== 'archive') ||
      saved.sheetOrder.some((id) => {
        const sheet = saved.sheets?.[id]
        return (
          !sheet ||
          sheet.id !== id ||
          !sheet.cellData ||
          ![sheet.rowCount, sheet.columnCount].every(
            (value) => typeof value === 'number' && Number.isInteger(value) && value > 0,
          )
        )
      }))
  )
    throw new Error('Restore an Oriole snapshot with its original sheet IDs and positive dimensions')
  const root = document.createElement('div')
  root.className = 'crosshair-demo'
  root.dataset.ready = 'false'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(coreEnUS, crosshairEnUS),
    },
    presets: [UniverSheetsCorePreset({ ribbonType: 'grid', container: root })],
    plugins: [UniverSheetsCrosshairHighlightPlugin],
  })
  const owner = window as typeof window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  let disposed = false
  let initialized = false
  const initialize = () => {
    if (disposed || initialized || univerAPI.getCurrentLifecycleStage() < LifecycleStages.Steady) return
    initialized = true
    univerAPI.setCrosshairHighlightEnabled(true)
    univerAPI.getWorkbook('oriole-rehearsals')!.getActiveSheet()!.getRange('C4').activate()
    root.dataset.ready = 'true'
  }
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, initialize)
  univerAPI.createWorkbook(saved === undefined ? createFixture() : structuredClone(saved))
  initialize()
  return {
    univerAPI,
    dispose() {
      if (disposed) return
      disposed = true
      lifecycle.dispose()
      if (owner.univerAPI === univerAPI) delete owner.univerAPI
      univer.dispose()
      root.remove()
    },
  }
}
