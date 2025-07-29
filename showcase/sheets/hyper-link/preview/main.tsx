'use client'

import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { UniverSheetsHyperLinkPreset } from '@univerjs/preset-sheets-hyper-link'
import sheetsHyperLinkEnUS from '@univerjs/preset-sheets-hyper-link/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'
import { WORKBOOK_DATA } from '../code/data'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-hyper-link/lib/index.css'

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
          sheetsHyperLinkEnUS,
        ),
      },
      presets: [
        UniverSheetsCorePreset({
          container: divRef.current,
        }),
        UniverSheetsHyperLinkPreset({
          urlHandler: {
            navigateToOtherWebsite: url => window.open(`${url}?utm_source=playground`, '_blank', 'noopener,noreferrer'),
          },
        }),
      ],
    })

    univerAPI.createWorkbook(WORKBOOK_DATA)

    return () => {
      univerAPI.dispose()
    }
  }, [theme])

  return (
    <div ref={divRef} className="h-full" />
  )
}
