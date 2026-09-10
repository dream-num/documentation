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

export const HOST_ID = 'harbor-room-budget'
export const SHEET_ID = 'budget'
export const SLIDES_ID = 'harbor-room-briefing'
export const DOCS_ID = 'harbor-room-rationale'
export const BASE_ID = 'harbor-room-suppliers'
export const BOARD_ID = 'harbor-room-workflow'
const TIME = Date.parse('2028-09-16T09:00:00Z')
export const COSTS = [
  ['Venue weekends', 4, 450],
  ['Facilitator sessions', 8, 180],
  ['Reading kits', 96, 18],
  ['Access support sessions', 8, 65],
  ['Reusable signs', 1, 240],
  ['Delivery runs', 4, 95],
  ['Printed guides', 120, 2.5],
  ['Evaluation materials', 1, 220],
] as const

export function createHostData(): Partial<IWorkbookData> {
  const cellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'HARBOR / Reading room pilot', s: 'title' } },
    1: { 0: { v: '4 weekends / 8 sessions / 96 planned places / September 2028', s: 'muted' } },
    3: Object.fromEntries(['Commitment', 'Qty', 'Rate', 'USD'].map((v, i) => [i, { v, s: 'header' }])),
    13: { 0: { v: 'Direct cost', s: 'header' }, 3: { f: '=SUM(D5:D12)', s: 'money' } },
    14: { 0: { v: 'Reserve / 10%', s: 'header' }, 3: { f: '=ROUND(D14*10%,2)', s: 'money' } },
    15: { 0: { v: 'Pilot envelope', s: 'header' }, 3: { f: '=D14+D15', s: 'total' } },
    16: { 0: { v: 'Planning ceiling' }, 3: { v: 8000, t: CellValueType.NUMBER, s: 'input' } },
    17: { 0: { v: 'Headroom', s: 'header' }, 3: { f: '=ROUND(D17-D16,2)', s: 'total' } },
    20: { 0: { v: 'Read the decision, then inspect the evidence.', s: 'section' } },
    22: { 0: { v: 'Supplier operations: six suppliers and six linked follow-ups.', s: 'muted' } },
    23: { 0: { v: 'Decision memo: scope, trade-offs and what is not approved.', s: 'muted' } },
    24: { 0: { v: 'Delivery workflow: editable hand-offs and a return path.', s: 'muted' } },
    26: { 0: { v: 'Fictional planning data. No orders, bookings or external services.', s: 'muted' } },
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
    id: HOST_ID,
    name: 'Harbor / Operations decision room',
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-rc.0',
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 23, bl: 1, cl: { rgb: '#152642' } },
      section: { fs: 16, bl: 1, cl: { rgb: '#235B60' } },
      header: { bg: { rgb: '#E6EDF5' }, bl: 1, cl: { rgb: '#223B55' } },
      body: { cl: { rgb: '#37495C' } },
      stripe: { bg: { rgb: '#F5F7FA' } },
      muted: { fs: 11, cl: { rgb: '#6E7A87' } },
      money: { n: { pattern: '#,##0.00' }, cl: { rgb: '#37495C' } },
      input: { bg: { rgb: '#FFF0D9' }, n: { pattern: '#,##0' }, cl: { rgb: '#8A5E24' } },
      total: { bg: { rgb: '#DCEEE8' }, bl: 1, n: { pattern: '#,##0.00' }, cl: { rgb: '#246451' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Pilot budget',
        rowCount: 40,
        columnCount: 18,
        defaultRowHeight: 28,
        defaultColumnWidth: 90,
        columnData: { 0: { w: 235 }, 1: { w: 65 }, 2: { w: 90 }, 3: { w: 110 } },
        cellData,
        rowData: { 0: { h: 42 } },
        mergeData: [0, 1, 20, 22, 23, 24, 26].map((row) => ({
          startRow: row,
          endRow: row,
          startColumn: 0,
          endColumn: 13,
        })),
      },
    },
  }
}

