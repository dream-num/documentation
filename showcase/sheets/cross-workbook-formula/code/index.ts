import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, merge } from '@univerjs/presets'
import { SwitchUnits } from './components/switch-units'
import { WORKBOOK_DATA_1, WORKBOOK_DATA_2, WORKBOOK_DATA_3, WORKBOOK_DATA_4 } from './data'
import { state } from './state'

import './styles.css'
import '@univerjs/preset-sheets-core/lib/index.css'

const { univer, univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: merge(
      {},
      sheetsCoreEnUS,
    ),
  },
  presets: [
    UniverSheetsCorePreset({
      container: 'app',
    }),
  ],
})

// Here we set the Univer instance to a global state for use in `SwitchUnits` component
state.setUniver(univer)

univerAPI.createWorkbook(WORKBOOK_DATA_1, { makeCurrent: true })
univerAPI.createWorkbook(WORKBOOK_DATA_2, { makeCurrent: false })
univerAPI.createWorkbook(WORKBOOK_DATA_3, { makeCurrent: false })
univerAPI.createWorkbook(WORKBOOK_DATA_4, { makeCurrent: false })

univerAPI.registerUIPart(
  univerAPI.Enum.BuiltInUIPart.CUSTOM_HEADER,
  // Just a workbook switcher component written in React. If you like other frameworks, you can write your own.
  SwitchUnits,
)
