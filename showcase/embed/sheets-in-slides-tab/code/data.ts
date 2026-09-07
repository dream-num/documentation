import type { IWorkbookData } from '@univerjs/core'
import { ShapeFillEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum, type ISlideData } from '@univerjs-pro/slides'
import { LocaleType, RichTextBuilder } from '@univerjs/core'

export const HOST_ID = 'aster-radio-season'
export const CHILD_ID = 'aster-pilot-schedule'
export const PAGE_ID = 'season'
export const SHEET_ID = 'schedule'

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
      'Original fictional community-radio pilot. The deck is an editorial narrative, not live Formula Shapes. No broadcast, booking or payment is performed.',
  }
}

export function createHostData(): ISlideData {
  const pages = [
    slide(PAGE_ID, 'A season worth listening to', '#123B42', [
      panel('season-band', 0, 0, 1000, 12, '#77BEB5'),
      text('season-kicker', 'ASTER RADIO / EIGHT-WEEK PILOT / AUTUMN 2027', 48, 47, 900, 34, 14, '#9ED1C8', true),
      text('season-title', 'Small stories.\nA whole neighbourhood.', 48, 120, 870, 145, 43, '#FAF4E7', true),
      text(
        'season-intro',
        'A community-radio team tests a weekly programme before commissioning a season. The production model lives on its own page.',
        48,
        294,
        620,
        95,
        21,
        '#C7DFDA',
      ),
      panel('season-label', 48, 432, 576, 68, '#22545B'),
      text('season-link', 'OPEN PAGE 2 / Pilot schedule', 65, 451, 542, 36, 21, '#FAF4E7', true),
      text('season-count', '08', 757, 305, 190, 111, 76, '#E6C186', true),
      text('season-count-label', 'weeks, not a renewal', 735, 417, 225, 42, 16, '#C7DFDA'),
      text(
        'season-footer',
        'Original fictional case / 4 October 2027 / Producer: Amira Cole',
        48,
        528,
        890,
        27,
        12,
        '#9ED1C8',
      ),
    ]),
    slide('editorial', 'Three formats, different effort', '#F4EFE5', [
      text('editorial-kicker', '03 / THE EDITORIAL MIX', 48, 43, 904, 30, 14, '#31736C', true),
      text('editorial-title', 'Not every episode takes the same work.', 48, 95, 905, 95, 34, '#173D43', true),
      panel('field-card', 48, 215, 284, 228, '#D5E7DE'),
      panel('interview-card', 357, 215, 284, 228, '#E9D9C0'),
      panel('live-card', 666, 215, 284, 228, '#DDE0EA'),
      text('field-name', 'FIELD DIARY', 67, 239, 245, 34, 17, '#285D52', true),
      text('field-detail', 'Street reporting\nMore editing time\nPermissions first', 67, 303, 245, 124, 17, '#285D52'),
      text('interview-name', 'LOCAL VOICES', 376, 239, 245, 34, 17, '#6D5437', true),
      text(
        'interview-detail',
        'One focused interview\nPrepare the guest\nKeep a backup voice',
        376,
        303,
        245,
        124,
        17,
        '#6D5437',
      ),
      text('live-name', 'OPEN STUDIO', 685, 239, 245, 34, 17, '#4B526B', true),
      text(
        'live-detail',
        'A supervised live show\nReserve studio time\nRehearse handovers',
        685,
        303,
        245,
        124,
        17,
        '#4B526B',
      ),
      text(
        'editorial-footer',
        'Narrative cards are authored context. Edit the appendix to test production hours and costs.',
        48,
        492,
        903,
        54,
        16,
        '#56756F',
      ),
    ]),
    slide('decision', 'Review before renewal', '#E6C186', [
      text('decision-kicker', '04 / COMMISSIONING GATE', 48, 43, 904, 30, 14, '#684B30', true),
      text('decision-title', 'Learn first. Renew later.', 48, 101, 904, 66, 41, '#3C382E', true),
      text('decision-one', '01 / Amira checks capacity', 70, 223, 840, 46, 26, '#3C382E', true),
      text(
        'decision-one-note',
        'Keep studio reservations below 24 hours across the pilot.',
        70,
        272,
        840,
        41,
        19,
        '#68553C',
      ),
      text('decision-two', '02 / Leo checks the envelope', 70, 346, 840, 46, 26, '#3C382E', true),
      text(
        'decision-two-note',
        'Compare production costs with the $3,000 working limit.',
        70,
        395,
        840,
        41,
        19,
        '#68553C',
      ),
      text(
        'decision-footer',
        'No automated approval or broadcast. The decision stays with the team. Reload loses local edits.',
        48,
        505,
        904,
        42,
        15,
        '#684B30',
      ),
    ]),
  ]
  return {
    id: HOST_ID,
    name: 'Aster / Pilot season',
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1000, height: 562.5 },
    slides: Object.fromEntries(pages.map((page) => [page.id, page])),
    slideOrder: pages.map((page) => page.id),
    activeSlideId: PAGE_ID,
  }
}

const EPISODES = [
  ['W01 / Market morning', 'Field diary', 'Amira', 2, 5],
  ['W02 / Night shift', 'Local voices', 'Leo', 3, 4],
  ['W03 / Repair cafe', 'Field diary', 'Jo', 2, 6],
  ['W04 / Open mic', 'Open studio', 'Amira', 4, 3],
  ['W05 / River walk', 'Field diary', 'Jo', 2, 5],
  ['W06 / New neighbours', 'Local voices', 'Leo', 3, 4],
  ['W07 / Archive hour', 'Local voices', 'Amira', 2, 5],
  ['W08 / Listening room', 'Open studio', 'Jo', 4, 3],
] as const

