import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { UniverSheetsFindReplacePreset } from '@univerjs/preset-sheets-find-replace'
import sheetsFindReplaceEnUS from '@univerjs/preset-sheets-find-replace/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { WORKBOOK_DATA } from './data'

import './styles.css'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-find-replace/lib/index.css'

const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: mergeLocales(
      sheetsCoreEnUS,
      sheetsFindReplaceEnUS,
    ),
  },
  presets: [
    UniverSheetsCorePreset({
      container: 'app',
    }),
    UniverSheetsFindReplacePreset(),
  ],
})

univerAPI.createWorkbook(WORKBOOK_DATA)
