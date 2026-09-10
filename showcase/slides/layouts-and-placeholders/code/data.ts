import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import {
  PageElementTypeEnum,
  PageTypeEnum,
  PlaceholderTypeEnum,
  SlideBackgroundTypeEnum,
  SlidePageLayoutTypeEnum,
  type ISlideData,
  type ISlidePageElement,
  type ISlidePlaceholderElement,
} from '@univerjs-pro/slides'
import { LocaleType, RichTextBuilder } from '@univerjs/core'

export const FROZEN_CLOCK = '2027-03-31T09:00:00Z'
export const VARIANTS = [
  { id: 'broadcast', label: 'Broadcast briefing · eight pages' },
  { id: 'comparison', label: 'Two-column comparison' },
  { id: 'inherited', label: 'Inherited placeholders only' },
  { id: 'empty', label: 'Zero pages' },
] as const
export type Variant = (typeof VARIANTS)[number]['id']
export const LAYOUTS = {
  briefing: 'Stacked briefing',
  comparison: 'Side-by-side comparison',
  section: 'Section opener',
  title: 'Opening title',
  data: 'Pilot data and interpretation',
  quote: 'Volunteer quotation',
  closing: 'Closing checklist',
}
export const PLACEHOLDERS = { title: 'Title · index 0', 'body-a': 'Body · index 1', 'body-b': 'Body · index 2' }
export const LAYOUT_COLORS = {
  briefing: '#EDF8F4',
  comparison: '#E8F4FA',
  section: '#EEE8FF',
  title: '#FFF1E8',
  data: '#EBF0FF',
  quote: '#FBE8F0',
  closing: '#EEF4E6',
}
const rect = (left: number, top: number, width: number, height: number) => ({ left, top, width, height, rotation: 0 })
export function placeholder(
  id: string,
  index: number,
  value: string,
  transform = rect(0, 0, 0, 0),
): ISlidePlaceholderElement {
  const plain = value.replace(/\n/g, '\r'),
    dataStream = plain + '\r\n'
  return {
    id,
    type: PageElementTypeEnum.Placeholder,
    transform,
    text: value,
    placeholder: {
      id: `slot-${index}`,
      type: index === 0 ? PlaceholderTypeEnum.Title : PlaceholderTypeEnum.Body,
      index,
      textConfig: {
        defaultText: value,
        textData: {
          id: `aster-${id}`,
          documentStyle: {},
          body: {
            dataStream,
            paragraphs: [...dataStream.matchAll(/\r/g)].map((match, i) => ({
              startIndex: match.index!,
              paragraphId: `${id}-${i}`,
            })),
            textRuns: [
              {
                st: 0,
                ed: plain.length,
                ts: { ff: 'Arial', fs: index === 0 ? 34 : 26, bl: index === 0 ? 1 : 0, cl: { rgb: '#101A34' } },
              },
            ],
          },
        },
      },
    },
    style: { fill: { fillType: ShapeFillEnum.NoFill }, stroke: { lineStrokeType: ShapeLineTypeEnum.NoLine, width: 0 } },
  }
}
function panel(id: string, transform: ReturnType<typeof rect>, color: string): ISlidePageElement {
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform,
    shapeData: { shapeType: ShapeTypeEnum.Rect, fill: { color }, stroke: { color, width: 0 } },
  }
}
export const CONTENT = [
  [
    'opening',
    'Aster / Community radio',
    'One town. Four shows.\nTwenty volunteer voices.',
    'Season briefing / 12 April 2027\nAll people and figures are fictional.',
    'Welcome the team. This is an original fictional community-radio program.',
  ],
  [
    'schedule',
    'Build a week people can follow',
    'MON / Street stories\nWED / Repair hour',
    'FRI / Evening session\nSUN / Kitchen table',
    'Four programs occupy four different days. Do not confuse shows with weekly episodes.',
  ],
  [
    'voices',
    'Twenty volunteers, four teams',
    'STORIES / 6 volunteers\nREPAIR / 4 volunteers',
    'MUSIC / 5 volunteers\nFOOD / 5 volunteers',
    '6 + 4 + 5 + 5 = 20 volunteers. These are assignments, not listener counts.',
  ],
  [
    'handoff',
    'A handoff has an owner',
    'BEFORE AIR / check levels\nProducer: Noor',
    'AFTER AIR / log corrections\nArchivist: Jules',
    'Use this content page to compare stacked and side-by-side layouts without losing either body.',
  ],
  [
    'access',
    'Access begins before broadcast',
    'Publish a plain-text guide.\nRead notices at a steady pace.',
    'Prepare transcripts.\nKeep a phone-in alternative.',
    'Do not promise transcripts before they have been reviewed.',
  ],
  [
    'review',
    'Review the pilot honestly',
    '12 trial episodes\n9 delivered on schedule',
    '3 rescheduled episodes\nExplain each change publicly.',
    'These fictional counts describe the pilot. Avoid percentages that obscure small sample size.',
  ],
  [
    'quote',
    'Make room for a new voice',
    '“I could start with a story,\nnot a perfect radio voice.”',
    'Ren / fictional volunteer\nFirst recording workshop',
    'The quotation is authored for this fixture, not a real endorsement.',
  ],
  [
    'closing',
    'Leave the studio ready',
    'Label the final recording.\nReturn the room to neutral.',
    'Next checkpoint / 19 April\nOwner / Noor',
    'Keep the room checklist and the next editorial checkpoint separate.',
  ],
]
export function createData(variant: Variant = 'broadcast'): ISlideData {
  if (!VARIANTS.some((item) => item.id === variant)) throw new Error('Unknown source data variant.')
  const geometry = {
    briefing: [rect(65, 40, 900, 95), rect(70, 175, 880, 140), rect(70, 335, 880, 140)],
    comparison: [rect(65, 40, 900, 95), rect(70, 180, 420, 295), rect(535, 180, 420, 295)],
    section: [rect(65, 95, 900, 110), rect(70, 240, 880, 95), rect(70, 365, 880, 95)],
    title: [rect(65, 75, 900, 100), rect(70, 220, 880, 110), rect(70, 370, 880, 100)],
    data: [rect(65, 40, 900, 95), rect(70, 175, 420, 140), rect(535, 300, 420, 175)],
    quote: [rect(65, 40, 900, 95), rect(110, 185, 800, 140), rect(110, 360, 800, 115)],
    closing: [rect(65, 55, 900, 95), rect(70, 180, 880, 115), rect(70, 355, 880, 120)],
  }
  const layouts = Object.fromEntries(
    Object.entries(geometry).map(([id, positions]) => {
      const slots = [
        placeholder('layout-title', 0, 'Add a program title', positions[0]),
        placeholder('layout-a', 1, 'Add the first talking point', positions[1]),
        placeholder('layout-b', 2, 'Add the second talking point', positions[2]),
      ]
      const backdrop = panel('layout-panel', rect(50, 155, 925, 340), LAYOUT_COLORS[id as keyof typeof LAYOUT_COLORS])
      return [
        id,
        {
          id,
          name: LAYOUTS[id as keyof typeof LAYOUTS],
          pageType: PageTypeEnum.Layout as const,
          layoutType:
            id === 'comparison'
              ? SlidePageLayoutTypeEnum.Comparison
              : id === 'section'
                ? SlidePageLayoutTypeEnum.SectionHeader
                : id === 'title'
                  ? SlidePageLayoutTypeEnum.Title
                  : id === 'briefing'
                    ? SlidePageLayoutTypeEnum.TitleAndBody
                    : SlidePageLayoutTypeEnum.Custom,
          masterPageId: 'aster-master',
          elements: Object.fromEntries([backdrop, ...slots].map((item) => [item.id, item])),
          elementOrder: [backdrop.id, ...slots.map((item) => item.id)],
        },
      ]
    }),
  )
  const footerDoc = RichTextBuilder.create()
    .span('ASTER / Community radio / Volunteer edition', { fontSize: 16, color: '#59647A' })
    .getData()
  footerDoc.id = 'aster-master-footer'
  footerDoc.documentStyle = { ...footerDoc.documentStyle, textStyle: { ff: 'Arial' } }
  footerDoc.body?.paragraphs?.forEach((paragraph, index) => {
    paragraph.paragraphId = `aster-footer-p-${index}`
  })
  footerDoc.body?.sectionBreaks?.forEach((section, index) => {
    section.sectionId = `aster-footer-s-${index}`
  })
  const masterElements: ISlidePageElement[] = [
    panel('brand-stripe', rect(0, 0, 18, 576), '#4B68D9'),
    {
      id: 'brand-footer',
      type: PageElementTypeEnum.Shape,
      shapeData: {
        shapeType: ShapeTypeEnum.Rect,
        fill: { fillType: ShapeFillEnum.NoFill },
        stroke: { lineStrokeType: ShapeLineTypeEnum.NoLine, width: 0 },
        shapeText: { dataModel: { doc: footerDoc } },
      },
      transform: rect(60, 525, 900, 30),
    },
  ]
  const chosen = variant === 'empty' ? [] : variant === 'inherited' ? CONTENT.slice(0, 1) : CONTENT
  const pageLayouts: Record<string, keyof typeof LAYOUTS> = {
    opening: 'title',
    schedule: 'briefing',
    voices: 'comparison',
    handoff: 'briefing',
    access: 'section',
    review: 'data',
    quote: 'quote',
    closing: 'closing',
  }
  const pages = chosen.map(([id, title, first, second, notes]) => {
    const layoutId = variant === 'comparison' ? 'comparison' : variant === 'inherited' ? 'briefing' : pageLayouts[id]
    // Explicit placement copies layout geometry. SDK layer suppression matches placeholder type/index, not these element IDs.
    const elements =
      variant === 'inherited'
        ? []
        : [
            placeholder('title', 0, title, geometry[layoutId][0]),
            placeholder('body-a', 1, first, geometry[layoutId][1]),
            placeholder('body-b', 2, second, geometry[layoutId][2]),
          ]
    return {
      id,
      name: title,
      pageType: PageTypeEnum.Slide as const,
      layoutPageId: layoutId,
      masterPageId: 'aster-master',
      showMasterSp: true,
      speakerNotes: notes,
      elementOrder: elements.map((item) => item.id),
      elements: Object.fromEntries(elements.map((item) => [item.id, item])),
    }
  })
  return {
    id: 'aster-deck',
    name: 'Aster / Community radio',
    appVersion: '1.0.0-rc.0',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1024, height: 576 },
    slides: Object.fromEntries(pages.map((page) => [page.id, page])),
    slideOrder: pages.map((page) => page.id),
    activeSlideId: pages[0]?.id,
    layoutPages: layouts,
    layoutPageOrder: Object.keys(layouts),
    masterPages: {
      'aster-master': {
        id: 'aster-master',
        name: 'Aster identity',
        pageType: PageTypeEnum.Master,
        background: { type: SlideBackgroundTypeEnum.Solid, color: '#F5F7FF' },
        elements: Object.fromEntries(masterElements.map((item) => [item.id, item])),
        elementOrder: masterElements.map((item) => item.id),
      },
    },
    masterPageOrder: ['aster-master'],
  }
}
export function layoutSlot(
  snapshot: ISlideData,
  pageId: string,
  elementId: string,
  layoutId = snapshot.slides[pageId]?.layoutPageId,
) {
  const page = snapshot.slides[pageId],
    layout = layoutId ? snapshot.layoutPages?.[layoutId] : undefined
  if (!page || !layout || !layout.masterPageId || !snapshot.masterPages?.[layout.masterPageId])
    throw new Error('Page or layout reference is invalid; no live change was made.')
  const element = page.elements[elementId]
  if (!element || element.type !== PageElementTypeEnum.Placeholder)
    throw new Error('No slide-owned placeholder. Load the broadcast fixture to edit one.')
  const slot = Object.values(layout.elements).find(
    (candidate) =>
      candidate.type === PageElementTypeEnum.Placeholder &&
      candidate.placeholder.type === element.placeholder.type &&
      candidate.placeholder.index === element.placeholder.index,
  )
  if (!slot) throw new Error('No matching layout placeholder; no live change was made.')
  return slot
}
export function rebuildLayout(snapshot: ISlideData, pageId: string, layoutId: string): ISlideData {
  const page = snapshot.slides[pageId],
    layout = snapshot.layoutPages?.[layoutId]
  if (!page || !layout || !layout.masterPageId || !snapshot.masterPages?.[layout.masterPageId])
    throw new Error('Page or layout reference is invalid; no live change was made.')
  const copy = structuredClone(snapshot),
    target = copy.slides[pageId]
  for (const element of Object.values(target.elements))
    if (element.type === PageElementTypeEnum.Placeholder)
      element.transform = structuredClone(layoutSlot(snapshot, pageId, element.id, layoutId).transform)
  target.layoutPageId = layoutId
  target.masterPageId = layout.masterPageId
  return copy
}
