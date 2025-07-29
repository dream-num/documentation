import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { UniverSheetsHyperLinkPreset } from '@univerjs/preset-sheets-hyper-link'
import sheetsHyperLinkEnUS from '@univerjs/preset-sheets-hyper-link/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { WORKBOOK_DATA } from './data'

import './styles.css'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-hyper-link/lib/index.css'

const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: mergeLocales(
      sheetsCoreEnUS,
      sheetsHyperLinkEnUS,
    ),
  },
  presets: [
    UniverSheetsCorePreset({
      container: 'app',
    }),
    UniverSheetsHyperLinkPreset({
      urlHandler: {
        navigateToOtherWebsite: url => window.open(`${url}?utm_source=playground`, '_blank', 'noopener,noreferrer'),
      },
    }),
  ],
})

univerAPI.createWorkbook(WORKBOOK_DATA)
