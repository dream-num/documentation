import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { UniverSheetsSortUIPlugin } from '@univerjs/sheets-sort-ui'
import sortEnUS from '@univerjs/sheets-sort-ui/locale/en-US'

import { createWorkbookData } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/sheets-sort-ui/lib/index.css'
import './styles.css'

import '@univerjs/sheets-sort/facade'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'sheet-sort-gallery'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergeLocales(coreEnUS, sortEnUS) },
    presets: [UniverSheetsCorePreset({ container: root, ribbonType: 'grid' })],
  })
  univer.registerPlugin(UniverSheetsSortUIPlugin)
  const workbook = univerAPI.createWorkbook(createWorkbookData())
  workbook.getActiveSheet()!.getRange('A5:E12').activate()
  const owner = window as typeof window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  let disposed = false
  return {
    univerAPI,
    dispose() {
      if (disposed) return
      disposed = true
      if (owner.univerAPI === univerAPI) delete owner.univerAPI
      try {
        univer.dispose()
      } finally {
        root.remove()
      }
    },
  }
}
