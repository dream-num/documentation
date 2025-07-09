import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, merge } from '@univerjs/presets'
import { UniverSheetsCustomShortcutPlugin } from '../code/shortcuts-plugin/plugin'
import { WORKBOOK_DATA } from './data'

import './styles.css'

import '@univerjs/preset-sheets-core/lib/index.css'

const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: merge(
      {},
      sheetsCoreEnUS,
    ),
  },
  presets: [
    UniverSheetsCorePreset(),
  ],
  plugins: [
    UniverSheetsCustomShortcutPlugin,
  ],
})

univerAPI.createWorkbook(WORKBOOK_DATA)
