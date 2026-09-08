import type { IBoardData } from '@univerjs-pro/boards'
import type { IDocumentData, IWorkbookData } from '@univerjs/core'
import { BoardPageType, createBoardConnectorElement, createBoardTextBoxShapeElement } from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { createFormulaShapeData } from '@univerjs-pro/shape-editor'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum, type ISlideData } from '@univerjs-pro/slides'
import {
  DocumentFlavor,
  HorizontalAlign,
  LocaleType,
  NamedStyleType,
  RichTextBuilder,
  VerticalAlign,
} from '@univerjs/core'

export const HOST_ID = 'aurora-budget-model'
export const SHEET_ID = 'allocation'
export const SOURCE_NAME = 'Aurora Budget'
export const DOCS_ID = 'aurora-budget-note'
export const SLIDES_ID = 'aurora-review-deck'
export const BOARD_ID = 'aurora-allocation-map'
const ref = (cell: string) => "'[Aurora Budget]Department plan'!" + cell
export const DEPARTMENTS = [
  ['Research', 4200, 'Archive visits, interviews and editorial development', '#DDEDE8', '#245B55'],
  ['Production', 3600, 'Build the exhibition and prepare reusable components', '#ECE5F4', '#644A80'],
  ['Access', 2200, 'Transcripts, large print and quiet visiting sessions', '#F9EACD', '#8B602F'],
] as const
export const INLINE_FORMULAS = [
  { marker: '{{total}}', formula: '=' + ref('B9'), pattern: '$#,##0' },
  { marker: '{{ceiling}}', formula: '=' + ref('B11'), pattern: '$#,##0' },
  { marker: '{{remaining}}', formula: '=' + ref('B12'), pattern: '$#,##0;-$#,##0' },
  { marker: '{{research}}', formula: '=' + ref('B5'), pattern: '$#,##0' },
  { marker: '{{production}}', formula: '=' + ref('B6'), pattern: '$#,##0' },
  { marker: '{{access}}', formula: '=' + ref('B7'), pattern: '$#,##0' },
  { marker: '{{share}}', formula: '=' + ref('C7'), pattern: '0.0%' },
  { marker: '{{signal}}', formula: '=' + ref('B13'), pattern: 'General' },
] as const
export const SLIDE_FORMULAS = [
  { page: 'overview', id: 'total', formula: '=' + ref('B9'), format: '$#,##0' },
  { page: 'overview', id: 'remaining', formula: '=' + ref('B12'), format: '$#,##0;-$#,##0' },
  ...DEPARTMENTS.map(([name], i) => ({
    page: 'departments',
    id: name.toLowerCase(),
    formula: '=' + ref('B' + (i + 5)),
    format: '$#,##0',
  })),
  { page: 'departments', id: 'share', formula: '=' + ref('C7'), format: '0.0%' },
  { page: 'decision', id: 'signal', formula: '=' + ref('B13'), format: 'General' },
  { page: 'decision', id: 'ceiling', formula: '=' + ref('B11'), format: '$#,##0' },
]
export const BOARD_FORMULAS = [
  { id: 'total', formula: '=' + ref('B9'), format: '$#,##0' },
  ...DEPARTMENTS.map(([name], i) => ({ id: name.toLowerCase(), formula: '=' + ref('B' + (i + 5)), format: '$#,##0' })),
  { id: 'remaining', formula: '=' + ref('B12'), format: '$#,##0;-$#,##0' },
  { id: 'signal', formula: '=' + ref('B13'), format: 'General' },
]

