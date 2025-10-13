'use client'

import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'
import { customRegisterEvent } from '../code/custom-register-event'
import { WORKBOOK_DATA } from '../code/data'

import '@univerjs/preset-sheets-core/lib/index.css'

export default function Preview() {
  const divRef = useRef<HTMLDivElement>(null!)

  const { theme } = useTheme()

  useEffect(() => {
    const { univer, univerAPI } = createUniver({
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
        }),
      ],
    })

    univerAPI.createWorkbook(WORKBOOK_DATA)

    customRegisterEvent(univer, univerAPI)

    return () => {
      univerAPI.dispose()
    }
  }, [theme])

  return (
    <div ref={divRef} className="h-full" />
  )
}
