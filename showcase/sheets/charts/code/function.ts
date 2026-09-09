import type { ChartSourceSpec, FChart, ISheetChartInfo, ISheetChartMethods } from '@univerjs/preset-sheets-advanced'
import type { FWorksheet } from '@univerjs/preset-sheets-core'
import type { FUniver } from '@univerjs/presets'
// beta.2 omits FSheetChart's declaration; its public FChart base is typed.
export type SheetChart = FChart<ChartSourceSpec, ChartSourceSpec, ISheetChartInfo, ISheetChartMethods>
export function buildChart(sheet: FWorksheet, api: FUniver, variant: string, _legacyChinese = false): ISheetChartInfo {
  const types = api.Enum.ChartTypeString
  const type =
    variant === 'line' ? types.Line : variant === 'bar' ? types.Bar : variant === 'area' ? types.Area : types.Column
  const multi = variant === 'multilevel'
  const builder = sheet
    .newChart(type)
    .setSource({
      sheetName: sheet.getSheetName(),
      range: multi ? 'A3:D11' : 'A3:D9',
      orientation: api.Enum.ChartSourceOrientation.Columns,
    })
    .setPosition({ row: 0, column: 5 })
    .setSize(600, 340)
    .setCategoryField(0)
    .setValueFields([1, 2, 3])
    .setPalette(['#176b87', '#42b7a0', '#e8a14b'])
    .setTitle('Monthly energy · MWh')
    .setLegend({ position: api.Enum.ChartLegendPositionEnum.Top, selectMode: api.Enum.ChartSelectModeEnum.Multiple })
  if (variant === 'theme')
    builder.setTheme('aster-warm').setPalette(['#893448', '#d95850', '#eb8146']).setTitle('Warm theme · MWh')
  if (multi)
    builder
      .setCategoryFields([0, 1])
      .setMultiLevelCategoryAxis(true)
      .setValueFields([2, 3])
      .setTitle('Station and quarter · observed / budget')
  return builder.build()
}
