import type { IBoardData } from '@univerjs-pro/boards'
import type { IBaseSnapshot, IDocumentData, IWorkbookData } from '@univerjs/core'
import { BoardPageType, createBoardConnectorElement, createBoardTextBoxShapeElement } from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { createFormulaShapeData } from '@univerjs-pro/shape-editor'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum, type ISlideData } from '@univerjs-pro/slides'
import {
  BASE_RECORD_ID_FIELD_ID,
  BaseFieldType,
  BaseViewType,
  createBaseRecordIdField,
  DocumentFlavor,
  HorizontalAlign,
  LocaleType,
  NamedStyleType,
  RichTextBuilder,
  VerticalAlign,
} from '@univerjs/core'

export const HOST_ID = 'meridian-production-model'
export const SHEET_ID = 'production'
export const SOURCE_NAME = 'Meridian Model'
export const BASE_ID = 'meridian-edition-register'
export const BASE_NAME = 'Meridian Editions'
export const DOCS_ID = 'meridian-production-note'
export const SLIDES_ID = 'meridian-studio-review'
export const BOARD_ID = 'meridian-production-map'
const ref = (cell: string) => "='[Meridian Model]Production model'!" + cell
const quantity = '[Meridian Editions]!Editions[Quantity]'
const edition = '[Meridian Editions]!Editions[Edition]'
const status = '[Meridian Editions]!Editions[Status]'
const countFor = (name: string) => '=SUMIFS(' + quantity + ',' + edition + ',"' + name + '",' + status + ',"Scheduled")'
export const EDITIONS = [
  [
    'Atlas',
    'Atlas / Night routes',
    40,
    'Scheduled',
    'Alma',
    'A folded collection of night-time walking routes.',
    '#DAEAF0',
    '#356D82',
  ],
  [
    'Fieldnotes',
    'Fieldnotes / Coastal walks',
    60,
    'Scheduled',
    'Theo',
    'A small notebook for observing the shoreline.',
    '#F2DFE7',
    '#8F536D',
  ],
] as const
export const METRICS = [
  { id: 'quantity', cell: 'B13', format: '0' },
  { id: 'rate', cell: 'B4', format: '$0.00' },
  { id: 'total', cell: 'D13', format: '$#,##0' },
  { id: 'headroom', cell: 'D15', format: '$#,##0;-$#,##0' },
  { id: 'atlas', cell: 'D10', format: '$#,##0' },
  { id: 'fieldnotes', cell: 'D11', format: '$#,##0' },
  { id: 'atlasQty', cell: 'B10', format: '0' },
  { id: 'fieldnotesQty', cell: 'B11', format: '0' },
  { id: 'share', cell: 'E11', format: '0.0%' },
  { id: 'count', cell: 'B15', format: '0' },
  { id: 'signal', cell: 'B16', format: 'General' },
].map(({ id, cell, format }) => ({ id, formula: ref(cell), format }))
export const INLINE_FORMULAS = METRICS.map(({ id, formula, format }) => ({
  marker: '{{' + id + '}}',
  formula,
  pattern: format,
}))
export const SLIDE_FORMULAS = [
  ...['quantity', 'total', 'headroom'].map((id) =>
    Object.assign(
      { page: 'overview' },
      METRICS.find((m) => m.id === id)!,
    ),
  ),
  ...['atlas', 'fieldnotes', 'share'].map((id) =>
    Object.assign(
      { page: 'editions' },
      METRICS.find((m) => m.id === id)!,
    ),
  ),
  ...['rate', 'count', 'signal'].map((id) =>
    Object.assign(
      { page: 'decision' },
      METRICS.find((m) => m.id === id)!,
    ),
  ),
]
export const BOARD_FORMULAS = ['quantity', 'rate', 'total', 'atlas', 'fieldnotes', 'signal'].map((id) =>
  METRICS.find((m) => m.id === id)!,
)

