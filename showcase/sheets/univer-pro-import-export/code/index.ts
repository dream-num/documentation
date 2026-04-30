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

import { createExchangeClientConfig } from './config'
import { WORKBOOK_DATA } from './data'
import { registerCorePlugins, registerExchangePlugins } from './function'

import '@univerjs/sheets/facade'
import '@univerjs-pro/exchange-client/facade'

import '@univerjs/design/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs-pro/exchange-client/lib/index.css'
import '@univerjs/sheets-formula-ui/lib/index.css'
import '@univerjs/sheets-numfmt-ui/lib/index.css'
import '@univerjs/sheets-ui/lib/index.css'
import '@univerjs/ui/lib/index.css'

const univer = new Univer({
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

registerCorePlugins(univer, 'app')
registerExchangePlugins(univer, createExchangeClientConfig())

univer.createUnit(UniverInstanceType.UNIVER_SHEET, WORKBOOK_DATA)

FUniver.newAPI(univer)
