'use client'

import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US'
import sheetsCoreZhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN'
import { UniverSheetsCrosshairHighlightPlugin } from '@univerjs/sheets-crosshair-highlight'
import SheetsCrosshairHighlightEnUS from '@univerjs/sheets-crosshair-highlight/locale/en-US'
import SheetsCrosshairHighlightZhCN from '@univerjs/sheets-crosshair-highlight/locale/zh-CN'
import { useTheme } from 'nextra-theme-docs'
import { useEffect, useRef } from 'react'
import { Preview } from '@/components/preview'
import { useCodeHighlight } from '@/hooks/use-code'
import '@univerjs/sheets-crosshair-highlight/facade'

const code = `
import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets'

import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US'
import '@univerjs/presets/lib/styles/preset-sheets-core.css'

import { UniverSheetsCrosshairHighlightPlugin } from '@univerjs/sheets-crosshair-highlight'
import SheetsCrosshairHighlightEnUS from '@univerjs/sheets-crosshair-highlight/locale/en-US'
import '@univerjs/sheets-crosshair-highlight/lib/index.css'
import '@univerjs/sheets-crosshair-highlight/facade'

const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: merge(
      {},
      sheetsCoreEnUS,
      SheetsCrosshairHighlightEnUS,
    ),
  },
  theme: defaultTheme,
  presets: [
    UniverSheetsCorePreset(),
  ],
  plugins: [
    UniverSheetsCrosshairHighlightPlugin,
  ],
})

univerAPI.createWorkbook({})

// Enable crosshair highlight
univerAPI.setCrosshairHighlightEnabled(true)
`

interface IDemoProps {
  lang: 'zh-CN' | 'en-US'
}

const localesMap = {
  'zh-CN': {
    name: 'ZH_CN',
    locale: LocaleType.ZH_CN,
    locales: merge(
      {},
      sheetsCoreZhCN,
      SheetsCrosshairHighlightZhCN,
    ),
  },
  'en-US': {
    name: 'EN_US',
    locale: LocaleType.EN_US,
    locales: merge(
      {},
      sheetsCoreEnUS,
      SheetsCrosshairHighlightEnUS,
    ),
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
        UniverSheetsCrosshairHighlightPlugin,
      ],
    })

    univerAPI.createWorkbook({})

    // Enable crosshair highlight
    univerAPI.setCrosshairHighlightEnabled(true)

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
