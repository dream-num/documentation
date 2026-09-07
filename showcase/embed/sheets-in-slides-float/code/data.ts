import type { IWorkbookData } from '@univerjs/core'
import { ShapeFillEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum, type ISlideData } from '@univerjs-pro/slides'
import { LocaleType, RichTextBuilder } from '@univerjs/core'

export const HOST_ID = 'tamar-quarterly-review'
export const CHILD_ID = 'tamar-revenue-assumptions'
export const PAGE_ID = 'review'
export const SHEET_ID = 'channels'

type SlideElement = ISlideData['slides'][string]['elements'][string]
function text(
  id: string,
  value: string,
  left: number,
  top: number,
  width: number,
  height: number,
  size: number,
  color: string,
  bold = false,
): SlideElement {
  const doc = RichTextBuilder.create().span(value, { fontSize: size, color, bold }).getData()
  doc.id = `${id}-text`
  doc.documentStyle = { ...doc.documentStyle, textStyle: { ff: 'Arial' } }
  doc.body?.paragraphs?.forEach((paragraph, index) => {
    paragraph.paragraphId = `${id}-p-${index}`
  })
  doc.body?.sectionBreaks?.forEach((section, index) => {
    section.sectionId = `${id}-s-${index}`
  })
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform: { left, top, width, height, rotation: 0 },
    shapeData: {
      shapeType: ShapeTypeEnum.Rect,
      fill: { fillType: ShapeFillEnum.NoFill },
      stroke: { color: 'transparent', width: 0 },
      shapeText: { dataModel: { doc } },
    },
  }
}
function panel(id: string, left: number, top: number, width: number, height: number, color: string): SlideElement {
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform: { left, top, width, height, rotation: 0 },
    shapeData: { shapeType: ShapeTypeEnum.Rect, fill: { color }, stroke: { color, width: 0 } },
  }
}
function slide(id: string, name: string, background: string, elements: SlideElement[]): ISlideData['slides'][string] {
  return {
    id,
    name,
    pageType: PageTypeEnum.Slide,
    background: { type: SlideBackgroundTypeEnum.Solid, color: background },
    elements: Object.fromEntries(elements.map((element) => [element.id, element])),
    elementOrder: elements.map((element) => element.id),
    speakerNotes:
      'Original fictional print-studio scenario. The presentation and workbook are independent; changing assumptions does not approve production.',
  }
}

