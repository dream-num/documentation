'use client'

import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import docsCoreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { createUniver, LocaleType, merge } from '@univerjs/presets'
import { UniverWatermarkPlugin } from '@univerjs/watermark'
import { useEffect, useRef } from 'react'
import { DOCUMENT_DATA } from '../code/data'

import '@univerjs/preset-sheets-core/lib/index.css'

import '@univerjs/watermark/facade'

export default function Preview() {
  const divRef = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    const { univerAPI } = createUniver({
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: merge(
          {},
          docsCoreEnUS,
        ),
      },
      presets: [
        UniverDocsCorePreset({
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

    univerAPI.createUniverDoc(DOCUMENT_DATA)
  }, [])

  return (
    <div ref={divRef} className="h-full" />
  )
}
