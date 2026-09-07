import { ShapeFillEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import {
  PageElementTypeEnum,
  PageTypeEnum,
  SlideBackgroundTypeEnum,
  SlidePageLayoutTypeEnum,
  type ISlideData,
  type ISlidePage,
  type ISlidePageElement,
} from '@univerjs-pro/slides'
import { LocaleType, RichTextBuilder } from '@univerjs/core'

export const FROZEN_CLOCK = '2027-03-31T09:00:00Z'
export const VARIANTS = [
  { id: 'night-program', label: 'Night program · eight pages' },
  { id: 'repeated-labels', label: 'Repeated names · distinct IDs' },
  { id: 'single', label: 'One-page handoff' },
  { id: 'empty', label: 'Empty starting point' },
] as const
export type Variant = (typeof VARIANTS)[number]['id']
function text(
  id: string,
  value: string,
  left: number,
  top: number,
  width: number,
  height: number,
  fontSize = 26,
): ISlidePageElement {
  const doc = RichTextBuilder.create()
    .span(value, { fontSize, color: '#233D49', bold: id === 'title' })
    .getData()
  doc.id = `northlight-${id}`
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
    shapeData: {
      shapeType: ShapeTypeEnum.Rect,
      fill: { fillType: ShapeFillEnum.NoFill },
      stroke: { color: 'transparent', width: 0 },
      shapeText: { dataModel: { doc } },
    },
    transform: { left, top, width, height, rotation: 0 },
  }
}
function panel(id: string, left: number, top: number, width: number, height: number, color: string): ISlidePageElement {
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform: { left, top, width, height, rotation: 0 },
    shapeData: {
      shapeType: ShapeTypeEnum.RoundRect,
      adjustValues: { adj: 12000 },
      fill: { color },
      stroke: { color, width: 0 },
    },
  }
}
export function createPage(id: string, title: string, notes: string, body: ISlidePageElement[]): ISlidePage {
  const elements = [
    panel('accent', 50, 48, 10, 90, '#BC693E'),
    text('title', title, 85, 48, 900, 100, 34),
    ...body,
    text('footer', 'NORTHLIGHT / Museum after hours', 70, 520, 860, 35, 16),
  ]
  return {
    id,
    name: title,
    pageType: PageTypeEnum.Slide,
    layoutPageId: 'northlight-blank',
    masterPageId: 'northlight-master',
    showMasterSp: true,
    speakerNotes: notes,
    background: { type: SlideBackgroundTypeEnum.Solid, color: '#FFFBF5' },
    elements: Object.fromEntries(elements.map((element) => [element.id, element])),
    elementOrder: elements.map((element) => element.id),
  }
}
export function createInsert(id: string) {
  return createPage(
    id,
    'Pop-up / Lantern desk',
    'Assign two hosts. This is a newly inserted page, not a duplicated room.',
    [
      panel('desk', 65, 200, 890, 260, '#F1DFC2'),
      text('body', '20:15–20:45\nMake a paper lantern\n24 places · 2 hosts · no booking', 100, 225, 820, 220, 30),
    ],
  )
}
// Original fictional museum program. Stable page IDs, scoped element IDs and distinct notes are intentional.
export function createData(variant: Variant = 'night-program'): ISlideData {
  const pages = [
    createPage(
      'welcome',
      'Northlight / Museum after hours',
      'Welcome room leads. All dates, capacities and quotations are fictional.',
      [
        panel('hero', 65, 175, 890, 295, '#DBE8E8'),
        text('body', 'One evening. Three ways to explore.\n18:00–22:00 / Friday 16 April 2027', 100, 260, 820, 160, 32),
      ],
    ),
    createPage('agenda', 'A route, not a queue', 'Allow guests to choose their order. Keep the west corridor open.', [
      text(
        'body',
        '18:00  Atrium welcome\n18:30  Open studio\n19:15  Stories in the gallery\n21:30  Shared closing circle',
        90,
        190,
        870,
        280,
        31,
      ),
    ]),
    createPage(
      'atrium',
      'Atrium / Arrival and orientation',
      '96 places. Four welcome hosts. The quiet arrival lane stays on the left.',
      [
        panel('capacity', 65, 205, 390, 260, '#F1DFC2'),
        text('places', '96\nplaces', 100, 245, 320, 160, 46),
        text('body', '18:00–19:00\n4 welcome hosts\n2 accessible entry points', 510, 225, 420, 200, 30),
      ],
    ),
    createPage(
      'studio',
      'Studio / Make and exchange',
      '36 places. Three facilitators. Materials are available on the low table.',
      [
        panel('left', 65, 205, 425, 260, '#DBE8E8'),
        panel('right', 525, 205, 425, 260, '#E6DFF0'),
        text('left-copy', 'MAKE\nPaper sculpture\n36 places', 95, 235, 365, 200, 24),
        text('right-copy', 'EXCHANGE\nA note for a stranger\nNo finished work needed', 550, 235, 375, 200, 24),
      ],
    ),
    createPage(
      'crew',
      'Nine hosts, three assignments',
      'Atrium 4, studio 3, gallery 2. The host total is nine, not the room capacity.',
      [
        text(
          'body',
          'ATRIUM      4 hosts\nSTUDIO      3 hosts\nGALLERY     2 hosts\nTOTAL       9 hosts',
          90,
          190,
          860,
          290,
          32,
        ),
      ],
    ),
    createPage(
      'access',
      'Access is part of the program',
      'Check the quiet room every 20 minutes. Offer captions before being asked.',
      [
        panel('quiet', 65, 200, 890, 280, '#E5EBD4'),
        text(
          'body',
          'Quiet room / north corridor\nStep-free route / west entrance\nPrinted captions / every station',
          100,
          240,
          820,
          200,
          30,
        ),
      ],
    ),
    createPage(
      'quote',
      'A visitor sets the pace',
      'Read the fictional visitor quote. Do not present it as a real testimonial.',
      [
        text('body', '“I stayed longer because\nI could choose where to begin.”', 95, 230, 860, 170, 36),
        text('credit', 'Alex / fictional pilot-night visitor', 95, 435, 850, 45, 22),
      ],
    ),
    createPage('closing', 'Leave a clear handoff', 'Confirm the owner and next checkpoint before the group leaves.', [
      panel('closing-panel', 65, 200, 890, 280, '#F1DFC2'),
      text(
        'body',
        '22:00 / doors close\n22:15 / room-lead check-in\nNext morning / review the guest notes',
        95,
        240,
        850,
        200,
        30,
      ),
    ]),
  ]
  if (variant === 'repeated-labels') for (const page of pages.slice(2, 4)) page.name = 'Room plan'
  const selected = variant === 'empty' ? [] : variant === 'single' ? pages.slice(0, 1) : pages
  return {
    id: 'northlight-deck',
    name: 'Northlight / Museum after hours',
    appVersion: '1.0.0-beta.2',
    rev: 1,
    locale: LocaleType.EN_US,
    defaultPageSize: { width: 1024, height: 576 },
    // Explicit empty layers keep insertion from inheriting the SDK's default title placeholders.
    masterPageOrder: ['northlight-master'],
    masterPages: {
      'northlight-master': {
        id: 'northlight-master',
        name: 'Northlight master',
        pageType: PageTypeEnum.Master,
        elements: {},
        elementOrder: [],
      },
    },
    layoutPageOrder: ['northlight-blank'],
    layoutPages: {
      'northlight-blank': {
        id: 'northlight-blank',
        name: 'Northlight blank',
        pageType: PageTypeEnum.Layout,
        layoutType: SlidePageLayoutTypeEnum.Blank,
        masterPageId: 'northlight-master',
        elements: {},
        elementOrder: [],
      },
    },
    slides: Object.fromEntries(selected.map((page) => [page.id, page])),
    slideOrder: selected.map((page) => page.id),
    activeSlideId: selected[0]?.id,
  }
}
