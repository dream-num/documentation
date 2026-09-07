import type { IBaseSnapshot, IWorkbookData } from '@univerjs/core'
import { ShapeFillEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { createFormulaShapeData } from '@univerjs-pro/shape-editor'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum, type ISlideData } from '@univerjs-pro/slides'
import {
  BASE_RECORD_ID_FIELD_ID,
  BaseFieldType,
  BaseViewType,
  CellValueType,
  createBaseRecordIdField,
  LocaleType,
  RichTextBuilder,
} from '@univerjs/core'

export const HOST_ID = 'beacon-learning-impact'
export const SHEET_UNIT_ID = 'beacon-learning-revenue'
export const BASE_ID = 'beacon-learning-costs'
export const SHEET_ID = 'revenue'
export const SHEET_NAME = 'Beacon Revenue'
export const BASE_NAME = 'Beacon Costs'
const TIME = Date.parse('2029-05-08T09:00:00Z')
export const WORKSHOPS = [
  ['Printmaking', 40, 45],
  ['Ceramics', 28, 65],
  ['Urban sketching', 36, 40],
  ['Bookbinding', 22, 80],
  ['Textile repair', 30, 55],
  ['Wood carving', 18, 90],
] as const
export const COSTS = [
  ['Studio rooms', 1800, 'Space', 'Six illustrated workshop allocations'],
  ['Facilitators', 2100, 'People', 'Preparation and session time'],
  ['Shared materials', 650, 'Materials', 'Original planning allowance'],
  ['Access support', 420, 'People', 'Separate provision, not attendance'],
  ['Local transport', 380, 'Logistics', 'Illustrative local transfers'],
  ['Outreach', 250, 'Communications', 'One launch cycle'],
] as const
export const REVENUE_FORMULA = "SUM('[Beacon Revenue]Workshop revenue'!D5:D10)"
export const COST_FORMULA = 'SUM([Beacon Costs]!Costs[Amount])'
export const FORMULA_CARDS = [
  { page: 'overview', id: 'revenue-value', expression: REVENUE_FORMULA, format: '$#,##0.00' },
  { page: 'overview', id: 'cost-value', expression: COST_FORMULA, format: '$#,##0.00' },
  { page: 'overview', id: 'surplus-value', expression: REVENUE_FORMULA + '-' + COST_FORMULA, format: '$#,##0.00' },
  {
    page: 'overview',
    id: 'margin-value',
    expression: '(' + REVENUE_FORMULA + '-' + COST_FORMULA + ')/' + REVENUE_FORMULA,
    format: '0.00%',
  },
  { page: 'revenue', id: 'revenue-detail', expression: REVENUE_FORMULA, format: '$#,##0.00' },
  { page: 'costs', id: 'cost-detail', expression: COST_FORMULA, format: '$#,##0.00' },
  { page: 'bridge', id: 'surplus-detail', expression: REVENUE_FORMULA + '-' + COST_FORMULA, format: '$#,##0.00' },
  {
    page: 'bridge',
    id: 'margin-detail',
    expression: '(' + REVENUE_FORMULA + '-' + COST_FORMULA + ')/' + REVENUE_FORMULA,
    format: '0.00%',
  },
]
export function createSheetData(): Partial<IWorkbookData> {
  const cellData: IWorkbookData['sheets'][string]['cellData'] = {
    0: { 0: { v: 'BEACON / Workshop revenue', s: 'title' } },
    1: { 0: { v: 'Six original workshop plans / USD / May 2029', s: 'muted' } },
    3: Object.fromEntries(['Workshop', 'Places', 'Fee', 'Revenue'].map((v, i) => [i, { v, s: 'header' }])),
    11: { 0: { v: 'TOTAL REVENUE', s: 'header' }, 3: { f: '=SUM(D5:D10)', s: 'total' } },
    14: { 0: { v: 'Source edits feed native slide Formula Shapes.', s: 'muted' } },
    16: { 0: { v: 'Fictional planning data / No bookings or payments', s: 'muted' } },
  }
  WORKSHOPS.forEach(([name, qty, price], i) => {
    cellData[i + 4] = {
      0: { v: name },
      1: { v: qty, t: CellValueType.NUMBER, s: 'count' },
      2: { v: price, t: CellValueType.NUMBER, s: 'input' },
      3: { f: '=B' + (i + 5) + '*C' + (i + 5), s: 'money' },
    }
  })
  return {
    id: SHEET_UNIT_ID,
    name: SHEET_NAME,
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 23, bl: 1, cl: { rgb: '#20354E' } },
      muted: { fs: 11, cl: { rgb: '#607785' } },
      header: { bg: { rgb: '#DFEAEF' }, bl: 1, cl: { rgb: '#20354E' } },
      count: { bg: { rgb: '#F3E5C5' }, n: { pattern: '#,##0' } },
      input: { bg: { rgb: '#F3E5C5' }, n: { pattern: '$#,##0.00' } },
      money: { bg: { rgb: '#E3F1EA' }, n: { pattern: '$#,##0.00' } },
      total: { bg: { rgb: '#285D52' }, cl: { rgb: '#FFFFFF' }, bl: 1, n: { pattern: '$#,##0.00' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Workshop revenue',
        rowCount: 20,
        columnCount: 4,
        defaultRowHeight: 27,
        defaultColumnWidth: 110,
        rowData: { 0: { h: 42 } },
        columnData: { 0: { w: 225 }, 1: { w: 90 }, 2: { w: 125 }, 3: { w: 150 } },
        cellData,
        mergeData: [0, 1, 14, 16].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 3 })),
      },
    },
  }
}
export function createBaseData(): IBaseSnapshot {
  const fields = [
    createBaseRecordIdField(),
    { id: 'title', name: 'Cost item', type: BaseFieldType.Text, config: {} },
    { id: 'amount', name: 'Amount', type: BaseFieldType.Number, config: {} },
    { id: 'category', name: 'Category', type: BaseFieldType.Text, config: {} },
    { id: 'note', name: 'Planning note', type: BaseFieldType.Text, config: {} },
  ]
  const fieldOrder = fields.map((f) => f.id)
  const records = Object.fromEntries(
    COSTS.map(([title, amount, category, note], i) => {
      const id = 'cost-' + (i + 1)
      return [
        id,
        {
          id,
          orderKey: String(i).padStart(3, '0'),
          createdAt: TIME,
          updatedAt: TIME,
          values: { [BASE_RECORD_ID_FIELD_ID]: id, title, amount, category, note },
        },
      ]
    }),
  )
  return {
    id: BASE_ID,
    name: BASE_NAME,
    schemaVersion: 2,
    createdAt: TIME,
    updatedAt: TIME,
    tableOrder: ['costs'],
    tables: {
      costs: {
        id: 'costs',
        name: 'Costs',
        formulaName: 'Costs',
        primaryFieldId: 'title',
        fields: Object.fromEntries(fields.map((f) => [f.id, f])),
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: ['costs-grid'],
        views: {
          'costs-grid': {
            id: 'costs-grid',
            tableId: 'costs',
            name: 'Cost register',
            type: BaseViewType.Grid,
            fieldOrder,
            fieldSettings: Object.fromEntries(
              fieldOrder.map((id) => [
                id,
                { hidden: id === BASE_RECORD_ID_FIELD_ID, width: id === 'title' ? 200 : id === 'note' ? 320 : 130 },
              ]),
            ),
            filter: null,
            sort: [],
            group: [],
            config: { rowHeight: 'medium', showRecordIndex: true, frozenFieldCount: 1 },
          },
        },
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
  const specs = [
    ['overview', 'Two sources. One live story.', '#101A34', '#F5F7FF', '#62C5ED'],
    ['revenue', 'Change the fee. Follow the result.', '#F6F1E7', '#20354E', '#886C3E'],
    ['costs', 'A structured register, not a pasted total.', '#EBF2F5', '#20354E', '#487786'],
    ['bridge', 'Revenue and costs meet here.', '#392F4C', '#F7F2FA', '#BCAEDE'],
  ] as const
  const pages = specs.map(([id, title, bg, ink, accent]) => {
    const elements = [
      text(id, 'kicker', 'BEACON / LEARNING STUDIO / ' + id.toUpperCase(), 40, 24, 1100, 28, 14, accent),
      text(id, 'title', title, 40, 78, 1120, 64, 38, ink),
      text(
        id,
        'footer',
        'Original fictional plan / Native formulas / No bookings, payments or backend',
        40,
        630,
        1120,
        26,
        12,
        accent,
      ),
      ...(id === 'overview'
        ? [
            text(
              id,
              'intro',
              'Sheet workshop fees + Base delivery costs -> slide-native results',
              40,
              158,
              1100,
              36,
              22,
              '#C8D3E5',
            ),
            ...card(id, 'revenue-value', 'REVENUE / Sheet source', 40, 235, 535, '#D8ECF6', '#20354E'),
            ...card(id, 'cost-value', 'COST / Base source', 625, 235, 535, '#F1DFC5', '#6C4B2D'),
            ...card(id, 'surplus-value', 'CONTRIBUTION / Both sources', 40, 415, 535, '#DCEEE5', '#27584E'),
            ...card(id, 'margin-value', 'MARGIN / Both sources', 625, 415, 535, '#E9DFF4', '#5E4779'),
          ]
        : id === 'revenue'
          ? [
              ...card(id, 'revenue-detail', 'LIVE REVENUE', 840, 180, 320, '#DCEEE5', '#27584E'),
              text(
                id,
                'explain',
                'The six workshop rows are the source.\n\nChange fee C5 from 45 to 50. Revenue rises by 200; Base costs stay unchanged.',
                840,
                350,
                320,
                230,
                21,
                ink,
              ),
            ]
          : id === 'costs'
            ? [
                ...card(id, 'cost-detail', 'LIVE COST TOTAL', 840, 180, 320, '#F1DFC5', '#6C4B2D'),
                text(
                  id,
                  'explain',
                  'Six structured cost records.\n\nChange Studio rooms from 1800 to 2100. Cost rises by 300; Sheet revenue stays unchanged.',
                  840,
                  350,
                  320,
                  230,
                  21,
                  ink,
                ),
              ]
            : [
                ...card(id, 'surplus-detail', 'REVENUE - COST', 40, 210, 535, '#DCEEE5', '#27584E'),
                ...card(id, 'margin-detail', 'CONTRIBUTION / REVENUE', 625, 210, 535, '#E9DFF4', '#5E4779'),
                text(
                  id,
                  'explain',
                  'Zero revenue is a real boundary: the native margin formula reports division by zero.\nRestore source quantities to recover. No fallback hides the error.',
                  40,
                  420,
                  1100,
                  120,
                  24,
                  ink,
                ),
              ]),
    ]
    return {
      id,
      name: title,
      pageType: PageTypeEnum.Slide as const,
      background: { type: SlideBackgroundTypeEnum.Solid as const, color: bg },
      elements: Object.fromEntries(elements.map((e) => [e.id, e])),
      elementOrder: elements.map((e) => e.id),
      speakerNotes:
        'Open the source pages and edit the real Sheet or Base. Only native Formula Shapes recalculate; surrounding narrative and layout are authored.',
    }
  })
  return {
    id: HOST_ID,
    name: 'Beacon / Live impact cards',
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1200, height: 675 },
    slides: Object.fromEntries(pages.map((p) => [p.id, p])),
    slideOrder: pages.map((p) => p.id),
    activeSlideId: 'overview',
  }
}
