'use client'

import { UniverSheetsAdvancedPreset } from '@univerjs/preset-sheets-advanced'
import sheetsAdvancedEnUS from '@univerjs/preset-sheets-advanced/locales/en-US'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'
import { WORKBOOK_DATA } from '../code/data'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-advanced/lib/index.css'

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
          sheetsAdvancedEnUS,
        ),
      },
      presets: [
        UniverSheetsCorePreset({
          container: divRef.current,
        }),
        UniverSheetsAdvancedPreset(),
      ],
    })

    const fWorkbook = univerAPI.createWorkbook(WORKBOOK_DATA)
    const fWorksheet = fWorkbook.getActiveSheet()

    fWorksheet.addRowOutline(3, 4)
    fWorksheet.addRowOutline(4, 2)
    fWorksheet.addRowOutline(8, 4)
    fWorksheet.addColumnOutline(2, 3)
    fWorksheet.addColumnOutline(2, 2)

    const nestedRowOutline = fWorksheet
      .getDimensionOutlines(univerAPI.Enum.DimensionOutlineAxis.ROW)
      .find(outline => outline.start === 4 && outline.end === 5)
    if (nestedRowOutline) {
      fWorksheet.setDimensionOutlineCollapsed(nestedRowOutline.id, true)
    }

    return () => {
      univerAPI.dispose()
    }
  }, [theme])

  return (
    <div ref={divRef} className="h-full" />
  )
}
