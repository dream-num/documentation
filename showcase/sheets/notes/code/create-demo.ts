import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { UniverSheetsNotePreset } from '@univerjs/preset-sheets-note'
import noteEnUS from '@univerjs/preset-sheets-note/locales/en-US'
import { createUniver, LifecycleStages, LocaleType, mergeLocales } from '@univerjs/presets'

import { WORKBOOK_DATA } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-note/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'notes-demo'
  root.dataset.ready = 'false'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(coreEnUS, noteEnUS),
    },
    presets: [UniverSheetsCorePreset({ ribbonType: 'grid', container: root }), UniverSheetsNotePreset()],
  })
  const ownerWindow = window as Window & { univerAPI?: typeof univerAPI }
  ownerWindow.univerAPI = univerAPI
  let disposed = false
  let finish!: () => void
  const steady = new Promise<void>((resolve) => {
    finish = resolve
  })
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (stage >= LifecycleStages.Steady) finish()
  })
  univerAPI.createWorkbook(structuredClone(WORKBOOK_DATA))
  if (univerAPI.getCurrentLifecycleStage() >= LifecycleStages.Steady) finish()
  const ready = steady
    .then(async () => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
      if (!disposed) root.dataset.ready = 'true'
    })
    .catch((error) => {
      if (disposed) return
      root.dataset.error = String(error)
      const alert = document.createElement('p')
      alert.setAttribute('role', 'alert')
      alert.textContent = 'The textile notes could not load. Reload to retry; details are in the console.'
      root.prepend(alert)
      console.error(error)
    })
  return {
    univerAPI,
    ready,
    async dispose() {
      if (disposed) return
      disposed = true
      finish()
      lifecycle.dispose()
      await ready
      univer.dispose()
      if (ownerWindow.univerAPI === univerAPI) delete ownerWindow.univerAPI
      root.remove()
    },
  }
}