const MEMO = [
  ['HARBOR / Decision memo', 'kicker'],
  ['A small pilot. Room to learn.', 'title'],
  ['16 September 2028 / Draft for discussion / Original fictional scenario', 'meta'],
  ['01 / The proposal', 'heading'],
  [
    'Run two reading sessions on each of four weekends. Twelve planned places per session gives 96 places, not confirmed attendance. Use a temporary room before making a longer venue commitment.',
    'body',
  ],
  ['02 / The cost boundary', 'heading'],
  [
    'The opening budget has USD 6,628 direct cost and a ten-percent reserve, for USD 7,290.80. The USD 8,000 ceiling leaves USD 709.20 headroom. These written figures are an authored baseline, not live formula ranges.',
    'body',
  ],
  ['03 / What the supplier table owns', 'heading'],
  [
    'Supplier operations records six counterparties and one follow-up for each. The print proof is in review, the kit count needs confirmation and delivery windows remain open. A Ready chip is an illustrative review label, not purchase authorization.',
    'body',
  ],
  ['04 / Why Float and Tab differ', 'heading'],
  [
    'The three-page briefing stays beside the budget as a floating decision summary. The memo, supplier register and delivery workflow use separate native tabs because they need room for reading and editing. All four children belong to this one workbook owner.',
    'body',
  ],
  ['05 / Review before expanding', 'heading'],
  [
    'After the second weekend, compare attendance notes, access requests and unspent materials. Decide whether to adjust the next two weekends. This sample does not collect participant information or send reminders.',
    'body',
  ],
  ['06 / Change the right source', 'heading'],
  [
    'Budget quantities recalculate the workbook. Editing a supplier note changes the Base only. Moving a workflow card changes the Board. Briefing text and this memo remain independent; no cross-product formula binding is claimed.',
    'body',
  ],
  ['Disposition / Discussion draft, not a booking or order.', 'heading'],
] as const
export function createDocsData(): IDocumentData {
  let offset = 0
  const paragraphs = MEMO.map(([text, kind], i) => {
    offset += text.length + 1
    const heading = kind === 'heading'
    return {
      startIndex: offset - 1,
      paragraphId: 'harbor-room-p-' + i,
      paragraphStyle: {
        namedStyleType:
          kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        ...(heading ? { headingId: 'harbor-room-heading-' + i } : {}),
        spaceAbove: { v: heading ? 14 : 0 },
        spaceBelow: { v: 8 },
        lineSpacing: 1.2,
        textStyle: {
          ff: 'Arial',
          fs: kind === 'title' ? 28 : heading ? 16 : kind === 'meta' ? 10 : 13,
          bl: heading || kind === 'title' ? BooleanNumber.TRUE : BooleanNumber.FALSE,
          cl: { rgb: heading || kind === 'title' ? '#584875' : '#4F4A59' },
        },
      },
    }
  })
  const dataStream = MEMO.map(([text]) => text).join('\r') + '\r\n'
  return {
    id: DOCS_ID,
    title: 'Harbor / Decision memo',
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
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'harbor-room-section' }],
    },
  }
}

