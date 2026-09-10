import type { IWorkbookData } from '@univerjs/core'
import { ShapeFillEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { createFormulaShapeData } from '@univerjs-pro/shape-editor'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum, type ISlideData } from '@univerjs-pro/slides'
import { LocaleType, RichTextBuilder } from '@univerjs/core'

export const HOST_ID = 'solstice-scenario-model'
export const CHILD_ID = 'solstice-scenario-deck'
export const SOURCE_NAME = 'Solstice Model'
export const SCENARIOS = [
  { id: 'conservative', name: 'Conservative', quantity: 80 },
  { id: 'baseline', name: 'Baseline', quantity: 100 },
  { id: 'expanded', name: 'Expanded', quantity: 125 },
] as const
export const FORMULA_CARDS = SCENARIOS.flatMap((scenario, i) =>
  [
    ['volume', 'B', '#,##0'],
    ['revenue', 'C', '$#,##0'],
    ['contribution', 'E', '$#,##0'],
    ['margin', 'F', '0.00%'],
  ].map(([id, column, format]) => ({
    page: scenario.id,
    id,
    format,
    formula: "='[Solstice Model]Scenario model'!" + column + (i + 11),
  })),
)

export function createHostData(): Partial<IWorkbookData> {
  const cellData: IWorkbookData['sheets'][string]['cellData'] = {
    0: { 0: { v: 'SOLSTICE / Evening programme', s: 'title' } },
    1: { 0: { v: 'Three original planning scenarios / Fictional USD assumptions / September 2029', s: 'muted' } },
    3: { 0: { v: 'Shared assumptions', s: 'header' }, 1: { v: 'USD', s: 'header' } },
    4: { 0: { v: 'Ticket price' }, 1: { v: 32, s: 'input' } },
    5: { 0: { v: 'Variable cost / guest' }, 1: { v: 18, s: 'input' } },
    6: { 0: { v: 'Fixed programme cost' }, 1: { v: 600, s: 'input' } },
    9: Object.fromEntries(
      ['Scenario', 'Guests', 'Revenue', 'Total cost', 'Contribution', 'Margin'].map((v, i) => [i, { v, s: 'header' }]),
    ),
    15: { 0: { v: 'TRY / Price B5: 32 -> 35 updates all three scenarios.', s: 'muted' } },
    16: { 0: { v: 'TRY / Expanded guests B13: 125 -> 140 updates only that scenario.', s: 'muted' } },
    18: { 0: { v: 'Open Scenario deck for three data-linked native Slides pages.', s: 'muted' } },
    20: { 0: { v: 'No bookings, payments, backend or manual refresh.', s: 'muted' } },
  }
  SCENARIOS.forEach((scenario, i) => {
    const row = i + 11
    cellData[row - 1] = {
      0: { v: scenario.name, s: ['teal', 'sand', 'lilac'][i] },
      1: { v: scenario.quantity, s: 'count' },
      2: { f: '=B' + row + '*$B$5', s: 'money' },
      3: { f: '=B' + row + '*$B$6+$B$7', s: 'money' },
      4: { f: '=C' + row + '-D' + row, s: 'money' },
      5: { f: '=E' + row + '/C' + row, s: 'percent' },
    }
  })
  return {
    id: HOST_ID,
    name: SOURCE_NAME,
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-rc.0',
    sheetOrder: ['model', 'notes'],
    styles: {
      title: { fs: 23, bl: 1, cl: { rgb: '#183C43' } },
      muted: { fs: 12, cl: { rgb: '#576F75' } },
      header: { bg: { rgb: '#DFEAEF' }, bl: 1, cl: { rgb: '#20354E' } },
      input: { bg: { rgb: '#F3E5C5' }, n: { pattern: '$#,##0' } },
      count: { bg: { rgb: '#F3E5C5' }, n: { pattern: '#,##0' } },
      money: { bg: { rgb: '#E3F0EA' }, n: { pattern: '$#,##0' }, cl: { rgb: '#245B50' } },
      percent: { bg: { rgb: '#E3F0EA' }, n: { pattern: '0.00%' }, bl: 1, cl: { rgb: '#245B50' } },
      teal: { bg: { rgb: '#DCEEE5' }, bl: 1 },
      sand: { bg: { rgb: '#F1DFC5' }, bl: 1 },
      lilac: { bg: { rgb: '#E9DFF4' }, bl: 1 },
    },
    sheets: {
      model: {
        id: 'model',
        name: 'Scenario model',
        rowCount: 40,
        columnCount: 12,
        defaultRowHeight: 32,
        defaultColumnWidth: 135,
        rowData: { 0: { h: 44 } },
        columnData: { 0: { w: 265 }, 1: { w: 145 }, 2: { w: 160 }, 3: { w: 160 }, 4: { w: 175 }, 5: { w: 140 } },
        cellData,
        mergeData: [0, 1, 15, 16, 18, 20].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 5 })),
      },
      notes: {
        id: 'notes',
        name: 'Decision notes',
        rowCount: 25,
        columnCount: 8,
        defaultRowHeight: 42,
        defaultColumnWidth: 120,
        columnData: { 0: { w: 235 }, 1: { w: 800 } },
        cellData: {
          0: { 0: { v: 'SOLSTICE / Decision notes', s: 'title' } },
          2: {
            0: { v: 'Conservative', s: 'teal' },
            1: { v: 'A smaller evening: test arrival flow and learn from a compact audience.' },
          },
          3: {
            0: { v: 'Baseline', s: 'sand' },
            1: { v: 'A repeatable programme: balance room capacity, staffing and contribution.' },
          },
          4: {
            0: { v: 'Expanded', s: 'lilac' },
            1: { v: 'A larger audience: verify staffing and access before committing capacity.' },
          },
          6: {
            0: { v: 'Model boundary', s: 'header' },
            1: { v: 'Revenue = guests × ticket price. Total cost = guests × variable cost + fixed cost.' },
          },
          7: {
            0: { v: 'Not included', s: 'header' },
            1: { v: 'Tax, financing, reservations and ticket sales. Figures are fictional planning data.' },
          },
          9: {
            0: { v: 'Source identity', s: 'header' },
            1: { v: 'Slides read stable Sheet unit IDs; Tab placement does not imply reverse write-back.' },
          },
          10: {
            0: { v: 'Error handling', s: 'header' },
            1: { v: 'Zero revenue leaves contribution visible and exposes native division errors for margin.' },
          },
        },
        mergeData: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 }],
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
  ink: string,
  fill?: string,
) {
  const doc = RichTextBuilder.create()
    .span(value, { fontSize: size, color: ink, bold: id === 'title' })
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
  height: number,
  fill: string,
  ink: string,
  size = 44,
) {
  const spec = FORMULA_CARDS.find((c) => c.page === page && c.id === id)!
  return [
    text(page, id + '-panel', '', left, top, width, height, 12, ink, fill),
    text(page, id + '-label', label, left + 20, top + 14, width - 40, 28, 16, ink),
    {
      id,
      type: PageElementTypeEnum.Shape as const,
      transform: { left: left + 18, top: top + 48, width: width - 36, height: height - 55, rotation: 0 },
      shapeData: {
        ...createFormulaShapeData({
          fill: { fillType: ShapeFillEnum.NoFill },
          stroke: { color: 'transparent', width: 0 },
          numberFormatPattern: spec.format,
          textStyle: { fs: size, bl: 1, cl: { rgb: ink }, ff: 'Arial' },
        }),
        shapeType: ShapeTypeEnum.Rect,
      },
    },
  ]
}
export function createChildData(): ISlideData {
  const pages = [
    {
      id: 'conservative',
      title: 'Start small. Learn deliberately.',
      bg: '#122F3A',
      ink: '#F1F8F7',
      accent: '#71D6C0',
      content: [
        ...card('conservative', 'revenue', 'REVENUE / Conservative', 40, 185, 690, 205, '#DCEEE5', '#27584E', 68),
        ...card('conservative', 'volume', 'GUESTS', 800, 175, 350, 120, '#D8ECF6', '#20354E'),
        ...card('conservative', 'contribution', 'CONTRIBUTION', 800, 320, 350, 120, '#F1DFC5', '#6C4B2D'),
        ...card('conservative', 'margin', 'MARGIN', 800, 465, 350, 120, '#E9DFF4', '#5E4779'),
        text(
          'conservative',
          'explanation',
          'A compact audience leaves room to learn.\nTest arrival flow and visitor support before\ncommitting to the larger programme.',
          40,
          440,
          680,
          135,
          25,
          '#C5DFDE',
        ),
      ],
    },
    {
      id: 'baseline',
      title: 'Build a repeatable evening.',
      bg: '#F4EEE4',
      ink: '#20354E',
      accent: '#86643D',
      content: [
        text(
          'baseline',
          'explanation',
          'Balance room capacity, staffing and a sustainable contribution.',
          40,
          150,
          1110,
          60,
          25,
          '#657479',
        ),
        ...card('baseline', 'revenue', 'REVENUE / Baseline', 40, 245, 535, 155, '#D8ECF6', '#20354E', 54),
        ...card('baseline', 'contribution', 'CONTRIBUTION', 625, 245, 535, 155, '#DCEEE5', '#27584E', 54),
        ...card('baseline', 'volume', 'GUESTS', 40, 440, 535, 135, '#F1DFC5', '#6C4B2D'),
        ...card('baseline', 'margin', 'MARGIN', 625, 440, 535, 135, '#E9DFF4', '#5E4779'),
      ],
    },
    {
      id: 'expanded',
      title: 'Grow only when the room is ready.',
      bg: '#382B48',
      ink: '#F7F2FA',
      accent: '#C9B9E6',
      content: [
        ...card('expanded', 'revenue', 'REVENUE / Expanded', 40, 165, 1120, 155, '#E9DFF4', '#5E4779', 62),
        ...card('expanded', 'volume', 'GUESTS', 40, 365, 350, 165, '#D8ECF6', '#20354E', 48),
        ...card('expanded', 'contribution', 'CONTRIBUTION', 425, 365, 350, 165, '#DCEEE5', '#27584E', 48),
        ...card('expanded', 'margin', 'MARGIN', 810, 365, 350, 165, '#F1DFC5', '#6C4B2D', 48),
        text(
          'expanded',
          'explanation',
          'Change only Expanded guests to isolate a single scenario.\nShared price and cost assumptions still affect every page.',
          40,
          563,
          1100,
          62,
          22,
          '#E4DCEC',
        ),
      ],
    },
  ].map(({ id, title, bg, ink, accent, content }) => {
    const elements = [
      text(id, 'kicker', 'SOLSTICE / EVENING PROGRAMME / ' + id.toUpperCase(), 40, 24, 1120, 30, 15, accent),
      text(id, 'title', title, 40, 80, 1120, 70, 40, ink),
      ...content,
      text(
        id,
        'footer',
        'Sheet source -> native Formula Shapes / Original fictional planning data',
        40,
        640,
        1120,
        25,
        12,
        accent,
      ),
    ]
    return {
      id,
      name: title,
      pageType: PageTypeEnum.Slide as const,
      background: { type: SlideBackgroundTypeEnum.Solid as const, color: bg },
      elements: Object.fromEntries(elements.map((e) => [e.id, e])),
      elementOrder: elements.map((e) => e.id),
      speakerNotes:
        'Each page reads one scenario row. Shared assumptions drive all pages; scenario-only inputs update only their genuine dependents. Narrative and geometry remain authored.',
    }
  })
  return {
    id: CHILD_ID,
    name: 'Solstice / Scenario review',
    appVersion: '1.0.0-rc.0',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1200, height: 675 },
    slides: Object.fromEntries(pages.map((p) => [p.id, p])),
    slideOrder: pages.map((p) => p.id),
    activeSlideId: 'conservative',
  }
}
