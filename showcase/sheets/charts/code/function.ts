import type { ChartSourceSpec, FChart, ISheetChartInfo, ISheetChartMethods } from '@univerjs/preset-sheets-advanced'
import type { FWorksheet } from '@univerjs/preset-sheets-core'
import type { FUniver } from '@univerjs/presets'

// beta.2 omits FSheetChart's declaration. Its public FChart base is fully typed;
// no injected service, invented facade method or patched SDK declaration is used.
export type SheetChart = FChart<ChartSourceSpec, ChartSourceSpec, ISheetChartInfo, ISheetChartMethods>

export function chartSource(api: FUniver, period: string): ChartSourceSpec {
  if (period === 'all')
    return { sheetName: 'Energy', range: 'A3:D27', orientation: api.Enum.ChartSourceOrientation.Columns }
  const first = period === '2026' ? 16 : 4,
    last = period === '2026' ? 27 : 15
  return {
    sheetName: 'Energy',
    orientation: api.Enum.ChartSourceOrientation.Columns,
    ranges: ['A', 'B', 'C', 'D'].map((column) => ({
      header: column + '3',
      range: column + first + ':' + column + last,
    })),
  }
}

export function buildChart(sheet: FWorksheet, api: FUniver, variant: string, source: ChartSourceSpec): ISheetChartInfo {
  const types = api.Enum.ChartTypeString
  const type =
    variant === 'line' ? types.Line : variant === 'bar' ? types.Bar : variant === 'area' ? types.Area : types.Column
  const builder = sheet
    .newChart(type)
    .setSource(source)
    .setPosition({ row: 0, column: 5 })
    .setSize(640, 350)
    .setCategoryField(0)
    .setValueFields([1, 2, 3])
    .setXAxis({ label: { rotate: variant === 'bar' ? 0 : -45 } })
    .setTitle('Aster observatory · monthly energy (MWh)')
    .setLegend({ position: api.Enum.ChartLegendPositionEnum.Top, selectMode: api.Enum.ChartSelectModeEnum.Multiple })
  if (variant === 'theme')
    builder.setTheme('aster-warm').setTitle({ text: 'Aster observatory · warm theme', color: '#893448' })
  if (variant === 'multilevel')
    builder
      .setSource({ sheetName: 'Energy', range: 'A31:D39', orientation: api.Enum.ChartSourceOrientation.Columns })
      .setCategoryFields([0, 1])
      .setMultiLevelCategoryAxis(true)
      .setValueFields([2, 3])
      .setTitle('Station and quarter · observed / budget')
  return builder.build()
}
