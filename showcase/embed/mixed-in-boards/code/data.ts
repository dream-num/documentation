import type { IBoardData } from '@univerjs-pro/boards'
import type { IBaseSnapshot, IDocumentData, IFieldSnapshot, ITableSnapshot, IWorkbookData } from '@univerjs/core'
import { serializeRecordLinkIds } from '@univerjs-pro/bases'
import { BoardPageType, createBoardConnectorElement, createBoardTextBoxShapeElement } from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeTextAutoFitType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum, type ISlideData } from '@univerjs-pro/slides'
import {
  BASE_RECORD_ID_FIELD_ID,
  BaseFieldType,
  BaseViewType,
  BooleanNumber,
  CellValueType,
  createBaseRecordIdField,
  DocumentFlavor,
  HorizontalAlign,
  LocaleType,
  NamedStyleType,
  RichTextBuilder,
  VerticalAlign,
} from '@univerjs/core'

export const HOST_ID = 'ripple-wayfinding-workshop'
export const SHEET_UNIT_ID = 'ripple-wayfinding-budget'
export const SHEET_ID = 'resources'
export const DOCS_ID = 'ripple-wayfinding-agenda'
export const BASE_ID = 'ripple-wayfinding-observations'
export const SLIDES_ID = 'ripple-wayfinding-review'
export const PAGE_ID = 'planning'
const TIME = Date.parse('2029-02-21T09:00:00Z')
export const COSTS = [
  ['Feedback cards', 32, 2.5],
  ['Table kits', 4, 34],
  ['Facilitator sessions', 2, 180],
  ['Access support sessions', 2, 90],
  ['Map prints', 40, 3],
  ['Prototype markers', 24, 8.5],
  ['Venue hours', 5, 60],
  ['Synthesis hours', 6, 42],
] as const
export function createSheetData(): Partial<IWorkbookData> {
  const cellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'RIPPLE / Workshop resources', s: 'title' } },
    1: { 0: { v: '32 planned participants / 4 tables / 90 minutes', s: 'muted' } },
    3: Object.fromEntries(['Resource', 'Qty', 'Rate', 'Line cost'].map((v, i) => [i, { v, s: 'header' }])),
    13: { 0: { v: 'Direct workshop costs', s: 'header' }, 3: { f: '=SUM(D5:D12)', s: 'money' } },
    14: { 0: { v: 'Reserve / 10%', s: 'header' }, 3: { f: '=ROUND(D14*10%,2)', s: 'money' } },
    15: { 0: { v: 'Workshop envelope', s: 'header' }, 3: { f: '=ROUND(D14+D15,2)', s: 'total' } },
    17: { 0: { v: 'Quantities recalculate; written claims stay independent.', s: 'muted' } },
    19: { 0: { v: 'Fictional estimates / No bookings or purchases', s: 'muted' } },
  }
  COSTS.forEach(([label, qty, rate], i) => {
    const row = i + 4
    cellData[row] = {
      0: { v: label, s: i % 2 ? 'stripe' : 'body' },
      1: { v: qty, t: CellValueType.NUMBER, s: 'input' },
      2: { v: rate, t: CellValueType.NUMBER, s: 'money' },
      3: { f: '=B' + (row + 1) + '*C' + (row + 1), s: 'money' },
    }
  })
  return {
    id: SHEET_UNIT_ID,
    name: 'Ripple / Workshop budget',
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-beta.2',
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 22, bl: 1, cl: { rgb: '#22365F' } },
      muted: { fs: 11, cl: { rgb: '#657F8D' } },
      header: { bg: { rgb: '#DFEAEF' }, bl: 1, cl: { rgb: '#22365F' } },
      body: { cl: { rgb: '#394B57' } },
      stripe: { bg: { rgb: '#F4F6F8' } },
      money: { n: { pattern: '#,##0.00' } },
      input: { cl: { rgb: '#1B1C1F' }, bg: { rgb: '#F4E7C9' }, n: { pattern: '#,##0' } },
      total: { bg: { rgb: '#DDF1EB' }, bl: 1, n: { pattern: '#,##0.00' }, cl: { rgb: '#285D52' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Workshop budget',
        rowCount: 22,
        columnCount: 4,
        defaultRowHeight: 25,
        defaultColumnWidth: 100,
        columnData: { 0: { w: 240 }, 1: { w: 75 }, 2: { w: 110 }, 3: { w: 140 } },
        cellData,
        rowData: { 0: { h: 38 } },
        mergeData: [0, 1, 17, 19].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 3 })),
      },
    },
  }
}
const MEMO = [
  ['RIPPLE / FACILITATION AGENDA', 'kicker'],
  ['Find the way together.', 'title'],
  ['21 February 2029 / Discussion draft / Fictional riverfront', 'meta'],
  ['01 / Observe together / 15 minutes', 'heading'],
  [
    'Begin with eight illustrative observations across Ferry steps, Garden loop and Market arch. Ask what is unclear before proposing a sign. No real route assessment or construction decision is implied.',
    'body',
  ],
  ['02 / Draft a route / 25 minutes', 'heading'],
  [
    'Four tables compare short labels, recognizable landmarks and return-direction cues. Plan for 32 participants; this is capacity, not attendance. Keep words readable without relying on color alone.',
    'body',
  ],
  ['03 / Try the reading / 30 minutes', 'heading'],
  [
    'Exchange paper prototypes between tables. Read each label aloud, explain the next decision and record one uncertainty. The linked Base keeps observations and next questions separate from proposed answers.',
    'body',
  ],
  ['04 / Revise the brief / 20 minutes', 'heading'],
  [
    'Review three locations in the Slides, then update the Board discussion loop. The opening resource estimate is USD 1,632 plus a ten-percent reserve: USD 1,795.20. These written numbers are authored baselines; only the Sheet recalculates.',
    'body',
  ],
  ['05 / Respect the boundaries', 'heading'],
  [
    'Each floating product has its own local model. Edit through native tools or fullscreen; return to the Board to compare evidence. Links describe relationships, not workflow automation. No participant profiles, booking, purchases, approvals or backend are used.',
    'body',
  ],
] as const
export function createDocsData(): IDocumentData {
  let offset = 0
  const paragraphs = MEMO.map(([text, kind], i) => {
    offset += text.length + 1
    const heading = kind === 'heading'
    return {
      startIndex: offset - 1,
      paragraphId: 'ripple-agenda-p-' + i,
      paragraphStyle: {
        namedStyleType:
          kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        ...(heading ? { headingId: 'ripple-agenda-h-' + i } : {}),
        spaceAbove: { v: heading ? 14 : 0 },
        spaceBelow: { v: 8 },
        lineSpacing: 1.2,
        textStyle: {
          ff: 'Arial',
          fs: kind === 'title' ? 28 : heading ? 16 : kind === 'meta' ? 10 : 13,
          bl: heading || kind === 'title' ? BooleanNumber.TRUE : BooleanNumber.FALSE,
          cl: { rgb: heading || kind === 'title' ? '#365E5C' : '#42535B' },
        },
      },
    }
  })
  const dataStream = MEMO.map(([text]) => text).join('\r') + '\r\n'
  return {
    id: DOCS_ID,
    title: 'Ripple / Facilitation agenda',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 800, height: 1000 },
      marginTop: 36,
      marginBottom: 36,
      marginLeft: 52,
      marginRight: 52,
    },
    body: {
      dataStream,
      paragraphs,
      textRuns: [],
      customBlocks: [],
      customRanges: [],
      customDecorations: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'ripple-agenda-section' }],
    },
  }
}
const text = (
  pageId: string,
  id: string,
  value: string,
  left: number,
  top: number,
  width: number,
  height: number,
  size: number,
  color: string,
  fill?: string,
) => {
  const doc = RichTextBuilder.create()
    .span(value, { fontSize: size, color, bold: id === 'title' || Boolean(fill) })
    .getData()
  doc.id = pageId + '-' + id
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

export function createSlidesData(): ISlideData {
  const specs = [
    { id: 'cover', name: 'Find the way\ntogether.', bg: '#101A34', ink: '#F5F7FF', accent: '#58C8FF' },
    { id: 'places', name: 'Three places. Different questions.', bg: '#F6F0E7', ink: '#303C64', accent: '#986441' },
    { id: 'checkpoint', name: 'Test the reading, not the person.', bg: '#45334F', ink: '#F5F0FA', accent: '#B6A6FF' },
  ]
  const pages = specs.map(({ id, name, bg, ink, accent }) => {
    const t = (
      eid: string,
      value: string,
      x: number,
      y: number,
      w: number,
      h: number,
      size: number,
      color = ink,
      fill?: string,
    ) => text(id, eid, value, x, y, w, h, size, color, fill)
    const elements = [
      t('kicker', 'RIPPLE / WAYFINDING REVIEW / 21 FEB 2029', 40, 25, 900, 35, 14, accent),
      t('title', name, 40, 88, id === 'cover' ? 610 : 920, id === 'cover' ? 145 : 100, id === 'cover' ? 45 : 32),
      t(
        'footer',
        'Original fictional workshop / Written figures are not live Formula Shapes',
        40,
        520,
        920,
        30,
        12,
        accent,
      ),
      ...(id === 'cover'
        ? [
            t(
              'intro',
              'Four tables. Three locations.\nA shared language for the riverfront.\nBring questions, not final signs.',
              40,
              285,
              580,
              155,
              23,
              '#C8D0E4',
            ),
            t('participants', '32\nPlanned participants', 690, 120, 270, 105, 20, '#101A34', '#58C8FF'),
            t('minutes', '90 MIN\nObserve to revise', 690, 250, 270, 105, 23, '#101A34', '#50C8B0'),
            t('envelope', '$1,795.20\nOpening envelope', 690, 380, 270, 105, 21, '#101A34', '#F2B84B'),
          ]
        : id === 'places'
          ? [
              t(
                'ferry',
                'FERRY STEPS\n\nName the exit.\nShow the return.\nLocate the first turn.',
                40,
                220,
                290,
                225,
                18,
                ink,
                '#DDE8F0',
              ),
              t(
                'garden',
                'GARDEN LOOP\n\nCompare landmarks.\nPair words + icons.\nAvoid color-only cues.',
                355,
                220,
                290,
                225,
                18,
                ink,
                '#DCEBE4',
              ),
              t(
                'market',
                'MARKET ARCH\n\nShorten the label.\nSeparate entry / exit.\nUse one place name.',
                670,
                220,
                290,
                225,
                18,
                ink,
                '#F1DDCF',
              ),
            ]
          : [
              t(
                'evidence',
                'LISTEN FOR UNCERTAINTY\n\nEight starter observations.\nOne next question each.\nNo personal profiles.',
                40,
                215,
                440,
                235,
                22,
                '#25483F',
                '#D7EDE6',
              ),
              t(
                'boundary',
                'KEEP THE BOUNDARIES\n\nPaper trials, not installed signs.\nCapacity, not attendance.\nReview, not approval.',
                520,
                215,
                440,
                235,
                21,
                '#583B41',
                '#F2DAD4',
              ),
            ]),
    ]
    return {
      id,
      name,
      pageType: PageTypeEnum.Slide as const,
      background: { type: SlideBackgroundTypeEnum.Solid as const, color: bg },
      elements: Object.fromEntries(elements.map((e) => [e.id, e])),
      elementOrder: elements.map((e) => e.id),
      speakerNotes:
        'Return to the Board overview after reviewing each location. Budget, observations, narrative and shapes remain independent.',
    }
  })
  return {
    id: SLIDES_ID,
    name: 'Ripple / Wayfinding review',
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1000, height: 562.5 },
    slides: Object.fromEntries(pages.map((p) => [p.id, p])),
    slideOrder: pages.map((p) => p.id),
    activeSlideId: 'cover',
  }
}
const field = (id: string, name: string, type: BaseFieldType, config = {}): IFieldSnapshot => ({
  id,
  name,
  type,
  config,
})

