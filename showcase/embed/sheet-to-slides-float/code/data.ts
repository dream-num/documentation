import type { IWorkbookData } from '@univerjs/core'
import { ShapeFillEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { createFormulaShapeData } from '@univerjs-pro/shape-editor'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum, type ISlideData } from '@univerjs-pro/slides'
import { CellValueType, LocaleType, RichTextBuilder } from '@univerjs/core'

export const HOST_ID = 'lumen-launch-deck'
export const SHEET_UNIT_ID = 'lumen-pricing-model'
export const SHEET_ID = 'pricing'
export const SHEET_NAME = 'Lumen Pricing'
const reference = (cell: string) => "'[Lumen Pricing]Launch model'!" + cell
export const FORMULA_CARDS = [
  { page: 'pricing', id: 'revenue', expression: reference('D5'), format: '$#,##0' },
  { page: 'pricing', id: 'units', expression: reference('B5'), format: '#,##0' },
  { page: 'economics', id: 'variable', expression: reference('D6'), format: '$#,##0' },
  { page: 'economics', id: 'fixed', expression: reference('B8'), format: '$#,##0' },
  { page: 'economics', id: 'contribution', expression: reference('D7'), format: '$#,##0' },
  { page: 'economics', id: 'margin', expression: reference('D8'), format: '0.00%' },
  { page: 'decision', id: 'breakeven', expression: reference('D9'), format: '#,##0' },
  { page: 'decision', id: 'headroom', expression: reference('D10'), format: '+#,##0;-#,##0;0' },
  { page: 'decision', id: 'revenue-repeat', expression: reference('D5'), format: '$#,##0' },
]
export function createSheetData(): Partial<IWorkbookData> {
  return {
    id: SHEET_UNIT_ID,
    name: SHEET_NAME,
    appVersion: '1.0.0-rc.0',
    locale: LocaleType.EN_US,
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 21, bl: 1, cl: { rgb: '#22365F' } },
      muted: { fs: 11, cl: { rgb: '#536078' } },
      header: { bg: { rgb: '#DFE8F7' }, bl: 1, cl: { rgb: '#22365F' } },
      input: { bg: { rgb: '#FAE8C2' }, n: { pattern: '#,##0' } },
      money: { bg: { rgb: '#DBF1EA' }, n: { pattern: '$#,##0' } },
      count: { bg: { rgb: '#DFE8F7' }, n: { pattern: '#,##0' } },
      percent: { bg: { rgb: '#E9DFF4' }, n: { pattern: '0.00%' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Launch model',
        rowCount: 18,
        columnCount: 4,
        defaultRowHeight: 27,
        defaultColumnWidth: 100,
        rowData: { 0: { h: 40 } },
        columnData: { 0: { w: 172 }, 1: { w: 100 }, 2: { w: 185 }, 3: { w: 105 } },
        mergeData: [0, 1, 12, 14, 16].map((r) => ({ startRow: r, endRow: r, startColumn: 0, endColumn: 3 })),
        cellData: {
          0: { 0: { v: 'LUMEN / First light collection', s: 'title' } },
          1: { 0: { v: 'Original fictional desk-lamp launch / USD / September 2029', s: 'muted' } },
          3: Object.fromEntries(
            ['Assumption', 'Input', 'Calculation', 'Result'].map((v, i) => [i, { v, s: 'header' }]),
          ),
          4: {
            0: { v: 'Launch units' },
            1: { v: 240, t: CellValueType.NUMBER, s: 'input' },
            2: { v: 'Revenue' },
            3: { f: '=B5*B6', s: 'money' },
          },
          5: {
            0: { v: 'Selling price' },
            1: { v: 45, t: CellValueType.NUMBER, s: 'input' },
            2: { v: 'Variable cost' },
            3: { f: '=B5*B7', s: 'money' },
          },
          6: {
            0: { v: 'Unit cost' },
            1: { v: 18, t: CellValueType.NUMBER, s: 'input' },
            2: { v: 'Launch contribution' },
            3: { f: '=D5-D6-B8', s: 'money' },
          },
          7: {
            0: { v: 'Fixed launch cost' },
            1: { v: 3600, t: CellValueType.NUMBER, s: 'input' },
            2: { v: 'Contribution margin' },
            3: { f: '=D7/D5', s: 'percent' },
          },
          8: { 2: { v: 'Break-even units' }, 3: { f: '=ROUNDUP(B8/(B6-B7),0)', s: 'count' } },
          9: { 2: { v: 'Units above break-even' }, 3: { f: '=B5-D9', s: 'count' } },
          12: { 0: { v: 'Amber inputs -> native Sheet formulas -> three Slides pages', s: 'muted' } },
          14: { 0: { v: 'Break-even assumes selling price exceeds unit cost.', s: 'muted' } },
          16: { 0: { v: 'Illustrative only / excludes taxes, returns and financing', s: 'muted' } },
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
    ['pricing', 'Price the first production run.', '#F6F2E9', '#22365F', '#8B641D'],
    ['economics', 'Revenue is only the beginning.', '#101A34', '#F5F7FF', '#58C8FF'],
    ['decision', 'Know the line before you launch.', '#163A39', '#F5F7FF', '#50C8B0'],
  ] as const
  const pages = specs.map(([id, title, bg, ink, accent]) => {
    const elements = [
      text(id, 'kicker', 'LUMEN / FIRST LIGHT COLLECTION / ' + id.toUpperCase(), 40, 24, 1120, 28, 14, accent),
      text(id, 'title', title, 40, 78, 1120, 65, 38, ink),
      text(
        id,
        'footer',
        'Original fictional launch / Sheet -> native Formula Shapes / Frontend only',
        40,
        630,
        1120,
        26,
        12,
        accent,
      ),
    ]
    if (id === 'pricing')
      elements.push(
        ...card(id, 'revenue', 'LAUNCH REVENUE', 800, 178, 360, '#DBF1EA', '#245B50'),
        ...card(id, 'units', 'PLANNED UNITS', 800, 340, 360, '#DFE8F7', '#22365F'),
        text(id, 'explain', 'Edit the amber inputs.\nPrice 45 -> 48: +$720.', 800, 510, 360, 86, 20, ink),
      )
    if (id === 'economics')
      elements.push(
        ...card(id, 'variable', 'VARIABLE / Units x unit cost', 40, 190, 535, '#D8ECF6', '#22365F'),
        ...card(id, 'fixed', 'FIXED / Launch preparation', 625, 190, 535, '#FAE8C2', '#76521F'),
        ...card(id, 'contribution', 'REVENUE - ALL LAUNCH COSTS', 40, 365, 535, '#DBF1EA', '#245B50'),
        ...card(id, 'margin', 'CONTRIBUTION / REVENUE', 625, 365, 535, '#E9DFF4', '#654B83'),
        text(
          id,
          'explain',
          'Change unit cost: revenue stays fixed. Change volume: fixed cost stays fixed.',
          40,
          550,
          1120,
          50,
          22,
          ink,
        ),
      )
    if (id === 'decision')
      elements.push(
        ...card(id, 'breakeven', 'BREAK-EVEN / Whole units', 40, 195, 535, '#DBF1EA', '#245B50'),
        ...card(id, 'headroom', 'PLANNED UNITS - BREAK-EVEN', 625, 195, 535, '#FAE8C2', '#76521F'),
        ...card(id, 'revenue-repeat', 'SAME SOURCE / Repeated revenue', 40, 380, 535, '#D8ECF6', '#22365F'),
        text(
          id,
          'explain',
          'One source, three pages.\n\nZero sales still incur fixed cost. A zero price-cost spread cannot recover the launch cost; native formulas expose the error.',
          625,
          385,
          535,
          210,
          23,
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
        'Edit the real pricing Sheet on page one. Inspect every page. Numeric results are native Formula Shapes, never copied text. Break-even is meaningful only for a positive unit spread.',
    }
  })
  return {
    id: HOST_ID,
    name: 'Lumen / Launch economics',
    appVersion: '1.0.0-rc.0',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1200, height: 675 },
    slides: Object.fromEntries(pages.map((p) => [p.id, p])),
    slideOrder: pages.map((p) => p.id),
    activeSlideId: 'pricing',
  }
}
