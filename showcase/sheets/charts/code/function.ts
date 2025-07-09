import type { FWorksheet } from '@univerjs/preset-sheets-core'
import type { FUniver } from '@univerjs/presets'
import { AreaLineStyle, ChartTypeBits, LegendPositionEnum, RadarShape, SelectModeEnum } from '@univerjs/preset-sheets-advanced'
import themeJson from './theme.json'

export function insertChart(univerAPI: FUniver) {
  const fWorkbook = univerAPI.getActiveWorkbook()!
  const fWorksheet = fWorkbook.getActiveSheet()

  insertLineChart(fWorksheet)
  insertBarChart(fWorksheet)
  insertPieChart(fWorksheet)
  insertRadarChart(fWorksheet)
  insertCombinChart(fWorksheet)
}

async function insertLineChart(fWorksheet: FWorksheet) {
  const lineChartBuildInfo = fWorksheet.newChart()
    .asLineChart()
    .setLineStyle(AreaLineStyle.Step)
    .addRange('Sheet1!B3:F14')
    .setPosition(1, 7, 0, 0)
    .setOptions('', {
      legend: {
        position: LegendPositionEnum.Top,
      },
    })
    .build()
  await fWorksheet.insertChart(lineChartBuildInfo)
}

async function insertBarChart(fWorksheet: FWorksheet) {
  const barChartBuildInfo = fWorksheet.newChart()
    .setChartType(ChartTypeBits.Bar)
    .addRange('Sheet1!B3:F14')
    .setPosition(1, 13, 0, 0)
    .setOptions('', {
      legend: {
        selectMode: SelectModeEnum.Multiple,
      },
    })
    .build()
  await fWorksheet.insertChart(barChartBuildInfo)
}

async function insertPieChart(fWorksheet: FWorksheet) {
  fWorksheet.registerChartTheme('theme1', themeJson)

  const pieChartBuildInfo = fWorksheet.newChart()
    .asPieChart()
    .setHasPaddingAngle(true)
    .addRange('Sheet1!B16:F17')
    .setPosition(18, 1, 0, 0)
    .setTheme('theme1')
    .setOptions('', {
      title: {
        content: 'Average Consumption',
        fontColor: '#ff0000',
        alignment: 'left',
      },
      legend: {
        selectMode: SelectModeEnum.Multiple,
      },
    })
    .setTransposeRowsAndColumns(false)
    .setWidth(600)
    .build()
  await fWorksheet.insertChart(pieChartBuildInfo)
}

async function insertRadarChart(fWorksheet: FWorksheet) {
  const RadarChartBuildInfo = fWorksheet.newChart()
    .asRadarChart()
    .setShape(RadarShape.Circle)
    .setFill(true)
    .addRange('Sheet1!B3:F14')
    .setPosition(18, 8, 0, 0)
    .build()
  await fWorksheet.insertChart(RadarChartBuildInfo)
}

async function insertCombinChart(fWorksheet: FWorksheet) {
  const combinChartBuildInfo = fWorksheet.newChart()
    .setChartType(ChartTypeBits.Combination)
    .addRange('Sheet1!B3:F14')
    .setPosition(18, 14, 0, 0)
    .build()
  await fWorksheet.insertChart(combinChartBuildInfo)
}