export function createChildData(): Partial<IWorkbookData> {
  const cells: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'ASTER / Eight weeks on air', s: 'title' } },
    1: { 0: { v: 'Fictional planning / USD / Sand cells are editable hours', s: 'muted' } },
    3: Object.fromEntries(
      ['Episode', 'Format', 'Producer', 'Studio h', 'Edit h', 'Cost'].map((v, i) => [i, { v, s: 'header' }]),
    ),
    12: {
      0: { v: 'PILOT TOTAL', s: 'header' },
      3: { f: '=SUM(D5:D12)', s: 'total' },
      4: { f: '=SUM(E5:E12)', s: 'total' },
      5: { f: '=SUM(F5:F12)', s: 'totalMoney' },
    },
    15: { 0: { v: 'Cost = studio hours x $45 + editing hours x $30. Rates are on Resources.', s: 'muted' } },
    17: {
      0: { v: 'This schedule reserves nothing. The editorial slides do not update from these cells.', s: 'muted' },
    },
  }
  EPISODES.forEach(([episode, format, producer, studio, edit], index) => {
    const row = index + 4
    cells[row] = {
      0: { v: episode, s: index % 2 ? 'stripe' : 'body' },
      1: { v: format, s: index % 2 ? 'stripe' : 'body' },
      2: { v: producer, s: index % 2 ? 'stripe' : 'body' },
      3: { v: studio, s: 'input' },
      4: { v: edit, s: 'input' },
      5: { f: `=D${row + 1}*Resources!$B$4+E${row + 1}*Resources!$B$5`, s: 'money' },
    }
  })
  return {
    id: CHILD_ID,
    name: 'Aster / Pilot schedule',
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-beta.2',
    sheetOrder: [SHEET_ID, 'resources'],
    styles: {
      title: { fs: 19, bl: 1, cl: { rgb: '#173D43' } },
      header: { bg: { rgb: '#22545B' }, cl: { rgb: '#FFFFFF' }, bl: 1 },
      body: { cl: { rgb: '#294D51' } },
      stripe: { bg: { rgb: '#EDF3EF' }, cl: { rgb: '#294D51' } },
      muted: { fs: 11, cl: { rgb: '#67817C' } },
      input: { bg: { rgb: '#F4E3C2' }, cl: { rgb: '#735A37' }, n: { pattern: '0.0' } },
      money: { n: { pattern: '#,##0.00' }, cl: { rgb: '#294D51' } },
      total: { bg: { rgb: '#CEE6DC' }, bl: 1, cl: { rgb: '#265E50' }, n: { pattern: '0.0' } },
      totalMoney: { bg: { rgb: '#CEE6DC' }, bl: 1, cl: { rgb: '#265E50' }, n: { pattern: '#,##0.00' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Schedule',
        rowCount: 32,
        columnCount: 9,
        defaultRowHeight: 32,
        defaultColumnWidth: 100,
        columnData: { 0: { w: 230 }, 1: { w: 150 }, 2: { w: 120 }, 3: { w: 100 }, 4: { w: 100 }, 5: { w: 130 } },
        cellData: cells,
        mergeData: [0, 1, 15, 17].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 5 })),
      },
      resources: {
        id: 'resources',
        name: 'Resources',
        rowCount: 28,
        columnCount: 8,
        defaultRowHeight: 34,
        defaultColumnWidth: 125,
        columnData: { 0: { w: 235 }, 1: { w: 140 }, 2: { w: 410 } },
        cellData: {
          0: { 0: { v: 'ASTER / Time is the scarce resource', s: 'title' } },
          2: {
            0: { v: 'Resource', s: 'header' },
            1: { v: 'Value', s: 'header' },
            2: { v: 'Working assumption', s: 'header' },
          },
          3: {
            0: { v: 'Studio / USD per hour', s: 'body' },
            1: { v: 45, s: 'input' },
            2: { v: 'Includes recording room, not transmission', s: 'muted' },
          },
          4: {
            0: { v: 'Editing / USD per hour', s: 'stripe' },
            1: { v: 30, s: 'input' },
            2: { v: 'Audio editing only; fictional internal rate', s: 'muted' },
          },
          6: { 0: { v: 'Studio capacity / hours', s: 'body' }, 1: { v: 24, s: 'input' } },
          7: { 0: { v: 'Studio planned / hours', s: 'body' }, 1: { f: '=Schedule!D13', s: 'total' } },
          8: { 0: { v: 'Studio remaining / hours', s: 'header' }, 1: { f: '=B7-B8', s: 'total' } },
          10: { 0: { v: 'Pilot budget / USD', s: 'body' }, 1: { v: 3000, s: 'input' } },
          11: { 0: { v: 'Production cost / USD', s: 'body' }, 1: { f: '=Schedule!F13', s: 'totalMoney' } },
          12: { 0: { v: 'Budget remaining / USD', s: 'header' }, 1: { f: '=B11-B12', s: 'totalMoney' } },
          15: { 0: { v: 'Rates apply to all eight episodes. Changing the rate recalculates Schedule.', s: 'muted' } },
          17: { 0: { v: 'No invoices, staff assignments or reservations are created by this demo.', s: 'muted' } },
        },
        mergeData: [0, 15, 17].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 2 })),
      },
    },
  }
}
