import { UniverSheetsAdvancedPreset } from '@univerjs/preset-sheets-advanced'
import sheetsAdvancedEnUS from '@univerjs/preset-sheets-advanced/locales/en-US'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { UniverSheetsDrawingPreset } from '@univerjs/preset-sheets-drawing'
import sheetsDrawingEnUS from '@univerjs/preset-sheets-drawing/locales/en-US'
import { createUniver, LocaleType, merge } from '@univerjs/presets'
import { WORKBOOK_DATA } from './data'

import './styles.css'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-drawing/lib/index.css'
import '@univerjs/preset-sheets-advanced/lib/index.css'

const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: merge(
      {},
      sheetsCoreEnUS,
      sheetsDrawingEnUS,
      sheetsAdvancedEnUS,
    ),
  },
  presets: [
    UniverSheetsCorePreset({
      container: 'app',
    }),
    UniverSheetsDrawingPreset(),
    UniverSheetsAdvancedPreset(),
  ],
})

univerAPI.createWorkbook(WORKBOOK_DATA)

univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
  if (stage === univerAPI.Enum.LifecycleStages.Rendered) {
    const fWorkbook = univerAPI.getActiveWorkbook()
    fWorkbook?.openPrintDialog()
  }
})
