export const univerIconNames = [
  'BasesAppIcon',
  'BasesMultiIcon',
  'BoardsAppIcon',
  'BoardsMultiIcon',
  'DocsAppIcon',
  'DocsMultiIcon',
  'GaugeChartIcon',
  'HistogramChartIcon',
  'PdfAppIcon',
  'PdfMultiIcon',
  'SheetsAppIcon',
  'SheetsMultiIcon',
  'SlidesAppIcon',
  'SlidesMultiIcon',
  'SunburstChartIcon',
  'TreemapChartIcon',
] as const

export type UniverIconName = (typeof univerIconNames)[number]

export function isUniverIconName(value: string): value is UniverIconName {
  return univerIconNames.includes(value as UniverIconName)
}
