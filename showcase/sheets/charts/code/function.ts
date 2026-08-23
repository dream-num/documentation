import type { FWorksheet } from '@univerjs/preset-sheets-core'
import type { FUniver } from '@univerjs/presets'

import themeJson from './theme.json'

export async function insertChart(univerAPI: FUniver) {
  const fWorkbook = univerAPI.getActiveWorkbook()!
  const fWorksheet = fWorkbook.getActiveSheet()

  univerAPI.registerTheme('theme1', themeJson)

  await insertLineChart(fWorksheet, univerAPI)
  await insertBarChart(fWorksheet, univerAPI)
  await insertColumnChart(fWorksheet, univerAPI)
  await insertMultiLevelCategoryChart(fWorksheet, univerAPI)
}

async function insertLineChart(fWorksheet: FWorksheet, univerAPI: FUniver) {
  const lineChartBuildInfo = fWorksheet
    .newChart(univerAPI.Enum.ChartTypeString.Line)
    .setSource('Sheet1!B3:F14')
    .setPosition({ row: 1, column: 7 })
    .setLegend({
      position: univerAPI.Enum.ChartLegendPositionEnum.Top,
    })
    .build()
  await fWorksheet.insertChart(lineChartBuildInfo)
}

async function insertBarChart(fWorksheet: FWorksheet, univerAPI: FUniver) {
  const barChartBuildInfo = fWorksheet
    .newChart(univerAPI.Enum.ChartTypeString.Bar)
    .setSource('Sheet1!B3:F14')
    .setPosition({ row: 1, column: 13 })
    .setLegend({
      selectMode: univerAPI.Enum.ChartSelectModeEnum.Multiple,
    })
    .build()
  await fWorksheet.insertChart(barChartBuildInfo)
}

async function insertColumnChart(fWorksheet: FWorksheet, univerAPI: FUniver) {
  const columnChartBuildInfo = fWorksheet
    .newChart(univerAPI.Enum.ChartTypeString.Column)
    .setSource('Sheet1!B16:F17')
    .setPosition({ row: 18, column: 1 })
    .setTheme('theme1')
    .setTitle({
      text: 'Average Consumption',
      color: '#ff0000',
      alignment: univerAPI.Enum.ChartLabelAlignEnum.Left,
    })
    .setLegend({
      selectMode: univerAPI.Enum.ChartSelectModeEnum.Multiple,
    })
    .setSize(600, 360)
    .build()
  await fWorksheet.insertChart(columnChartBuildInfo)
}

async function insertMultiLevelCategoryChart(fWorksheet: FWorksheet, univerAPI: FUniver) {
  const multiLevelChartBuildInfo = fWorksheet
    .newChart(univerAPI.Enum.ChartTypeString.Column)
    .setSource('Sheet1!B31:E37')
    .setPosition({ row: 18, column: 8 })
    .setCategoryFields([0, 1])
    .setMultiLevelCategoryAxis(true)
    .setValueFields([2, 3])
    .setTitle('Revenue by Region and Quarter')
    .setSize(600, 360)
    .build()
  await fWorksheet.insertChart(multiLevelChartBuildInfo)
}
