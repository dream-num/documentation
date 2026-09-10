import type { IBoardData } from '@univerjs-pro/boards'
import type { IWorkbookData } from '@univerjs/core'
import { BoardPageType, createBoardTextBoxShapeElement } from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { BooleanNumber, HorizontalAlign, LocaleType, VerticalAlign } from '@univerjs/core'

export const HOST_ID = 'ripple-repair-workshop'
export const CHILD_ID = 'ripple-workshop-budget'
export const PAGE_ID = 'planning'
export const SHEET_ID = 'budget'

function boardCard(
  id: string,
  value: string,
  left: number,
  top: number,
  width: number,
  height: number,
  size: number,
  color: string,
  fill?: string,
  bold = false,
) {
  const shape = createBoardTextBoxShapeElement({
    id,
    text: value,
    left,
    top,
    width,
    height,
    horizontalAlign: HorizontalAlign.LEFT,
    verticalAlign: VerticalAlign.MIDDLE,
    textWrap: ShapeTextWrapType.Square,
    textStyle: { ff: 'Arial', fs: size, bl: bold ? BooleanNumber.TRUE : BooleanNumber.FALSE, cl: { rgb: color } },
  })
  shape.shapeData.shapeType = ShapeTypeEnum.Rect
  shape.shapeData.fill = fill ? { fillType: ShapeFillEnum.SolidFill, color: fill } : { fillType: ShapeFillEnum.NoFill }
  shape.shapeData.stroke = { color: 'transparent', width: 0 }
  // Decorative lane backgrounds must not render the SDK's empty-text placeholder.
  if (!value) {
    delete shape.shapeData.shapeText
    shape.shapeData.isTextBox = false
  }
  return shape
}

export function createHostData(): IBoardData {
  const elements = [
    boardCard('title-band', '', 90, 45, 1330, 130, 12, '#182D2B', '#182D2B'),
    boardCard('workshop-title', 'RIPPLE / MAKE ROOM FOR REPAIR', 115, 63, 1260, 65, 29, '#E6F3B4', undefined, true),
    boardCard(
      'workshop-subtitle',
      'A fictional 24-person pilot / 4 tables / 2 facilitators / 12 February 2028',
      118,
      132,
      1250,
      30,
      14,
      '#E6EEDB',
    ),
    boardCard(
      'listen',
      '01 / LISTEN FIRST\n10 minutes to name a repair need.',
      110,
      225,
      345,
      118,
      19,
      '#273C37',
      '#E5EECB',
    ),
    boardCard(
      'practice',
      '02 / TRY TOGETHER\n35 minutes at four repair tables.',
      110,
      370,
      345,
      118,
      19,
      '#33423E',
      '#E1EEE9',
    ),
    boardCard(
      'share',
      '03 / SHARE THE LEARNING\n15 minutes to record next steps.',
      110,
      515,
      345,
      118,
      19,
      '#573F31',
      '#F4DFCB',
    ),
    boardCard(
      'decision-note',
      'READY TO TEST?\nConfirm access support first.',
      110,
      668,
      345,
      98,
      16,
      '#253A34',
      '#E6F3B4',
      true,
    ),
    boardCard(
      'model-caption',
      'BUDGET / double-click to edit; expand for reserve scenarios',
      510,
      173,
      890,
      34,
      13,
      '#48634E',
      undefined,
      true,
    ),
    boardCard(
      'board-footer',
      'Planning is not booking. The notes and budget are independent; changing a cell does not approve the event.',
      115,
      822,
      1285,
      60,
      14,
      '#5C7068',
    ),
  ]
  return {
    id: HOST_ID,
    name: 'Ripple / The repair workshop',
    appVersion: '1.0.0-rc.0',
    defaultPageSize: { width: 1500, height: 950 },
    pageOrder: [PAGE_ID],
    activePageId: PAGE_ID,
    pages: {
      [PAGE_ID]: {
        id: PAGE_ID,
        name: 'Listen, repair, reflect',
        pageType: BoardPageType.Page,
        elements: Object.fromEntries(elements.map((el) => [el.id, el])),
        elementOrder: elements.map((el) => el.id),
      },
    },
  }
}

const COSTS = [
  ['Repair materials', 24, 18, 'Include six spare kits if needed'],
  ['Facilitator sessions', 2, 160, 'Two original fictional facilitators'],
  ['Venue hours', 4, 55, 'Setup and cleanup are included'],
  ['Access support', 1, 120, 'Confirm the arrangement before inviting'],
  ['Refreshments', 24, 6, 'One portion per planned attendee'],
  ['Printed guides', 24, 3, 'Plain-language handout'],
  ['Tool care', 1, 45, 'Inspect before and after use'],
  ['Travel support', 4, 20, 'Four indicative travel allowances'],
] as const

