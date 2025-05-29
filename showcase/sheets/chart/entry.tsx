'use client'

import { Preview } from '@/components/preview'
import { useCodeHighlight } from '@/hooks/use-code'
import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets'
import { UniverSheetsAdvancedPreset } from '@univerjs/presets/preset-sheets-advanced'
import sheetsAdvancedEnUS from '@univerjs/presets/preset-sheets-advanced/locales/en-US'
import sheetsAdvancedZhCN from '@univerjs/presets/preset-sheets-advanced/locales/zh-CN'
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US'
import sheetsCoreZhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN'
import { UniverSheetsDrawingPreset } from '@univerjs/presets/preset-sheets-drawing'
import sheetsDrawingEnUS from '@univerjs/presets/preset-sheets-drawing/locales/en-US'
import sheetsDrawingZhCN from '@univerjs/presets/preset-sheets-drawing/locales/zh-CN'
import { useTheme } from 'nextra-theme-docs'
import { useEffect, useRef } from 'react'
import { WORKBOOK_DATA } from './data'
import { insertChart } from './function'

const code = `
import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets'

import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US'
import '@univerjs/presets/lib/styles/preset-sheets-core.css'

import { UniverSheetsDrawingPreset } from '@univerjs/presets/preset-sheets-drawing'
import sheetsDrawingEnUS from '@univerjs/presets/preset-sheets-drawing/locales/en-US'
import '@univerjs/presets/lib/styles/preset-sheets-drawing.css'

import { UniverSheetsAdvancedPreset } from '@univerjs/presets/preset-sheets-advanced'
import sheetsAdvancedEnUS from '@univerjs/presets/preset-sheets-advanced/locales/en-US'
import '@univerjs/presets/lib/styles/preset-sheets-advanced.css'

import { WORKBOOK_DATA } from './data'
import { insertChart } from './function'

const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: merge(
      {},
      sheetsCoreEnUS,
      sheetsDrawingEnUS,
      sheetsAdvancedEnUS,
    ),
  },
  theme: defaultTheme,
  presets: [
    UniverSheetsCorePreset(),
    UniverSheetsDrawingPreset(),
    UniverSheetsAdvancedPreset({
      license: '1846850823316525117-1-eyJpIjoiMTg0Njg1MDgyMzMxNjUyNTExNyIsInYiOiIxIiwicCI6IkVFNTRrV0NxRkdUOUNWcEJsK2ZNWnBpekgxQ3pDV2dzWEMyKzB1c3RRRFk9IiwiZG0iOlsiKi51bml2ZXIuYWkiLCIqLnVuaXZlci5wbHVzIl0sInJ0IjozLCJmdCI6eyJ1ZiI6eyJtdSI6MjE0NzQ4MzY0NiwiZXQiOjE3Njc4ODc5OTksIm1tIjoyMTQ3NDgzNjQ2LCJjdSI6MjE0NzQ4MzY0Nn0sInNmIjp7ImV0IjoxNzY3ODg3OTk5LCJydiI6dHJ1ZSwicHRuIjoyMTQ3NDgzNjQ2LCJtaXMiOjIxNDc0ODM2NDYsIm1wbiI6MjE0NzQ4MzY0NiwibmMiOjIxNDc0ODM2NDZ9LCJkZiI6eyJldCI6MTc2Nzg4Nzk5OSwicnYiOnRydWUsIm1pcyI6MjE0NzQ4MzY0NiwibXBuIjoyMTQ3NDgzNjQ2fSwid3NmIjp7ImV0IjoxNzY3ODg3OTk5LCJobiI6MjE0NzQ4MzY0Nn19LCJ1ZCI6MTc2Nzg4Nzk5OSwiYXQiOjE3MzYzMzA2ODYsImUiOiJkZXZlbG9wZXJAdW5pdmVyLmFpIiwiZCI6OCwibiI6MTUyfQ==-bjVjDKN3EaHAvf4ySUFxnjHsXiKnk1RSiiOD7RaeXkXRHheSdiMjfctXscfYQxJdleRIA9hSSlc4TO9Ncy/qCQ==-1767887999',
    }),
  ],
})

univerAPI.createWorkbook(WORKBOOK_DATA)

// Insert the chart
univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
  if (stage === univerAPI.Enum.LifecycleStages.Steady) {
    insertChart(univerAPI)
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
    locales: merge(
      {},
      sheetsCoreZhCN,
      sheetsDrawingZhCN,
      sheetsAdvancedZhCN,
    ),
  },
  'en-US': {
    name: 'EN_US',
    locale: LocaleType.EN_US,
    locales: merge(
      {},
      sheetsCoreEnUS,
      sheetsDrawingEnUS,
      sheetsAdvancedEnUS,
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
        UniverSheetsDrawingPreset(),
        UniverSheetsAdvancedPreset({
          license: '1846850823316525117-1-eyJpIjoiMTg0Njg1MDgyMzMxNjUyNTExNyIsInYiOiIxIiwicCI6IkVFNTRrV0NxRkdUOUNWcEJsK2ZNWnBpekgxQ3pDV2dzWEMyKzB1c3RRRFk9IiwiZG0iOlsiKi51bml2ZXIuYWkiLCIqLnVuaXZlci5wbHVzIl0sInJ0IjozLCJmdCI6eyJ1ZiI6eyJtdSI6MjE0NzQ4MzY0NiwiZXQiOjE3Njc4ODc5OTksIm1tIjoyMTQ3NDgzNjQ2LCJjdSI6MjE0NzQ4MzY0Nn0sInNmIjp7ImV0IjoxNzY3ODg3OTk5LCJydiI6dHJ1ZSwicHRuIjoyMTQ3NDgzNjQ2LCJtaXMiOjIxNDc0ODM2NDYsIm1wbiI6MjE0NzQ4MzY0NiwibmMiOjIxNDc0ODM2NDZ9LCJkZiI6eyJldCI6MTc2Nzg4Nzk5OSwicnYiOnRydWUsIm1pcyI6MjE0NzQ4MzY0NiwibXBuIjoyMTQ3NDgzNjQ2fSwid3NmIjp7ImV0IjoxNzY3ODg3OTk5LCJobiI6MjE0NzQ4MzY0Nn19LCJ1ZCI6MTc2Nzg4Nzk5OSwiYXQiOjE3MzYzMzA2ODYsImUiOiJkZXZlbG9wZXJAdW5pdmVyLmFpIiwiZCI6OCwibiI6MTUyfQ==-bjVjDKN3EaHAvf4ySUFxnjHsXiKnk1RSiiOD7RaeXkXRHheSdiMjfctXscfYQxJdleRIA9hSSlc4TO9Ncy/qCQ==-1767887999',
        }),
      ],
    })

    univerAPI.createWorkbook(WORKBOOK_DATA)

    // Insert the chart
    univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
      if (stage === univerAPI.Enum.LifecycleStages.Steady) {
        insertChart(univerAPI)
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
