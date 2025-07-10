import { UniverSheetsConditionalFormattingPreset } from '@univerjs/preset-sheets-conditional-formatting'
import sheetsConditionalFormattingEnUS from '@univerjs/preset-sheets-conditional-formatting/locales/en-US'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { UniverSheetsDataValidationPreset } from '@univerjs/preset-sheets-data-validation'
import sheetsDataValidationEnUS from '@univerjs/preset-sheets-data-validation/locales/en-US'
import { createUniver, LocaleType, merge } from '@univerjs/presets'
import { luckyToUniver } from './core/lucky-to-univer'
import { luckyJson } from './data'

import './styles.css'

import '@univerjs/preset-sheets-core/lib/index.css'

const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: merge(
      {},
      sheetsCoreEnUS,
      sheetsConditionalFormattingEnUS,
      sheetsDataValidationEnUS,
    ),
  },
  presets: [
    UniverSheetsCorePreset(),
    UniverSheetsConditionalFormattingPreset(),
    UniverSheetsDataValidationPreset(),
  ],
})

const WORKBOOK_DATA = luckyToUniver(luckyJson)

univerAPI.createWorkbook(WORKBOOK_DATA)
