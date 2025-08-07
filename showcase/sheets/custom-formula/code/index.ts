import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { FUNCTION_LIST_USER, functionEnUS, functionUser } from './custom-function'
import { WORKBOOK_DATA } from './data'

import './styles.css'

import '@univerjs/preset-sheets-core/lib/index.css'

const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: mergeLocales(
      sheetsCoreEnUS,
      functionEnUS,
    ),
  },
  presets: [
    UniverSheetsCorePreset({
      container: 'app',
      formula: {
        function: functionUser,
        description: FUNCTION_LIST_USER,
      },
    }),
  ],
})

univerAPI.createWorkbook(WORKBOOK_DATA)
