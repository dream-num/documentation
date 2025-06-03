'use client'

import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets'
import { UniverSheetsConditionalFormattingPreset } from '@univerjs/presets/preset-sheets-conditional-formatting'
import sheetsConditionalFormattingEnUS from '@univerjs/presets/preset-sheets-conditional-formatting/locales/en-US'
import sheetsConditionalFormattingZhCN from '@univerjs/presets/preset-sheets-conditional-formatting/locales/zh-CN'
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US'
import sheetsCoreZhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN'
import { UniverSheetsDataValidationPreset } from '@univerjs/presets/preset-sheets-data-validation'
import sheetsDataValidationEnUS from '@univerjs/presets/preset-sheets-data-validation/locales/en-US'
import sheetsDataValidationZhCN from '@univerjs/presets/preset-sheets-data-validation/locales/zh-CN'
import { useTheme } from 'nextra-theme-docs'
import { useEffect, useRef } from 'react'
import { Preview } from '@/components/preview'
import { useCodeHighlight } from '@/hooks/use-code'
import { luckyToUniver } from './core/lucky-to-univer'
import { luckyJson } from './lucky-json'

const code = `
import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets'

import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US'
import '@univerjs/presets/lib/styles/preset-sheets-core.css'

import { UniverSheetsConditionalFormattingPreset } from '@univerjs/presets/preset-sheets-conditional-formatting'
import sheetsConditionalFormattingEnUS from '@univerjs/presets/preset-sheets-conditional-formatting/locales/en-US'
import '@univerjs/presets/lib/styles/preset-sheets-conditional-formatting.css'

import { UniverSheetsDataValidationPreset } from '@univerjs/presets/preset-sheets-data-validation'
import sheetsDataValidationEnUS from '@univerjs/presets/preset-sheets-data-validation/locales/en-US'
import '@univerjs/presets/lib/styles/preset-sheets-data-validation.css'

import { luckyToUniver } from './core/lucky-to-univer'
import { luckyJson } from './lucky-json'

const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: merge(
      {},
      sheetsCoreEnUS,
      sheetsConditionalFormattingEnUS,
      sheetsDataValidationEnUS,
    ),
  },
  theme: defaultTheme,
  presets: [
    UniverSheetsCorePreset(),
    UniverSheetsConditionalFormattingPreset(),
    UniverSheetsDataValidationPreset(),
  ],
})

const WORKBOOK_DATA = luckyToUniver(luckyJson)

univerAPI.createWorkbook(WORKBOOK_DATA)
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
      sheetsConditionalFormattingZhCN,
      sheetsDataValidationZhCN,
    ),
  },
  'en-US': {
    name: 'EN_US',
    locale: LocaleType.EN_US,
    locales: merge(
      {},
      sheetsCoreEnUS,
      sheetsConditionalFormattingEnUS,
      sheetsDataValidationEnUS,
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
        UniverSheetsConditionalFormattingPreset(),
        UniverSheetsDataValidationPreset(),
      ],
    })

    const WORKBOOK_DATA = luckyToUniver(luckyJson)

    univerAPI.createWorkbook(WORKBOOK_DATA)

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
