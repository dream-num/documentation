import type { IDocumentData } from '@univerjs/core'
import { ChartTypeString, LegendPositionEnum } from '@univerjs-pro/engine-chart'
import { BooleanNumber, DocumentFlavor, NamedStyleType } from '@univerjs/core'

export function createVariants(_legacyLocale = false) {
  return [
    {
      id: 'column',
      type: ChartTypeString.Column,
      title: 'Column · compare two series',
      legend: LegendPositionEnum.Bottom,
      palette: ['#176b87', '#42b7a0'],
      values: [
        ['Quarter', 'Actual', 'Target'],
        ['Q1', 42, 50],
        ['Q2', 65, 60],
        ['Q3', 58, 70],
      ],
    },
    {
      id: 'line',
      type: ChartTypeString.Line,
      title: 'Line · observe a trend',
      legend: false as const,
      palette: ['#7657b7'],
      values: [
        ['Day', 'Temperature'],
        ['Mon', 18],
        ['Tue', 22],
        ['Wed', 19],
        ['Thu', 26],
        ['Fri', 24],
      ],
    },
    {
      id: 'area',
      type: ChartTypeString.Area,
      title: 'Area · changing volume',
      legend: LegendPositionEnum.Bottom,
      palette: ['#218a78'],
      values: [
        ['Week', 'Orders'],
        ['W1', 15],
        ['W2', 32],
        ['W3', 24],
        ['W4', 46],
      ],
    },
    {
      id: 'bar',
      type: ChartTypeString.Bar,
      title: 'Bar · rank categories',
      legend: false as const,
      palette: ['#cb7836'],
      values: [
        ['Channel', 'Visits'],
        ['Search', 95],
        ['Direct', 72],
        ['Email', 48],
      ],
    },
    {
      id: 'stacked',
      type: ChartTypeString.ColumnStacked,
      title: 'Stacked column · parts of a total',
      legend: LegendPositionEnum.Bottom,
      palette: ['#176b87', '#42b7a0', '#e8a14b'],
      values: [
        ['Quarter', 'Design', 'Build', 'Test'],
        ['Q1', 12, 24, 8],
        ['Q2', 16, 30, 12],
        ['Q3', 10, 28, 15],
      ],
    },
    {
      id: 'pie',
      type: ChartTypeString.Pie,
      title: 'Pie · category share',
      legend: LegendPositionEnum.Right,
      palette: ['#893448', '#d95850', '#eb8146'],
      values: [
        ['Type', 'Share'],
        ['Desktop', 52],
        ['Mobile', 36],
        ['Tablet', 12],
      ],
    },
    {
      id: 'donut',
      type: ChartTypeString.Donut,
      title: 'Donut · a compact proportion',
      legend: LegendPositionEnum.Bottom,
      palette: ['#4859a8', '#929edf', '#d4dafa'],
      values: [
        ['Status', 'Tasks'],
        ['Done', 24],
        ['In progress', 9],
        ['Planned', 7],
      ],
    },
  ]
}
export function createData(_legacyLocale = false): IDocumentData {
  const rows: [string, NamedStyleType, string][] = [
    ['Native chart gallery', NamedStyleType.TITLE, 'title'],
    [
      'Select a chart to use its native menu. Each section varies type, data, legend and palette.',
      NamedStyleType.NORMAL_TEXT,
      'intro',
    ],
  ]
  for (const variant of createVariants()) {
    rows.push(
      [variant.title, NamedStyleType.HEADING_1, variant.id + '-heading'],
      ['', NamedStyleType.NORMAL_TEXT, variant.id + '-anchor'],
    )
  }
  let offset = 0
  const dataStream = rows.map(([text]) => text).join('\r') + '\r\n'
  return {
    id: 'doc-chart-gallery',
    title: rows[0][0],
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 820, height: 1123 },
      marginTop: 24,
      marginBottom: 24,
    },
    body: {
      dataStream,
      textRuns: [],
      customRanges: [],
      paragraphs: rows.map(([text, style, id]) => {
        offset += text.length + 1
        return {
          startIndex: offset - 1,
          paragraphId: id,
          paragraphStyle: {
            namedStyleType: style,
            spaceBelow: { v: 12 },
            lineSpacing: 1.2,
            textStyle: {
              fs: style === NamedStyleType.TITLE ? 24 : style === NamedStyleType.HEADING_1 ? 18 : 13,
              bl: style === NamedStyleType.NORMAL_TEXT ? BooleanNumber.FALSE : BooleanNumber.TRUE,
            },
          },
        }
      }),
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'gallery-section' }],
    },
  }
}
