'use client'

import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, merge } from '@univerjs/presets'
import { useEffect, useRef } from 'react'
import { WORKBOOK_DATA } from '../code/data'

import '@univerjs/preset-sheets-core/lib/index.css'

export default function Preview() {
  const divRef = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    const { univerAPI } = createUniver({
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: merge(
          {},
          sheetsCoreEnUS,
        ),
      },
      presets: [
        UniverSheetsCorePreset({
          container: divRef.current,
        }),
      ],
    })

    univerAPI.createWorkbook(WORKBOOK_DATA)
  }, [])

  return (
    <div ref={divRef} className="h-full" />
  )
}
