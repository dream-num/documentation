import type { IWorkbookData } from '@univerjs/core'
import { ShapeFillEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { createFormulaShapeData } from '@univerjs-pro/shape-editor'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum, type ISlideData } from '@univerjs-pro/slides'
import { LocaleType, RichTextBuilder } from '@univerjs/core'

export const HOST_ID = 'atlas-quote-model'
export const CHILD_ID = 'atlas-quote-decision'
export const SHEET_ID = 'quote'
export const SOURCE_NAME = 'Atlas Quote'
export const COSTS = [
  ['Design and setup', 2100],
  ['Equipment rental', 2400],
  ['Installation crew', 1800],
  ['Transport', 900],
  ['Studio preparation', 700],
  ['Visitor support', 500],
] as const
const ref = (cell: string) => "='[Atlas Quote]Quote model'!" + cell
export const FORMULA_CARDS = [
  { page: 'decision', id: 'quote-value', formula: ref('B5'), format: '$#,##0' },
  { page: 'decision', id: 'cost-value', formula: ref('B14'), format: '$#,##0' },
  { page: 'decision', id: 'contribution-value', formula: ref('B15'), format: '$#,##0' },
  { page: 'decision', id: 'margin-value', formula: ref('B16'), format: '0.00%' },
  { page: 'review', id: 'review-cost', formula: ref('B14'), format: '$#,##0' },
  { page: 'review', id: 'review-margin', formula: ref('B16'), format: '0.00%' },
]
export function createHostData(): Partial<IWorkbookData> {
  const cellData: IWorkbookData['sheets'][string]['cellData'] = {
    0: { 0: { v: 'ATLAS / Quote workshop', s: 'title' } },
    1: { 0: { v: 'A two-day exhibition / Original fictional USD plan / June 2029', s: 'muted' } },
    3: { 0: { v: 'Commercial assumption', s: 'header' }, 1: { v: 'USD', s: 'header' } },
    4: { 0: { v: 'Client quote' }, 1: { v: 12000, s: 'input' } },
    5: { 0: { v: 'Delivery cost breakdown', s: 'header' }, 1: { v: 'USD', s: 'header' } },
    13: { 0: { v: 'Total delivery cost', s: 'header' }, 1: { f: '=SUM(B7:B12)', s: 'money' } },
    14: { 0: { v: 'Contribution', s: 'header' }, 1: { f: '=B5-B14', s: 'money' } },
    15: { 0: { v: 'Contribution / quote', s: 'header' }, 1: { f: '=B15/B5', s: 'percent' } },
    18: { 0: { v: 'TRY / Change equipment B8 from 2400 to 3000.', s: 'muted' } },
    19: { 0: { v: 'The slide margin follows: 30% becomes 25%.', s: 'muted' } },
    21: { 0: { v: 'Sand = editable inputs. Mint = native Sheet formulas.', s: 'muted' } },
    23: { 0: { v: 'Slide@Sheet Float / Sheet data drives Slides, not the reverse.', s: 'muted' } },
    25: { 0: { v: 'No backend, manual refresh or copied KPI text.', s: 'muted' } },
  }
  COSTS.forEach(([label, amount], index) => {
    cellData[index + 6] = { 0: { v: label }, 1: { v: amount, s: 'input' } }
  })
  return {
    id: HOST_ID,
    name: SOURCE_NAME,
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-beta.2',
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 21, bl: 1, cl: { rgb: '#101A34' } },
      muted: { fs: 11, cl: { rgb: '#536879' } },
      header: { bg: { rgb: '#E0EAF1' }, bl: 1, cl: { rgb: '#20354E' } },
      input: { bg: { rgb: '#F3E5C5' }, n: { pattern: '$#,##0' } },
      money: { bg: { rgb: '#DCEEE5' }, n: { pattern: '$#,##0' }, cl: { rgb: '#245B50' } },
      percent: { bg: { rgb: '#DCEEE5' }, n: { pattern: '0.00%' }, bl: 1, cl: { rgb: '#245B50' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Quote model',
        rowCount: 45,
        columnCount: 16,
        defaultRowHeight: 27,
        defaultColumnWidth: 100,
        rowData: { 0: { h: 42 } },
        columnData: { 0: { w: 265 }, 1: { w: 145 } },
        cellData,
        mergeData: [0, 1, 18, 19, 21, 23, 25].map((row) => ({
          startRow: row,
          endRow: row,
          startColumn: 0,
          endColumn: row < 2 ? 9 : 4,
        })),
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
  ink: string,
  fill?: string,
) {
  const doc = RichTextBuilder.create()
    .span(value, { fontSize: size, color: ink, bold: id === 'title' })
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
function card(page: string, id: string, label: string, left: number, top: number, fill: string, ink: string) {
  const spec = FORMULA_CARDS.find((c) => c.page === page && c.id === id)!
  return [
    text(page, id + '-panel', '', left, top, 350, 105, 12, ink, fill),
    text(page, id + '-label', label, left + 16, top + 12, 320, 24, 14, ink),
    {
      id,
      type: PageElementTypeEnum.Shape as const,
      transform: { left: left + 14, top: top + 43, width: 322, height: 50, rotation: 0 },
      shapeData: {
        ...createFormulaShapeData({
          fill: { fillType: ShapeFillEnum.NoFill },
          stroke: { color: 'transparent', width: 0 },
          numberFormatPattern: spec.format,
          textStyle: { fs: 32, bl: 1, cl: { rgb: ink }, ff: 'Arial' },
        }),
        shapeType: ShapeTypeEnum.Rect,
      },
    },
  ]
}
export function createChildData(): ISlideData {
  const pages = [
    {
      id: 'decision',
      title: 'A quote with room to deliver.',
      bg: '#101A34',
      ink: '#F5F7FF',
      accent: '#62C5ED',
      content: [
        ...card('decision', 'quote-value', 'CLIENT QUOTE', 30, 150, '#D8ECF6', '#20354E'),
        ...card('decision', 'cost-value', 'DELIVERY COST', 420, 150, '#F1DFC5', '#6C4B2D'),
        ...card('decision', 'contribution-value', 'CONTRIBUTION', 30, 275, '#DCEEE5', '#27584E'),
        ...card('decision', 'margin-value', 'CONTRIBUTION / QUOTE', 420, 275, '#E9DFF4', '#5E4779'),
      ],
    },
    {
      id: 'review',
      title: 'Keep the model in the conversation.',
      bg: '#F3EEE5',
      ink: '#20354E',
      accent: '#86643D',
      content: [
        ...card('review', 'review-cost', 'LIVE DELIVERY COST', 30, 145, '#DCEEE5', '#27584E'),
        ...card('review', 'review-margin', 'LIVE MARGIN', 420, 145, '#E9DFF4', '#5E4779'),
        text(
          'review',
          'explanation',
          'Six delivery lines remain editable in the host Sheet.\nChange equipment, then compare both native slide pages.\nZero quote exposes a native formula error; restore to recover.',
          30,
          280,
          730,
          110,
          18,
          '#536879',
        ),
      ],
    },
  ].map(({ id, title, bg, ink, accent, content }) => {
    const elements = [
      text(id, 'kicker', 'ATLAS / EXHIBITION QUOTE / ' + id.toUpperCase(), 30, 20, 730, 24, 13, accent),
      text(id, 'title', title, 30, 64, 740, 65, 30, ink),
      ...content,
      text(
        id,
        'footer',
        'Sheet source -> native Formula Shapes / Original fictional planning data',
        30,
        411,
        740,
        23,
        11,
        accent,
      ),
    ]
    return {
      id,
      name: title,
      pageType: PageTypeEnum.Slide as const,
      background: { type: SlideBackgroundTypeEnum.Solid as const, color: bg },
      elements: Object.fromEntries(elements.map((e) => [e.id, e])),
      elementOrder: elements.map((e) => e.id),
      speakerNotes:
        'The host Sheet is the only source of quote values. Native formulas update; narrative and geometry stay authored.',
    }
  })
  return {
    id: CHILD_ID,
    name: 'Atlas / Quote decision',
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 800, height: 450 },
    slides: Object.fromEntries(pages.map((p) => [p.id, p])),
    slideOrder: pages.map((p) => p.id),
    activeSlideId: 'decision',
  }
}
