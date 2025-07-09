'use client'

import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, merge } from '@univerjs/presets'
import { UniverSheetsCrosshairHighlightPlugin } from '@univerjs/sheets-crosshair-highlight'
import sheetsCrosshairHighlightEnUS from '@univerjs/sheets-crosshair-highlight/locale/en-US'
import { useEffect, useRef } from 'react'
import { WORKBOOK_DATA } from '../code/data'

import '@univerjs/preset-sheets-core/lib/index.css'

import '@univerjs/sheets-crosshair-highlight/facade'

export default function Preview() {
  const divRef = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    const { univerAPI } = createUniver({
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: merge(
          {},
          sheetsCoreEnUS,
          sheetsCrosshairHighlightEnUS,
        ),
      },
      presets: [
        UniverSheetsCorePreset({
          container: divRef.current,
        }),
      ],
      plugins: [
        UniverSheetsCrosshairHighlightPlugin,
      ],
    })

    univerAPI.createWorkbook(WORKBOOK_DATA)
    univerAPI.setCrosshairHighlightEnabled(true)
  }, [])

  return (
    <div ref={divRef} className="h-full" />
  )
}