export function createHostData(): ISlideData {
  const pages = [
    slide(PAGE_ID, 'Quarterly assumptions', '#F7F3EF', [
      panel('review-rule', 40, 34, 62, 5, '#9067A5'),
      text('review-kicker', 'TAMAR / INDEPENDENT PRINT STUDIO / Q4 2027', 40, 53, 910, 32, 13, '#795783', true),
      text('review-title', 'Test the demand. Keep the margin.', 40, 94, 915, 54, 32, '#362D46', true),
      text('review-question', 'What is worth\nprinting next?', 40, 174, 275, 90, 30, '#362D46', true),
      text(
        'review-body',
        'Three revenue lines.\nOne editable model.\nNo committed orders.',
        40,
        286,
        270,
        100,
        19,
        '#675D6E',
      ),
      panel('decision-label', 40, 406, 260, 54, '#E6DDEB'),
      text('review-decision', 'DECISION / STILL OPEN', 53, 421, 237, 28, 14, '#634474', true),
      text(
        'review-caption',
        'Activate the model. Change units. Expand for sensitivity.',
        340,
        503,
        620,
        32,
        14,
        '#795783',
      ),
      text(
        'review-footer',
        'Original fictional assumptions / USD / 15 September 2027 / Owner: Elena Park',
        40,
        539,
        920,
        24,
        11,
        '#817588',
      ),
    ]),
    slide('drivers', 'Three different economics', '#30253E', [
      text('drivers-kicker', '02 / DO NOT TREAT EVERY SALE THE SAME', 40, 35, 900, 30, 13, '#CAB4D6', true),
      text('drivers-title', 'Three different economics.', 40, 88, 920, 64, 36, '#FAF6F1', true),
      panel('direct-card', 40, 189, 286, 237, '#493653'),
      panel('shops-card', 356, 189, 286, 237, '#334D50'),
      panel('sessions-card', 672, 189, 286, 237, '#5A443B'),
      text('direct-name', 'DIRECT EDITIONS', 59, 210, 250, 35, 15, '#D7B5E6', true),
      text('direct-metric', '$18 / copy', 59, 263, 250, 57, 30, '#FAF6F1', true),
      text(
        'direct-note',
        '1,600 planned copies\n$6 variable cost per copy\nDemand is not an order.',
        59,
        336,
        250,
        83,
        15,
        '#E5D7ED',
      ),
      text('shops-name', 'BOOKSHOP PARTNERS', 375, 210, 250, 35, 15, '#A8D9D1', true),
      text('shops-metric', '$12 / copy', 375, 263, 250, 57, 30, '#FAF6F1', true),
      text(
        'shops-note',
        '900 planned copies\n$5 variable cost per copy\nWholesale terms are draft.',
        375,
        336,
        250,
        83,
        15,
        '#D4E9E5',
      ),
      text('sessions-name', 'PRINT WORKSHOPS', 691, 210, 250, 35, 15, '#EBC3A0', true),
      text('sessions-metric', '$45 / seat', 691, 263, 250, 57, 30, '#FAF6F1', true),
      text(
        'sessions-note',
        '144 planned seats\n$17 variable cost per seat\nAttendance needs testing.',
        691,
        336,
        250,
        83,
        15,
        '#F0DFD0',
      ),
      text(
        'drivers-footer',
        'Narrative values are the authored baseline, not live Formula Shapes. Review the workbook before deciding.',
        40,
        478,
        915,
        61,
        15,
        '#D2C1DB',
      ),
    ]),
    slide('gates', 'Evidence before a print run', '#E9F2EF', [
      text('gates-kicker', '03 / A RELEASE GATE, NOT A SALES TARGET', 40, 35, 920, 30, 13, '#3D776E', true),
      text('gates-title', 'Evidence before a print run.', 40, 88, 920, 65, 36, '#294E49', true),
      panel('gate-line', 60, 197, 5, 232, '#9FC9BE'),
      text('gate-one', '01 / Elena validates demand', 102, 185, 820, 42, 25, '#294E49', true),
      text(
        'gate-one-note',
        'Compare direct interest, bookshop feedback and workshop waitlists.',
        102,
        231,
        820,
        36,
        18,
        '#516B65',
      ),
      text('gate-two', '02 / Malik checks the margin', 102, 280, 820, 42, 25, '#294E49', true),
      text(
        'gate-two-note',
        'Stress volume by 15%. Keep quarterly fixed costs at $18,000.',
        102,
        326,
        820,
        36,
        18,
        '#516B65',
      ),
      text('gate-three', '03 / Jo schedules only after review', 102, 375, 820, 42, 25, '#294E49', true),
      text(
        'gate-three-note',
        'Approve quantity and timing separately. No order is sent by this demo.',
        102,
        421,
        820,
        36,
        18,
        '#516B65',
      ),
      text(
        'gates-footer',
        'Editing the model does not change the decision label. Reload loses all local edits.',
        40,
        514,
        920,
        30,
        13,
        '#3D776E',
      ),
    ]),
  ]
  return {
    id: HOST_ID,
    name: 'Tamar / Quarterly assumptions',
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1000, height: 562.5 },
    slides: Object.fromEntries(pages.map((page) => [page.id, page])),
    slideOrder: pages.map((page) => page.id),
    activeSlideId: PAGE_ID,
  }
}

const CHANNELS = [
  ['Direct editions', 1600, 18, 6],
  ['Bookshop partners', 900, 12, 5],
  ['Print workshops', 144, 45, 17],
] as const

