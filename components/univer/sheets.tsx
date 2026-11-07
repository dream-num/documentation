'use client'

import { mergeLocales, UniverInstanceType } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import { UniverSheetsConditionalFormattingUIPlugin } from '@univerjs/sheets-conditional-formatting-ui'
import SheetsConditionalFormattingUIEnUS from '@univerjs/sheets-conditional-formatting-ui/locale/en-US'
import { UniverSheetsDataValidationPlugin } from '@univerjs/sheets-data-validation'
import { UniverSheetsDataValidationUIPlugin } from '@univerjs/sheets-data-validation-ui'
import SheetsDataValidationUIEnUS from '@univerjs/sheets-data-validation-ui/locale/en-US'
import { UniverSheetsFilterUIPlugin } from '@univerjs/sheets-filter-ui'
import SheetsFilterUIEnUS from '@univerjs/sheets-filter-ui/locale/en-US'
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui'
import SheetsFormulaUIEnUS from '@univerjs/sheets-formula-ui/locale/en-US'
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui'
import SheetsNumfmtUIEnUS from '@univerjs/sheets-numfmt-ui/locale/en-US'
import { UniverSheetsSortUIPlugin } from '@univerjs/sheets-sort-ui'
import SheetsSortUIEnUS from '@univerjs/sheets-sort-ui/locale/en-US'
import { UniverSheetsTableUIPlugin } from '@univerjs/sheets-table-ui'
import SheetsTableUIEnUS from '@univerjs/sheets-table-ui/locale/en-US'
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui'
import SheetsUIEnUS from '@univerjs/sheets-ui/locale/en-US'
import SheetsEnUS from '@univerjs/sheets/locale/en-US'
import { useCallback } from 'react'
import type { IUniverCanvasProps } from './canvas'
import { UniverCanvas } from './canvas'
import { workbookData } from './data'
import '@univerjs/sheets-ui/lib/index.css'
import '@univerjs/sheets-formula-ui/lib/index.css'
import '@univerjs/sheets-numfmt-ui/lib/index.css'
import '@univerjs/sheets-conditional-formatting-ui/lib/index.css'
import '@univerjs/sheets-data-validation-ui/lib/index.css'
import '@univerjs/sheets-filter-ui/lib/index.css'
import '@univerjs/sheets-sort-ui/lib/index.css'
import '@univerjs/sheets-table-ui/lib/index.css'
import '@univerjs/sheets/facade'
import '@univerjs/sheets-filter/facade'
import '@univerjs/sheets-table/facade'

const locales = mergeLocales(
  SheetsEnUS,
  SheetsUIEnUS,
  SheetsFormulaUIEnUS,
  SheetsNumfmtUIEnUS,
  SheetsConditionalFormattingUIEnUS,
  SheetsDataValidationUIEnUS,
  SheetsFilterUIEnUS,
  SheetsSortUIEnUS,
  SheetsTableUIEnUS,
)

export default function SheetsDemo() {
  const initialize = useCallback<IUniverCanvasProps['initialize']>((univer) => {
    univer.registerPlugin(UniverFormulaEnginePlugin)
    univer.registerPlugin(UniverSheetsPlugin)
    univer.registerPlugin(UniverSheetsUIPlugin)
    univer.registerPlugin(UniverSheetsFormulaUIPlugin)
    univer.registerPlugin(UniverSheetsNumfmtUIPlugin)
    univer.registerPlugin(UniverSheetsDataValidationPlugin)
    univer.registerPlugin(UniverSheetsDataValidationUIPlugin)
    univer.registerPlugin(UniverSheetsConditionalFormattingUIPlugin)
    univer.registerPlugin(UniverSheetsFilterUIPlugin)
    univer.registerPlugin(UniverSheetsSortUIPlugin)
    univer.registerPlugin(UniverSheetsTableUIPlugin)
    univer.createUnit(UniverInstanceType.UNIVER_SHEET, structuredClone(workbookData))

    const univerAPI = FUniver.newAPI(univer)
    return {
      api: univerAPI,
      onRendered: async () => {
        const workbook = univerAPI.getActiveWorkbook()!
        workbook.getSheetByName('Feature tour')!.getRange('A6:J15').createFilter()
        const practice = workbook.getSheetByName('Practice data')!
        await practice.addTable('FeaturePractice', practice.getRange('A4:I31').getRange(), 'feature-practice-table', {
          tableStyleId: 'table-default-4',
        })
      },
    }
  }, [])

  return <UniverCanvas initialize={initialize} locales={locales} />
}
