import type { IWorkbookData } from '@univerjs/core'
import { ShapeFillEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum, type ISlideData } from '@univerjs-pro/slides'
import { LocaleType, RichTextBuilder } from '@univerjs/core'

export const HOST_ID = 'marigold-monthly-review'
export const CHILD_ID = 'marigold-board-deck'
export const SHEET_ID = 'cost-ledger'
export const COSTS = [
  ['Studio lease', 7400, 7400, 'Facilities'],
  ['Access team', 12600, 13400, 'Visitor services'],
  ['Teaching materials', 3200, 3650, 'Learning'],
  ['Energy and upkeep', 2800, 2420, 'Facilities'],
  ['Resident artists', 9600, 9600, 'Programme'],
  ['Neighbourhood outreach', 2100, 1860, 'Community'],
  ['Live captioning', 1800, 2250, 'Access'],
  ['Operating reserve', 2500, 1900, 'Finance'],
] as const

export function createHostData(): Partial<IWorkbookData> {
  const cellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'MARIGOLD / Monthly review', s: 'title' } },
    1: { 0: { v: 'Community arts centre · October 2027 · fictional USD costs', s: 'muted' } },
    3: Object.fromEntries(
      ['Operating line', 'Plan', 'Actual', 'Variance', 'Owner'].map((v, i) => [i, { v, s: 'header' }]),
    ),
    13: {
      0: { v: 'Monthly total', s: 'header' },
      1: { f: '=SUM(B5:B12)', s: 'total' },
      2: { f: '=SUM(C5:C12)', s: 'total' },
      3: { f: '=C14-B14', s: 'variance' },
    },
    15: { 0: { v: 'Decision requested', s: 'header' }, 1: { v: 'Reallocate $450 from reserve to live captioning.' } },
    17: { 0: { v: 'Open the Board review tab for the editable decision deck.', s: 'muted' } },
    18: { 0: { v: 'The Assumptions tab documents scope and exclusions.', s: 'muted' } },
  }
  COSTS.forEach(([label, plan, actual, owner], index) => {
    const row = index + 4
    cellData[row] = {
      0: { v: label, s: index % 2 ? 'stripe' : 'body' },
      1: { v: plan, s: 'money' },
      2: { v: actual, s: 'money' },
      3: { f: `=C${row + 1}-B${row + 1}`, s: 'variance' },
      4: { v: owner, s: 'muted' },
    }
  })
  return {
    id: HOST_ID,
    name: 'Marigold / October board pack',
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-beta.2',
    sheetOrder: [SHEET_ID, 'assumptions'],
    styles: {
      title: { fs: 22, bl: 1, cl: { rgb: '#24352C' } },
      header: { bg: { rgb: '#F8E5B7' }, bl: 1, cl: { rgb: '#24352C' } },
      body: { cl: { rgb: '#24352C' } },
      stripe: { bg: { rgb: '#FBF8EF' }, cl: { rgb: '#24352C' } },
      muted: { cl: { rgb: '#657067' } },
      money: { n: { pattern: '"$"#,##0' }, cl: { rgb: '#245F58' } },
      total: { bg: { rgb: '#EDF4EF' }, n: { pattern: '"$"#,##0' }, bl: 1, cl: { rgb: '#245F58' } },
      variance: { n: { pattern: '+"$"#,##0;-"$"#,##0;"—"' }, cl: { rgb: '#815338' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Cost ledger',
        rowCount: 50,
        columnCount: 14,
        defaultRowHeight: 32,
        defaultColumnWidth: 110,
        cellData,
        columnData: { 0: { w: 250 }, 1: { w: 145 }, 2: { w: 145 }, 3: { w: 145 }, 4: { w: 195 } },
        mergeData: [
          { startRow: 0, endRow: 0, startColumn: 0, endColumn: 4 },
          { startRow: 1, endRow: 1, startColumn: 0, endColumn: 4 },
          { startRow: 15, endRow: 15, startColumn: 1, endColumn: 4 },
        ],
      },
      assumptions: {
        id: 'assumptions',
        name: 'Assumptions',
        rowCount: 30,
        columnCount: 10,
        defaultRowHeight: 34,
        defaultColumnWidth: 115,
        columnData: { 0: { w: 220 }, 1: { w: 650 } },
        cellData: {
          0: { 0: { v: 'Review scope', s: 'title' } },
          2: { 0: { v: 'Period', s: 'header' }, 1: { v: '1–31 October 2027; monthly operating costs only.' } },
          3: {
            0: { v: 'Excluded', s: 'header' },
            1: { v: 'Capital refurbishment, restricted grants and ticket revenue.' },
          },
          4: { 0: { v: 'Variance', s: 'header' }, 1: { v: 'Actual minus plan; positive means higher spending.' } },
          5: {
            0: { v: 'Decision', s: 'header' },
            1: { v: '$450 proposed reallocation; the board has not yet approved it.' },
          },
          7: {
            0: { v: 'Data ownership', s: 'header' },
            1: { v: 'The Slides tab is a separate live unit, not merged worksheet content.' },
          },
          8: {
            0: { v: 'Narrative', s: 'header' },
            1: { v: 'Deck figures are authored review notes, not Formula Shape bindings.' },
          },
        },
      },
    },
  }
}