export function createBaseData(): IBaseSnapshot {
  const state = field('state', 'Review state', BaseFieldType.SingleSelect, {
    options: [
      { id: 'ready', name: 'Ready', color: '#54826C' },
      { id: 'review', name: 'In review', color: '#9D793C' },
      { id: 'waiting', name: 'Waiting', color: '#8E6A9D' },
    ],
  })
  const table = (id: string, name: string, defs: IFieldSnapshot[], rows: Record<string, string>[]): ITableSnapshot => {
    const fields = [createBaseRecordIdField(), ...defs],
      fieldOrder = fields.map((f) => f.id)
    const records = Object.fromEntries(
      rows.map((values, i) => {
        const recordId = id + '-' + (i + 1)
        return [
          recordId,
          {
            id: recordId,
            orderKey: String(i).padStart(3, '0'),
            createdAt: TIME,
            updatedAt: TIME,
            values: { [BASE_RECORD_ID_FIELD_ID]: recordId, ...values },
          },
        ]
      }),
    )
    return {
      id,
      name,
      formulaName: id,
      primaryFieldId: 'title',
      fields: Object.fromEntries(fields.map((f) => [f.id, structuredClone(f)])),
      fieldOrder,
      records,
      recordOrder: Object.keys(records),
      viewOrder: [id + '-grid'],
      views: {
        [id + '-grid']: {
          id: id + '-grid',
          tableId: id,
          name: 'Review register',
          type: BaseViewType.Grid,
          fieldOrder,
          fieldSettings: Object.fromEntries(
            fieldOrder.map((key) => [
              key,
              { hidden: key === BASE_RECORD_ID_FIELD_ID, width: key === 'title' ? 240 : key === 'note' ? 420 : 170 },
            ]),
          ),
          filter: null,
          sort: [],
          group: [],
          config: { rowHeight: 'medium', showRecordIndex: true, frozenFieldCount: 1 },
        },
      },
    }
  }
  const locations = table(
    'locations',
    'Locations',
    [
      field('title', 'Location', BaseFieldType.Text),
      field('scope', 'Setting', BaseFieldType.Text),
      field('note', 'Context', BaseFieldType.Text),
    ],
    [
      { title: 'Ferry steps', scope: 'Arrival edge', note: 'An arrival point where the next turn needs a name.' },
      { title: 'Garden loop', scope: 'Circular walk', note: 'Similar landmarks invite comparison in both directions.' },
      {
        title: 'Market arch',
        scope: 'Shared entrance',
        note: 'Arrival and exit messages compete for a short reading window.',
      },
    ],
  )
  const rows = [
    [
      'Which exit?',
      1,
      'review',
      'A first-time visitor notices two unnamed exits.',
      'Could the first turn include a landmark?',
    ],
    [
      'Return direction',
      1,
      'waiting',
      'The return route is not described by the arrival label.',
      'What wording helps on the way back?',
    ],
    [
      'Reading distance',
      1,
      'ready',
      'A paper label is easier to compare when its length is fixed.',
      'Compare a short and long label at the same size.',
    ],
    [
      'Similar landmarks',
      2,
      'review',
      'Two planted corners look similar in the draft map.',
      'Can a distinct landmark replace a color cue?',
    ],
    [
      'Color-only cue',
      2,
      'waiting',
      'A green arrow has no accompanying word in one draft.',
      'Which word or symbol makes the cue independent of color?',
    ],
    [
      'Loop direction',
      2,
      'review',
      'Clockwise and counterclockwise labels use different names.',
      'Can both directions use the same place names?',
    ],
    [
      'Competing messages',
      3,
      'ready',
      'The entry draft combines welcome, directions and event text.',
      'Which message belongs at the next decision point?',
    ],
    [
      'Inconsistent labels',
      3,
      'waiting',
      'Market gate and Market arch refer to the same sketch.',
      'Which name should appear on every paper prototype?',
    ],
  ] as const
  const observations = table(
    'observations',
    'Observations',
    [
      field('title', 'Observation', BaseFieldType.Text),
      field('location', 'Location', BaseFieldType.RecordLink, {
        targetTableId: 'locations',
        multiple: false,
        displayFieldId: 'title',
      }),
      state,
      field('note', 'Illustrative evidence', BaseFieldType.Text),
      field('next', 'Next question', BaseFieldType.Text),
    ],
    rows.map(([title, location, status, note, next]) => ({
      title,
      location: serializeRecordLinkIds(['locations-' + location]),
      state: status,
      note,
      next,
    })),
  )
  return {
    id: BASE_ID,
    name: 'Ripple / Observations and locations',
    locale: LocaleType.EN_US,
    schemaVersion: 1,
    createdAt: TIME,
    updatedAt: TIME,
    tableOrder: ['observations', 'locations'],
    tables: { observations, locations },
  }
}
const card = (
  id: string,
  value: string,
  left: number,
  top: number,
  width: number,
  height: number,
  size: number,
  ink: string,
  fill?: string,
) => {
  const e = createBoardTextBoxShapeElement({
    id,
    text: value,
    left,
    top,
    width,
    height,
    horizontalAlign: HorizontalAlign.LEFT,
    verticalAlign: VerticalAlign.MIDDLE,
    textStyle: { ff: 'Arial', fs: size, bl: BooleanNumber.TRUE, cl: { rgb: ink } },
  })
  e.shapeData.shapeText!.autoFitType = ShapeTextAutoFitType.NoAutoFit
  if (fill) {
    e.shapeData.isTextBox = false
    e.shapeData.fill = { fillType: ShapeFillEnum.SolidFill, color: fill }
  }
  return e
}
export function createHostData(): IBoardData {
  const shapes = [
    card('title', 'RIPPLE / FIND THE WAY TOGETHER', 70, 40, 1500, 80, 38, '#F5F7FF', '#101A34'),
    card('subtitle', '32 planned participants / 4 tables / 90 minutes / 21 FEB 2029', 70, 125, 1500, 45, 21, '#235A60'),
    card('sheet-label', '01 / RESOURCE BUDGET', 70, 195, 720, 40, 22, '#22365F'),
    card('doc-label', '02 / FACILITATION AGENDA', 850, 195, 720, 40, 22, '#365E5C'),
    card('base-label', '03 / OBSERVATIONS + LOCATIONS', 70, 745, 720, 40, 22, '#94653B'),
    card('slide-label', '04 / WAYFINDING REVIEW', 850, 745, 720, 40, 22, '#655185'),
    card('observe', 'OBSERVE / 15 MIN\nName the uncertainty', 90, 1280, 310, 100, 18, '#344C59', '#DDE8F0'),
    card('draft', 'DRAFT / 25 MIN\nCompare paper labels', 470, 1280, 310, 100, 18, '#344C59', '#E6E0F1'),
    card('try', 'TRY / 30 MIN\nRead with another table', 850, 1280, 310, 100, 18, '#344C59', '#F3E5C5'),
    card('revise', 'REVISE / 20 MIN\nRecord the next question', 1230, 1280, 310, 100, 18, '#344C59', '#DDEBE5'),
    card(
      'footer',
      'Original fictional workshop / Bound connectors show discussion flow, not automation or approval.',
      70,
      1460,
      1500,
      40,
      16,
      '#657F8D',
    ),
  ]
  const routes = [
    ['observe', 1, 'draft', 3],
    ['draft', 1, 'try', 3],
    ['try', 1, 'revise', 3],
    ['revise', 2, 'observe', 2],
  ] as const
  const connectors = routes.map(([a, sa, b, sb], i) =>
    createBoardConnectorElement({
      id: 'route-' + i,
      start: { kind: 'shapeSite', shapeId: a, connectionSiteId: sa },
      end: { kind: 'shapeSite', shapeId: b, connectionSiteId: sb },
      routing: 'orthogonal',
      routingMode: 'auto',
      style: { stroke: i === 3 ? '#B57549' : '#6B8B91', strokeWidth: 2, endMarker: { type: 'filledArrow' } },
    }),
  )
  const elements = [...connectors, ...shapes]
  return {
    id: HOST_ID,
    name: 'Ripple / Complete planning workshop',
    appVersion: '1.0.0-beta.2',
    defaultPageSize: { width: 1640, height: 1540 },
    pageOrder: [PAGE_ID],
    activePageId: PAGE_ID,
    pages: {
      [PAGE_ID]: {
        id: PAGE_ID,
        name: 'Planning workshop',
        pageType: BoardPageType.Page,
        elementOrder: elements.map((e) => e.id),
        elements: Object.fromEntries(elements.map((e) => [e.id, e])),
      },
    },
  }
}
