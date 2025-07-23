import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, merge } from '@univerjs/presets'
import { WORKBOOK_DATA } from './data'
import ColumnHeaderCustomExtension from './extensions/column-header.extension'
import MainCustomExtension from './extensions/main.extension'
import RowHeaderCustomExtension from './extensions/row-header.extension'

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
    UniverSheetsCorePreset({
      container: 'app',
    }),
  ],
})

univerAPI.createWorkbook(WORKBOOK_DATA)

univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
  if (stage === univerAPI.Enum.LifecycleStages.Rendered) {
    const unitId = univerAPI.getActiveWorkbook()?.getId()
    if (!unitId) {
      return
    }
    univerAPI.registerSheetRowHeaderExtension(unitId, new RowHeaderCustomExtension())
    univerAPI.registerSheetMainExtension(unitId, new MainCustomExtension())
    univerAPI.registerSheetColumnHeaderExtension(unitId, new ColumnHeaderCustomExtension())
  }
})
