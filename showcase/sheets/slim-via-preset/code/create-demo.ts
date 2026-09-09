import { unmount } from '@univerjs/design'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { WORKBOOK_DATA } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false, _legacyLocale: LocaleType = LocaleType.EN_US) {
  const root = document.createElement('div')
  root.className = 'slim-preset'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergeLocales(sheetsCoreEnUS) },
    presets: [UniverSheetsCorePreset({ ribbonType: 'grid', container: root })],
  })

  univerAPI.createWorkbook(structuredClone(WORKBOOK_DATA))
  const demoWindow = window as Window & { univerAPI?: typeof univerAPI }
  demoWindow.univerAPI = univerAPI
  return {
    univerAPI,
    dispose: () => {
      unmount(root)
      univer.dispose()
      if (demoWindow.univerAPI === univerAPI) delete demoWindow.univerAPI
      root.remove()
    },
  }
}
