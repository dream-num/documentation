import { LocaleType, merge, Univer, UniverInstanceType } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula'
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt'
import SheetsEnUS from '@univerjs/sheets/locale/en-US'
import { WORKBOOK_DATA } from './data'

import '@univerjs/engine-formula/facade'
import '@univerjs/sheets/facade'
import '@univerjs/sheets-formula/facade'
import '@univerjs/sheets-numfmt/facade'

const univer = new Univer({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: merge(
      {},
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

// eslint-disable-next-line no-console
console.log(JSON.stringify(snapshot, null, 2))