export function createChildData(): Partial<IWorkbookData> {
  const cells: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'RIPPLE / Workshop budget', s: 'title' } },
    1: { 0: { v: 'Fictional local planning / USD / yellow cells are inputs', s: 'muted' } },
    3: {
      0: { v: 'Cost item', s: 'header' },
      1: { v: 'Units', s: 'header' },
      2: { v: 'Unit cost', s: 'header' },
      3: { v: 'Note', s: 'header' },
      4: { v: 'Amount', s: 'header' },
    },
    13: { 0: { v: 'Direct costs', s: 'header' }, 4: { f: '=SUM(E5:E12)', s: 'money' } },
    14: { 0: { v: 'Reserve', s: 'body' }, 1: { v: 0.1, s: 'percent' }, 4: { f: '=ROUND(E14*B15,2)', s: 'money' } },
    15: { 0: { v: 'Planned total', s: 'header' }, 4: { f: '=ROUND(SUM(E14:E15),2)', s: 'total' } },
    17: { 0: { v: 'Spending ceiling', s: 'body' }, 4: { v: 1800, s: 'inputMoney' } },
    18: { 0: { v: 'Room remaining', s: 'header' }, 4: { f: '=ROUND(E18-E16,2)', s: 'total' } },
    20: { 0: { v: 'Spare materials can change without changing attendance. Nothing is purchased.', s: 'muted' } },
    22: { 0: { v: 'Compare reserve rates in Sensitivity. Reload loses local edits.', s: 'muted' } },
  }
  COSTS.forEach(([name, units, rate, note], index) => {
    const row = index + 4
    cells[row] = {
      0: { v: name, s: index % 2 ? 'stripe' : 'body' },
      1: { v: units, s: 'input' },
      2: { v: rate, s: 'inputMoney' },
      3: { v: note, s: 'muted' },
      4: { f: `=B${row + 1}*C${row + 1}`, s: 'money' },
    }
  })
  return {
    id: CHILD_ID,
    name: 'Ripple / Workshop budget',
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-rc.0',
    sheetOrder: [SHEET_ID, 'sensitivity'],
    styles: {
      title: { fs: 18, bl: 1, cl: { rgb: '#253C32' } },
      header: { bg: { rgb: '#E5EECB' }, cl: { rgb: '#253C32' }, bl: 1 },
      body: { cl: { rgb: '#33443C' } },
      stripe: { bg: { rgb: '#F0F5ED' }, cl: { rgb: '#33443C' } },
      muted: { fs: 10, cl: { rgb: '#627268' } },
      input: { bg: { rgb: '#FFF2CA' }, n: { pattern: '#,##0' }, cl: { rgb: '#755B28' } },
      inputMoney: { bg: { rgb: '#FFF2CA' }, n: { pattern: '#,##0.00' }, cl: { rgb: '#755B28' } },
      money: { n: { pattern: '#,##0.00' }, cl: { rgb: '#33443C' } },
      total: { bg: { rgb: '#DDEBDD' }, n: { pattern: '#,##0.00' }, bl: 1, cl: { rgb: '#294D39' } },
      percent: { bg: { rgb: '#FFF2CA' }, n: { pattern: '0%' }, cl: { rgb: '#755B28' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Budget',
        rowCount: 32,
        columnCount: 7,
        defaultRowHeight: 25,
        defaultColumnWidth: 100,
        columnData: { 0: { w: 185 }, 1: { w: 62 }, 2: { w: 82 }, 3: { w: 300 }, 4: { w: 110 } },
        cellData: cells,
        mergeData: [0, 1, 20, 22].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 4 })),
      },
      sensitivity: {
        id: 'sensitivity',
        name: 'Sensitivity',
        rowCount: 24,
        columnCount: 7,
        defaultRowHeight: 34,
        defaultColumnWidth: 110,
        columnData: { 0: { w: 180 }, 1: { w: 90 }, 2: { w: 120 }, 3: { w: 120 }, 4: { w: 160 } },
        cellData: {
          0: { 0: { v: 'RIPPLE / Reserve is a choice', s: 'title' } },
          2: {
            0: { v: 'Scenario', s: 'header' },
            1: { v: 'Reserve', s: 'header' },
            2: { v: 'Planned', s: 'header' },
            3: { v: 'Remaining', s: 'header' },
            4: { v: 'Ceiling check', s: 'header' },
          },
          ...Object.fromEntries(
            [
              ['Lean reserve', 0.05],
              ['Working reserve', 0.1],
              ['Cautious reserve', 0.2],
            ].map(([name, rate], index) => {
              const row = index + 3
              return [
                row,
                {
                  0: { v: name, s: 'body' },
                  1: { v: rate, s: 'percent' },
                  2: { f: `=ROUND(Budget!E14*(1+B${row + 1}),2)`, s: 'money' },
                  3: { f: `=ROUND(Budget!E18-C${row + 1},2)`, s: 'total' },
                  4: { f: `=IF(D${row + 1}<0,"Above cap","Within cap")`, s: 'body' },
                },
              ]
            }),
          ),
          8: { 0: { v: 'Same direct costs and ceiling; only the reserve rate changes.', s: 'muted' } },
          10: { 0: { v: 'Negative remaining room is a discussion signal, not an approval.', s: 'muted' } },
        },
        mergeData: [0, 8, 10].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 4 })),
      },
    },
  }
}
