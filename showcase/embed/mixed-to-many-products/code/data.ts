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

export const HOST_ID = 'kestrel-actuals'
export const SHEET_UNIT_ID = 'kestrel-plan'
export const SHEET_ID = 'plan'
export const SOURCE_NAME = 'Kestrel Actuals'
export const PLAN_NAME = 'Kestrel Plan'
export const DOCS_ID = 'kestrel-planning-note'
export const SLIDES_ID = 'kestrel-review'
export const BOARD_ID = 'kestrel-variance-map'
const planRange = "'[Kestrel Plan]Workstream plan'!B5:B7"
const amounts = '[Kestrel Actuals]!Expenses[Amount]'
const statuses = '[Kestrel Actuals]!Expenses[Status]'
const streams = '[Kestrel Actuals]!Expenses[Workstream]'
const actual = 'SUMIF(' + statuses + ',"Posted",' + amounts + ')'
const planned = 'SUM(' + planRange + ')'
export const WORKSTREAMS = [
  ['Learning', 18000, 'Workshops, mentors and reusable learning kits', '#E2E9F4', '#445E91'],
  ['Fabrication', 16000, 'Shared tools, prototypes and safe working space', '#D8EFE9', '#236A60'],
  ['Access', 14000, 'Travel support, interpretation and quiet sessions', '#F8E8D5', '#8F623D'],
] as const
export const EXPENSES = [
  ['Workshop mentors', 'Learning', 'Posted', 8000, 'Mina', 'Facilitators for the first workshop series.'],
  ['Reusable learning kits', 'Learning', 'Posted', 9000, 'Ellis', 'Kits remain available for the next cohort.'],
  ['Tool bench and guards', 'Fabrication', 'Posted', 9500, 'Rowan', 'Shared tools with protective equipment.'],
  ['Prototype materials', 'Fabrication', 'Posted', 5000, 'Sana', 'Small batches for practical exploration.'],
  ['Travel support', 'Access', 'Posted', 6000, 'Jules', 'Local travel support for workshop participants.'],
  ['Interpretation sessions', 'Access', 'Posted', 8000, 'Mina', 'Interpretation and accessible session materials.'],
  ['Additional mentors', 'Learning', 'Draft', 1500, 'Ellis', 'Proposed extension, not in posted actuals.'],
  ['Quiet-session pilot', 'Access', 'Draft', 1000, 'Jules', 'A draft option for the next workshop cycle.'],
] as const
const gap = planned + '-' + actual
const departmentActual = (name: string) =>
  'SUMIFS(' + amounts + ',' + statuses + ',"Posted",' + streams + ',"' + name + '")'
export const METRICS = [
  { id: 'plan', formula: '=' + planned, format: '$#,##0' },
  { id: 'actual', formula: '=' + actual, format: '$#,##0' },
  { id: 'gap', formula: '=' + gap, format: '$#,##0;-$#,##0' },
  { id: 'coverage', formula: '=' + actual + '/(' + planned + ')', format: '0.0%' },
  { id: 'posted', formula: '=COUNTIF(' + statuses + ',"Posted")', format: '0' },
  { id: 'draft', formula: '=SUMIF(' + statuses + ',"Draft",' + amounts + ')', format: '$#,##0' },
  ...WORKSTREAMS.map(([name], i) => ({
    id: name.toLowerCase(),
    formula: "='[Kestrel Plan]Workstream plan'!B" + (i + 5) + '-' + departmentActual(name),
    format: '$#,##0;-$#,##0',
  })),
  { id: 'signal', formula: '=IF(' + gap + '<0,"Over plan","Within plan")', format: 'General' },
]
export const INLINE_FORMULAS = METRICS.map(({ id, formula, format }) => ({
  marker: '{{' + id + '}}',
  formula,
  pattern: format,
}))
export const SLIDE_FORMULAS = [
  ...['plan', 'actual', 'gap'].map((id) =>
    Object.assign(
      { page: 'overview' },
      METRICS.find((m) => m.id === id)!,
    ),
  ),
  ...['learning', 'fabrication', 'access'].map((id) =>
    Object.assign(
      { page: 'workstreams' },
      METRICS.find((m) => m.id === id)!,
    ),
  ),
  ...['coverage', 'draft', 'signal'].map((id) =>
    Object.assign(
      { page: 'decision' },
      METRICS.find((m) => m.id === id)!,
    ),
  ),
]
export const BOARD_FORMULAS = METRICS.filter((m) =>
  ['plan', 'actual', 'gap', 'learning', 'fabrication', 'access', 'signal'].includes(m.id),
)

