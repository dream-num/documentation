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

export const HOST_ID = 'estuary-exhibition-project'
export const SHEET_UNIT_ID = 'estuary-exhibition-budget'
export const SHEET_ID = 'resources'
export const BASE_ID = 'estuary-exhibition-readiness'
export const SLIDES_ID = 'estuary-exhibition-strategy'
export const BOARD_ID = 'estuary-exhibition-dependencies'
export const BLOCK_MARKERS = [
  '03 / Evidence and custodians',
  '04 / Hearing presentation',
  '05 / Review and release process',
  '06 / Disposition',
] as const
const TIME = Date.parse('2028-11-08T09:00:00Z')
export const COSTS = [
  ['Listening stations', 3, 780],
  ['Transcript reviews', 24, 42],
  ['Caption panels', 18, 32],
  ['Exhibition design days', 4, 260],
  ['Access walkthroughs', 3, 150],
  ['Printed visitor guides', 120, 3],
  ['Reusable transport crates', 4, 70],
  ['Permission review sessions', 6, 30],
] as const
export function createSheetData(): Partial<IWorkbookData> {
  const cellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'ESTUARY / Grant costs', s: 'title' } },
    1: { 0: { v: 'Three exhibition rooms / 24 excerpts / USD estimates', s: 'muted' } },
    3: Object.fromEntries(['Resource', 'Qty', 'Rate', 'Line cost'].map((v, i) => [i, { v, s: 'header' }])),
    13: { 0: { v: 'Direct exhibition costs', s: 'header' }, 3: { f: '=SUM(D5:D12)', s: 'money' } },
    14: { 0: { v: 'Contingency / 8%', s: 'header' }, 3: { f: '=ROUND(D14*8%,2)', s: 'money' } },
    15: { 0: { v: 'Requested envelope', s: 'header' }, 3: { f: '=ROUND(D14+D15,2)', s: 'total' } },
    17: { 0: { v: 'Contingency is an estimate, not an award or spending approval.', s: 'muted' } },
    19: { 0: { v: 'Original estimates / No application is submitted', s: 'muted' } },
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
    name: 'Estuary / Grant costs',
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-beta.2',
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 22, bl: 1, cl: { rgb: '#193D54' } },
      muted: { fs: 11, cl: { rgb: '#657F8D' } },
      header: { bg: { rgb: '#DDE7EE' }, bl: 1, cl: { rgb: '#193D54' } },
      body: { cl: { rgb: '#394B57' } },
      stripe: { bg: { rgb: '#F4F6F8' } },
      money: { n: { pattern: '#,##0.00' } },
      input: { cl: { rgb: '#1B1C1F' }, bg: { rgb: '#F4E7C9' }, n: { pattern: '#,##0' } },
      total: { bg: { rgb: '#E9DFE6' }, bl: 1, n: { pattern: '#,##0.00' }, cl: { rgb: '#754A58' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Grant costs',
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
  ['ESTUARY / Cultural access fund', 'kicker'],
  ['Make room for local voices.', 'title'],
  ['Review dossier E-24 / 8 November 2028 / Fictional proposal', 'meta'],
  ['01 / Executive assessment', 'heading'],
  [
    'A small maritime museum proposes three listening rooms built around twenty-four illustrative oral-history excerpts. The dossier separates an editable cost schedule, an evidence register, a hearing presentation and a release workflow. No real recordings, personal data or grant application are included.',
    'body',
  ],
  [
    'The planning envelope is USD 6,732.72, including an eight-percent contingency. Transcript and permission checks are distinct review activities. A complete cost model does not prove that the material is cleared for display, and a review label does not grant rights.',
    'body',
  ],
  [
    'Reading order / Cost assumptions; evidence and custodians; hearing presentation; review and release process.',
    'heading',
  ],
  [
    'Committee question / Is the scope clear enough to request further evidence? The sample leaves this decision open. Numbers and status labels are authored planning data, not a funding decision or legal opinion.',
    'body',
  ],
  ['02 / Cost assumptions', 'heading'],
  [
    'Eight budget lines distinguish equipment, interpretation and review work. Revise transcript quantities in the native Sheet below; its formulas update the requested envelope, not this report or the hearing slides. Expand the table for full native editing and print preview.',
    'body',
  ],
  ['', 'body'],
  [BLOCK_MARKERS[0], 'heading'],
  [
    'Seven evidence items link to four custodians. Consent scope, accessible transcripts and installation notes remain separate records. The linked Custodians table holds responsibility notes; no messages or assignments are sent.',
    'body',
  ],
  ['', 'body'],
  [BLOCK_MARKERS[1], 'heading'],
  [
    'Four hearing slides distinguish public purpose, the exhibition units, outstanding evidence and the release decision. Shapes and text are editable. The budget amount on the closing slide is an authored baseline, not a Formula Shape.',
    'body',
  ],
  ['', 'body'],
  [BLOCK_MARKERS[2], 'heading'],
  [
    'The eight-card Board separates evidence checks from layout and staging. Three return paths make revision visible without running automation. Expand it to inspect native connectors and change a review label.',
    'body',
  ],
  ['', 'body'],
  [BLOCK_MARKERS[3], 'heading'],
  [
    'Disposition / Request further evidence before deciding. Four native body anchors remain attached to their chapters when the cover title changes. The report and all four children have independent snapshots. Reload discards local edits; no submission or publication occurs.',
    'body',
  ],
] as const
export function createHostData(): IDocumentData {
  let offset = 0
  const paragraphs = MEMO.map(([text, kind], i) => {
    offset += text.length + 1
    const heading = kind === 'heading'
    return {
      startIndex: offset - 1,
      paragraphId: 'estuary-exhibition-p-' + i,
      paragraphStyle: {
        namedStyleType:
          kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        ...(/^(02|03|04|05) \/ /.test(text) ? { pageBreakBefore: BooleanNumber.TRUE } : {}),
        ...(heading ? { headingId: 'estuary-exhibition-heading-' + i } : {}),
        spaceAbove: { v: heading ? 14 : 0 },
        spaceBelow: { v: 8 },
        lineSpacing: 1.2,
        textStyle: {
          ff: kind === 'body' || kind === 'title' ? 'Georgia' : 'Arial',
          fs: kind === 'title' ? 30 : heading ? 16 : kind === 'meta' ? 10 : 12,
          bl: heading || kind === 'title' ? BooleanNumber.TRUE : BooleanNumber.FALSE,
          cl: { rgb: heading || kind === 'title' ? '#193D54' : '#394B57' },
        },
      },
    }
  })
  const dataStream = MEMO.map(([text]) => text).join('\r') + '\r\n'
  return {
    id: HOST_ID,
    title: 'Estuary / Grant review dossier',
    documentStyle: {
      documentFlavor: DocumentFlavor.TRADITIONAL,
      pageSize: { width: 794, height: 1123 },
      marginTop: 60,
      marginBottom: 60,
      marginLeft: 60,
      marginRight: 60,
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
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'estuary-exhibition-section' }],
    },
  }
}

