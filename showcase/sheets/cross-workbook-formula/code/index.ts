import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, merge } from '@univerjs/presets'
import { SwitchUnits } from './components/switch-units'
import { WORKBOOK_DATA_1, WORKBOOK_DATA_2, WORKBOOK_DATA_3, WORKBOOK_DATA_4 } from './data'

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
})

univerAPI.createWorkbook(WORKBOOK_DATA_1, { makeCurrent: true })
univerAPI.createWorkbook(WORKBOOK_DATA_2, { makeCurrent: false })
univerAPI.createWorkbook(WORKBOOK_DATA_3, { makeCurrent: false })
univerAPI.createWorkbook(WORKBOOK_DATA_4, { makeCurrent: false })

univerAPI.registerUIPart(
  univerAPI.Enum.BuiltInUIPart.CUSTOM_HEADER,
  SwitchUnits,
)
