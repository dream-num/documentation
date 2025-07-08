import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, merge } from '@univerjs/presets'
import { UniverSheetsCrosshairHighlightPlugin } from '@univerjs/sheets-crosshair-highlight'
import sheetsCrosshairHighlightEnUS from '@univerjs/sheets-crosshair-highlight/locale/en-US'
import { WORKBOOK_DATA } from './data'

import './styles.css'

import '@univerjs/preset-sheets-core/lib/index.css'

import '@univerjs/sheets-crosshair-highlight/facade'

const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: merge(
      {},
      sheetsCoreEnUS,
      sheetsCrosshairHighlightEnUS,
    ),
  },
  presets: [
    UniverSheetsCorePreset(),
  ],
  plugins: [
    UniverSheetsCrosshairHighlightPlugin,
  ],
})

univerAPI.createWorkbook(WORKBOOK_DATA)
univerAPI.setCrosshairHighlightEnabled(true)