export function createSlidesData(): ISlideData {
  const specs = [
    {
      id: 'purpose',
      title: 'Listen before we exhibit.',
      kicker: 'ESTUARY / THE PUBLIC PURPOSE',
      body: 'Three rooms. Twenty-four illustrative excerpts.\nA proposal for access, not an approved exhibition.',
      bg: '#193D54',
      ink: '#F3F5F7',
      accent: '#D6B56E',
    },
    {
      id: 'roles',
      title: 'Different units. One exhibition.',
      kicker: 'SCOPE / COUNT THE RIGHT THINGS',
      body: 'Rooms define space. Excerpts define review workload.\nPanels provide context, not consent.',
      bg: '#F4EEE3',
      ink: '#3B4F5C',
      accent: '#98723C',
    },
    {
      id: 'review',
      title: 'Two evidence gates remain.',
      kicker: 'HEARING / NOT A RELEASE DECISION',
      body: 'Check scope of permission and transcript review separately.\nDo not infer consent from a completed budget.',
      bg: '#E8EDF2',
      ink: '#334C61',
      accent: '#754A58',
    },
    {
      id: 'funding',
      title: 'Release only reviewed material.',
      kicker: 'DISPOSITION / REQUEST FURTHER EVIDENCE',
      body: 'USD 6,732.72 / Authored opening estimate.\nNo award, publication or submission follows.',
      bg: '#56394D',
      ink: '#FFF7EF',
      accent: '#DCC18B',
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
            text('stations', '03\nRooms', 36, 182, 225, 110, 25, ink, '#E4EBDC'),
            text('packs', '24\nExcerpts', 282, 182, 225, 110, 25, ink, '#F1E4C9'),
            text('sessions', '18\nPanels', 528, 182, 225, 110, 25, ink, '#E6E1EE'),
          ]
        : []),
      ...(id === 'review'
        ? [
            text('permission', 'Permission scope\nOpen questions', 36, 185, 350, 110, 23, ink, '#EADCE3'),
            text('transcripts', 'Transcript review\nNot yet complete', 410, 185, 350, 110, 23, ink, '#F2E4C6'),
          ]
        : []),
      text(
        'body',
        body,
        36,
        id === 'roles' || id === 'review' ? 315 : 230,
        720,
        95,
        id === 'roles' || id === 'review' ? 17 : 22,
        ink,
      ),
      text('footer', 'Fictional dossier / No award or publication', 36, 412, 475, 25, 10, accent),
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
    name: 'Estuary / Hearing presentation',
    appVersion: '1.0.0-beta.2',
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
    'Custodians',
    [
      field('title', 'Custodian', BaseFieldType.Text),
      field('scope', 'Focus', BaseFieldType.Text),
      field('note', 'Handover note', BaseFieldType.Text),
    ],
    [
      {
        title: 'Maya Reed',
        scope: 'Collection scope',
        note: 'Record the excerpt inventory without personal interview data.',
      },
      { title: 'Theo Lin', scope: 'Permissions', note: 'Separate permission scope from interpretation decisions.' },
      {
        title: 'Sofia Hart',
        scope: 'Interpretation',
        note: 'Keep edits and unresolved wording attached to each excerpt.',
      },
      {
        title: 'Jon Bell',
        scope: 'Exhibition access',
        note: 'Check caption contrast and listening-room navigation.',
      },
    ],
  )
  const workstreams = table(
    'evidence',
    'Evidence',
    [
      field('title', 'Evidence item', BaseFieldType.Text),
      field('owner', 'Custodian', BaseFieldType.RecordLink, {
        targetTableId: 'owners',
        multiple: false,
        displayFieldId: 'title',
      }),
      state,
      field('note', 'Next evidence', BaseFieldType.Text),
    ],
    [
      {
        title: 'Excerpt inventory',
        owner: serializeRecordLinkIds(['owners-1']),
        state: 'review',
        note: 'Twenty-four synthetic excerpt identifiers; no recordings attached.',
      },
      {
        title: 'Permission scope',
        owner: serializeRecordLinkIds(['owners-2']),
        state: 'waiting',
        note: 'Six review sessions planned; no permission is granted here.',
      },
      {
        title: 'Caption proofs',
        owner: serializeRecordLinkIds(['owners-4']),
        state: 'review',
        note: 'Review eighteen caption panels for contrast and wording.',
      },
      {
        title: 'Room access plan',
        owner: serializeRecordLinkIds(['owners-4']),
        state: 'ready',
        note: 'Three room walkthroughs proposed; access review remains local.',
      },
      {
        title: 'Transcript review',
        owner: serializeRecordLinkIds(['owners-3']),
        state: 'waiting',
        note: 'Twenty-four transcript reviews in the opening cost estimate.',
      },
      {
        title: 'Close-out evidence',
        owner: serializeRecordLinkIds(['owners-1']),
        state: 'waiting',
        note: 'Retain the review record separately from publication decisions.',
      },
      {
        title: 'Installation notes',
        owner: serializeRecordLinkIds(['owners-2']),
        state: 'review',
        note: 'Check the layout and reusable crates before staging.',
      },
    ],
  )
  return {
    id: BASE_ID,
    name: 'Estuary / Evidence and custodians',
    locale: LocaleType.EN_US,
    schemaVersion: 1,
    createdAt: TIME,
    updatedAt: TIME,
    tableOrder: ['evidence', 'owners'],
    tables: { evidence: workstreams, owners },
  }
}

