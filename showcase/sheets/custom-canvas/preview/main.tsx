'use client'

import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, merge } from '@univerjs/presets'
import { useEffect, useRef } from 'react'
import { WORKBOOK_DATA } from '../code/data'
import ColumnHeaderCustomExtension from '../code/extensions/column-header.extension'
import MainCustomExtension from '../code/extensions/main.extension'
import RowHeaderCustomExtension from '../code/extensions/row-header.extension'

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

    univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
      if (stage === univerAPI.Enum.LifecycleStages.Rendered) {
        const unitId = univerAPI.getActiveWorkbook()?.getId()
        if (!unitId) {
          return
        }
        univerAPI.registerSheetRowHeaderExtension(unitId, new RowHeaderCustomExtension())
        univerAPI.registerSheetMainExtension(unitId, new MainCustomExtension())
        univerAPI.registerSheetColumnHeaderExtension(unitId, new ColumnHeaderCustomExtension())
      }
    })
  }, [])

  return (
    <div ref={divRef} className="h-full" />
  )
}
