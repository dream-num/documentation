import type { IWorkbookData } from '@univerjs/core'
import { ShapeFillEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum, type ISlideData } from '@univerjs-pro/slides'
import { LocaleType, RichTextBuilder } from '@univerjs/core'

export const HOST_ID = 'harbor-budget'
export const CHILD_ID = 'harbor-decision'
export const SHEET_ID = 'operating-plan'
export const COSTS = [
  ['Crew shifts', 12600],
  ['Fuel allowance', 4800],
  ['Dock access', 2100],
  ['Maintenance reserve', 3200],
  ['Insurance', 1750],
  ['Ticketing', 640],
  ['Accessibility support', 900],
  ['Safety drills', 560],
  ['Cleaning', 720],
  ['Signage', 380],
  ['Community notices', 250],
  ['Contingency', 1800],
] as const

export function createHostData(): Partial<IWorkbookData> {
  const cellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'HARBOR / Service budget', s: 'title' } },
    1: { 0: { v: 'A fictional community ferry · monthly USD · April 2027' } },
    3: { 0: { v: 'Operating commitment', s: 'header' }, 1: { v: 'Monthly USD', s: 'header' } },
    17: { 0: { v: 'Monthly operating total', s: 'header' }, 1: { f: '=SUM(B5:B16)', s: 'money' } },
    19: { 0: { v: 'Review assumption: 26 service days. Costs are original illustrative data.' } },
    21: { 0: { v: 'The floating presentation is an editable Univer child, not a screenshot.' } },
  }
  COSTS.forEach(([label, amount], index) => {
    cellData[index + 4] = { 0: { v: label }, 1: { v: amount, s: 'money' } }
  })
  return {
    id: HOST_ID,
    name: 'Harbor / Operations budget',
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-beta.2',
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 20, bl: 1, cl: { rgb: '#101A34' } },
      header: { bg: { rgb: '#E8F4FA' }, bl: 1, cl: { rgb: '#101A34' } },
      money: { n: { pattern: '"$"#,##0' }, cl: { rgb: '#245F58' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Operating plan',
        rowCount: 60,
        columnCount: 18,
        defaultRowHeight: 28,
        defaultColumnWidth: 100,
        cellData,
        columnData: { 0: { w: 255 }, 1: { w: 140 } },
        mergeData: [
          { startRow: 0, endRow: 0, startColumn: 0, endColumn: 9 },
          { startRow: 1, endRow: 1, startColumn: 0, endColumn: 9 },
        ],
      },
    },
  }
}

export function createChildData(): ISlideData {
  const content = [
    [
      'decision',
      'A smaller launch. A clearer promise.',
      'HARBOR / Decision brief',
      'Start with two morning crossings.\nReview reliability before extending the timetable.',
      '#0A1226',
      '#F5F7FF',
      '#58C8FF',
    ],
    [
      'review',
      'Protect the service before adding trips.',
      'APRIL / Review checkpoint',
      'Track late departures, access requests and crew load.\nThe operating budget stays visible in the host sheet.',
      '#F0F8F6',
      '#101A34',
      '#24756B',
    ],
  ]
  const pages = content.map(([id, title, kicker, body, background, ink, accent]) => {
    const elements = [
      [title, 40, 85, 700, 100, 34, ink],
      [kicker, 40, 30, 700, 40, 15, accent],
      [body, 40, 210, 700, 150, 22, ink],
    ].map(([text, left, top, width, height, fontSize, color], index) => {
      const doc = RichTextBuilder.create()
        .span(String(text), { fontSize: Number(fontSize), color: String(color), bold: index === 0 })
        .getData()
      doc.id = `${id}-text-${index}`
      doc.documentStyle = { ...doc.documentStyle, textStyle: { ff: 'Arial' } }
      doc.body?.paragraphs?.forEach((p, n) => {
        p.paragraphId = `${doc.id}-p-${n}`
      })
      doc.body?.sectionBreaks?.forEach((s, n) => {
        s.sectionId = `${doc.id}-s-${n}`
      })
      return {
        id: `${id}-${index}`,
        type: PageElementTypeEnum.Shape as const,
        transform: { left: Number(left), top: Number(top), width: Number(width), height: Number(height), rotation: 0 },
        shapeData: {
          shapeType: ShapeTypeEnum.Rect,
          fill: { fillType: ShapeFillEnum.NoFill },
          stroke: { color: 'transparent', width: 0 },
          shapeText: { dataModel: { doc } },
        },
      }
    })
    return {
      id,
      name: title,
      pageType: PageTypeEnum.Slide as const,
      background: { type: SlideBackgroundTypeEnum.Solid as const, color: background },
      elements: Object.fromEntries(elements.map((e) => [e.id, e])),
      elementOrder: elements.map((e) => e.id),
      speakerNotes:
        'Original fictional service proposal. Budget totals and presentation text are independent; this is not the Formula Shape case.',
    }
  })
  return {
    id: CHILD_ID,
    name: 'Harbor / Decision brief',
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 800, height: 450 },
    slides: Object.fromEntries(pages.map((p) => [p.id, p])),
    slideOrder: pages.map((p) => p.id),
    activeSlideId: 'decision',
  }
}