export function createBaseData(): IBaseSnapshot {
  const time = Date.parse('2029-08-21T09:00:00Z')
  const fields = [
    createBaseRecordIdField(),
    { id: 'title', name: 'Working title', type: BaseFieldType.Text, config: {} },
    {
      id: 'edition',
      name: 'Edition',
      type: BaseFieldType.SingleSelect,
      config: { options: EDITIONS.map(([name, , , , , , color]) => ({ id: name, name, color })) },
    },
    { id: 'quantity', name: 'Quantity', type: BaseFieldType.Number, config: { precision: 0 } },
    {
      id: 'status',
      name: 'Status',
      type: BaseFieldType.SingleSelect,
      config: {
        options: [
          { id: 'Scheduled', name: 'Scheduled', color: '#75AAA0' },
          { id: 'On hold', name: 'On hold', color: '#CDA16F' },
        ],
      },
    },
    { id: 'owner', name: 'Editor', type: BaseFieldType.Text, config: {} },
    { id: 'note', name: 'Edition notes', type: BaseFieldType.Text, config: {} },
  ]
  const fieldOrder = fields.map((field) => field.id)
  const records = Object.fromEntries(
    EDITIONS.map(([kind, title, amount, state, owner, note], i) => {
      const id = 'edition-' + (i + 1)
      return [
        id,
        {
          id,
          orderKey: String(i).padStart(3, '0'),
          createdAt: time,
          updatedAt: time,
          values: { [BASE_RECORD_ID_FIELD_ID]: id, title, edition: kind, quantity: amount, status: state, owner, note },
        },
      ]
    }),
  )
  return {
    id: BASE_ID,
    name: BASE_NAME,
    locale: LocaleType.EN_US,
    schemaVersion: 2,
    createdAt: time,
    updatedAt: time,
    tableOrder: ['editions'],
    tables: {
      editions: {
        id: 'editions',
        name: 'Editions',
        formulaName: 'Editions',
        primaryFieldId: 'title',
        fields: Object.fromEntries(fields.map((field) => [field.id, field])),
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: ['editions-grid'],
        views: {
          'editions-grid': {
            id: 'editions-grid',
            tableId: 'editions',
            name: 'Print schedule',
            type: BaseViewType.Grid,
            fieldOrder,
            fieldSettings: Object.fromEntries(
              fieldOrder.map((id) => [
                id,
                { hidden: id === BASE_RECORD_ID_FIELD_ID, width: id === 'title' ? 270 : id === 'note' ? 400 : 135 },
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

export function createHostData(): Partial<IWorkbookData> {
  const cellData: IWorkbookData['sheets'][string]['cellData'] = {
    0: { 0: { v: 'MERIDIAN / Follow the production calculation', s: 'title' } },
    1: { 0: { v: 'Independent print studio / August 2029 / Original fictional USD model', s: 'meta' } },
    3: {
      0: { v: 'Unit production rate', s: 'header' },
      1: { v: 25, s: 'rate' },
      3: { v: 'EDIT THE AMBER ASSUMPTIONS', s: 'meta' },
    },
    5: { 0: { v: 'Discussion envelope', s: 'header' }, 1: { v: 3500, s: 'input' } },
    7: { 0: { v: 'Relational Table quantities → Sheet formulas → Native prose, cards and chart', s: 'meta' } },
    8: Object.fromEntries(
      ['Edition', 'Scheduled quantity', 'Unit rate', 'Production amount', 'Quantity share'].map((v, i) => [
        i,
        { v, s: 'header' },
      ]),
    ),
    9: {
      0: { v: 'Atlas' },
      1: { f: countFor('Atlas'), s: 'quantity' },
      2: { f: '=$B$4', s: 'rateResult' },
      3: { f: '=B10*C10', s: 'amount' },
      4: { f: '=B10/$B$13', s: 'share' },
    },
    10: {
      0: { v: 'Fieldnotes' },
      1: { f: countFor('Fieldnotes'), s: 'quantity' },
      2: { f: '=$B$4', s: 'rateResult' },
      3: { f: '=B11*C11', s: 'amount' },
      4: { f: '=B11/$B$13', s: 'share' },
    },
    12: {
      0: { v: 'Scheduled total', s: 'header' },
      1: { f: '=SUM(B10:B11)', s: 'quantity' },
      3: { f: '=SUM(D10:D11)', s: 'amount' },
      4: { f: '=SUM(E10:E11)', s: 'share' },
    },
    14: {
      0: { v: 'Scheduled editions', s: 'header' },
      1: { f: '=COUNTIF(' + status + ',"Scheduled")', s: 'quantity' },
      2: { v: 'Envelope left', s: 'meta' },
      3: { f: '=B6-D13', s: 'amount' },
    },
    15: {
      0: { v: 'Discussion signal', s: 'header' },
      1: { f: '=IF(D13>B6,"Review scope","Within envelope")', s: 'signal' },
    },
    17: {
      0: {
        v: 'Read B10:B11 for Relational Table-backed quantities, D10:D11 for products, and D13 for the aggregate.',
        s: 'meta',
      },
    },
    18: {
      0: {
        v: 'Every output reads these Sheet results. No copied totals, hidden intermediary Sheet or refresh button.',
        s: 'meta',
      },
    },
  }
  return {
    id: HOST_ID,
    name: SOURCE_NAME,
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 22, bl: 1, cl: { rgb: '#203F4C' } },
      meta: { fs: 11, cl: { rgb: '#5D7280' } },
      header: { bl: 1, bg: { rgb: '#DAEAF0' }, cl: { rgb: '#2D5263' } },
      input: { bg: { rgb: '#FFF0D9' }, n: { pattern: '$#,##0' } },
      rate: { bg: { rgb: '#FFF0D9' }, n: { pattern: '$0.00' } },
      rateResult: { n: { pattern: '$0.00' } },
      quantity: { bg: { rgb: '#DAEAF0' }, n: { pattern: '0' } },
      amount: { bl: 1, bg: { rgb: '#F2DFE7' }, n: { pattern: '$#,##0;-$#,##0' } },
      share: { n: { pattern: '0.0%' } },
      signal: { cl: { rgb: '#356D82' }, bl: 1 },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Production model',
        rowCount: 42,
        columnCount: 9,
        defaultRowHeight: 29,
        defaultColumnWidth: 145,
        columnData: { 0: { w: 235 }, 1: { w: 180 }, 2: { w: 140 }, 3: { w: 195 }, 4: { w: 170 } },
        rowData: { 0: { h: 44 } },
        cellData,
        mergeData: [
          ...[0, 1, 7, 17, 18].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 4 })),
          { startRow: 3, endRow: 3, startColumn: 3, endColumn: 4 },
          { startRow: 15, endRow: 15, startColumn: 1, endColumn: 4 },
        ],
      },
    },
  }
}

export function createDocsData(): IDocumentData {
  const paragraphs = [
    ['MERIDIAN / EDITION PRODUCTION NOTE', 'kicker'],
    ['From the register to the printed page.', 'title'],
    ['Independent print studio / 21 August 2029 / Original fictional model', 'meta'],
    ['01 / The current run', 'heading'],
    [
      'The scheduled quantity is {{quantity}} copies at a unit production rate of {{rate}}. The model therefore totals {{total}}, leaving {{headroom}} inside the discussion envelope. This is an illustrative production model, not a supplier quote.',
      'body',
    ],
    ['02 / Two editions, one calculation chain', 'heading'],
    [
      'Atlas contributes {{atlasQty}} copies and {{atlas}} of the calculated amount. Fieldnotes contributes {{fieldnotesQty}} copies and {{fieldnotes}}. Fieldnotes represents {{share}} of the scheduled quantity.',
      'body',
    ],
    ['03 / What is included', 'heading'],
    [
      'The register has {{count}} scheduled editions. On-hold editions remain in Relational Table, but their quantities do not enter this run. Filtering the register view does not change that whole-table rule.',
      'body',
    ],
    ['Discussion signal: {{signal}}.', 'signal'],
    ['04 / Trace the dependency', 'heading'],
    [
      'Change the Fieldnotes quantity from 60 to 80 in Edition register. Read 120 copies and 3,000 in Production model. Then change the unit rate from 25 to 30: the amount becomes 3,600, without changing the two quantities.',
      'body',
    ],
    [
      'The note, review deck and production map read only Sheet result cells. They never query Relational Table directly. The intermediate quantity, multiplication and aggregate formulas remain visible and editable in the Sheet.',
      'body',
    ],
    ['Local studio discussion / No backend, order placement, accounting approval or publication', 'meta'],
  ] as const
  let offset = 0
  return {
    id: DOCS_ID,
    title: 'Meridian / Production note',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 960, height: 1000 },
      marginTop: 36,
      marginBottom: 36,
      marginLeft: 50,
      marginRight: 50,
    },
    body: {
      dataStream: paragraphs.map(([text]) => text).join('\r') + '\r\n',
      textRuns: paragraphs.map(([text, style]) => {
        const st = offset
        offset += text.length + 1
        return {
          st,
          ed: st + text.length,
          ts: {
            ff: 'Arial',
            fs: style === 'title' ? 28 : style === 'heading' ? 17 : style === 'meta' ? 10 : 13,
            bl: ['title', 'heading', 'signal'].includes(style) ? 1 : 0,
            cl: { rgb: style === 'kicker' || style === 'signal' ? '#986C39' : '#234653' },
          },
        }
      }),
      paragraphs: paragraphs.map(([text, style], i) => ({
        startIndex: paragraphs.slice(0, i + 1).reduce((sum, [part]) => sum + part.length + 1, 0) - 1,
        paragraphId: 'meridian-note-p-' + i,
        paragraphStyle: {
          namedStyleType:
            style === 'title'
              ? NamedStyleType.TITLE
              : style === 'heading'
                ? NamedStyleType.HEADING_1
                : NamedStyleType.NORMAL_TEXT,
          spaceAbove: { v: 4 },
          spaceBelow: { v: text ? 10 : 0 },
        },
      })),
      sectionBreaks: [
        {
          startIndex: paragraphs.reduce((sum, [text]) => sum + text.length + 1, 0),
          sectionId: 'meridian-note-section',
        },
      ],
    },
  }
}
function slideText(
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
  doc.id = 'meridian-' + page + '-' + id
  doc.documentStyle = { ...doc.documentStyle, textStyle: { ff: 'Arial' } }
  doc.body?.paragraphs?.forEach((paragraph, i) => {
    paragraph.paragraphId = doc.id + '-p-' + i
  })
  doc.body?.sectionBreaks?.forEach((section, i) => {
    section.sectionId = doc.id + '-s-' + i
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
function formulaShape(format: string, size: number, ink: string) {
  return {
    ...createFormulaShapeData({
      numberFormatPattern: format,
      fill: { fillType: ShapeFillEnum.NoFill },
      stroke: { color: 'transparent', width: 0 },
      textStyle: { ff: 'Arial', fs: size, bl: 1, cl: { rgb: ink } },
    }),
    shapeType: ShapeTypeEnum.Rect,
  }
}
function slideCard(
  page: string,
  id: string,
  label: string,
  x: number,
  y: number,
  width: number,
  fill: string,
  ink: string,
) {
  const spec = SLIDE_FORMULAS.find((item) => item.page === page && item.id === id)!
  return [
    slideText(page, id + '-panel', '', x, y, width, 150, 12, ink, fill),
    slideText(page, id + '-label', label, x + 18, y + 14, width - 36, 28, 15, ink),
    {
      id,
      type: PageElementTypeEnum.Shape as const,
      transform: { left: x + 16, top: y + 53, width: width - 32, height: 75, rotation: 0 },
      shapeData: formulaShape(spec.format, id === 'signal' ? 30 : 42, ink),
    },
  ]
}
export function createSlidesData(): ISlideData {
  const pages = [
    ['overview', 'Small editions. Visible assumptions.', '#173844', '#F8F5EC', '#E1B87B'],
    ['editions', 'Two titles, different contributions.', '#F7F2E9', '#244754', '#A76882'],
    ['decision', 'Change the rate. Keep the quantities.', '#553B51', '#FBF5EC', '#D9B6C5'],
  ].map(([id, title, bg, ink, accent]) => {
    const elements = [
      slideText(id, 'kicker', 'MERIDIAN / INDEPENDENT PRINT STUDIO / AUGUST 2029', 40, 28, 1120, 26, 14, accent),
      slideText(id, 'title', title, 40, 82, 1120, 66, 34, ink),
      slideText(
        id,
        'footer',
        'Relational Table records → Visible Sheet calculations → Native editorial outputs',
        40,
        626,
        1120,
        24,
        12,
        accent,
      ),
    ]
    if (id === 'overview') {
      ;[
        ['quantity', 'SCHEDULED COPIES', '#DAEAF0', '#356D82'],
        ['total', 'CALCULATED AMOUNT', '#F2DFE7', '#8F536D'],
        ['headroom', 'ENVELOPE LEFT', '#F8E8CF', '#8F6737'],
      ].forEach(([key, label, fill, color], i) =>
        elements.push(...slideCard(id, key, label, 40 + i * 380, 210, 350, fill, color)),
      )
      elements.push(
        slideText(
          id,
          'note',
          'The register holds quantities. The Sheet applies the rate. Every editorial output reads the resulting cells.',
          44,
          425,
          1080,
          122,
          25,
          ink,
        ),
      )
    }
    if (id === 'editions')
      elements.push(
        ...slideCard(id, 'atlas', 'ATLAS / NIGHT ROUTES', 40, 205, 535, '#DAEAF0', '#356D82'),
        ...slideCard(id, 'fieldnotes', 'FIELDNOTES / COASTAL WALKS', 615, 205, 535, '#F2DFE7', '#8F536D'),
        ...slideCard(id, 'share', 'FIELDNOTES / QUANTITY SHARE', 40, 440, 440, '#F2DFE7', '#8F536D'),
        slideText(
          id,
          'note',
          'A folded walking atlas and a shoreline notebook. Different quantities, the same unit-rate assumption.',
          525,
          460,
          605,
          110,
          25,
          ink,
        ),
      )
    if (id === 'decision')
      elements.push(
        ...slideCard(id, 'rate', 'UNIT RATE / SHEET INPUT', 40, 210, 350, '#F8E8CF', '#8F6737'),
        ...slideCard(id, 'count', 'SCHEDULED EDITIONS', 420, 210, 350, '#DAEAF0', '#356D82'),
        ...slideCard(id, 'signal', 'DISCUSSION SIGNAL', 800, 210, 350, '#F2DFE7', '#8F536D'),
        slideText(
          id,
          'note',
          '01  Confirm which editions are scheduled.\n02  Compare the rate and production envelope.\n03  Keep editorial decisions separate from calculated numbers.',
          48,
          425,
          1070,
          150,
          24,
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
        'Use Edition register for quantities/statuses and Production model for unit rate and envelope. All cards read Sheet cells.',
    }
  })
  return {
    id: SLIDES_ID,
    name: 'Meridian / Studio review',
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1200, height: 675 },
    slides: Object.fromEntries(pages.map((p) => [p.id, p])),
    slideOrder: pages.map((p) => p.id),
    activeSlideId: 'overview',
  }
}
function boardText(
  id: string,
  text: string,
  left: number,
  top: number,
  width: number,
  height: number,
  size: number,
  ink: string,
  fill?: string,
) {
  const shape = createBoardTextBoxShapeElement({
    id,
    text,
    left,
    top,
    width,
    height,
    horizontalAlign: HorizontalAlign.LEFT,
    verticalAlign: VerticalAlign.MIDDLE,
    textWrap: ShapeTextWrapType.Square,
    textStyle: { ff: 'Arial', fs: size, cl: { rgb: ink } },
  })
  shape.shapeData.shapeType = ShapeTypeEnum.Rect
  shape.shapeData.fill = fill ? { fillType: ShapeFillEnum.SolidFill, color: fill } : { fillType: ShapeFillEnum.NoFill }
  shape.shapeData.stroke = { color: 'transparent', width: 0 }
  if (!text) {
    delete shape.shapeData.shapeText
    shape.shapeData.isTextBox = false
  }
  return shape
}
function boardCard(id: string, label: string, left: number, top: number, width: number, fill: string, ink: string) {
  const shape = boardText(id, '', left + 18, top + 48, width - 36, 65, 34, ink)
  shape.shapeData = formulaShape(BOARD_FORMULAS.find((item) => item.id === id)!.format, id === 'signal' ? 23 : 36, ink)
  return [
    boardText(id + '-panel', '', left, top, width, 134, 12, ink, fill),
    boardText(id + '-label', label, left + 18, top + 8, width - 36, 32, 14, ink),
    shape,
  ]
}
export function createBoardData(): IBoardData {
  const shapes = [
    boardText('title', 'MERIDIAN / FOLLOW ONE NUMBER THROUGH', 40, 22, 1120, 58, 30, '#203F4C'),
    boardText(
      'subtitle',
      'Relational Table is the record source. Sheet is the visible calculation layer.',
      44,
      88,
      1110,
      36,
      17,
      '#5D7280',
    ),
    ...boardCard('quantity', '01 / SCHEDULED COPIES', 40, 170, 355, '#DAEAF0', '#356D82'),
    ...boardCard('rate', '02 / UNIT RATE', 440, 170, 355, '#F8E8CF', '#8F6737'),
    ...boardCard('total', '03 / CALCULATED AMOUNT', 820, 170, 355, '#F2DFE7', '#8F536D'),
    ...boardCard('atlas', 'ATLAS / NIGHT ROUTES', 180, 445, 395, '#DAEAF0', '#356D82'),
    ...boardCard('fieldnotes', 'FIELDNOTES / COASTAL WALKS', 640, 445, 395, '#F2DFE7', '#8F536D'),
    ...boardCard('signal', 'READ THE MODEL / THEN DISCUSS', 320, 705, 580, '#E7E1EC', '#624766'),
    boardText(
      'footer',
      'Native connected shapes keep their layout while upstream record and rate edits recalculate.',
      44,
      888,
      1110,
      45,
      17,
      '#5D7280',
    ),
  ]
  const edges = [
    ['quantity', 'total'],
    ['rate', 'total'],
    ['total', 'atlas'],
    ['total', 'fieldnotes'],
  ]
  const connectors = edges.map(([from, to], i) =>
    createBoardConnectorElement({
      id: 'chain-' + i,
      start: { kind: 'shapeSite', shapeId: from + '-panel', connectionSiteId: 2 },
      end: { kind: 'shapeSite', shapeId: to + '-panel', connectionSiteId: 0 },
      routing: 'orthogonal',
      routingMode: 'auto',
      style: { stroke: '#7F929D', strokeWidth: 2, endMarker: { type: 'filledArrow' } },
    }),
  )
  const elements = [...connectors, ...shapes]
  return {
    id: BOARD_ID,
    name: 'Meridian / Production map',
    appVersion: '1.0.0-beta.2',
    defaultPageSize: { width: 1220, height: 970 },
    pageOrder: ['production'],
    activePageId: 'production',
    pages: {
      production: {
        id: 'production',
        name: 'Production discussion',
        pageType: BoardPageType.Page,
        elements: Object.fromEntries(elements.map((e) => [e.id, e])),
        elementOrder: elements.map((e) => e.id),
      },
    },
  }
}
