'use client'

import { LocaleType, mergeLocales, Univer, UniverInstanceType } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula'
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt'
import SheetsEnUS from '@univerjs/sheets/locale/en-US'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Terminal, TypingAnimation } from '@/components/magicui/terminal'
import { WORKBOOK_DATA } from '../code/data'

import '@univerjs/engine-formula/facade'
import '@univerjs/sheets/facade'
import '@univerjs/sheets-formula/facade'
import '@univerjs/sheets-numfmt/facade'

export default function Preview() {
  const [snapshot, setSnapshot] = useState<string>('')

  const { theme } = useTheme()

  useEffect(() => {
    const univer = new Univer({
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: mergeLocales(
          SheetsEnUS,
        ),
      },
    })

    univer.registerPlugin(UniverRenderEnginePlugin)
    univer.registerPlugin(UniverFormulaEnginePlugin)

    univer.registerPlugin(UniverDocsPlugin)

    univer.registerPlugin(UniverSheetsPlugin)
    univer.registerPlugin(UniverSheetsFormulaPlugin)
    univer.registerPlugin(UniverSheetsNumfmtPlugin)

    univer.createUnit(UniverInstanceType.UNIVER_SHEET, WORKBOOK_DATA)

    const univerAPI = FUniver.newAPI(univer)
    const snapshot = univerAPI.getActiveWorkbook()?.save()

    setSnapshot(JSON.stringify(snapshot, null, 2))

    return () => {
      univerAPI.dispose()
    }
  }, [theme])

  return (
    <div className="h-full">
      <Terminal>
        <TypingAnimation duration={0}>{snapshot}</TypingAnimation>
      </Terminal>
    </div>
  )
}
