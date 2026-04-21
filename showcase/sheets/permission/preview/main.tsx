'use client'

import type { FUniver } from '@univerjs/presets'
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

  async function AddWorksheetProtection(univerAPI: FUniver) {
    const fWorkbook = univerAPI.getActiveWorkbook()
    if (!fWorkbook) return

    fWorkbook.getWorkbookPermission().setPermissionDialogVisible(false)

    const fWorksheet = fWorkbook.getActiveSheet()
    if (!fWorksheet) return

    const permission = fWorksheet.getWorksheetPermission()
    await permission.protect()
    await permission.setPoint(univerAPI.Enum.WorksheetPermissionPoint.Edit, false)
  }

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

    AddWorksheetProtection(univerAPI)

    return () => {
      univerAPI.dispose()
    }
  }, [theme])

  return (
    <div ref={divRef} className="h-full" />
  )
}
