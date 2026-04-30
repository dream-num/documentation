'use client'

import ExchangeClientEnUS from '@univerjs-pro/exchange-client/locale/en-US'
import { LocaleType, mergeLocales, Univer, UniverInstanceType } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import DesignEnUS from '@univerjs/design/locale/en-US'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import SheetsFormulaUIEnUS from '@univerjs/sheets-formula-ui/locale/en-US'
import SheetsNumfmtUIEnUS from '@univerjs/sheets-numfmt-ui/locale/en-US'
import SheetsUIEnUS from '@univerjs/sheets-ui/locale/en-US'
import SheetsEnUS from '@univerjs/sheets/locale/en-US'
import UIEnUS from '@univerjs/ui/locale/en-US'
import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'

import { createExchangeClientConfig } from '../code/config'
import { WORKBOOK_DATA } from '../code/data'
import { registerCorePlugins, registerExchangePlugins } from '../code/function'

import '@univerjs/sheets/facade'
import '@univerjs-pro/exchange-client/facade'

import '@univerjs/design/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs-pro/exchange-client/lib/index.css'
import '@univerjs/sheets-formula-ui/lib/index.css'
import '@univerjs/sheets-numfmt-ui/lib/index.css'
import '@univerjs/sheets-ui/lib/index.css'
import '@univerjs/ui/lib/index.css'

export default function Preview() {
  const divRef = useRef<HTMLDivElement>(null!)

  const { theme } = useTheme()

  useEffect(() => {
    const univer = new Univer({
      darkMode: theme === 'dark',
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: mergeLocales(
          DesignEnUS,
          ExchangeClientEnUS,
          UIEnUS,
          DocsUIEnUS,
          SheetsEnUS,
          SheetsUIEnUS,
          SheetsFormulaUIEnUS,
          SheetsNumfmtUIEnUS,
        ),
      },
    })

    registerCorePlugins(univer, divRef.current)
    registerExchangePlugins(univer, createExchangeClientConfig())
    univer.createUnit(UniverInstanceType.UNIVER_SHEET, WORKBOOK_DATA)

    const univerAPI = FUniver.newAPI(univer)

    return () => {
      univerAPI.dispose()
    }
  }, [theme])

  return (
    <div ref={divRef} className="h-full" />
  )
}