export function createSlidesData(): ISlideData {
  const specs = [
    [
      'decision',
      'A room to read.\nA pilot to learn.',
      'HARBOR / OPERATIONS DECISION',
      '4 weekends. 8 sessions. 96 planned places.\nKeep the commitment small and the review visible.',
      '#101A34',
      '#F5F7FF',
      '#58C8FF',
    ],
    [
      'allocation',
      'Protect the reserve.',
      'BUDGET / OPENING BASELINE',
      'USD 6,628 direct cost + USD 662.80 reserve.\nThe workbook calculates; this briefing explains.',
      '#F9F5EB',
      '#344238',
      '#A67532',
    ],
    [
      'checkpoint',
      'Review before expanding.',
      'WEEKEND TWO / CHECKPOINT',
      'Read attendance notes, access requests and leftovers.\nKeep the remaining weekends open to adjustment.',
      '#EAF4EF',
      '#235A4B',
      '#477C66',
    ],
  ]
  const pages = specs.map(([id, title, kicker, body, bg, ink, accent]) => {
    const elements = [
      [kicker, 36, 28, 720, 35, 14, accent],
      [title, 36, 94, 720, 130, 34, ink],
      [body, 36, 280, 720, 95, 20, ink],
      ['Fictional draft / No bookings or purchases', 36, 410, 480, 24, 11, accent],
    ].map(([text, left, top, width, height, size, color], i) => {
      const doc = RichTextBuilder.create()
        .span(String(text), { fontSize: Number(size), color: String(color), bold: i === 1 })
        .getData()
      doc.id = id + '-text-' + i
      doc.documentStyle = { ...doc.documentStyle, textStyle: { ff: 'Arial' } }
      doc.body?.paragraphs?.forEach((p, n) => {
        p.paragraphId = doc.id + '-p-' + n
      })
      doc.body?.sectionBreaks?.forEach((s, n) => {
        s.sectionId = doc.id + '-s-' + n
      })
      return {
        id: id + '-' + i,
        type: PageElementTypeEnum.Shape as const,
        transform: { left: Number(left), top: Number(top), width: Number(width), height: Number(height), rotation: 0 },
        shapeData: {
          shapeType: ShapeTypeEnum.Rect,
          fill: { fillType: ShapeFillEnum.NoFill },
          stroke: { color: 'transparent', width: 0 },
          shapeText: { dataModel: { doc } },
        },
      }
    })
    return {
      id,
      name: title.replace('\n', ' '),
      pageType: PageTypeEnum.Slide as const,
      background: { type: SlideBackgroundTypeEnum.Solid as const, color: bg },
      elements: Object.fromEntries(elements.map((e) => [e.id, e])),
      elementOrder: elements.map((e) => e.id),
      speakerNotes: 'Authored baseline, not Formula Shape output. Change text deliberately after revising the budget.',
    }
  })
  return {
    id: SLIDES_ID,
    name: 'Harbor / Pilot briefing',
    appVersion: '1.0.0-rc.0',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 800, height: 450 },
    slides: Object.fromEntries(pages.map((p) => [p.id, p])),
    slideOrder: pages.map((p) => p.id),
    activeSlideId: 'decision',
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
  const suppliers = table(
    'suppliers',
    'Suppliers',
    [
      field('title', 'Supplier', BaseFieldType.Text),
      field('scope', 'Scope', BaseFieldType.Text),
      state,
      field('note', 'Review note', BaseFieldType.Text),
    ],
    [
      {
        title: 'Quay Rooms',
        scope: 'Venue',
        state: 'ready',
        note: 'Four weekends held provisionally; no booking sent.',
      },
      {
        title: 'Lantern Learning',
        scope: 'Facilitators',
        state: 'review',
        note: 'Confirm the two-session schedule for each weekend.',
      },
      {
        title: 'Page & Parcel',
        scope: 'Reading kits',
        state: 'waiting',
        note: 'Check 96 kit contents before accepting the quote.',
      },
      {
        title: 'Open Door Support',
        scope: 'Access support',
        state: 'review',
        note: 'Discuss quiet-room and large-print requests.',
      },
      {
        title: 'Tern Printworks',
        scope: 'Guides and signs',
        state: 'review',
        note: 'Proof the 120 guides separately from reusable signs.',
      },
      {
        title: 'Estuary Couriers',
        scope: 'Delivery',
        state: 'waiting',
        note: 'Agree four drop-off windows; no dispatch scheduled.',
      },
    ],
  )
  const tasks = [
    'Confirm provisional hold',
    'Review session plan',
    'Count kit contents',
    'Review access requests',
    'Approve guide proof',
    'Agree delivery windows',
  ]
  const followups = table(
    'followups',
    'Follow-ups',
    [
      field('title', 'Follow-up', BaseFieldType.Text),
      field('supplier', 'Supplier', BaseFieldType.RecordLink, {
        targetTableId: 'suppliers',
        multiple: false,
        displayFieldId: 'title',
      }),
      field('owner', 'Owner', BaseFieldType.Text),
      state,
    ],
    tasks.map((title, i) => ({
      title,
      supplier: serializeRecordLinkIds(['suppliers-' + (i + 1)]),
      owner: ['Leah', 'Jon', 'Maya', 'Ravi', 'Maya', 'Jon'][i],
      state: i === 0 ? 'ready' : i === 2 || i === 5 ? 'waiting' : 'review',
    })),
  )
  return {
    id: BASE_ID,
    name: 'Harbor / Supplier operations',
    locale: LocaleType.EN_US,
    schemaVersion: 1,
    createdAt: TIME,
    updatedAt: TIME,
    tableOrder: ['suppliers', 'followups'],
    tables: { suppliers, followups },
  }
}

