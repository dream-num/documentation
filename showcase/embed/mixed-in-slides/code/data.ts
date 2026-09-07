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

export const HOST_ID = 'beacon-repair-review'
export const SHEET_UNIT_ID = 'beacon-repair-costs'
export const SHEET_ID = 'resources'
export const DOCS_ID = 'beacon-repair-memo'
export const BASE_ID = 'beacon-repair-readiness'
export const BOARD_ID = 'beacon-repair-delivery'
const TIME = Date.parse('2028-12-06T09:00:00Z')
export const COSTS = [
  ['Hub room days', 6, 220],
  ['Repair clinics', 12, 145],
  ['Shared tool sets', 18, 48],
  ['Replacement kits', 144, 9.5],
  ['Access support sessions', 12, 55],
  ['Volunteer training hours', 16, 38],
  ['Transport legs', 6, 85],
  ['Evaluation cards', 180, 1.2],
] as const
export function createSheetData(): Partial<IWorkbookData> {
  const cellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'BEACON / Pilot cost model', s: 'title' } },
    1: { 0: { v: '3 hubs / 12 clinics / 144 planned places', s: 'muted' } },
    3: Object.fromEntries(['Resource', 'Qty', 'Rate', 'Line cost'].map((v, i) => [i, { v, s: 'header' }])),
    13: { 0: { v: 'Direct pilot costs', s: 'header' }, 3: { f: '=SUM(D5:D12)', s: 'money' } },
    14: { 0: { v: 'Reserve / 7%', s: 'header' }, 3: { f: '=ROUND(D14*7%,2)', s: 'money' } },
    15: { 0: { v: 'Pilot envelope', s: 'header' }, 3: { f: '=ROUND(D14+D15,2)', s: 'total' } },
    17: { 0: { v: 'Quantities recalculate; presentation claims stay independent.', s: 'muted' } },
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
    name: 'Beacon / Pilot costs',
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
        name: 'Pilot costs',
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
  ['BEACON / Decision memo', 'kicker'],
  ['Repair locally. Learn together.', 'title'],
  ['6 December 2028 / Draft review / Fictional neighborhood network', 'meta'],
  ['01 / A bounded trial', 'heading'],
  [
    'Three hubs each propose four clinics. Twelve places per clinic gives 144 planned places, not attendance or repairs completed. Start with shared tools and a small set of replacement kits.',
    'body',
  ],
  ['02 / What the estimate contains', 'heading'],
  [
    'Eight cost lines total USD 7,286. A seven-percent reserve adds USD 510.02, for an opening envelope of USD 7,796.02. These written figures are authored baselines; only the embedded Sheet recalculates.',
    'body',
  ],
  ['03 / Evidence before launch', 'heading'],
  [
    'The readiness register links six review gates to three hubs. Room access, tool inventory, volunteers, parts, session capacity and evaluation are separate checks. A Ready chip is a review label, not launch approval.',
    'body',
  ],
  ['04 / Decide after clinic four', 'heading'],
  [
    'Compare aggregate participation notes, consumable use and unresolved requests after the fourth clinic. The Board shows a return path to revise the remaining clinics; it does not run an automation.',
    'body',
  ],
  ['05 / Ownership in this review', 'heading'],
  [
    'The cost model floats on the economics slide. This memo, the Base and the Board open as native pages in the left page list. Their edits and histories are independent of slide text. No Formula Shape, cross-product binding or backend is claimed.',
    'body',
  ],
  ['Recommendation / Request missing evidence before scheduling.', 'heading'],
] as const
export function createDocsData(): IDocumentData {
  let offset = 0
  const paragraphs = MEMO.map(([text, kind], i) => {
    offset += text.length + 1
    const heading = kind === 'heading'
    return {
      startIndex: offset - 1,
      paragraphId: 'beacon-memo-p-' + i,
      paragraphStyle: {
        namedStyleType:
          kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        ...(heading ? { headingId: 'beacon-memo-h-' + i } : {}),
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
    title: 'Beacon / Decision memo',
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
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'beacon-memo-section' }],
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

export function createHostData(): ISlideData {
  const specs = [
    {
      id: 'cover',
      title: 'Repair locally.\nLearn together.',
      kicker: 'BEACON / EXECUTIVE REVIEW',
      bg: '#101A34',
      ink: '#F5F7FF',
      accent: '#58C8FF',
    },
    {
      id: 'scope',
      title: 'Count capacity, not outcomes.',
      kicker: '01 / PILOT SCOPE',
      bg: '#F5F0E5',
      ink: '#25394C',
      accent: '#976C28',
    },
    {
      id: 'economics',
      title: 'Make the assumptions editable.',
      kicker: '02 / COST AND RESERVE',
      bg: '#EEF3F7',
      ink: '#22365F',
      accent: '#42748D',
    },
    {
      id: 'decision',
      title: 'Review evidence. Then decide.',
      kicker: '03 / CHECKPOINT',
      bg: '#382E4E',
      ink: '#F5F0FA',
      accent: '#B6A6FF',
    },
  ]
  const pages = specs.map(({ id, title, kicker, bg, ink, accent }) => {
    const t = (
      eid: string,
      value: string,
      left: number,
      top: number,
      width: number,
      height: number,
      size: number,
      color: string,
      fill?: string,
    ) => text(id, eid, value, left, top, width, height, size, color, fill)
    const elements = [
      t('kicker', kicker, 40, 30, 880, 30, 14, accent),
      t(
        'title',
        title,
        40,
        id === 'cover' ? 135 : 80,
        id === 'cover' ? 590 : 920,
        id === 'cover' ? 155 : 55,
        id === 'cover' ? 47 : 34,
        ink,
      ),
      t(
        'footer',
        'Original fictional review / No bookings, orders or repair instructions',
        40,
        523,
        880,
        24,
        11,
        accent,
      ),
      ...(id === 'cover'
        ? [
            t(
              'intro',
              'A three-hub trial for shared tools,\nlocal learning and repair conversations.',
              40,
              330,
              585,
              92,
              24,
              '#C8D0E4',
            ),
            t('date', '6 DEC 2028 / DISCUSSION DRAFT', 40, 463, 500, 30, 13, accent),
            t('hubs', '03\nLocal hubs', 680, 140, 280, 105, 24, '#101A34', '#58C8FF'),
            t('clinics', '12\nPlanned clinics', 680, 265, 280, 105, 24, '#101A34', '#50C8B0'),
            t('places', '144\nPlanned places', 680, 390, 280, 105, 24, '#101A34', '#F2B84B'),
          ]
        : id === 'scope'
          ? [
              t(
                'north',
                'NORTH / Library annex\n4 clinics\nQuiet reading-room setting',
                40,
                175,
                290,
                185,
                18,
                ink,
                '#DDE8F0',
              ),
              t(
                'central',
                'CENTRAL / Market hall\n4 clinics\nShared neighborhood tables',
                355,
                175,
                290,
                185,
                18,
                ink,
                '#DCEBE4',
              ),
              t(
                'west',
                'WEST / Makers room\n4 clinics\nTool-led learning space',
                670,
                175,
                290,
                185,
                18,
                ink,
                '#F1DDCF',
              ),
              t(
                'note',
                '12 places per clinic is a planning assumption. Readiness is reviewed separately in the Base.',
                40,
                405,
                915,
                80,
                22,
                ink,
              ),
            ]
          : id === 'economics'
            ? [
                t(
                  'cost-note',
                  'Eight cost lines.\n7% reserve.\n\nChange kit quantity\ninside the Sheet.',
                  40,
                  180,
                  285,
                  220,
                  20,
                  ink,
                ),
                t(
                  'boundary',
                  'The Sheet recalculates.\nSlide text stays independent.',
                  40,
                  425,
                  285,
                  70,
                  15,
                  '#586A7C',
                ),
              ]
            : [
                t(
                  'evidence',
                  'BEFORE SCHEDULING\n\nClose readiness gates.\nConfirm rooms and tools.\nReview pilot costs.',
                  40,
                  178,
                  440,
                  235,
                  20,
                  '#233D49',
                  '#D7EDE6',
                ),
                t(
                  'learning',
                  'AFTER CLINIC FOUR\n\nRead aggregate notes.\nReview consumable use.\nAdjust remaining clinics.',
                  520,
                  178,
                  440,
                  235,
                  20,
                  '#533B3D',
                  '#F2DAD4',
                ),
                t(
                  'disposition',
                  'Discussion draft / Request evidence, not an automatic launch decision.',
                  40,
                  455,
                  920,
                  48,
                  19,
                  ink,
                ),
              ]),
    ]
    return {
      id,
      name: title.replace('\n', ' '),
      pageType: PageTypeEnum.Slide as const,
      background: { type: SlideBackgroundTypeEnum.Solid as const, color: bg },
      elements: Object.fromEntries(elements.map((e) => [e.id, e])),
      elementOrder: elements.map((e) => e.id),
      speakerNotes:
        'Use the native page list to inspect the memo, readiness register and delivery map. Authored claims are not data bindings.',
    }
  })
  return {
    id: HOST_ID,
    name: 'Beacon / Complete executive review',
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
  const hubs = table(
    'hubs',
    'Hubs',
    [
      field('title', 'Hub', BaseFieldType.Text),
      field('scope', 'Setting', BaseFieldType.Text),
      field('note', 'Local context', BaseFieldType.Text),
    ],
    [
      {
        title: 'North / Library annex',
        scope: 'Quiet room',
        note: 'Four clinics proposed; protect the reading-room boundary.',
      },
      {
        title: 'Central / Market hall',
        scope: 'Shared tables',
        note: 'Four clinics proposed; confirm table access and storage.',
      },
      {
        title: 'West / Makers room',
        scope: 'Tool workspace',
        note: 'Four clinics proposed; review tool inventory separately.',
      },
    ],
  )
  const gates = table(
    'gates',
    'Readiness',
    [
      field('title', 'Review gate', BaseFieldType.Text),
      field('hub', 'Hub', BaseFieldType.RecordLink, {
        targetTableId: 'hubs',
        multiple: false,
        displayFieldId: 'title',
      }),
      state,
      field('note', 'Next evidence', BaseFieldType.Text),
    ],
    [
      {
        title: 'Room access',
        hub: serializeRecordLinkIds(['hubs-1']),
        state: 'review',
        note: 'Check entrances and the quiet-room boundary.',
      },
      {
        title: 'Tool inventory',
        hub: serializeRecordLinkIds(['hubs-3']),
        state: 'waiting',
        note: 'Count eighteen shared tool sets before scheduling.',
      },
      {
        title: 'Volunteer briefing',
        hub: serializeRecordLinkIds(['hubs-2']),
        state: 'review',
        note: 'Sixteen training hours are budgeted, not delivered.',
      },
      {
        title: 'Replacement kits',
        hub: serializeRecordLinkIds(['hubs-3']),
        state: 'waiting',
        note: 'Opening assumption is 144 kits; no purchase is placed.',
      },
      {
        title: 'Session capacity',
        hub: serializeRecordLinkIds(['hubs-1']),
        state: 'ready',
        note: 'Twelve places per clinic is a provisional capacity, not attendance.',
      },
      {
        title: 'Evaluation notes',
        hub: serializeRecordLinkIds(['hubs-2']),
        state: 'review',
        note: 'Use aggregate observations only; no participant data.',
      },
    ],
  )
  return {
    id: BASE_ID,
    name: 'Beacon / Readiness and hubs',
    locale: LocaleType.EN_US,
    schemaVersion: 1,
    createdAt: TIME,
    updatedAt: TIME,
    tableOrder: ['gates', 'hubs'],
    tables: { gates, hubs },
  }
}

export function createBoardData(): IBoardData {
  const nodes = [
    ['scope', 'Frame the trial\nNia / Draft', 40, 100, '#DDE8F0'],
    ['rooms', 'Confirm hub rooms\nOwen / In review', 330, 100, '#E6E0F1'],
    ['kits', 'Count tools and kits\nSana / Waiting', 620, 100, '#F3E5C5'],
    ['brief', 'Brief volunteers\nJules / Planned', 910, 100, '#DDEBE5'],
    ['run', 'Run first four clinics\nHub teams / Planned', 910, 320, '#DDEBE5'],
    ['review', 'Review observations\nNia / Planned', 620, 320, '#E6E0F1'],
    ['adjust', 'Adjust remaining clinics\nAll hubs / Undecided', 330, 320, '#F2DAD4'],
  ] as const
  const shapes = nodes.map(([id, text, left, top, color]) => {
    const e = createBoardTextBoxShapeElement({
      id,
      text,
      left,
      top,
      width: 230,
      height: 108,
      horizontalAlign: HorizontalAlign.CENTER,
      verticalAlign: VerticalAlign.MIDDLE,
      textStyle: { fs: 15, bl: BooleanNumber.TRUE, cl: { rgb: '#344C59' } },
    })
    e.shapeData.shapeType = ShapeTypeEnum.RoundRect
    e.shapeData.isTextBox = false
    e.shapeData.fill = { fillType: ShapeFillEnum.SolidFill, color }
    e.shapeData.shapeText!.autoFitType = ShapeTextAutoFitType.NoAutoFit
    return e
  })
  const routes = [
    ['scope', 1, 'rooms', 3],
    ['rooms', 1, 'kits', 3],
    ['kits', 1, 'brief', 3],
    ['brief', 2, 'run', 0],
    ['run', 3, 'review', 1],
    ['review', 3, 'adjust', 1],
    ['adjust', 0, 'rooms', 2],
    ['review', 0, 'kits', 2],
  ] as const
  const connectors = routes.map(([a, sa, b, sb], i) =>
    createBoardConnectorElement({
      id: 'route-' + i,
      start: { kind: 'shapeSite', shapeId: a, connectionSiteId: sa },
      end: { kind: 'shapeSite', shapeId: b, connectionSiteId: sb },
      routing: 'orthogonal',
      routingMode: 'auto',
      style: { stroke: i >= 6 ? '#B57549' : '#6B8B91', strokeWidth: 2, endMarker: { type: 'filledArrow' } },
    }),
  )
  const title = createBoardTextBoxShapeElement({
    id: 'title',
    text: 'BEACON / Prepare, run, review.',
    left: 40,
    top: 22,
    width: 1100,
    height: 45,
    textStyle: { fs: 25, bl: BooleanNumber.TRUE, cl: { rgb: '#235A60' } },
  })
  const footer = createBoardTextBoxShapeElement({
    id: 'footer',
    text: 'Native bound connectors show hand-offs, not scheduling or task automation.',
    left: 40,
    top: 510,
    width: 1100,
    height: 35,
    textStyle: { fs: 12, cl: { rgb: '#6E7D86' } },
  })
  const elements = [...connectors, ...shapes, title, footer]
  return {
    id: BOARD_ID,
    name: 'Beacon / Delivery map',
    appVersion: '1.0.0-beta.2',
    defaultPageSize: { width: 1180, height: 590 },
    pageOrder: ['workflow'],
    activePageId: 'workflow',
    pages: {
      workflow: {
        id: 'workflow',
        name: 'Delivery map',
        pageType: BoardPageType.Page,
        elementOrder: elements.map((e) => e.id),
        elements: Object.fromEntries(elements.map((e) => [e.id, e])),
      },
    },
  }
}
