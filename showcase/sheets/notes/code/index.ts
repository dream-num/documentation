import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { UniverSheetsNotePreset } from '@univerjs/preset-sheets-note'
import sheetsNoteEnUS from '@univerjs/preset-sheets-note/locales/en-US'
import { createUniver, LocaleType, merge } from '@univerjs/presets'
import { WORKBOOK_DATA } from './data'

import './styles.css'

import '@univerjs/preset-sheets-note/lib/index.css'
import '@univerjs/preset-sheets-core/lib/index.css'

const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: merge(
      {},
      sheetsCoreEnUS,
      sheetsNoteEnUS,
    ),
  },
  presets: [
    UniverSheetsCorePreset({
      container: 'app',
    }),
    UniverSheetsNotePreset(),
  ],
})

univerAPI.createWorkbook(WORKBOOK_DATA)
