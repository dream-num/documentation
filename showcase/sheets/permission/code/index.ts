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

const workbook = univerAPI.getActiveWorkbook()!
const permission = workbook?.getPermission()
if (permission) {
  const unitId = workbook.getId()
  const subUnitId = workbook.getActiveSheet().getSheetId()
  const worksheetEditPermission = permission.permissionPointsDefinition.WorksheetEditPermission

  permission.addWorksheetBasePermission(unitId, subUnitId).then((permissionId) => {
    permission.sheetRuleChangedAfterAuth$.subscribe((currentPermissionId) => {
      if (currentPermissionId === permissionId) {
        permission.setWorksheetPermissionPoint(unitId, subUnitId, worksheetEditPermission, false)
      }
    })
  })
}