export function createBoardData(): IBoardData {
  const nodes = [
    ['brief', 'Define inventory\nMaya / Draft', 35, 100, '#DFE8EE'],
    ['source', 'Check permissions\nTheo / Open', 325, 100, '#EADCE3'],
    ['prepare', 'Review transcripts\nSofia / Waiting', 615, 100, '#F2E4C6'],
    ['layout', 'Plan listening rooms\nJon / Draft', 905, 100, '#DFE8EE'],
    ['release', 'Stage reviewed items\nTeam / Not approved', 905, 310, '#DCE8E4'],
    ['review', 'Committee review\nTeam / Planned', 615, 310, '#E5E0ED'],
    ['access', 'Access walkthrough\nJon / Planned', 325, 310, '#DCE8E4'],
    ['adjust', 'Revise evidence\nCustodians / Open', 35, 310, '#F0DED6'],
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
    ['prepare', 1, 'layout', 3],
    ['layout', 2, 'release', 0],
    ['release', 3, 'review', 1],
    ['review', 3, 'access', 1],
    ['access', 3, 'adjust', 1],
    ['adjust', 0, 'brief', 2],
    ['review', 0, 'prepare', 2],
    ['access', 0, 'source', 2],
  ] as const
  const connectors = routes.map(([a, sa, b, sb], i) =>
    createBoardConnectorElement({
      id: 'route-' + i,
      start: { kind: 'shapeSite', shapeId: a, connectionSiteId: sa },
      end: { kind: 'shapeSite', shapeId: b, connectionSiteId: sb },
      routing: 'orthogonal',
      routingMode: 'auto',
      style: { stroke: i >= 7 ? '#B57549' : '#6B8B91', strokeWidth: 2, endMarker: { type: 'filledArrow' } },
    }),
  )
  const title = createBoardTextBoxShapeElement({
    id: 'title',
    text: 'ESTUARY / Evidence before exhibition.',
    left: 40,
    top: 22,
    width: 1100,
    height: 45,
    textStyle: { fs: 25, bl: BooleanNumber.TRUE, cl: { rgb: '#235A60' } },
  })
  const footer = createBoardTextBoxShapeElement({
    id: 'footer',
    text: 'Review paths do not grant consent, submit an application or publish recordings.',
    left: 40,
    top: 510,
    width: 1100,
    height: 35,
    textStyle: { fs: 12, cl: { rgb: '#6E7D86' } },
  })
  const elements = [...connectors, ...shapes, title, footer]
  return {
    id: BOARD_ID,
    name: 'Estuary / Dependency review',
    appVersion: '1.0.0-beta.2',
    defaultPageSize: { width: 1180, height: 590 },
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
