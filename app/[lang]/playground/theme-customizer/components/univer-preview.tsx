'use client'

import type { Theme } from '@univerjs/themes'
import { LocaleType, LogLevel, mergeLocales, ThemeService, Univer, UniverInstanceType } from '@univerjs/core'
import { clsx } from '@univerjs/design'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula'
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui'
import SheetsFormulaUIEnUS from '@univerjs/sheets-formula-ui/locale/en-US'
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt'
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui'
import SheetsNumfmtUIEnUS from '@univerjs/sheets-numfmt-ui/locale/en-US'
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui'
import SheetsUIEnUS from '@univerjs/sheets-ui/locale/en-US'
import { UniverSheetsZenEditorPlugin } from '@univerjs/sheets-zen-editor'
import SheetsEnUS from '@univerjs/sheets/locale/en-US'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'
import { useEffect, useRef } from 'react'
import { PREVIEW_CONTAINER_ID } from './constants'

import '@univerjs/design/lib/index.css'
import '@univerjs/sheets-ui/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/sheets-formula-ui/lib/index.css'
import '@univerjs/sheets-data-validation-ui/lib/index.css'
import '@univerjs/sheets-conditional-formatting-ui/lib/index.css'
import '@univerjs/sheets-filter-ui/lib/index.css'
import '@univerjs/sheets-sort-ui/lib/index.css'
import '@univerjs/sheets-hyper-link-ui/lib/index.css'
import '@univerjs/sheets-table-ui/lib/index.css'
import '@univerjs/sheets-note-ui/lib/index.css'
import '@univerjs/sheets-numfmt-ui/lib/index.css'
import '@univerjs/sheets-zen-editor/lib/index.css'
import '@univerjs/thread-comment-ui/lib/index.css'

// Demo workbook data
const DEMO_WORKBOOK_DATA = {
  id: 'demo-workbook',
  sheetOrder: ['demo-sheet'],
  sheets: {
    'demo-sheet': {
      id: 'demo-sheet',
      name: 'Demo Sheet',
      rowCount: 20,
      columnCount: 10,
      cellData: {
        0: {
          0: { v: 'Hello Univer!' },
          1: { v: 100 },
          2: { v: 200 },
        },
        1: {
          0: { v: 'Theme Preview' },
          1: { v: 300 },
          2: { v: 400 },
        },
      },
    },
  },
  locale: LocaleType.EN_US,
}

export function UniverPreview(props: { theme: Theme, darkMode: boolean }) {
  const { theme, darkMode } = props
  const univerRef = useRef<Univer | null>(null)

  useEffect(() => {
    const univer = new Univer({
      theme,
      darkMode,
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: mergeLocales(
          DesignEnUS,
          UIEnUS,
          DocsUIEnUS,
          SheetsEnUS,
          SheetsUIEnUS,
          SheetsFormulaUIEnUS,
          SheetsNumfmtUIEnUS,
        ),
      },
      logLevel: LogLevel.ERROR,
    })

    univer.registerPlugins([
      [UniverDocsPlugin],
      [UniverRenderEnginePlugin],
      [UniverUIPlugin, {
        container: PREVIEW_CONTAINER_ID,
        header: true,
        toolbar: true,
        footer: true,
      }],
      [UniverDocsUIPlugin],
      [UniverSheetsPlugin],
      [UniverSheetsUIPlugin],
      [UniverSheetsNumfmtPlugin],
      [UniverSheetsZenEditorPlugin],
      [UniverFormulaEnginePlugin],
      [UniverSheetsFormulaPlugin],
      [UniverSheetsFormulaUIPlugin],
      [UniverSheetsNumfmtUIPlugin],
    ])

    univer.createUnit(UniverInstanceType.UNIVER_SHEET, DEMO_WORKBOOK_DATA)
    univerRef.current = univer

    return () => {
      univer.dispose()
      univerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (univerRef.current) {
      univerRef.current.__getInjector().get(ThemeService).setTheme(theme)
    }
  }, [theme])

  useEffect(() => {
    if (univerRef.current) {
      univerRef.current.__getInjector().get(ThemeService).setDarkMode(darkMode)
    }
  }, [darkMode])

  return (
    <div
      id={PREVIEW_CONTAINER_ID}
      className={clsx(`size-full min-h-130 overflow-hidden rounded-[20px] bg-white`)}
    />
  )
}
