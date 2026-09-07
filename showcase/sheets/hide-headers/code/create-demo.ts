import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import enUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType } from '@univerjs/presets'

import { WORKBOOK_DATA } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: enUS },
    presets: [UniverSheetsCorePreset({ ribbonType: 'grid', container })],
  })
  univerAPI.createWorkbook(structuredClone(WORKBOOK_DATA))
  return { dispose: () => univer.dispose() }
}
