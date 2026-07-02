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
          toolbar: false, // hide toolbar
          contextMenu: false, // disable context menu
          formulaBar: false, // hide formula bar
          footer: false, // hide footer
        }),
      ],
    })

    univerAPI.createWorkbook(WORKBOOK_DATA)

    univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
      if (stage === univerAPI.Enum.LifecycleStages.Rendered) {
        const fWorkbook = univerAPI.getActiveWorkbook()!

        // disable selection
        fWorkbook.disableSelection()

        // set read only
        const permission = fWorkbook.getWorkbookPermission()
        permission.setReadOnly()
        univerAPI.setPermissionDialogVisible(false)
      }
    })

    return () => {
      univerAPI.dispose()
    }
  }, [theme])

  return (
    <div ref={divRef} className="h-full" />
  )
}
