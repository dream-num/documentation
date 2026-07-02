import type { FUniver } from '@univerjs/presets'
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
      sheets: {
        protectedRangeShadow: false,
      },
    }),
  ],
})

univerAPI.createWorkbook(WORKBOOK_DATA)

async function AddWorksheetProtection(univerAPI: FUniver) {
  const fWorkbook = univerAPI.getActiveWorkbook()
  if (!fWorkbook) return

  univerAPI.setPermissionDialogVisible(false)

  const fWorksheet = fWorkbook.getActiveSheet()
  if (!fWorksheet) return

  const permission = fWorksheet.getWorksheetPermission()
  await permission.protect()
  await permission.setPoint(univerAPI.Enum.WorksheetPermissionPoint.Edit, false)
}

AddWorksheetProtection(univerAPI)