export function createHostData(): Partial<IWorkbookData> {
  const cellData: IWorkbookData['sheets'][string]['cellData'] = {
    0: { 0: { v: 'AURORA / One model, four outputs', s: 'title' } },
    1: { 0: { v: 'Community exhibition / June 2029 / Original fictional USD planning data', s: 'meta' } },
    3: Object.fromEntries(['Department', 'Allocation', 'Share', 'Purpose'].map((v, i) => [i, { v, s: 'header' }])),
    8: {
      0: { v: 'Total allocation', s: 'header' },
      1: { f: '=SUM(B5:B7)', s: 'total' },
      2: { f: '=SUM(C5:C7)', s: 'share' },
    },
    10: { 0: { v: 'Planning ceiling', s: 'header' }, 1: { v: 12000, s: 'input' } },
    11: { 0: { v: 'Unallocated', s: 'header' }, 1: { f: '=B11-B9', s: 'total' } },
    12: {
      0: { v: 'Review signal', s: 'header' },
      1: { f: '=IF(B12<0,"Rebalance scope","Within ceiling")', s: 'meta' },
    },
    14: {
      0: {
        v: 'Edit an amber amount, then open Brief, Review deck and Allocation map in the native tab bar.',
        s: 'meta',
      },
    },
    15: {
      0: { v: 'The chart below reads the same department range. No copied numbers or manual refresh.', s: 'meta' },
    },
  }
  DEPARTMENTS.forEach(([name, value, purpose], i) => {
    const row = i + 4
    cellData[row] = {
      0: { v: name },
      1: { v: value, s: 'input' },
      2: { f: '=B' + (row + 1) + '/$B$9', s: 'share' },
      3: { v: purpose, s: 'meta' },
      4: { f: '=A' + (row + 1), s: 'meta' },
      5: { f: '=B' + (row + 1), s: 'total' },
    }
  })
  cellData[3][4] = { v: 'Chart series', s: 'header' }
  cellData[3][5] = { v: 'Linked amount', s: 'header' }
  cellData[8][4] = { v: 'Chart total', s: 'header' }
  cellData[8][5] = { f: '=SUM(F5:F7)', s: 'total' }
  return {
    id: HOST_ID,
    name: SOURCE_NAME,
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 24, bl: 1, cl: { rgb: '#173F4E' } },
      meta: { fs: 11, cl: { rgb: '#526C78' } },
      header: { bl: 1, bg: { rgb: '#E0ECEF' }, cl: { rgb: '#173F4E' } },
      input: { bg: { rgb: '#FFF0D8' }, n: { pattern: '$#,##0' } },
      total: { bl: 1, bg: { rgb: '#DDEDE8' }, n: { pattern: '$#,##0;-$#,##0' } },
      share: { bg: { rgb: '#ECE5F4' }, n: { pattern: '0.0%' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Department plan',
        rowCount: 42,
        columnCount: 9,
        defaultRowHeight: 30,
        defaultColumnWidth: 130,
        columnData: { 0: { w: 185 }, 1: { w: 150 }, 2: { w: 110 }, 3: { w: 470 }, 4: { w: 185 }, 5: { w: 150 } },
        rowData: { 0: { h: 46 } },
        cellData,
        mergeData: [
          ...[0, 1, 14, 15].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 3 })),
          { startRow: 12, endRow: 12, startColumn: 1, endColumn: 3 },
        ],
      },
    },
  }
}

