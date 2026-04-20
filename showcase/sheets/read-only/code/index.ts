import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { WORKBOOK_DATA } from './data'

import './styles.css'

import '@univerjs/preset-sheets-core/lib/index.css'

const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: mergeLocales(
      sheetsCoreEnUS,
    ),
  },
  presets: [
    UniverSheetsCorePreset({
      container: 'app',
      toolbar: false, // hide toolbar
      contextMenu: false, // disable context menu
      formulaBar: false, // hide formula bar
      footer: false, // hide footer
    }),
  ],
})

univerAPI.createWorkbook(WORKBOOK_DATA)

univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
  if (stage === univerAPI.Enum.LifecycleStages.Rendered) {
    const fWorkbook = univerAPI.getActiveWorkbook()!

    // disable selection
    fWorkbook.disableSelection()

    // set read only
    const permission = fWorkbook.getWorkbookPermission()
    permission.setReadOnly()
    permission.setPermissionDialogVisible(false)
  }
})
