'use client'

import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'
import { SwitchUnits } from '../code/components/switch-units'
import { WORKBOOK_DATA_1, WORKBOOK_DATA_2, WORKBOOK_DATA_3, WORKBOOK_DATA_4 } from '../code/data'
import { state } from '../code/state'

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

    univerAPI.createWorkbook(WORKBOOK_DATA_1, { makeCurrent: true })
    univerAPI.createWorkbook(WORKBOOK_DATA_2, { makeCurrent: false })
    univerAPI.createWorkbook(WORKBOOK_DATA_3, { makeCurrent: false })
    univerAPI.createWorkbook(WORKBOOK_DATA_4, { makeCurrent: false })

    univerAPI.registerUIPart(
      univerAPI.Enum.BuiltInUIPart.CUSTOM_HEADER,
      SwitchUnits,
    )

    state.setUniver(univer)

    return () => {
      univerAPI.dispose()
    }
  }, [theme])

  return (
    <div ref={divRef} className="h-full" />
  )
}