export function createDocsData(): IDocumentData {
  const paragraphs = [
    ['AURORA / CURATOR’S FIELD NOTE', 'kicker'],
    ['A shared budget, four useful views.', 'title'],
    ['Planning brief / June 2029 / Original fictional exhibition', 'meta'],
    ['01 / The envelope', 'heading'],
    [
      'The current allocation is {{total}} against a planning ceiling of {{ceiling}}. That leaves {{remaining}} unallocated. This is a discussion model, not an approved purchase order.',
      'body',
    ],
    ['02 / What each department makes possible', 'heading'],
    [
      'Research receives {{research}} for archive visits and interviews. Production receives {{production}} for the exhibition build. Access receives {{access}} for transcripts, large print and quiet sessions.',
      'body',
    ],
    [
      'Access accounts for {{share}} of the allocated budget. A larger amount can change both the total and the mix; compare the department chart before making a decision.',
      'body',
    ],
    ['Review signal: {{signal}}.', 'signal'],
    ['03 / From one input to four outputs', 'heading'],
    [
      'Return to Department plan and change Access from 2,200 to 2,700. Read the new total here, on the overview slide and at the top of the allocation map. The native chart changes the same department column.',
      'body',
    ],
    [
      'The prose, slide layouts and Canvas connections are authored independently. Only their Formula values depend on the workbook; changing a source number does not regenerate the surrounding content.',
      'body',
    ],
    ['Local demonstration / No server, purchase, publication or automatic approval', 'meta'],
  ] as const
  let offset = 0
  return {
    id: DOCS_ID,
    title: 'Aurora / Budget brief',
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
        paragraphId: 'aurora-note-p-' + i,
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
          sectionId: 'aurora-note-section',
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
  doc.id = 'aurora-' + page + '-' + id
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
    ['overview', 'Make room for the whole experience.', '#132F3E', '#F6F5EF', '#D7B46F'],
    ['departments', 'Three departments. One shared model.', '#F5F1E8', '#234653', '#97653A'],
    ['decision', 'Discuss the scope before committing.', '#244F4A', '#F5F8F1', '#BCD6B5'],
  ].map(([id, title, bg, ink, accent]) => {
    const elements = [
      slideText(id, 'kicker', 'AURORA / COMMUNITY EXHIBITION / PLANNING REVIEW', 40, 28, 1120, 26, 14, accent),
      slideText(id, 'title', title, 40, 82, 1120, 66, 36, ink),
      slideText(
        id,
        'footer',
        'Original fictional model / June 2029 / Live values from Department plan',
        40,
        626,
        1120,
        24,
        12,
        accent,
      ),
    ]
    if (id === 'overview')
      elements.push(
        ...slideCard(id, 'total', 'ALLOCATED / ALL DEPARTMENTS', 40, 210, 535, '#DDEDE8', '#245B55'),
        ...slideCard(id, 'remaining', 'UNALLOCATED / ROOM TO DISCUSS', 615, 210, 535, '#F9EACD', '#8B602F'),
        slideText(
          id,
          'note',
          'An input belongs in the Sheet. Its explanation belongs in the brief. The review deck and allocation map keep the same numbers in view.',
          44,
          426,
          1070,
          116,
          24,
          ink,
        ),
      )
    if (id === 'departments') {
      DEPARTMENTS.forEach(([name, , purpose, fill, color], i) =>
        elements.push(
          ...slideCard(id, name.toLowerCase(), name.toUpperCase(), 40 + i * 380, 206, 355, fill, color),
          slideText(id, 'purpose-' + i, purpose, 44 + i * 380, 378, 340, 92, 20, ink),
        ),
      )
      elements.push(
        ...slideCard(id, 'share', 'ACCESS / SHARE OF TOTAL', 40, 474, 355, '#F9EACD', '#8B602F'),
        slideText(
          id,
          'question',
          'If Access grows, which other assumptions need another conversation?',
          430,
          500,
          680,
          95,
          26,
          ink,
        ),
      )
    }
    if (id === 'decision')
      elements.push(
        ...slideCard(id, 'signal', 'MODEL SIGNAL / NOT AN APPROVAL', 40, 210, 645, '#E0EBE1', '#245B55'),
        ...slideCard(id, 'ceiling', 'PLANNING CEILING', 725, 210, 425, '#F9EACD', '#8B602F'),
        slideText(
          id,
          'checklist',
          '01  Compare the department mix.\n02  Read what the budget enables.\n03  Agree what remains out of scope.',
          48,
          421,
          1070,
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
      elements: Object.fromEntries(elements.map((element) => [element.id, element])),
      elementOrder: elements.map((element) => element.id),
      speakerNotes:
        'Return to the Department plan tab to edit the source. Every numeric card is a native Formula Shape, not a copied value.',
    }
  })
  return {
    id: SLIDES_ID,
    name: 'Aurora / Review deck',
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1200, height: 675 },
    slides: Object.fromEntries(pages.map((page) => [page.id, page])),
    slideOrder: pages.map((page) => page.id),
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
    boardText('title', 'AURORA / FOLLOW THE ALLOCATION', 40, 24, 1120, 56, 30, '#173F4E'),
    boardText('subtitle', 'One source, three departments, a shared planning ceiling.', 44, 90, 1110, 30, 17, '#526C78'),
    ...boardCard('total', 'TOTAL ALLOCATION / SHARED MODEL', 390, 160, 420, '#DDEDE8', '#245B55'),
  ]
  DEPARTMENTS.forEach(([name, , purpose, fill, ink], i) =>
    shapes.push(
      ...boardCard(name.toLowerCase(), name.toUpperCase(), 40 + 390 * i, 390, 340, fill, ink),
      boardText('purpose-' + i, purpose, 56 + 390 * i, 540, 315, 94, 18, '#36576A'),
    ),
  )
  shapes.push(
    ...boardCard('remaining', 'UNALLOCATED / NOT A RESERVE PROMISE', 40, 695, 530, '#F9EACD', '#8B602F'),
    ...boardCard('signal', 'REVIEW SIGNAL', 625, 695, 530, '#E0ECEF', '#173F4E'),
    boardText(
      'footer',
      'Move and annotate the native shapes. Their formulas keep reading Department plan.',
      44,
      873,
      1100,
      42,
      16,
      '#526C78',
    ),
  )
  const connectors = DEPARTMENTS.map(([name, , , , ink]) =>
    createBoardConnectorElement({
      id: 'allocation-to-' + name.toLowerCase(),
      start: { kind: 'shapeSite', shapeId: 'total-panel', connectionSiteId: 2 },
      end: { kind: 'shapeSite', shapeId: name.toLowerCase() + '-panel', connectionSiteId: 0 },
      routing: 'orthogonal',
      routingMode: 'auto',
      style: { stroke: ink, strokeWidth: 2, endMarker: { type: 'filledArrow' } },
    }),
  )
  const elements = [...connectors, ...shapes]
  return {
    id: BOARD_ID,
    name: 'Aurora / Allocation map',
    appVersion: '1.0.0-beta.2',
    defaultPageSize: { width: 1200, height: 950 },
    pageOrder: ['allocation'],
    activePageId: 'allocation',
    pages: {
      allocation: {
        id: 'allocation',
        name: 'Allocation discussion',
        pageType: BoardPageType.Page,
        elements: Object.fromEntries(elements.map((element) => [element.id, element])),
        elementOrder: elements.map((element) => element.id),
      },
    },
  }
}