export function createBoardData(): IBoardData {
  const nodes = [
    ['brief', 'Frame the pilot\nLeah / Draft', 40, 100, '#DDEBF5'],
    ['source', 'Confirm suppliers\nJon / In review', 320, 100, '#E9E2F4'],
    ['prepare', 'Prepare materials\nMaya / Waiting', 600, 100, '#F7E9CA'],
    ['review', 'Weekend two review\nLeah / Planned', 320, 300, '#DDEEE7'],
    ['deliver', 'Run sessions\nRavi / Planned', 600, 300, '#DDEEE7'],
    ['adjust', 'Adjust the remainder\nTeam / Not decided', 40, 300, '#F3DDD8'],
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
      textStyle: { fs: 16, bl: BooleanNumber.TRUE, cl: { rgb: '#344C59' } },
    })
    e.shapeData.shapeType = ShapeTypeEnum.RoundRect
    e.shapeData.isTextBox = false
    e.shapeData.fill = { fillType: ShapeFillEnum.SolidFill, color }
    e.shapeData.shapeText!.autoFitType = ShapeTextAutoFitType.NoAutoFit
    return e
  })
  const routes = [
    ['brief', 1, 'source', 3],
    ['source', 1, 'prepare', 3],
    ['prepare', 2, 'deliver', 0],
    ['deliver', 3, 'review', 1],
    ['review', 3, 'adjust', 1],
    ['adjust', 0, 'source', 2],
  ] as const
  const connectors = routes.map(([a, sa, b, sb], i) =>
    createBoardConnectorElement({
      id: 'route-' + i,
      start: { kind: 'shapeSite', shapeId: a, connectionSiteId: sa },
      end: { kind: 'shapeSite', shapeId: b, connectionSiteId: sb },
      routing: 'orthogonal',
      routingMode: 'auto',
      style: { stroke: i === 5 ? '#B57549' : '#6B8B91', strokeWidth: 2, endMarker: { type: 'filledArrow' } },
    }),
  )
  const title = createBoardTextBoxShapeElement({
    id: 'title',
    text: 'HARBOR / Prepare, deliver, learn.',
    left: 40,
    top: 22,
    width: 800,
    height: 45,
    textStyle: { fs: 25, bl: BooleanNumber.TRUE, cl: { rgb: '#235A60' } },
  })
  const footer = createBoardTextBoxShapeElement({
    id: 'footer',
    text: 'Authored hand-offs, not task automation. Statuses stay independent of the Base.',
    left: 40,
    top: 485,
    width: 790,
    height: 35,
    textStyle: { fs: 12, cl: { rgb: '#6E7D86' } },
  })
  const elements = [...connectors, ...shapes, title, footer]
  return {
    id: BOARD_ID,
    name: 'Harbor / Delivery workflow',
    appVersion: '1.0.0-rc.0',
    defaultPageSize: { width: 880, height: 550 },
    pageOrder: ['workflow'],
    activePageId: 'workflow',
    pages: {
      workflow: {
        id: 'workflow',
        name: 'Delivery workflow',
        pageType: BoardPageType.Page,
        elementOrder: elements.map((e) => e.id),
        elements: Object.fromEntries(elements.map((e) => [e.id, e])),
      },
    },
  }
}
