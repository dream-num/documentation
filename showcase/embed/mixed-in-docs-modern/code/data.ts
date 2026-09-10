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

export const HOST_ID = 'northstar-seed-project'
export const SHEET_UNIT_ID = 'northstar-seed-budget'
export const SHEET_ID = 'resources'
export const BASE_ID = 'northstar-seed-readiness'
export const SLIDES_ID = 'northstar-seed-strategy'
export const BOARD_ID = 'northstar-seed-dependencies'
export const BLOCK_MARKERS = [
  '03 / People and readiness',
  '04 / Strategy in three views',
  '05 / Dependencies and review',
  '06 / Decisions still open',
] as const
const TIME = Date.parse('2028-10-04T09:00:00Z')
export const COSTS = [
  ['Display stations', 6, 160],
  ['Starter packs', 72, 12],
  ['Orientation sessions', 6, 95],
  ['Large-print guides', 90, 2.4],
  ['Reusable labels', 120, 1.5],
  ['Local delivery runs', 3, 85],
  ['Community room evenings', 2, 140],
  ['Feedback materials', 1, 110],
] as const
export function createSheetData(): Partial<IWorkbookData> {
  const cellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'NORTHSTAR / Resource plan', s: 'title' } },
    1: { 0: { v: 'Six stations / 72 starter packs / USD planning estimates', s: 'muted' } },
    3: Object.fromEntries(['Resource', 'Qty', 'Rate', 'Line cost'].map((v, i) => [i, { v, s: 'header' }])),
    13: { 0: { v: 'Direct resources', s: 'header' }, 3: { f: '=SUM(D5:D12)', s: 'money' } },
    14: { 0: { v: 'Reserve / 12%', s: 'header' }, 3: { f: '=ROUND(D14*12%,2)', s: 'money' } },
    15: { 0: { v: 'Planned envelope', s: 'header' }, 3: { f: '=ROUND(D14+D15,2)', s: 'total' } },
    17: { 0: { v: 'The reserve is a planning allowance, not permission to spend.', s: 'muted' } },
    19: { 0: { v: 'Authored estimates / No purchases or inventory service', s: 'muted' } },
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
    name: 'Northstar / Resource plan',
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-rc.0',
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 22, bl: 1, cl: { rgb: '#3A5B47' } },
      muted: { fs: 11, cl: { rgb: '#728173' } },
      header: { bg: { rgb: '#E2EBDC' }, bl: 1, cl: { rgb: '#3A5B47' } },
      body: { cl: { rgb: '#425247' } },
      stripe: { bg: { rgb: '#F5F8F0' } },
      money: { n: { pattern: '#,##0.00' } },
      input: { bg: { rgb: '#FFF0D7' }, n: { pattern: '#,##0' } },
      total: { bg: { rgb: '#DDEBDE' }, bl: 1, n: { pattern: '#,##0.00' }, cl: { rgb: '#3A674C' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Resource plan',
        rowCount: 22,
        columnCount: 6,
        defaultRowHeight: 28,
        defaultColumnWidth: 100,
        columnData: { 0: { w: 260 }, 1: { w: 85 }, 2: { w: 105 }, 3: { w: 130 } },
        cellData,
        rowData: { 0: { h: 38 } },
        mergeData: [0, 1, 17, 19].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 5 })),
      },
    },
  }
}
const MEMO = [
  ['NORTHSTAR / Neighborhood seed library', 'kicker'],
  ['Start small. Share what we learn.', 'title'],
  ['Project brief / 4 October 2028 / Fictional six-week pilot', 'meta'],
  ['01 / A shared starting point', 'heading'],
  [
    'Six neighborhood stations will trial a small seed-library service with 72 illustrative starter packs and six orientation sessions. This project brief keeps the resource model, people, strategy and dependencies in one readable narrative. It does not offer planting advice, make suitability claims or distribute real seeds.',
    'body',
  ],
  ['02 / Resource assumptions', 'heading'],
  [
    'The live Sheet below separates eight cost lines and a twelve-percent reserve. The opening envelope is USD 3,847.20. Expand it to revise station quantities or unit rates. Its calculations do not rewrite this sentence or the strategy slides.',
    'body',
  ],
  ['', 'body'],
  [BLOCK_MARKERS[0], 'heading'],
  [
    'The Base owns six workstreams and four linked coordinators. Review state describes the fictional planning conversation: it does not approve a location, contact a resident or dispatch materials. Expand the register to inspect the Owners table and edit a handover note.',
    'body',
  ],
  ['', 'body'],
  [BLOCK_MARKERS[1], 'heading'],
  [
    'Three editable slides explain the experiment, the different roles of stations, packs and sessions, and the week-three review. They are a presentation of the plan, not formula-driven totals. Use the native page controls rather than leaving the brief.',
    'body',
  ],
  ['', 'body'],
  [BLOCK_MARKERS[2], 'heading'],
  [
    'The Board makes hand-offs explicit: scope, hosts, materials, orientation, review and revision. The return path sends the planning discussion back to hosts; it does not run an automated workflow. Drag a card in the expanded Board to inspect native connection behavior.',
    'body',
  ],
  ['', 'body'],
  [BLOCK_MARKERS[3], 'heading'],
  [
    'Before any real launch, check local requirements, source material permissions, storage conditions and access needs separately. No suitability, germination or distribution claim follows from these sample cards or numbers.',
    'body',
  ],
  ['07 / Read the five models honestly', 'heading'],
  [
    'Only the Sheet recalculates its own formulas. Owner links resolve within the Base. The document, slide copy and Board labels stay independent. Editing the title moves all four native body anchors without rewriting their children. Reload discards local edits and recreates the original story.',
    'body',
  ],
  ['Decision / Draft for discussion, not a launch approval.', 'heading'],
] as const
export function createHostData(): IDocumentData {
  let offset = 0
  const paragraphs = MEMO.map(([text, kind], i) => {
    offset += text.length + 1
    const heading = kind === 'heading'
    return {
      startIndex: offset - 1,
      paragraphId: 'northstar-seed-p-' + i,
      paragraphStyle: {
        namedStyleType:
          kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        ...(heading ? { headingId: 'northstar-seed-heading-' + i } : {}),
        spaceAbove: { v: heading ? 14 : 0 },
        spaceBelow: { v: 8 },
        lineSpacing: 1.2,
        textStyle: {
          ff: 'Arial',
          fs: kind === 'title' ? 30 : heading ? 16 : kind === 'meta' ? 10 : 13,
          bl: heading || kind === 'title' ? BooleanNumber.TRUE : BooleanNumber.FALSE,
          cl: { rgb: heading || kind === 'title' ? '#38634F' : '#42574D' },
        },
      },
    }
  })
  const dataStream = MEMO.map(([text]) => text).join('\r') + '\r\n'
  return {
    id: HOST_ID,
    title: 'Northstar / Complete project brief',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 1060, height: 1000 },
      marginTop: 36,
      marginBottom: 36,
      marginLeft: 52,
      marginRight: 52,
    },
    drawings: {},
    drawingsOrder: [],
    body: {
      dataStream,
      paragraphs,
      textRuns: [],
      customBlocks: [],
      customRanges: [],
      customDecorations: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'northstar-seed-section' }],
    },
  }
}

