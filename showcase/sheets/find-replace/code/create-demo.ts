import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { UniverSheetsFindReplacePreset } from '@univerjs/preset-sheets-find-replace'
import findEnUS from '@univerjs/preset-sheets-find-replace/locales/en-US'
import { createUniver, LifecycleStages, LocaleType, mergeLocales, type IWorkbookData } from '@univerjs/presets'

import { WORKBOOK_DATA } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-find-replace/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false, saved: Partial<IWorkbookData> = WORKBOOK_DATA) {
  if (
    !saved.id ||
    !saved.sheets ||
    !saved.sheetOrder?.length ||
    new Set(saved.sheetOrder).size !== saved.sheetOrder.length ||
    saved.sheetOrder.some((id) => saved.sheets?.[id]?.id !== id)
  )
    throw new Error('A complete saved workbook with matching sheet IDs is required.')
  const root = document.createElement('div')
  root.className = 'find-replace-demo'
  root.dataset.ready = 'false'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(coreEnUS, findEnUS),
    },
    presets: [UniverSheetsCorePreset({ ribbonType: 'grid', container: root }), UniverSheetsFindReplacePreset()],
  })
  let disposed = false
  const markReady = () => {
    if (!disposed && univerAPI.getCurrentLifecycleStage() >= LifecycleStages.Steady) root.dataset.ready = 'true'
  }
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, markReady)
  const controller = {
    univerAPI,
    container,
    createDemo,
    dispose() {
      if (disposed) return
      disposed = true
      lifecycle.dispose()
      if (owner.univerAPI === univerAPI) delete owner.univerAPI
      if (owner.pelicanDemo === controller) delete owner.pelicanDemo
      univer.dispose()
      root.remove()
    },
  }
  const owner = window as typeof window & { univerAPI?: typeof univerAPI; pelicanDemo?: typeof controller }
  owner.univerAPI = univerAPI
  owner.pelicanDemo = controller
  try {
    univerAPI.createWorkbook(structuredClone(saved))
    markReady()
  } catch (error) {
    root.dataset.ready = 'error'
    const alert = document.createElement('p')
    alert.role = 'alert'
    alert.textContent = 'Workbook startup failed: ' + String(error)
    root.append(alert)
    console.error(error)
  }
  return controller
}
