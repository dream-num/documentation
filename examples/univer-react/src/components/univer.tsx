import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { useEffect, useRef } from 'react'

import '@univerjs/preset-sheets-core/lib/index.css'
import './index.css'

export function Univer() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = containerRef.current
    if (!host) return
    const container = document.createElement('div')
    container.style.height = '100%'
    host.append(container)

    const { univer, univerAPI } = createUniver({
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: mergeLocales(sheetsCoreEnUS),
      },
      presets: [
        UniverSheetsCorePreset({
          container,
        }),
      ],
    })
    univerAPI.createWorkbook({})
    return () => {
      queueMicrotask(() => {
        univer.dispose()
        container.remove()
      })
    }
  }, [])

  return <div ref={containerRef} id="univer" />
}