export function createSlidesData(): ISlideData {
  const specs = [
    {
      id: 'purpose',
      title: 'A library of beginnings.',
      kicker: 'NORTHSTAR / THE EXPERIMENT',
      body: 'Six stations. A six-week conversation.\nLearn what people need before expanding.',
      bg: '#163A30',
      ink: '#F4F8EA',
      accent: '#D6E69C',
    },
    {
      id: 'roles',
      title: 'Three different commitments.',
      kicker: 'THE PLAN / NOT A FORECAST',
      body: 'Stations provide a place. Packs provide a starting point.\nSessions provide time for questions.',
      bg: '#FAF5E8',
      ink: '#4D513E',
      accent: '#9C773E',
    },
    {
      id: 'review',
      title: 'Pause at week three.',
      kicker: 'REVIEW / KEEP THE NEXT STEP OPEN',
      body: 'Read handover notes and unused-material counts.\nAdjust scope before repeating the experiment.',
      bg: '#EDE8F3',
      ink: '#514765',
      accent: '#786593',
    },
  ]
  const pages = specs.map(({ id, title, kicker, body, bg, ink, accent }) => {
    const text = (
      eid: string,
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
        .span(value, { fontSize: size, color, bold: eid === 'title' || Boolean(fill) })
        .getData()
      doc.id = id + '-' + eid
      doc.documentStyle = { ...doc.documentStyle, textStyle: { ff: 'Arial' } }
      doc.body?.paragraphs?.forEach((p, n) => {
        p.paragraphId = doc.id + '-p-' + n
      })
      doc.body?.sectionBreaks?.forEach((s, n) => {
        s.sectionId = doc.id + '-s-' + n
      })
      return {
        id: eid,
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
    const elements = [
      text('kicker', kicker, 36, 25, 720, 35, 14, accent),
      text('title', title, 36, 86, 720, 75, 32, ink),
      ...(id === 'roles'
        ? [
            text('stations', '06\nStations', 36, 182, 225, 110, 25, ink, '#E4EBDC'),
            text('packs', '72\nStarter packs', 282, 182, 225, 110, 25, ink, '#F1E4C9'),
            text('sessions', '06\nOrientations', 528, 182, 225, 110, 25, ink, '#E6E1EE'),
          ]
        : []),
      text('body', body, 36, id === 'roles' ? 315 : 230, 720, 95, id === 'roles' ? 17 : 22, ink),
      text('footer', 'Original fictional pilot / No live distribution', 36, 412, 475, 25, 10, accent),
    ]
    return {
      id,
      name: title,
      pageType: PageTypeEnum.Slide as const,
      background: { type: SlideBackgroundTypeEnum.Solid as const, color: bg },
      elements: Object.fromEntries(elements.map((e) => [e.id, e])),
      elementOrder: elements.map((e) => e.id),
      speakerNotes: 'Authored strategy, not Formula Shapes. Numbers are a discussion baseline.',
    }
  })
  return {
    id: SLIDES_ID,
    name: 'Northstar / Pilot strategy',
    appVersion: '1.0.0-rc.0',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 800, height: 450 },
    slides: Object.fromEntries(pages.map((p) => [p.id, p])),
    slideOrder: pages.map((p) => p.id),
    activeSlideId: 'purpose',
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
  const owners = table(
    'owners',
    'Owners',
    [
      field('title', 'Coordinator', BaseFieldType.Text),
      field('scope', 'Focus', BaseFieldType.Text),
      field('note', 'Handover note', BaseFieldType.Text),
    ],
    [
      {
        title: 'Amira Chen',
        scope: 'Community hosts',
        note: 'Discuss station responsibilities before inviting participants.',
      },
      { title: 'Noel Park', scope: 'Materials', note: 'Keep pack descriptions separate from planting guidance.' },
      {
        title: 'Priya Shah',
        scope: 'Learning review',
        note: 'Review aggregate notes; do not collect private participant data.',
      },
      {
        title: 'Eli Navarro',
        scope: 'Access and sessions',
        note: 'Confirm readable labels and a quiet question space.',
      },
    ],
  )
  const workstreams = table(
    'workstreams',
    'Workstreams',
    [
      field('title', 'Workstream', BaseFieldType.Text),
      field('owner', 'Coordinator', BaseFieldType.RecordLink, {
        targetTableId: 'owners',
        multiple: false,
        displayFieldId: 'title',
      }),
      state,
      field('note', 'Next evidence', BaseFieldType.Text),
    ],
    [
      {
        title: 'Station host agreements',
        owner: serializeRecordLinkIds(['owners-1']),
        state: 'review',
        note: 'Six draft host conversations; none are signed agreements.',
      },
      {
        title: 'Starter pack descriptions',
        owner: serializeRecordLinkIds(['owners-2']),
        state: 'waiting',
        note: 'Check the wording for 72 illustrative packs.',
      },
      {
        title: 'Large-print labels',
        owner: serializeRecordLinkIds(['owners-4']),
        state: 'review',
        note: 'Review contrast and label placement at each station.',
      },
      {
        title: 'Orientation format',
        owner: serializeRecordLinkIds(['owners-4']),
        state: 'ready',
        note: 'Six session outlines drafted; no invitations sent.',
      },
      {
        title: 'Week-three review',
        owner: serializeRecordLinkIds(['owners-3']),
        state: 'waiting',
        note: 'Agree aggregate questions before the first session.',
      },
      {
        title: 'Unused-material handover',
        owner: serializeRecordLinkIds(['owners-2']),
        state: 'review',
        note: 'Record who checks remaining materials after the pilot.',
      },
    ],
  )
  return {
    id: BASE_ID,
    name: 'Northstar / People and readiness',
    locale: LocaleType.EN_US,
    schemaVersion: 1,
    createdAt: TIME,
    updatedAt: TIME,
    tableOrder: ['workstreams', 'owners'],
    tables: { workstreams, owners },
  }
}

export function createBoardData(): IBoardData {
  const nodes = [
    ['brief', 'Frame the scope\nAmira / Draft', 40, 100, '#DEE8D7'],
    ['source', 'Confirm hosts\nAmira / In review', 320, 100, '#E2EBE7'],
    ['prepare', 'Describe materials\nNoel / Waiting', 600, 100, '#EFE0B9'],
    ['review', 'Week-three review\nPriya / Planned', 320, 300, '#DFE6F0'],
    ['deliver', 'Host orientations\nEli / Planned', 600, 300, '#DFE6F0'],
    ['adjust', 'Revise the scope\nTeam / Not decided', 40, 300, '#EADDEB'],
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
    text: 'NORTHSTAR / Scope, hand over, review.',
    left: 40,
    top: 22,
    width: 800,
    height: 45,
    textStyle: { fs: 25, bl: BooleanNumber.TRUE, cl: { rgb: '#235A60' } },
  })
  const footer = createBoardTextBoxShapeElement({
    id: 'footer',
    text: 'Planning dependencies, not a distribution service. Review labels stay independent.',
    left: 40,
    top: 485,
    width: 790,
    height: 35,
    textStyle: { fs: 12, cl: { rgb: '#6E7D86' } },
  })
  const elements = [...connectors, ...shapes, title, footer]
  return {
    id: BOARD_ID,
    name: 'Northstar / Dependency review',
    appVersion: '1.0.0-rc.0',
    defaultPageSize: { width: 880, height: 550 },
    pageOrder: ['workflow'],
    activePageId: 'workflow',
    pages: {
      workflow: {
        id: 'workflow',
        name: 'Dependency review',
        pageType: BoardPageType.Page,
        elementOrder: elements.map((e) => e.id),
        elements: Object.fromEntries(elements.map((e) => [e.id, e])),
      },
    },
  }
}
