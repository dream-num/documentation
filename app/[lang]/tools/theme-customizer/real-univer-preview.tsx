'use client'

import type { IDocumentData, IWorkbookData } from '@univerjs/core'
import type { Theme } from '@univerjs/themes'
import { LocaleType, LogLevel, mergeLocales, ThemeService, Univer, UniverInstanceType } from '@univerjs/core'
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
import SheetsEnUS from '@univerjs/sheets/locale/en-US'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'
import { useEffect, useRef } from 'react'

import '@univerjs/design/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/sheets-formula-ui/lib/index.css'
import '@univerjs/sheets-numfmt-ui/lib/index.css'
import '@univerjs/sheets-ui/lib/index.css'
import '@univerjs/ui/lib/index.css'

type PreviewKind = 'docs' | 'sheets'

const DEMO_WORKBOOK_DATA: Partial<IWorkbookData> = {
  id: 'theme-preview-workbook',
  locale: LocaleType.EN_US,
  name: 'Theme Preview',
  sheetOrder: ['theme-preview-sheet'],
  sheets: {
    'theme-preview-sheet': {
      cellData: {
        0: {
          0: { v: 'Theme token' },
          1: { v: 'Value' },
          2: { v: 'Preview' },
        },
        1: {
          0: { v: 'primary.500' },
          1: { v: 'Brand action' },
          2: { v: 'Selected cell' },
        },
        2: {
          0: { v: 'loop-color.1' },
          1: { v: 'Series color' },
          2: { v: 128 },
        },
      },
      columnCount: 8,
      id: 'theme-preview-sheet',
      name: 'Tokens',
      rowCount: 24,
    },
  },
}

const DEMO_DOCUMENT_DATA: Partial<IDocumentData> = {
  id: 'theme-preview-doc',
  body: {
    dataStream: 'Theme Preview\rUniver Docs uses the same design tokens for toolbar, canvas and document surfaces.\r\n',
  },
}

function createUniver({
  container,
  darkMode,
  kind,
  theme,
}: {
  container: HTMLDivElement
  darkMode: boolean
  kind: PreviewKind
  theme: Theme
}) {
  const univer = new Univer({
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
    theme,
  })

  univer.registerPlugins([
    [UniverRenderEnginePlugin],
    [UniverFormulaEnginePlugin],
    [UniverUIPlugin, {
      container,
      footer: kind === 'sheets',
      header: true,
      toolbar: true,
    }],
    [UniverDocsPlugin],
    [UniverDocsUIPlugin],
  ])

  if (kind === 'sheets') {
    univer.registerPlugins([
      [UniverSheetsPlugin],
      [UniverSheetsUIPlugin],
      [UniverSheetsNumfmtPlugin],
      [UniverSheetsNumfmtUIPlugin],
      [UniverSheetsFormulaPlugin],
      [UniverSheetsFormulaUIPlugin],
    ])
    univer.createUnit(UniverInstanceType.UNIVER_SHEET, DEMO_WORKBOOK_DATA)
  } else {
    univer.createUnit(UniverInstanceType.UNIVER_DOC, DEMO_DOCUMENT_DATA)
  }

  return univer
}

export function RealUniverPreview({
  darkMode,
  kind,
  theme,
}: {
  darkMode: boolean
  kind: PreviewKind
  theme: Theme
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const latestConfigRef = useRef({ darkMode, theme })
  const univerRef = useRef<Univer | null>(null)

  latestConfigRef.current = { darkMode, theme }

  useEffect(() => {
    if (!containerRef.current) return undefined

    const latestConfig = latestConfigRef.current
    const univer = createUniver({
      container: containerRef.current,
      darkMode: latestConfig.darkMode,
      kind,
      theme: latestConfig.theme,
    })

    univerRef.current = univer

    return () => {
      univer.dispose()
      univerRef.current = null
    }
  }, [kind])

  useEffect(() => {
    univerRef.current?.__getInjector().get(ThemeService).setTheme(theme)
  }, [theme])

  useEffect(() => {
    univerRef.current?.__getInjector().get(ThemeService).setDarkMode(darkMode)
  }, [darkMode])

  return (
    <div
      className="h-120 overflow-hidden rounded-md border bg-background"
      data-univer-preview-kind={kind}
      ref={containerRef}
    />
  )
}
