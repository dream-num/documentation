import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import {
  PageElementTypeEnum,
  PageTypeEnum,
  SlideBackgroundTypeEnum,
  SlidePageLayoutTypeEnum,
  type ISlideData,
  type ISlidePage,
  type ISlidePageElement,
} from '@univerjs-pro/slides'
import { LocaleType } from '@univerjs/core'

export const FROZEN_CLOCK = '2027-03-31T09:00:00Z'
export const SECTIONS = { intro: 'Context', roadmap: 'Roadmap', review: 'Review', decision: 'Decision' }
export const VARIANTS = [
  { id: 'roadmap-first', label: 'Roadmap first · eight pages' },
  { id: 'review-first', label: 'Evidence first · same content' },
  { id: 'repeated-names', label: 'Repeated titles · stable IDs' },
  { id: 'single', label: 'One-page decision' },
  { id: 'empty', label: 'No pages' },
] as const
export type Variant = (typeof VARIANTS)[number]['id']
function text(
  id: string,
  value: string,
  left: number,
  top: number,
  width: number,
  height: number,
  fontSize = 28,
): ISlidePageElement {
  return {
    id,
    type: PageElementTypeEnum.Shape,
    shapeData: {
      shapeType: ShapeTypeEnum.Rect,
      isTextBox: true,
      fill: { fillType: ShapeFillEnum.NoFill },
      stroke: { lineStrokeType: ShapeLineTypeEnum.NoLine, width: 0 },
      textRectPadding: { left: 0, top: 0, right: 0, bottom: 0 },
      shapeText: {
        isHorizontal: true,
        isRichText: false,
        text: value,
        fontFamily: 'Arial',
        fontSize,
        color: '#173B3A',
        bold: id === 'title',
      },
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
      adjustValues: { adj: 10000 },
      fill: { color },
      stroke: { color, width: 0 },
    },
  }
}
function page(
  id: string,
  title: string,
  section: keyof typeof SECTIONS,
  notes: string,
  body: ISlidePageElement[],
): ISlidePage {
  const elements = [
    text('title', title, 60, 40, 910, 100, 34),
    ...body,
    text('footer', `COBALT / Street shade pilot / ${SECTIONS[section]}`, 60, 520, 910, 36, 16),
  ]
  return {
    id,
    name: title,
    pageType: PageTypeEnum.Slide,
    layoutPageId: 'cobalt-blank',
    masterPageId: 'cobalt-master',
    showMasterSp: true,
    background: { type: SlideBackgroundTypeEnum.Solid, color: '#F6F7F0' },
    speakerNotes: notes,
    custom: { sectionId: section },
    elements: Object.fromEntries(elements.map((element) => [element.id, element])),
    elementOrder: elements.map((element) => element.id),
  }
}
// Original fictional civic briefing. Host section tags are not native SDK section records.
export function createData(variant: Variant = 'roadmap-first'): ISlideData {
  const pages = [
    page(
      'opening',
      'Cobalt / Street shade pilot',
      'intro',
      'Open with the question, not a promise of citywide cooling. All figures are fictional.',
      [
        panel('hero', 60, 175, 900, 290, '#DCEAE5'),
        text(
          'body',
          '12 sites. 84 trees. One summer.\nWhat would make the next phase worthwhile?',
          90,
          230,
          830,
          200,
          32,
        ),
      ],
    ),
    page(
      'context',
      'Three streets, different needs',
      'intro',
      'Keep footfall, school access and maintenance separate. Do not treat tree count as shade coverage.',
      [
        text(
          'body',
          'MARKET WALK / 5 sites / 40 trees\nSCHOOL LOOP / 4 sites / 28 trees\nSTATION EDGE / 3 sites / 16 trees',
          90,
          190,
          850,
          240,
          30,
        ),
      ],
    ),
    page(
      'roadmap',
      'Roadmap / Establish before expanding',
      'roadmap',
      'This section has two pages. Move the whole Review section ahead of it to lead with evidence.',
      [
        panel('section', 60, 170, 900, 310, '#C7DCE2'),
        text(
          'body',
          '01  Prepare the soil\n02  Plant with access in mind\n03  Check survival before expansion',
          95,
          205,
          820,
          240,
          32,
        ),
      ],
    ),
    page(
      'planting',
      'A staged planting window',
      'roadmap',
      'April 18, May 42, June 24 trees; total 84. Dates are the plan, not measured results.',
      [
        panel('april', 60, 190, 280, 280, '#E5DFCA'),
        panel('may', 370, 190, 280, 280, '#DCEAE5'),
        panel('june', 680, 190, 280, 280, '#C7DCE2'),
        text('a', 'APRIL\n18 trees\nSoil trials', 85, 225, 230, 205, 29),
        text('b', 'MAY\n42 trees\nMain planting', 395, 225, 230, 205, 29),
        text('c', 'JUNE\n24 trees\nStation edge', 705, 225, 230, 205, 29),
      ],
    ),
    page(
      'review',
      'Review / What changed',
      'review',
      'Review contains this divider, the observation comparison and a resident quote. Keep all three together when moving the section.',
      [
        panel('review', 60, 180, 900, 290, '#E5DFCA'),
        text(
          'body',
          'Two observations and one caveat\nRead the evidence before\nthe next commitment.',
          95,
          235,
          825,
          190,
          32,
        ),
      ],
    ),
    page(
      'observations',
      'Paired observations, not a causal claim',
      'review',
      'Fictional surface temperatures: exposed 29.4 C and shaded 26.8 C. Observations do not establish causation.',
      [
        panel('exposed', 60, 180, 430, 290, '#E5DFCA'),
        panel('shaded', 530, 180, 430, 290, '#DCEAE5'),
        text('a', 'EXPOSED\n29.4 °C\nMidday surface', 90, 220, 370, 215, 32),
        text('b', 'SHADED\n26.8 °C\nSame visit', 560, 220, 370, 215, 32),
      ],
    ),
    page(
      'quote',
      'The route should still work for everyone',
      'review',
      'Sam is a fictional resident. Keep the access concern beside the measured observations.',
      [
        text('body', '“The shade helps, but leave room\nfor the pram beside the tree guard.”', 85, 220, 855, 190, 33),
        text('credit', 'Sam / fictional resident interview', 85, 440, 855, 45, 22),
      ],
    ),
    page(
      'decision',
      'Decide at the survival checkpoint',
      'decision',
      'Decision owner: Maya. Check 12 sites on 30 September 2027. No automatic expansion is promised.',
      [
        panel('decision', 60, 180, 900, 300, '#DCEAE5'),
        text(
          'body',
          '30 September / inspect all 12 sites\nMaya / publish survival and access findings\nNext phase / decide after the review',
          90,
          220,
          835,
          220,
          29,
        ),
      ],
    ),
  ]
  if (variant === 'repeated-names') for (const item of [pages[2], pages[4]]) item.name = 'Briefing'
  const order =
    variant === 'review-first'
      ? ['opening', 'context', 'review', 'observations', 'quote', 'roadmap', 'planting', 'decision']
      : pages.map((item) => item.id)
  const selected = variant === 'empty' ? [] : variant === 'single' ? ['decision'] : order
  return {
    id: 'cobalt-deck',
    name: 'Cobalt / Street shade pilot',
    appVersion: '1.0.0-rc.0',
    rev: 1,
    locale: LocaleType.EN_US,
    defaultPageSize: { width: 1024, height: 576 },
    activeSlideId: selected[0],
    slideOrder: selected,
    slides: Object.fromEntries(pages.filter((item) => selected.includes(item.id)).map((item) => [item.id, item])),
    masterPageOrder: ['cobalt-master'],
    masterPages: {
      'cobalt-master': {
        id: 'cobalt-master',
        name: 'Cobalt master',
        pageType: PageTypeEnum.Master,
        elements: {},
        elementOrder: [],
      },
    },
    layoutPageOrder: ['cobalt-blank'],
    layoutPages: {
      'cobalt-blank': {
        id: 'cobalt-blank',
        name: 'Cobalt blank',
        pageType: PageTypeEnum.Layout,
        layoutType: SlidePageLayoutTypeEnum.Blank,
        masterPageId: 'cobalt-master',
        elements: {},
        elementOrder: [],
      },
    },
  }
}
export function sections(data: ISlideData) {
  const groups = new Map<
    string,
    { id: string; label: string; pages: string[]; positions: number[]; contiguous: boolean }
  >()
  data.slideOrder.forEach((id, index) => {
    const sectionId = String(data.slides[id].custom?.sectionId ?? 'unassigned')
    const group = groups.get(sectionId) ?? {
      id: sectionId,
      label: SECTIONS[sectionId as keyof typeof SECTIONS] ?? 'Unassigned',
      pages: [],
      positions: [],
      contiguous: true,
    }
    group.pages.push(id)
    group.positions.push(index + 1)
    group.contiguous = group.positions.at(-1)! - group.positions[0] + 1 === group.pages.length
    groups.set(sectionId, group)
  })
  return [...groups.values()]
}
export function sectionOrder(data: ISlideData, sectionId: string, beforeId: string) {
  if (sectionId === beforeId) throw new Error('Choose two different sections; no move was sent.')
  const groups = sections(data),
    moved = groups.find((group) => group.id === sectionId),
    before = groups.find((group) => group.id === beforeId)
  if (!moved || !before) throw new Error('Both sections must contain pages; no move was sent.')
  const remainder = data.slideOrder.filter((id) => !moved.pages.includes(id))
  const index = remainder.indexOf(before.pages[0])
  return [...remainder.slice(0, index), ...moved.pages, ...remainder.slice(index)]
}
