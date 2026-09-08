import { LocaleType, mergeLocales, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import EngineFormulaEnUS from '@univerjs/engine-formula/locale/en-US'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula'
import SheetsFormulaEnUS from '@univerjs/sheets-formula/locale/en-US'
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt'
import SheetsEnUS from '@univerjs/sheets/locale/en-US'

import { WORKBOOK_DATA } from './data.ts'

import '@univerjs/engine-formula/facade'
import '@univerjs/sheets/facade'
import '@univerjs/sheets-formula/facade'
import '@univerjs/sheets-numfmt/facade'

export function createHeadlessDemo(_legacyLocale: LocaleType = LocaleType.EN_US) {
  const univer = new Univer({
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergeLocales(EngineFormulaEnUS, SheetsFormulaEnUS, SheetsEnUS) },
  })

  univer.registerPlugin(UniverRenderEnginePlugin)
  univer.registerPlugin(UniverFormulaEnginePlugin)
  univer.registerPlugin(UniverDocsPlugin)
  univer.registerPlugin(UniverSheetsPlugin)
  univer.registerPlugin(UniverSheetsFormulaPlugin)
  univer.registerPlugin(UniverSheetsNumfmtPlugin)

  const univerAPI = FUniver.newAPI(univer)
  const workbook = univerAPI.createWorkbook(structuredClone(WORKBOOK_DATA))
  const snapshot = workbook.save()

  return { snapshot, dispose: () => univer.dispose() }
}