export function createChildData(): Partial<IWorkbookData> {
  const cells: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'TAMAR / Quarterly revenue assumptions', s: 'title' } },
    1: { 0: { v: 'Fictional planning model / USD / cream cells are inputs', s: 'muted' } },
    3: {
      0: { v: 'Channel', s: 'header' },
      1: { v: 'Units', s: 'header' },
      2: { v: 'Price', s: 'header' },
      3: { v: 'Cost/unit', s: 'header' },
      4: { v: 'Revenue', s: 'header' },
      5: { v: 'Contribution', s: 'header' },
    },
    8: { 0: { v: 'Total', s: 'header' }, 4: { f: '=SUM(E5:E7)', s: 'total' }, 5: { f: '=SUM(F5:F7)', s: 'total' } },
    10: { 0: { v: 'Fixed costs', s: 'body' }, 5: { v: 18000, s: 'inputMoney' } },
    11: { 0: { v: 'Operating result', s: 'header' }, 5: { f: '=F9-F11', s: 'total' } },
    14: { 0: { v: 'Contribution = revenue less variable costs. Fixed costs apply once per quarter.', s: 'muted' } },
    16: { 0: { v: 'The slide decision stays open. This is not tax, cash-flow or order fulfillment.', s: 'muted' } },
  }
  CHANNELS.forEach(([name, units, price, cost], index) => {
    const row = index + 4
    cells[row] = {
      0: { v: name, s: index % 2 ? 'stripe' : 'body' },
      1: { v: units, s: 'input' },
      2: { v: price, s: 'inputMoney' },
      3: { v: cost, s: 'inputMoney' },
      4: { f: `=B${row + 1}*C${row + 1}`, s: 'money' },
      5: { f: `=B${row + 1}*(C${row + 1}-D${row + 1})`, s: 'money' },
    }
  })
  return {
    id: CHILD_ID,
    name: 'Tamar / Revenue assumptions',
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-beta.2',
    sheetOrder: [SHEET_ID, 'sensitivity'],
    styles: {
      title: { fs: 18, bl: 1, cl: { rgb: '#634474' } },
      header: { bg: { rgb: '#E6DDEB' }, cl: { rgb: '#634474' }, bl: 1 },
      body: { cl: { rgb: '#4C4255' } },
      stripe: { bg: { rgb: '#F4EFF6' }, cl: { rgb: '#4C4255' } },
      muted: { fs: 10, cl: { rgb: '#7D7187' } },
      input: { bg: { rgb: '#FAEDCD' }, n: { pattern: '#,##0' }, cl: { rgb: '#825F32' } },
      inputMoney: { bg: { rgb: '#FAEDCD' }, n: { pattern: '#,##0.00' }, cl: { rgb: '#825F32' } },
      money: { n: { pattern: '#,##0.00' }, cl: { rgb: '#4C4255' } },
      total: { n: { pattern: '#,##0.00' }, bg: { rgb: '#DCEDE5' }, bl: 1, cl: { rgb: '#386E60' } },
      percent: { bg: { rgb: '#FAEDCD' }, n: { pattern: '0%' }, cl: { rgb: '#825F32' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Channels',
        rowCount: 30,
        columnCount: 8,
        defaultRowHeight: 24,
        defaultColumnWidth: 90,
        columnData: { 0: { w: 150 }, 1: { w: 65 }, 2: { w: 70 }, 3: { w: 70 }, 4: { w: 90 }, 5: { w: 110 } },
        cellData: cells,
        mergeData: [0, 1, 14, 16].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 5 })),
      },
      sensitivity: {
        id: 'sensitivity',
        name: 'Sensitivity',
        rowCount: 25,
        columnCount: 7,
        defaultRowHeight: 34,
        defaultColumnWidth: 110,
        columnData: { 0: { w: 180 }, 1: { w: 110 }, 2: { w: 125 }, 3: { w: 125 }, 4: { w: 210 } },
        cellData: {
          0: { 0: { v: 'TAMAR / Volume changes, costs remain', s: 'title' } },
          2: {
            0: { v: 'Scenario', s: 'header' },
            1: { v: 'Volume', s: 'header' },
            2: { v: 'Revenue', s: 'header' },
            3: { v: 'Result', s: 'header' },
            4: { v: 'Interpretation', s: 'header' },
          },
          3: {
            0: { v: 'Lower demand', s: 'body' },
            1: { v: 0.85, s: 'percent' },
            2: { f: '=ROUND(Channels!E9*B4,2)', s: 'money' },
            3: { f: '=ROUND(Channels!F9*B4-Channels!F11,2)', s: 'money' },
            4: { v: '15% fewer units across all lines', s: 'muted' },
          },
          4: {
            0: { v: 'Working case', s: 'stripe' },
            1: { v: 1, s: 'percent' },
            2: { f: '=ROUND(Channels!E9*B5,2)', s: 'money' },
            3: { f: '=ROUND(Channels!F9*B5-Channels!F11,2)', s: 'total' },
            4: { v: 'Current channel assumptions', s: 'muted' },
          },
          5: {
            0: { v: 'Higher demand', s: 'body' },
            1: { v: 1.15, s: 'percent' },
            2: { f: '=ROUND(Channels!E9*B6,2)', s: 'money' },
            3: { f: '=ROUND(Channels!F9*B6-Channels!F11,2)', s: 'money' },
            4: { v: '15% more units; no capacity test', s: 'muted' },
          },
          8: {
            0: {
              v: 'Price, unit cost and fixed costs stay unchanged. These are scenarios, not forecasts.',
              s: 'muted',
            },
          },
          10: {
            0: { v: 'All figures and names are original fictional content. No backend or sales order.', s: 'muted' },
          },
        },
        mergeData: [0, 8, 10].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 4 })),
      },
    },
  }
}