const text = (
  id: string,
  value: string,
  left: number,
  top: number,
  width: number,
  height: number,
  size: number,
  color: string,
  bold = false,
) => {
  const doc = RichTextBuilder.create().span(value, { fontSize: size, color, bold }).getData()
  doc.id = `${id}-doc`
  doc.documentStyle = { ...doc.documentStyle, textStyle: { ff: 'Arial' } }
  doc.body?.paragraphs?.forEach((p, i) => {
    p.paragraphId = `${id}-p${i}`
  })
  doc.body?.sectionBreaks?.forEach((s, i) => {
    s.sectionId = `${id}-s${i}`
  })
  return {
    id,
    type: PageElementTypeEnum.Shape as const,
    transform: { left, top, width, height, rotation: 0 },
    shapeData: {
      shapeType: ShapeTypeEnum.Rect,
      fill: { fillType: ShapeFillEnum.NoFill },
      stroke: { color: 'transparent', width: 0 },
      shapeText: { dataModel: { doc } },
    },
  }
}
const panel = (id: string, left: number, top: number, width: number, height: number, color: string) => ({
  id,
  type: PageElementTypeEnum.Shape as const,
  transform: { left, top, width, height, rotation: 0 },
  shapeData: {
    shapeType: ShapeTypeEnum.Rect,
    fill: { fillType: ShapeFillEnum.Solid, color },
    stroke: { color: 'transparent', width: 0 },
  },
})
export function createChildData(): ISlideData {
  const content = [
    {
      id: 'overview',
      name: 'October / Board review',
      color: '#FBF5E8',
      elements: [
        panel('cover-band', 0, 0, 22, 540, '#D9A53A'),
        text('cover-kicker', 'MARIGOLD / COMMUNITY ARTS CENTRE', 65, 46, 810, 36, 15, '#7E641D'),
        text('cover-title', 'Keep access at the\ncentre of the plan.', 65, 123, 825, 165, 46, '#24352C', true),
        text(
          'cover-summary',
          'October board review\nOperating costs, service quality and one funding decision.',
          68,
          324,
          810,
          96,
          22,
          '#59645C',
        ),
        text('cover-date', '28 OCT 2027  /  ORIGINAL FICTIONAL CASE', 68, 470, 820, 32, 13, '#7E641D'),
      ],
    },
    {
      id: 'costs',
      name: 'Costs / Explain the movement',
      color: '#F2EEFA',
      elements: [
        text('cost-title', 'A small variance. A specific cause.', 55, 48, 850, 64, 34, '#302745', true),
        panel('plan-panel', 55, 156, 270, 142, '#E5DEF3'),
        panel('actual-panel', 345, 156, 270, 142, '#E5DEF3'),
        panel('variance-panel', 635, 156, 270, 142, '#E5DEF3'),
        text('plan-label', 'MONTHLY PLAN', 75, 171, 228, 30, 13, '#665179'),
        text('plan-number', '$42,000', 75, 211, 228, 65, 34, '#302745', true),
        text('actual-label', 'ACTUAL SPEND', 365, 171, 228, 30, 13, '#665179'),
        text('actual-number', '$42,480', 365, 211, 228, 65, 34, '#302745', true),
        text('variance-label', 'ABOVE PLAN', 655, 171, 228, 30, 13, '#665179'),
        text('variance-number', '$480', 655, 211, 228, 65, 34, '#302745', true),
        text(
          'cost-explanation',
          'More access-team hours and captioned workshops.\nLower utility costs and reserve use offset part of the increase.',
          55,
          350,
          850,
          122,
          23,
          '#554968',
        ),
      ],
    },
    {
      id: 'decision',
      name: 'Decision / Protect captioning',
      color: '#FBEAE2',
      elements: [
        text('decision-kicker', 'FOR APPROVAL / NOT YET APPROVED', 55, 48, 850, 32, 14, '#9A513F'),
        text('decision-title', 'Move $450. Keep the door open.', 55, 116, 850, 116, 39, '#51382F', true),
        panel('decision-panel', 55, 254, 850, 172, '#F4D9CC'),
        text(
          'decision-copy',
          'FROM  Operating reserve\nTO  Live captioning for the next workshop cycle\nOWNER  Access lead · review after four sessions',
          80,
          274,
          798,
          132,
          22,
          '#51382F',
        ),
        text(
          'decision-footer',
          'Return to Cost ledger to inspect the numbers; use Assumptions for scope.',
          55,
          468,
          850,
          36,
          16,
          '#8C5848',
        ),
      ],
    },
  ]
  return {
    id: CHILD_ID,
    name: 'Marigold / October board review',
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 960, height: 540 },
    activeSlideId: 'overview',
    slideOrder: content.map((p) => p.id),
    slides: Object.fromEntries(
      content.map((p) => [
        p.id,
        {
          id: p.id,
          name: p.name,
          pageType: PageTypeEnum.Slide,
          background: { type: SlideBackgroundTypeEnum.Solid, color: p.color },
          elements: Object.fromEntries(p.elements.map((element) => [element.id, element])),
          elementOrder: p.elements.map((element) => element.id),
          speakerNotes:
            'Authored review narrative; figures do not update from the host sheet. Formula-linked cases are separate.',
        },
      ]),
    ),
  }
}
