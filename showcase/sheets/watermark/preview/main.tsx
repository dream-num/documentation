'use client'

import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, merge } from '@univerjs/presets'
import { UniverWatermarkPlugin } from '@univerjs/watermark'
import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'
import { WORKBOOK_DATA } from '../code/data'

import '@univerjs/preset-sheets-core/lib/index.css'

import '@univerjs/watermark/facade'

export default function Preview() {
  const divRef = useRef<HTMLDivElement>(null!)

  const { theme } = useTheme()

  useEffect(() => {
    const { univerAPI } = createUniver({
      darkMode: theme === 'dark',
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
      plugins: [
        [UniverWatermarkPlugin, {
          textWatermarkSettings: {
            content: 'Hello, Univer!',
            fontSize: 16,
            color: 'rgb(0,0,0)',
            bold: false,
            italic: false,
            direction: 'ltr',
            x: 60,
            y: 36,
            repeat: true,
            spacingX: 200,
            spacingY: 100,
            rotate: 0,
            opacity: 0.15,
          },
        }],
      ],
    })

    univerAPI.createWorkbook(WORKBOOK_DATA)
  }, [])

  return (
    <div ref={divRef} className="h-full" />
  )
}
