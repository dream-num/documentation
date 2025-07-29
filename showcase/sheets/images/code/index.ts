import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { UniverSheetsDrawingPreset } from '@univerjs/preset-sheets-drawing'
import sheetsDrawingEnUS from '@univerjs/preset-sheets-drawing/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { WORKBOOK_DATA } from './data'

import './styles.css'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-drawing/lib/index.css'

const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: mergeLocales(
      sheetsCoreEnUS,
      sheetsDrawingEnUS,
    ),
  },
  presets: [
    UniverSheetsCorePreset({
      container: 'app',
    }),
    UniverSheetsDrawingPreset(),
  ],
})

univerAPI.createWorkbook(WORKBOOK_DATA)

univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, async (event) => {
  if (event.stage === univerAPI.Enum.LifecycleStages.Rendered) {
    const fWorkbook = univerAPI.getActiveWorkbook()
    const fWorksheet = fWorkbook?.getActiveSheet()

    const imageUrl = 'https://avatars.githubusercontent.com/u/61444807'

    // Insert a floating image into the active worksheet
    const image = await fWorksheet?.newOverGridImage()
      .setSource(imageUrl, univerAPI.Enum.ImageSourceType.URL)
      .setColumn(5)
      .setRow(5)
      .setWidth(120)
      .setHeight(120)
      .buildAsync()

    image && fWorksheet?.insertImages([image])

    // Insert a cell image into the active worksheet
    const cells = ['A1', 'B1', 'C1', 'D1', 'E1']
    cells.forEach((cell) => {
      const fRange = fWorksheet?.getRange(cell)
      fRange?.insertCellImageAsync(imageUrl)
    })
  }
})
