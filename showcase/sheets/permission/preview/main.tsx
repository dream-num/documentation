'use client'

import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'
import { WORKBOOK_DATA } from '../code/data'

import '@univerjs/preset-sheets-core/lib/index.css'

export default function Preview() {
  const divRef = useRef<HTMLDivElement>(null!)

  const { theme } = useTheme()

  useEffect(() => {
    const { univerAPI } = createUniver({
      darkMode: theme === 'dark',
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: mergeLocales(
          sheetsCoreEnUS,
        ),
      },
      presets: [
        UniverSheetsCorePreset({
          container: divRef.current,
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

    return () => {
      univerAPI.dispose()
    }
  }, [theme])

  return (
    <div ref={divRef} className="h-full" />
  )
}
