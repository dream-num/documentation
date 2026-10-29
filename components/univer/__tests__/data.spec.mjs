import assert from 'node:assert/strict'
import { test } from 'node:test'
import { LocaleType, Univer, UniverInstanceType } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula'
import { workbookData } from '../data.ts'
import '@univerjs/engine-formula/facade'
import '@univerjs/sheets/facade'

async function checkDemo(input) {
  const univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: {} } })
  univer.registerPlugin(UniverFormulaEnginePlugin)
  univer.registerPlugin(UniverSheetsPlugin)
  univer.registerPlugin(UniverSheetsFormulaPlugin)
  univer.createUnit(UniverInstanceType.UNIVER_SHEET, structuredClone(workbookData))
  const univerAPI = FUniver.newAPI(univer)

  try {
    const sheet = univerAPI.getActiveWorkbook().getSheetByName('Feature tour')
    const formula = univerAPI.getFormula()
    sheet.getRange('F7').setValue(input)
    formula.executeCalculation()
    await formula.onCalculationResultApplied(5000)

    const otherInput = sheet.getRange('G7').getValue()
    assert.equal(sheet.getRange('H7').getValue(), input - otherInput)
    const total = sheet
      .getRange('F7:F15')
      .getValues()
      .flat()
      .reduce((sum, value) => sum + value, 0)
    assert.equal(sheet.getRange('E3').getValue(), total)
  } finally {
    univerAPI.dispose()
  }
}

test('the Sheets demo recalculates independently after being recreated', async () => {
  await checkDemo(1500)
  await checkDemo(1800)
})
