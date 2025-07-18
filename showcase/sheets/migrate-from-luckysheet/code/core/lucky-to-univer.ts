import type { IConditionFormattingRule } from '@univerjs/preset-sheets-conditional-formatting'
import type { ISheetDataValidationRule, IWorkbookData, IWorksheetData } from '@univerjs/presets'
import type { ILuckyJson } from '../common/interface/lucky-json'
import { SHEET_CONDITIONAL_FORMATTING_PLUGIN } from '@univerjs/preset-sheets-conditional-formatting'
import { DATA_VALIDATION_PLUGIN_NAME } from '@univerjs/preset-sheets-data-validation'
import { cellData } from './cell'
import { workbookProperty } from './workbook-property'
import { worksheetConfig } from './worksheet-config'
import { worksheetProperty } from './worksheet-property'

export function luckyToUniver(luckyJson: Partial<ILuckyJson>) {
  const workbookData: Partial<IWorkbookData> = {}
  workbookData.styles = {}

  workbookProperty(workbookData, luckyJson)

  const sheets = luckyJson.data
  const dataValidationData: Record<string, ISheetDataValidationRule[]> = {}
  const conditionFormat: Record<string, IConditionFormattingRule[]> = {}

  if (Array.isArray(sheets)) {
    workbookData.sheets = {}
    for (const sheet of sheets) {
      const worksheetData: Partial<IWorksheetData> = {}

      const { worksheetDataVerification, worksheetConditionFormat } = worksheetProperty(workbookData, worksheetData, luckyJson, sheet)

      if (worksheetDataVerification && worksheetDataVerification.length > 0) {
        dataValidationData[worksheetData.id!] = worksheetDataVerification
      }

      if (worksheetConditionFormat && worksheetConditionFormat.length > 0) {
        conditionFormat[worksheetData.id!] = worksheetConditionFormat
      }

      worksheetConfig(workbookData, worksheetData, luckyJson, sheet)
      cellData(workbookData, worksheetData, luckyJson, sheet)

      workbookData.sheets[worksheetData.id!] = worksheetData
    }
  }

  workbookData.resources = [
    {
      name: DATA_VALIDATION_PLUGIN_NAME,
      data: JSON.stringify(dataValidationData),
    },
    {
      name: SHEET_CONDITIONAL_FORMATTING_PLUGIN,
      data: JSON.stringify(conditionFormat),
    },
  ]

  return workbookData
}
