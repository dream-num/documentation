import { UniverSheetsPivotTablePlugin } from '@univerjs-pro/sheets-pivot'
import { LocaleType, Univer } from '@univerjs/core'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import { UniverRPCWorkerThreadPlugin } from '@univerjs/rpc'
import { UniverSheetsPlugin } from '@univerjs/sheets'

// Univer web worker is also a univer application.
const univer = new Univer({
  locale: LocaleType.ZH_CN,
})

univer.registerPlugin(UniverSheetsPlugin)
univer.registerPlugin(UniverFormulaEnginePlugin)
univer.registerPlugin(UniverRPCWorkerThreadPlugin)
univer.registerPlugin(UniverSheetsPivotTablePlugin, {
  notExecuteFormula: false,
})

declare let self: WorkerGlobalScope & typeof globalThis & { univer: Univer }
self.univer = univer
