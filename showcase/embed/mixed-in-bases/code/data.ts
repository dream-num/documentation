import type { IBoardData } from '@univerjs-pro/boards'
import type {
  BaseCellValue,
  IBaseSnapshot,
  IDocumentData,
  IFieldSnapshot,
  ITableSnapshot,
  IWorkbookData,
} from '@univerjs/core'
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
  DocumentFlavor,
  HorizontalAlign,
  NamedStyleType,
  RichTextBuilder,
  VerticalAlign,
  createBaseRecordIdField,
  LocaleType,
} from '@univerjs/core'

export const HOST_ID = 'acorn-studio-operations'
export const SHEET_UNIT_ID = 'acorn-studio-forecast'
export const SHEET_ID = 'forecast'
export const DOCS_ID = 'acorn-studio-playbook'
export const SLIDES_ID = 'acorn-studio-review'
export const BOARD_ID = 'acorn-studio-workflow'
const REVIEW_TIME = Date.parse('2029-01-17T09:00:00Z')
export const DEALS = [
  ['Tidal Atlas / Touring exhibition', 'Proposal', 48000, 'Mira', 1, 'Confirm crate return route'],
  ['Night Orchard / Light installation', 'Qualified', 32500, 'Leo', 2, 'Review outdoor power boundary'],
  ['Paper Cities / Library residency', 'Negotiation', 24000, 'Asha', 3, 'Agree accessible label format'],
  ['Sound Cabinet / Listening booth', 'Prospect', 18000, 'Mira', 1, 'Arrange acoustic survey'],
  ['River Archive / Mobile gallery', 'Proposal', 67500, 'Asha', 4, 'Validate vehicle loading plan'],
  ['Small Worlds / School exhibition', 'Qualified', 28500, 'Leo', 3, 'Confirm term-time access'],
  ['Clay Stories / Maker showcase', 'Prospect', 14500, 'Mira', 2, 'Collect material samples'],
  ['Signal Room / Science trail', 'Negotiation', 82000, 'Asha', 4, 'Review reusable frame inventory'],
  ['Hidden Gardens / Visitor centre', 'Proposal', 39000, 'Leo', 2, 'Compare weatherproof finishes'],
  ['Folded Coast / Museum pop-up', 'Qualified', 21500, 'Mira', 1, 'Confirm two-stop itinerary'],
] as const
const STAGES = [
  { name: 'Prospect', weight: 0.15, color: '#7E72A8', note: 'Interest recorded; needs not yet validated' },
  { name: 'Qualified', weight: 0.4, color: '#39848D', note: 'Scope discussed; no proposal accepted' },
  { name: 'Proposal', weight: 0.65, color: '#B78547', note: 'Written scope shared; price still open' },
  { name: 'Negotiation', weight: 0.85, color: '#50679E', note: 'Commercial details under discussion' },
] as const
const field = (id: string, name: string, type: BaseFieldType, config = {}): IFieldSnapshot => ({
  id,
  name,
  type,
  config,
})
function table(
  id: string,
  name: string,
  definitions: IFieldSnapshot[],
  rows: Record<string, BaseCellValue>[],
): ITableSnapshot {
  const fields = [createBaseRecordIdField(), ...definitions]
  const fieldOrder = fields.map((item) => item.id)
  const records = Object.fromEntries(
    rows.map((values, index) => {
      const recordId = `${id}-${index + 1}`
      return [
        recordId,
        {
          id: recordId,
          orderKey: String(index).padStart(3, '0'),
          createdAt: REVIEW_TIME,
          updatedAt: REVIEW_TIME,
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
    fields: Object.fromEntries(fields.map((item) => [item.id, item])),
    fieldOrder,
    records,
    recordOrder: Object.keys(records),
    viewOrder: [`${id}-grid`],
    views: {
      [`${id}-grid`]: {
        id: `${id}-grid`,
        tableId: id,
        name: id === 'deals' ? 'January pipeline' : 'Partner contexts',
        type: BaseViewType.Grid,
        fieldOrder,
        fieldSettings: Object.fromEntries(
          fieldOrder.map((fieldId) => [
            fieldId,
            {
              hidden: fieldId === BASE_RECORD_ID_FIELD_ID,
              width: fieldId === 'title' ? 260 : fieldId === 'next' ? 320 : fieldId === 'account' ? 180 : 135,
            },
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
export function createHostData(): IBaseSnapshot {
  const accounts = table(
    'accounts',
    'Accounts',
    [
      field('title', 'Partner group', BaseFieldType.Text),
      field('sector', 'Sector', BaseFieldType.Text),
      field('next', 'Relationship context', BaseFieldType.Text),
    ],
    [
      {
        title: 'Independent Museums',
        sector: 'Museums and archives',
        next: 'Touring loans; careful handling and reusable crates',
      },
      {
        title: 'Civic Festivals',
        sector: 'Public arts and festivals',
        next: 'Outdoor access; temporary installations',
      },
      {
        title: 'Learning Partners',
        sector: 'Schools and libraries',
        next: 'Term-time access; plain-language interpretation',
      },
      {
        title: 'Regional Networks',
        sector: 'Regional touring venues',
        next: 'Multiple stops; common modular frame inventory',
      },
    ],
  )
  const deals = table(
    'deals',
    'Opportunities',
    [
      field('title', 'Opportunity', BaseFieldType.Text),
      field('stage', 'Stage', BaseFieldType.SingleSelect, {
        options: STAGES.map((stage) => ({ id: stage.name, name: stage.name, color: stage.color })),
      }),
      field('amount', 'Value / USD', BaseFieldType.Currency, {
        decimalPlaces: 0,
        currencySymbol: '$',
        useThousands: true,
        separatorStyle: 'commaPeriod',
      }),
      field('account', 'Partner group', BaseFieldType.RecordLink, {
        targetTableId: 'accounts',
        multiple: false,
        displayFieldId: 'title',
      }),
      field('owner', 'Owner', BaseFieldType.Text),
      field('next', 'Next conversation', BaseFieldType.Text),
    ],
    DEALS.map(([title, stage, amount, owner, account, next]) => ({
      title,
      stage,
      amount,
      owner,
      account: serializeRecordLinkIds([`accounts-${account}`]),
      next,
    })),
  )
  const tasks = table(
    'tasks',
    'Follow-ups',
    [
      field('title', 'Deliverable', BaseFieldType.Text),
      field('deal', 'Opportunity', BaseFieldType.RecordLink, {
        targetTableId: 'deals',
        multiple: false,
        displayFieldId: 'title',
      }),
      field('owner', 'Owner', BaseFieldType.Text),
      field('state', 'Readiness', BaseFieldType.SingleSelect, {
        options: [
          { id: 'review', name: 'In review', color: '#6688FF' },
          { id: 'waiting', name: 'Waiting', color: '#D98C5F' },
          { id: 'ready', name: 'Ready', color: '#50C8B0' },
        ],
      }),
      field('next', 'Evidence needed', BaseFieldType.Text),
    ],
    [
      {
        title: 'Reusable crate schedule',
        deal: serializeRecordLinkIds(['deals-1']),
        owner: 'Mira',
        state: 'review',
        next: 'Match pickup and return dimensions before quoting.',
      },
      {
        title: 'Accessible label sample',
        deal: serializeRecordLinkIds(['deals-3']),
        owner: 'Asha',
        state: 'waiting',
        next: 'Ask the partner to review one large-print sample.',
      },
      {
        title: 'Loading plan',
        deal: serializeRecordLinkIds(['deals-5']),
        owner: 'Leo',
        state: 'review',
        next: 'Check the narrowest door at both venues.',
      },
      {
        title: 'Frame inventory',
        deal: serializeRecordLinkIds(['deals-8']),
        owner: 'Asha',
        state: 'ready',
        next: 'Illustrative count complete; no stock reservation.',
      },
      {
        title: 'Finish sample board',
        deal: serializeRecordLinkIds(['deals-9']),
        owner: 'Leo',
        state: 'waiting',
        next: 'Compare two surfaces under outdoor light.',
      },
      {
        title: 'Two-stop itinerary',
        deal: serializeRecordLinkIds(['deals-10']),
        owner: 'Mira',
        state: 'review',
        next: 'Keep a buffer day between the proposed stops.',
      },
    ],
  )
  return {
    id: HOST_ID,
    name: 'Acorn / Touring studio operations',
    locale: LocaleType.EN_US,
    schemaVersion: 1,
    createdAt: REVIEW_TIME,
    updatedAt: REVIEW_TIME,
    tableOrder: ['deals', 'tasks', 'accounts'],
    tables: { deals, tasks, accounts },
  }
}

export function createSheetData(): Partial<IWorkbookData> {
  const cells: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'ACORN / A forecast, not a promise', s: 'title' } },
    1: { 0: { v: '17 JAN 2029 / Fictional USD values / Independent what-if snapshot', s: 'muted' } },
    3: Object.fromEntries(
      ['Opportunity', 'Stage', 'Value / USD', 'Weight', 'Weighted / USD'].map((v, i) => [i, { v, s: 'header' }]),
    ),
    14: {
      0: { v: 'PIPELINE TOTAL', s: 'header' },
      2: { f: '=SUM(C5:C14)', s: 'total' },
      4: { f: '=SUM(E5:E14)', s: 'total' },
    },
    17: { 0: { v: 'Sand = editable values. Change stage weights on Assumptions.', s: 'muted' } },
    19: { 0: { v: 'Base edits do not sync here. This workbook starts from the same authored deals.', s: 'muted' } },
    21: { 0: { v: 'Weighted pipeline is a planning scenario, not booked revenue or an order.', s: 'muted' } },
  }
  DEALS.forEach(([title, stage, amount], index) => {
    const row = index + 4
    cells[row] = {
      0: { v: title, s: index % 2 ? 'stripe' : 'body' },
      1: { v: stage, s: index % 2 ? 'stripe' : 'body' },
      2: { v: amount, t: CellValueType.NUMBER, s: 'inputMoney' },
      3: { f: `=VLOOKUP(B${row + 1},Assumptions!$A$4:$B$7,2,FALSE)`, s: 'percent' },
      4: { f: `=ROUND(C${row + 1}*D${row + 1},2)`, s: 'money' },
    }
  })
  const assumptions: typeof cells = {
    0: { 0: { v: 'ACORN / Make the uncertainty visible', s: 'title' } },
    2: Object.fromEntries(['Stage', 'Weight', 'Working interpretation'].map((v, i) => [i, { v, s: 'header' }])),
    9: { 0: { v: 'Weighted pipeline / USD', s: 'body' }, 1: { f: '=Forecast!E15', s: 'total' } },
    10: { 0: { v: 'Working target / USD', s: 'body' }, 1: { v: 180000, s: 'inputMoney' } },
    11: { 0: { v: 'Gap to target / USD', s: 'header' }, 1: { f: '=B11-B10', s: 'total' } },
    14: { 0: { v: 'Try Qualified at 50%, then 0%. Its three opportunities recalculate together.', s: 'muted' } },
    16: { 0: { v: 'These probabilities are illustrative, not calibrated predictions.', s: 'muted' } },
    18: { 0: { v: 'No customer messages, invoices, approvals or CRM synchronization.', s: 'muted' } },
  }
  STAGES.forEach((stage, index) => {
    assumptions[index + 3] = {
      0: { v: stage.name, s: index % 2 ? 'stripe' : 'body' },
      1: { v: stage.weight, t: CellValueType.NUMBER, s: 'inputPercent' },
      2: { v: stage.note, s: 'body' },
    }
  })
  return {
    id: SHEET_UNIT_ID,
    name: 'Acorn / Weighted forecast',
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    sheetOrder: [SHEET_ID, 'assumptions'],
    styles: {
      title: { fs: 20, bl: 1, cl: { rgb: '#303C64' } },
      header: { bg: { rgb: '#303C64' }, cl: { rgb: '#FFFFFF' }, bl: 1 },
      body: { cl: { rgb: '#344C59' } },
      stripe: { bg: { rgb: '#EEF3F5' }, cl: { rgb: '#344C59' } },
      muted: { fs: 11, cl: { rgb: '#68758B' } },
      inputMoney: { bg: { rgb: '#F4D6B1' }, cl: { rgb: '#1B1C1F' }, n: { pattern: '#,##0' } },
      inputPercent: { bg: { rgb: '#F4D6B1' }, cl: { rgb: '#1B1C1F' }, n: { pattern: '0%' } },
      percent: { bg: { rgb: '#EAE4F2' }, cl: { rgb: '#65537D' }, n: { pattern: '0%' } },
      money: { cl: { rgb: '#227C7E' }, n: { pattern: '#,##0.00' } },
      total: { bg: { rgb: '#CBE5E1' }, cl: { rgb: '#215F62' }, bl: 1, n: { pattern: '#,##0.00' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Forecast',
        rowCount: 35,
        columnCount: 8,
        defaultRowHeight: 31,
        defaultColumnWidth: 110,
        columnData: { 0: { w: 245 }, 1: { w: 135 }, 2: { w: 140 }, 3: { w: 105 }, 4: { w: 155 } },
        cellData: cells,
        mergeData: [0, 1, 17, 19, 21].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 4 })),
      },
      assumptions: {
        id: 'assumptions',
        name: 'Assumptions',
        rowCount: 30,
        columnCount: 7,
        defaultRowHeight: 33,
        defaultColumnWidth: 120,
        columnData: { 0: { w: 245 }, 1: { w: 140 }, 2: { w: 395 } },
        cellData: assumptions,
        mergeData: [0, 14, 16, 18].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 2 })),
      },
    },
  }
}

const MEMO = [
  ['ACORN / Delivery playbook', 'kicker'],
  ['Build once. Travel thoughtfully.', 'title'],
  ['17 January 2029 / Original touring-studio scenario', 'meta'],
  ['01 / Start with a partner conversation', 'heading'],
  [
    'Ten fictional opportunities span museums, festivals, learning partners and regional networks. Clarify the audience, access constraints and return journey before describing a deliverable. The Base links each opportunity to a partner group and six follow-ups to their opportunities.',
    'body',
  ],
  ['02 / Price uncertainty explicitly', 'heading'],
  [
    'The opening pipeline is USD 375,500; illustrative stage weights produce USD 228,400. The independent Forecast workbook exposes these assumptions. Its formulas recalculate, but the written totals and Base records do not automatically synchronize. No booked revenue is implied.',
    'body',
  ],
  ['03 / Review a physical sample', 'heading'],
  [
    'Paper Cities needs an accessible label sample; Hidden Gardens needs a finish comparison. A photograph cannot substitute for checking legibility and material in context. Store a concise evidence request in Follow-ups. A Ready label is not a customer approval.',
    'body',
  ],
  ['04 / Plan the return as well as the launch', 'heading'],
  [
    'Reusable crates and modular frames need an owner on both legs of the journey. The service blueprint includes a return loop from partner review to scope and a reuse loop from recovery to preparation. Its connectors express a process, not an automation.',
    'body',
  ],
  ['05 / Keep each working surface honest', 'heading'],
  [
    'The Base owns records, the Sheet owns calculations, this document owns prose, Slides owns its visual review and the Board owns the process map. Open the native tab before editing its model. All data is local and fictional; no email, order, shipment or customer system is contacted.',
    'body',
  ],
  ['Next checkpoint / Resolve the six evidence requests before making commitments.', 'heading'],
] as const
export function createDocsData(): IDocumentData {
  let offset = 0
  const paragraphs = MEMO.map(([text, kind], i) => {
    offset += text.length + 1
    const heading = kind === 'heading'
    return {
      startIndex: offset - 1,
      paragraphId: 'acorn-playbook-p-' + i,
      paragraphStyle: {
        namedStyleType:
          kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        ...(heading ? { headingId: 'acorn-playbook-h-' + i } : {}),
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
    title: 'Acorn / Delivery playbook',
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
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'acorn-playbook-section' }],
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
    { id: 'cover', name: 'Make room for the journey', bg: '#101A34', ink: '#F5F7FF', accent: '#58C8FF' },
    {
      id: 'portfolio',
      name: 'A portfolio with different constraints',
      bg: '#F6F0E7',
      ink: '#303C64',
      accent: '#986441',
    },
    { id: 'checkpoint', name: 'A review, not a commitment', bg: '#45334F', ink: '#F5F0FA', accent: '#B6A6FF' },
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
      t('kicker', 'ACORN / STUDIO REVIEW / 17 JAN 2029', 40, 25, 900, 35, 14, accent),
      t('title', name, 40, 88, id === 'cover' ? 610 : 920, id === 'cover' ? 145 : 100, id === 'cover' ? 45 : 32),
      t(
        'footer',
        'Original fictional scenario / Authored figures are not live Formula Shapes',
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
              'Reusable exhibition systems.\nTen different conversations.\nOne shared operating workspace.',
              40,
              285,
              580,
              155,
              24,
              '#C8D0E4',
            ),
            t('opportunities', '10\nOpportunities', 690, 120, 270, 105, 25, '#101A34', '#58C8FF'),
            t('pipeline', '$375,500\nGross pipeline', 690, 250, 270, 105, 21, '#101A34', '#50C8B0'),
            t('weighted', '$228,400\nWeighted baseline', 690, 380, 270, 105, 19, '#101A34', '#F2B84B'),
          ]
        : id === 'portfolio'
          ? [
              t(
                'touring',
                'TOURING\n\nTidal Atlas\nReusable crates\nReturn-route review',
                40,
                220,
                290,
                225,
                21,
                ink,
                '#DDE8F0',
              ),
              t(
                'learning',
                'LEARNING\n\nPaper Cities\nAccessible labels\nTerm-time access',
                355,
                220,
                290,
                225,
                21,
                ink,
                '#DCEBE4',
              ),
              t(
                'outdoors',
                'OUTDOORS\n\nHidden Gardens\nFinish samples\nOutdoor materials',
                670,
                220,
                290,
                225,
                21,
                ink,
                '#F1DDCF',
              ),
            ]
          : [
              t(
                'evidence',
                'EVIDENCE FIRST\n\nSix linked follow-ups.\nReview samples and access.\nCheck reusable inventory.',
                40,
                215,
                440,
                235,
                22,
                '#25483F',
                '#D7EDE6',
              ),
              t(
                'boundaries',
                'KEEP THE BOUNDARIES\n\nForecast is a scenario.\nA status is not approval.\nA connector is not automation.',
                520,
                215,
                440,
                235,
                22,
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
        'Use the native Base table list to move between records, forecasts and supporting evidence. Each product remains independently editable.',
    }
  })
  return {
    id: SLIDES_ID,
    name: 'Acorn / Studio review',
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1000, height: 562.5 },
    slides: Object.fromEntries(pages.map((p) => [p.id, p])),
    slideOrder: pages.map((p) => p.id),
    activeSlideId: 'cover',
  }
}

export function createBoardData(): IBoardData {
  const nodes = [
    ['scope', 'Discover the brief\nMira / Discovery', 40, 100, '#DDE8F0'],
    ['rooms', 'Scope reusable parts\nLeo / Review', 330, 100, '#E6E0F1'],
    ['kits', 'Prepare a sample\nAsha / Waiting', 620, 100, '#F3E5C5'],
    ['brief', 'Review with partner\nStudio / Planned', 910, 100, '#DDEBE5'],
    ['run', 'Install and document\nVenue / Planned', 910, 320, '#DDEBE5'],
    ['review', 'Recover and inspect\nStudio / Planned', 620, 320, '#E6E0F1'],
    ['adjust', 'Repack for reuse\nAll partners / Planned', 330, 320, '#F2DAD4'],
  ] as const
  const shapes = nodes.map(([id, label, left, top, color]) => {
    const e = createBoardTextBoxShapeElement({
      id,
      text: label,
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
    ['adjust', 0, 'kits', 2],
    ['brief', 0, 'rooms', 0],
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
    text: 'ACORN / The return journey matters.',
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
    name: 'Acorn / Service blueprint',
    appVersion: '1.0.0-beta.2',
    defaultPageSize: { width: 1180, height: 590 },
    pageOrder: ['workflow'],
    activePageId: 'workflow',
    pages: {
      workflow: {
        id: 'workflow',
        name: 'Service blueprint',
        pageType: BoardPageType.Page,
        elementOrder: elements.map((e) => e.id),
        elements: Object.fromEntries(elements.map((e) => [e.id, e])),
      },
    },
  }
}
