'use client'

import { Preview } from '@/components/preview'
import { useCodeHighlight } from '@/hooks/use-code'
import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US'
import sheetsCoreZhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN'
import { UniverWatermarkPlugin } from '@univerjs/watermark'
import { useTheme } from 'nextra-theme-docs'
import { useEffect, useRef } from 'react'
import '@univerjs/watermark/facade'

const code = `
import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets'

import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US'
import '@univerjs/presets/lib/styles/preset-sheets-core.css'

import { UniverWatermarkPlugin } from '@univerjs/watermark'
import '@univerjs/watermark/facade'

const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: merge(
      {},
      sheetsCoreEnUS,
    ),
  },
  theme: defaultTheme,
  presets: [
    UniverSheetsCorePreset(),
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

univerAPI.createWorkbook({})
`

interface IDemoProps {
  lang: 'zh-CN' | 'en-US'
}

const localesMap = {
  'zh-CN': {
    name: 'ZH_CN',
    locale: LocaleType.ZH_CN,
    locales: merge({}, sheetsCoreZhCN),
  },
  'en-US': {
    name: 'EN_US',
    locale: LocaleType.EN_US,
    locales: merge({}, sheetsCoreEnUS),
  },
}

export default function Demo(props: IDemoProps) {
  const { lang } = props

  const containerRef = useRef<HTMLDivElement>(null!)

  const { theme } = useTheme()

  const { locale, locales } = localesMap[lang]

  useEffect(() => {
    const { univerAPI } = createUniver({
      darkMode: theme === 'dark',
      locale,
      locales: {
        [locale]: locales,
      },
      theme: defaultTheme,
      presets: [
        UniverSheetsCorePreset({
          container: containerRef.current,
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

    univerAPI.createWorkbook({})

    return () => {
      univerAPI.dispose()
    }
  }, [])

  const codeWithHighlight = useCodeHighlight({
    code,
    lang,
  })

  return (
    <Preview ref={containerRef} code={codeWithHighlight} />
  )
}
