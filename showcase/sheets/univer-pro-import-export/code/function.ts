import type { Univer } from '@univerjs/core'
import { UniverExchangeClientPlugin } from '@univerjs-pro/exchange-client'
import { UniverSheetsExchangeClientPlugin } from '@univerjs-pro/sheets-exchange-client'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula'
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui'
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt'
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui'
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui'
import { UniverUIPlugin } from '@univerjs/ui'

import { FRONTEND_ONLY_EXCHANGE_MENU } from './config'

export function registerCorePlugins(univer: Univer, container: HTMLElement | string) {
  univer.registerPlugin(UniverRenderEnginePlugin)
  univer.registerPlugin(UniverFormulaEnginePlugin)
  univer.registerPlugin(UniverUIPlugin, { ribbonType: 'grid', container })
  univer.registerPlugin(UniverDocsPlugin)
  univer.registerPlugin(UniverDocsUIPlugin)
  univer.registerPlugin(UniverSheetsPlugin)
  univer.registerPlugin(UniverSheetsUIPlugin)
  univer.registerPlugin(UniverSheetsFormulaPlugin)
  univer.registerPlugin(UniverSheetsFormulaUIPlugin)
  univer.registerPlugin(UniverSheetsNumfmtPlugin)
  univer.registerPlugin(UniverSheetsNumfmtUIPlugin)
}

export function registerExchangePlugins(univer: Univer) {
  univer.registerPlugin(UniverExchangeClientPlugin)
  univer.registerPlugin(UniverSheetsExchangeClientPlugin, { menu: FRONTEND_ONLY_EXCHANGE_MENU })
}