export function createHostData(): IBaseSnapshot {
  const time = Date.parse('2029-07-12T09:00:00Z')
  const fields = [
    createBaseRecordIdField(),
    { id: 'title', name: 'Expense', type: BaseFieldType.Text, config: {} },
    {
      id: 'workstream',
      name: 'Workstream',
      type: BaseFieldType.SingleSelect,
      config: { options: WORKSTREAMS.map(([name, , , color]) => ({ id: name, name, color })) },
    },
    {
      id: 'status',
      name: 'Status',
      type: BaseFieldType.SingleSelect,
      config: {
        options: [
          { id: 'Posted', name: 'Posted', color: '#71B6A6' },
          { id: 'Draft', name: 'Draft', color: '#D4AD73' },
        ],
      },
    },
    { id: 'amount', name: 'Amount', type: BaseFieldType.Number, config: { precision: 0 } },
    { id: 'owner', name: 'Owner', type: BaseFieldType.Text, config: {} },
    { id: 'note', name: 'Context', type: BaseFieldType.Text, config: {} },
  ]
  const fieldOrder = fields.map((field) => field.id)
  const records = Object.fromEntries(
    EXPENSES.map(([title, workstream, status, amount, owner, note], i) => {
      const id = 'expense-' + (i + 1)
      return [
        id,
        {
          id,
          orderKey: String(i).padStart(3, '0'),
          createdAt: time,
          updatedAt: time,
          values: { [BASE_RECORD_ID_FIELD_ID]: id, title, workstream, status, amount, owner, note },
        },
      ]
    }),
  )
  return {
    id: HOST_ID,
    name: SOURCE_NAME,
    locale: LocaleType.EN_US,
    schemaVersion: 2,
    createdAt: time,
    updatedAt: time,
    tableOrder: ['expenses'],
    tables: {
      expenses: {
        id: 'expenses',
        name: 'Expenses',
        formulaName: 'Expenses',
        primaryFieldId: 'title',
        fields: Object.fromEntries(fields.map((field) => [field.id, field])),
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: ['expense-grid'],
        views: {
          'expense-grid': {
            id: 'expense-grid',
            tableId: 'expenses',
            name: 'Posted and draft',
            type: BaseViewType.Grid,
            fieldOrder,
            fieldSettings: Object.fromEntries(
              fieldOrder.map((id) => [
                id,
                {
                  hidden: id === BASE_RECORD_ID_FIELD_ID,
                  width: id === 'title' ? 240 : id === 'note' ? 370 : 135,
                },
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

export function createSheetData(): Partial<IWorkbookData> {
  const cellData: IWorkbookData['sheets'][string]['cellData'] = {
    0: { 0: { v: 'KESTREL / Plan beside actuals', s: 'title' } },
    1: { 0: { v: 'Community maker lab / July 2029 / Original fictional USD planning data', s: 'meta' } },
    3: Object.fromEntries(
      ['Workstream', 'Plan input', 'Posted actual', 'Remaining', 'Actual / plan'].map((v, i) => [
        i,
        { v, s: 'header' },
      ]),
    ),
    8: {
      0: { v: 'All workstreams', s: 'header' },
      1: { f: '=SUM(B5:B7)', s: 'money' },
      2: { f: '=SUM(C5:C7)', s: 'actual' },
      3: { f: '=B9-C9', s: 'money' },
      4: { f: '=C9/B9', s: 'ratio' },
    },
    10: {
      0: { v: 'Draft amount / excluded', s: 'meta' },
      2: { f: '=SUMIF(' + statuses + ',"Draft",' + amounts + ')', s: 'money' },
    },
    12: {
      0: {
        v: 'Edit amber plan values here. Edit actuals and statuses in Expenses. Only Posted records count.',
        s: 'meta',
      },
    },
    13: {
      0: {
        v: 'The chart reads B5:C7, including native Base-backed formulas. No copied actuals or manual refresh.',
        s: 'meta',
      },
    },
  }
  WORKSTREAMS.forEach(([name, plan], i) => {
    const r = i + 5
    cellData[r - 1] = {
      0: { v: name },
      1: { v: plan, s: 'input' },
      2: { f: '=' + departmentActual(name), s: 'actual' },
      3: { f: '=B' + r + '-C' + r, s: 'money' },
      4: { f: '=C' + r + '/B' + r, s: 'ratio' },
    }
  })
  return {
    id: SHEET_UNIT_ID,
    name: PLAN_NAME,
    appVersion: '1.0.0-rc.0',
    locale: LocaleType.EN_US,
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 24, bl: 1, cl: { rgb: '#213D4A' } },
      meta: { fs: 11, cl: { rgb: '#566F7B' } },
      header: { bl: 1, bg: { rgb: '#E2E9F4' }, cl: { rgb: '#294660' } },
      input: { bg: { rgb: '#FFF0DB' }, n: { pattern: '$#,##0' } },
      money: { bl: 1, n: { pattern: '$#,##0;-$#,##0' } },
      actual: { bg: { rgb: '#D8EFE9' }, n: { pattern: '$#,##0' } },
      ratio: { n: { pattern: '0.0%' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Workstream plan',
        rowCount: 40,
        columnCount: 9,
        defaultRowHeight: 31,
        defaultColumnWidth: 140,
        columnData: { 0: { w: 240 }, 1: { w: 155 }, 2: { w: 170 }, 3: { w: 170 }, 4: { w: 160 } },
        rowData: { 0: { h: 46 } },
        cellData,
        mergeData: [0, 1, 12, 13].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 4 })),
      },
    },
  }
}

export function createDocsData(): IDocumentData {
  const paragraphs = [
    ['KESTREL / PLANNING FIELD NOTE', 'kicker'],
    ['Two sources. One useful discussion.', 'title'],
    ['Community maker lab / 12 July 2029 / Original fictional model', 'meta'],
    ['01 / Read the difference', 'heading'],
    [
      'The Sheet plan is {{plan}}. The Base register has {{actual}} in posted actuals, leaving {{gap}} against the plan. Actuals represent {{coverage}} of the plan. These are illustrative allocations, not audited accounts.',
      'body',
    ],
    ['02 / Separate posted from proposed', 'heading'],
    [
      'There are {{posted}} posted records. Draft amounts total {{draft}} and are excluded from actuals. Posting a draft changes the totals; changing its owner or note does not.',
      'body',
    ],
    ['03 / Ask where the difference sits', 'heading'],
    [
      'Learning has {{learning}} remaining; Fabrication has {{fabrication}}; Access has {{access}}. A positive overall difference can hide a workstream overrun. Read all three before moving resources.',
      'body',
    ],
    ['Review signal: {{signal}}.', 'signal'],
    ['04 / Follow the source', 'heading'],
    [
      'Change Workshop mentors from 8,000 to 9,500 in Expenses. Posted actuals become 47,000 and the overall gap becomes 1,000. Then change the Access plan in Plan & chart and compare which results depend on that second source.',
      'body',
    ],
    [
      'Base filters change the visible records, not the whole-table references. The Slides and Board read both sources directly; the chart reads the visible Sheet calculation range. No prose or layout is regenerated.',
      'body',
    ],
    ['Local discussion model / No server, purchase, accounting approval or publication', 'meta'],
  ] as const
  let offset = 0
  return {
    id: DOCS_ID,
    title: 'Kestrel / Planning brief',
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
        paragraphId: 'kestrel-note-p-' + i,
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
          sectionId: 'kestrel-note-section',
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
  doc.id = 'kestrel-' + page + '-' + id
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
    ['overview', 'See both sides of the plan.', '#192E3B', '#F9F5EC', '#DBB575'],
    ['workstreams', 'A total can hide three different stories.', '#F6F0E6', '#263F51', '#997044'],
    ['decision', 'Check the model before choosing.', '#284E4B', '#F1F6EF', '#B9D8C8'],
  ].map(([id, title, bg, ink, accent]) => {
    const elements = [
      slideText(id, 'kicker', 'KESTREL / COMMUNITY MAKER LAB / JULY 2029', 40, 28, 1120, 26, 14, accent),
      slideText(id, 'title', title, 40, 80, 1120, 70, 34, ink),
      slideText(
        id,
        'footer',
        'Original fictional data / Base actuals + Sheet plan / No automatic approval',
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
        ['plan', 'SHEET / PLAN', '#E2E9F4', '#445E91'],
        ['actual', 'BASE / POSTED', '#D8EFE9', '#236A60'],
        ['gap', 'PLAN LESS ACTUAL', '#F8E8D5', '#8F623D'],
      ].forEach(([key, label, fill, color], i) =>
        elements.push(...slideCard(id, key, label, 40 + i * 380, 210, 350, fill, color)),
      )
      elements.push(
        slideText(
          id,
          'note',
          'Plan values live in the Sheet. Posted amounts live in Base. This review reads both, without copying either source.',
          44,
          420,
          1070,
          120,
          24,
          ink,
        ),
      )
    }
    if (id === 'workstreams') {
      WORKSTREAMS.forEach(([name, , purpose, fill, color], i) =>
        elements.push(
          ...slideCard(
            id,
            name.toLowerCase(),
            name.toUpperCase() + ' / REMAINING',
            40 + i * 380,
            210,
            350,
            fill,
            color,
          ),
          slideText(id, 'purpose-' + i, purpose, 44 + i * 380, 383, 340, 100, 19, ink),
        ),
      )
      elements.push(
        slideText(
          id,
          'note',
          'A negative card means that workstream is over plan. Compare the two series in Plan & chart.',
          44,
          516,
          1080,
          75,
          24,
          ink,
        ),
      )
    }
    if (id === 'decision')
      elements.push(
        ...slideCard(id, 'coverage', 'POSTED / PLAN', 40, 210, 345, '#E2E9F4', '#445E91'),
        ...slideCard(id, 'draft', 'DRAFT / EXCLUDED', 420, 210, 345, '#F8E8D5', '#8F623D'),
        ...slideCard(id, 'signal', 'REVIEW SIGNAL', 800, 210, 345, '#D8EFE9', '#236A60'),
        slideText(
          id,
          'note',
          '01  Review the remaining gap.\n02  Keep drafts separate from posted actuals.\n03  Agree the next step with the workstream owners.',
          48,
          422,
          1050,
          150,
          25,
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
        'Open Expenses to edit posted amounts and statuses. Open Plan & chart to edit the independent planning assumptions.',
    }
  })
  return {
    id: SLIDES_ID,
    name: 'Kestrel / Review deck',
    appVersion: '1.0.0-rc.0',
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
    boardText('title', 'KESTREL / WHERE THE DIFFERENCE LIVES', 40, 24, 1120, 56, 30, '#213D4A'),
    boardText('subtitle', 'Two editable sources, one shared variance discussion.', 44, 90, 1110, 30, 17, '#566F7B'),
    ...boardCard('plan', 'SHEET / PLAN', 40, 160, 340, '#E2E9F4', '#445E91'),
    ...boardCard('actual', 'BASE / POSTED ACTUAL', 820, 160, 340, '#D8EFE9', '#236A60'),
    ...boardCard('gap', 'PLAN LESS POSTED ACTUAL', 430, 340, 340, '#F8E8D5', '#8F623D'),
  ]
  WORKSTREAMS.forEach(([name, , , fill, ink], i) =>
    shapes.push(
      ...boardCard(name.toLowerCase(), name.toUpperCase() + ' / REMAINING', 40 + i * 390, 565, 340, fill, ink),
    ),
  )
  shapes.push(
    ...boardCard('signal', 'MODEL SIGNAL / NOT AN APPROVAL', 320, 770, 580, '#E2E9F4', '#294660'),
    boardText(
      'footer',
      'Edit either source. Keep the discussion, notes and connections in this native Board.',
      44,
      925,
      1110,
      38,
      17,
      '#566F7B',
    ),
  )
  const edges = [['plan', 'gap'], ['actual', 'gap'], ...WORKSTREAMS.map(([name]) => ['gap', name.toLowerCase()])]
  const connectors = edges.map(([from, to], i) =>
    createBoardConnectorElement({
      id: 'dependency-' + i,
      start: { kind: 'shapeSite', shapeId: from + '-panel', connectionSiteId: 2 },
      end: { kind: 'shapeSite', shapeId: to + '-panel', connectionSiteId: 0 },
      routing: 'orthogonal',
      routingMode: 'auto',
      style: { stroke: '#718AA0', strokeWidth: 2, endMarker: { type: 'filledArrow' } },
    }),
  )
  const elements = [...connectors, ...shapes]
  return {
    id: BOARD_ID,
    name: 'Kestrel / Variance map',
    appVersion: '1.0.0-rc.0',
    defaultPageSize: { width: 1200, height: 990 },
    pageOrder: ['variance'],
    activePageId: 'variance',
    pages: {
      variance: {
        id: 'variance',
        name: 'Variance discussion',
        pageType: BoardPageType.Page,
        elements: Object.fromEntries(elements.map((e) => [e.id, e])),
        elementOrder: elements.map((e) => e.id),
      },
    },
  }
}
