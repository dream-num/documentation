import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import enUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType } from '@univerjs/presets'

import { createWorkbookData } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false, _legacyLocale?: LocaleType) {
  const root = document.createElement('div')
  root.className = 'freeze-panes-demo'
  root.dataset.ready = 'false'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: enUS },
    presets: [UniverSheetsCorePreset({ container: root, ribbonType: 'grid' })],
  })
  let disposed = false
  const ready = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (stage === univerAPI.Enum.LifecycleStages.Rendered && !disposed) root.dataset.ready = 'true'
  })
  try {
    const workbook = univerAPI.createWorkbook(createWorkbookData())
    workbook.getSheetBySheetId('rows')!.setFrozenRows(2)
    workbook.getSheetBySheetId('columns')!.setFrozenColumns(2)
    workbook.getSheetBySheetId('both')!.setFreeze({ startRow: 2, startColumn: 2, xSplit: 2, ySplit: 2 })
    workbook.setActiveSheet('both')
    // Expose the same live Facade for trying the documented calls in DevTools.
    const ownerWindow = window as Window & { univerAPI?: typeof univerAPI }
    ownerWindow.univerAPI = univerAPI
    return {
      univerAPI,
      workbook,
      dispose() {
        if (disposed) return
        disposed = true
        ready.dispose()
        if (ownerWindow.univerAPI === univerAPI) delete ownerWindow.univerAPI
        univer.dispose()
        root.remove()
      },
    }
  } catch (error) {
    disposed = true
    ready.dispose()
    univer.dispose()
    root.remove()
    throw error
  }
}
