'use client'

import { Preview } from '@/components/preview'
import { useCodeHighlight } from '@/hooks/use-code'
import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US'
import sheetsCoreZhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN'
import { useTheme } from 'nextra-theme-docs'
import { useEffect, useRef } from 'react'
import ColumnHeaderCustomExtension from './column-header-extension'
import MainCustomExtension from './main-extension'
import RowHeaderCustomExtension from './row-header-extension'

const code = `
import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets'

import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US'
import '@univerjs/presets/lib/styles/preset-sheets-core.css'

import ColumnHeaderCustomExtension from './column-header-extension'
import MainCustomExtension from './main-extension'
import RowHeaderCustomExtension from './row-header-extension'

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
})

univerAPI.createWorkbook({})

// register custom extension
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
    })

    univerAPI.createWorkbook({})

    // register custom extension
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
