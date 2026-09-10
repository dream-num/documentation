import type { IWorkbookData } from '@univerjs/core'
import { ShapeFillEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { createFormulaShapeData } from '@univerjs-pro/shape-editor'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum, type ISlideData } from '@univerjs-pro/slides'
import { LocaleType, RichTextBuilder } from '@univerjs/core'

export const HOST_ID = 'nova-operating-deck'
export const SHEET_UNIT_ID = 'nova-channel-model'
export const SHEET_ID = 'channels'
export const SHEET_NAME = 'Nova Operating'
const ref = (cell: string) => "'[Nova Operating]Channel plan'!" + cell
export const CHANNELS = [
  ['Retail', 30000, 31500],
  ['Partners', 25000, 27500],
  ['Online', 15000, 14500],
] as const
export const FORMULA_CARDS = [
  { page: 'overview', id: 'actual', expression: ref('C9'), format: '$#,##0' },
  { page: 'overview', id: 'target', expression: ref('B9'), format: '$#,##0' },
  { page: 'overview', id: 'attainment', expression: ref('E9'), format: '0.00%' },
  { page: 'overview', id: 'variance', expression: ref('D9'), format: '+$#,##0;-$#,##0;$0' },
  ...CHANNELS.flatMap(([name], i) => [
    { page: 'channels', id: name.toLowerCase() + '-actual', expression: ref('C' + (i + 5)), format: '$#,##0' },
    { page: 'channels', id: name.toLowerCase() + '-rate', expression: ref('E' + (i + 5)), format: '0.00%' },
  ]),
  { page: 'decision', id: 'attainment-repeat', expression: ref('E9'), format: '0.00%' },
  { page: 'decision', id: 'largest-gap', expression: ref('D11'), format: '+$#,##0;-$#,##0;$0' },
  { page: 'decision', id: 'below-target', expression: ref('D12'), format: '#,##0' },
]
export function createSheetData(): Partial<IWorkbookData> {
  const cellData: IWorkbookData['sheets'][string]['cellData'] = {
    0: { 0: { v: 'NOVA / Channel operating model', s: 'title' } },
    1: { 0: { v: 'Original fictional stationery collective / October 2029 / USD', s: 'muted' } },
    3: Object.fromEntries(
      ['Channel', 'Target', 'Actual', 'Variance', 'Attainment'].map((v, i) => [i, { v, s: 'header' }]),
    ),
    8: {
      0: { v: 'TOTAL', s: 'header' },
      1: { f: '=SUM(B5:B7)', s: 'money' },
      2: { f: '=SUM(C5:C7)', s: 'money' },
      3: { f: '=C9-B9', s: 'delta' },
      4: { f: '=C9/B9', s: 'rate' },
    },
    10: { 0: { v: 'Largest signed channel variance', s: 'muted' }, 3: { f: '=MAX(D5:D7)', s: 'delta' } },
    11: { 0: { v: 'Channels below target', s: 'muted' }, 3: { f: '=COUNTIF(D5:D7,"<0")', s: 'count' } },
    14: { 0: { v: 'Edit targets and actuals here; return to the native results pages.', s: 'muted' } },
    16: { 0: { v: 'No transactions, payments, forecasts or backend are involved.', s: 'muted' } },
  }
  CHANNELS.forEach(([name, target, actual], i) => {
    const r = i + 5
    cellData[r - 1] = {
      0: { v: name },
      1: { v: target, s: 'target' },
      2: { v: actual, s: 'input' },
      3: { f: '=C' + r + '-B' + r, s: 'delta' },
      4: { f: '=C' + r + '/B' + r, s: 'rate' },
    }
  })
  return {
    id: SHEET_UNIT_ID,
    name: SHEET_NAME,
    appVersion: '1.0.0-rc.0',
    locale: LocaleType.EN_US,
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 24, bl: 1, cl: { rgb: '#22365F' } },
      muted: { fs: 11, cl: { rgb: '#536078' } },
      header: { bl: 1, bg: { rgb: '#E2E6F4' }, cl: { rgb: '#22365F' } },
      target: { bg: { rgb: '#E9DFF4' }, n: { pattern: '$#,##0' } },
      input: { bg: { rgb: '#FAE5D6' }, n: { pattern: '$#,##0' } },
      money: { bg: { rgb: '#DAEEE8' }, n: { pattern: '$#,##0' } },
      delta: { bg: { rgb: '#E7EEF5' }, n: { pattern: '+$#,##0;-$#,##0;$0' } },
      rate: { bg: { rgb: '#DAEEE8' }, n: { pattern: '0.00%' } },
      count: { bg: { rgb: '#E9DFF4' }, n: { pattern: '#,##0' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Channel plan',
        rowCount: 20,
        columnCount: 5,
        defaultRowHeight: 31,
        defaultColumnWidth: 145,
        rowData: { 0: { h: 45 } },
        columnData: { 0: { w: 190 }, 1: { w: 140 }, 2: { w: 140 }, 3: { w: 145 }, 4: { w: 150 } },
        cellData,
        mergeData: [
          ...[0, 1, 14, 16].map((r) => ({ startRow: r, endRow: r, startColumn: 0, endColumn: 4 })),
          ...[10, 11].map((r) => ({ startRow: r, endRow: r, startColumn: 0, endColumn: 2 })),
        ],
      },
    },
  }
}
function text(
  page: string,
  id: string,
  value: string,
  left: number,
  top: number,
  width: number,
  height: number,
  size: number,
  color: string,
  fill?: string,
) {
  const doc = RichTextBuilder.create()
    .span(value, { fontSize: size, color, bold: id === 'title' })
    .getData()
  doc.id = page + '-' + id
  doc.documentStyle = { ...doc.documentStyle, textStyle: { ff: 'Arial' } }
  doc.body?.paragraphs?.forEach((p, i) => {
    p.paragraphId = doc.id + '-p-' + i
  })
  doc.body?.sectionBreaks?.forEach((s, i) => {
    s.sectionId = doc.id + '-s-' + i
  })
  return {
    id,
    type: PageElementTypeEnum.Shape as const,
    transform: { left, top, width, height, rotation: 0 },
    shapeData: {
      shapeType: ShapeTypeEnum.Rect,
      fill: fill ? { fillType: ShapeFillEnum.SolidFill, color: fill } : { fillType: ShapeFillEnum.NoFill },
      stroke: { color: 'transparent', width: 0 },
      shapeText: { dataModel: { doc } },
    },
  }
}
function card(
  page: string,
  id: string,
  label: string,
  left: number,
  top: number,
  width: number,
  fill: string,
  ink: string,
) {
  const spec = FORMULA_CARDS.find((c) => c.page === page && c.id === id)!
  return [
    text(page, id + '-panel', '', left, top, width, 142, 14, ink, fill),
    text(page, id + '-label', label, left + 20, top + 15, width - 40, 28, 16, ink),
    {
      id,
      type: PageElementTypeEnum.Shape as const,
      transform: { left: left + 18, top: top + 54, width: width - 36, height: 68, rotation: 0 },
      shapeData: {
        ...createFormulaShapeData({
          fill: { fillType: ShapeFillEnum.NoFill },
          stroke: { color: 'transparent', width: 0 },
          numberFormatPattern: spec.format,
          textStyle: { fs: 39, bl: 1, cl: { rgb: ink }, ff: 'Arial' },
        }),
        shapeType: ShapeTypeEnum.Rect,
        fill: { fillType: ShapeFillEnum.NoFill },
        stroke: { color: 'transparent', width: 0 },
      },
    },
  ]
}
export function createHostData(): ISlideData {
  const pages = [
    ['overview', 'A good total can hide a weak channel.', '#101A34', '#F5F7FF', '#58C8FF'],
    ['channels', 'Three channels. Three different stories.', '#F5EEE8', '#22365F', '#AD5D3C'],
    ['decision', 'Discuss the mix, not just the headline.', '#382D48', '#F5F7FF', '#B6A6FF'],
  ].map(([id, title, bg, ink, accent]) => {
    const elements = [
      text(id, 'kicker', 'NOVA / STATIONERY COLLECTIVE / MONTHLY OPERATING REVIEW', 40, 24, 1120, 28, 14, accent),
      text(id, 'title', title, 40, 78, 1120, 70, 36, ink),
      text(
        id,
        'footer',
        'Original fictional data / Open Operating data in the page list / Sheet -> Slides formulas',
        40,
        630,
        1120,
        26,
        12,
        accent,
      ),
    ]
    if (id === 'overview')
      elements.push(
        ...card(id, 'actual', 'ACTUAL / Three channels', 40, 195, 535, '#DAEEE8', '#275C50'),
        ...card(id, 'target', 'TARGET / Editable assumptions', 625, 195, 535, '#E9DFF4', '#644D80'),
        ...card(id, 'attainment', 'ACTUAL / TARGET', 40, 375, 535, '#D9ECF6', '#22365F'),
        ...card(id, 'variance', 'ACTUAL - TARGET', 625, 375, 535, '#FAE5D6', '#875034'),
        text(
          id,
          'explain',
          'Update a channel in Operating data. Every result page reads the same model.',
          40,
          555,
          1120,
          42,
          22,
          ink,
        ),
      )
    if (id === 'channels')
      CHANNELS.forEach(([name], i) => {
        const fill = ['#D9ECF6', '#FAE5D6', '#DAEEE8'][i],
          color = ['#22365F', '#875034', '#275C50'][i]
        elements.push(
          ...card(
            id,
            name.toLowerCase() + '-actual',
            name.toUpperCase() + ' / Actual',
            40 + i * 385,
            205,
            350,
            fill,
            color,
          ),
          ...card(id, name.toLowerCase() + '-rate', 'ACTUAL / TARGET', 40 + i * 385, 390, 350, fill, color),
        )
      })
    if (id === 'decision')
      elements.push(
        ...card(id, 'attainment-repeat', 'THE SAME OVERALL RESULT', 40, 200, 535, '#E9DFF4', '#644D80'),
        ...card(id, 'largest-gap', 'LARGEST SIGNED CHANNEL VARIANCE', 625, 200, 535, '#DAEEE8', '#275C50'),
        ...card(id, 'below-target', 'CHANNELS BELOW TARGET', 40, 385, 535, '#FAE5D6', '#875034'),
        text(
          id,
          'explain',
          'An overall result above 100% does not mean every channel meets its target.\n\nInspect the underlying mix before changing the plan.',
          625,
          385,
          535,
          205,
          23,
          ink,
        ),
      )
    return {
      id,
      name: title,
      pageType: PageTypeEnum.Slide as const,
      background: { type: SlideBackgroundTypeEnum.Solid as const, color: bg },
      elements: Object.fromEntries(elements.map((e) => [e.id, e])),
      elementOrder: elements.map((e) => e.id),
      speakerNotes:
        'Original fictional stationery collective. Open the native Operating data page to edit targets and actuals. Formula Shapes recalculate without changing this authored narrative or geometry.',
    }
  })
  return {
    id: HOST_ID,
    name: 'Nova / Live operating deck',
    appVersion: '1.0.0-rc.0',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1200, height: 675 },
    slides: Object.fromEntries(pages.map((p) => [p.id, p])),
    slideOrder: pages.map((p) => p.id),
    activeSlideId: 'overview',
  }
}
