import type { IDocumentData } from '@univerjs/core'
import { ShapeFillEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum, type ISlideData } from '@univerjs-pro/slides'
import { BooleanNumber, DocumentFlavor, LocaleType, NamedStyleType, RichTextBuilder } from '@univerjs/core'

export const HOST_ID = 'lighthouse-strategy-announcement'
export const CHILD_ID = 'lighthouse-strategy-deck'
export const BLOCK_MARKER = '03 / What happens after this announcement'
export const BRIEF = [
  ['LIGHTHOUSE / Neighborhood repair studios', 'kicker'],
  ['Make the first repair feel possible.', 'title'],
  ['Strategy announcement · 14 July 2027 · Owner: Nia Wilson · Internal draft', 'meta'],
  ['01 / The problem we are choosing', 'heading'],
  [
    'New visitors often leave with an idea but no first appointment. For six weeks, our fictional repair studios will test a clear beginner offer: bring one small item, meet a guide and leave with a practical next step.',
    'body',
  ],
  ['02 / The strategy in three frames', 'heading'],
  [
    'The editable deck below explains the promise, the evidence we still need and the learning sequence. Use its native page controls or expand the presentation. The numbers are planning assumptions, not measured outcomes.',
    'body',
  ],
  ['', 'body'],
  [BLOCK_MARKER, 'heading'],
  [
    'Nia owns the message; Amir prepares the workshop guides; Sofia reviews the participant journey. Start with the neighborhood newsletter and studio window cards. Paid acquisition and national expansion are out of scope.',
    'body',
  ],
  [
    'Review questions / Could a first-time visitor explain the offer? Did they attend? Did they leave knowing the next repair step? Do not equate a full calendar with a useful workshop.',
    'body',
  ],
  ['Decision: test locally, then review.', 'warning'],
  [
    'Editing a slide does not rewrite this announcement. All organizations, dates and figures are fictional. No campaign, invitation or tracking event is sent. Reload restores the authored demo and loses local edits.',
    'body',
  ],
] as const

export function createHostData(): IDocumentData {
  let offset = 0
  const paragraphs = BRIEF.map(([content, kind], index) => {
    offset += content.length + 1
    const heading = kind === 'heading' || kind === 'warning'
    return {
      startIndex: offset - 1,
      paragraphId: `lighthouse-p-${index}`,
      paragraphStyle: {
        namedStyleType:
          kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        ...(heading ? { headingId: `lighthouse-section-${index}` } : {}),
        spaceAbove: { v: heading ? 16 : 0 },
        spaceBelow: { v: kind === 'title' ? 12 : 9 },
        lineSpacing: 1.2,
        textStyle: {
          ff: 'Arial',
          fs: kind === 'title' ? 32 : heading ? 18 : kind === 'meta' || kind === 'kicker' ? 11 : 14,
          bl: heading || kind === 'title' ? BooleanNumber.TRUE : BooleanNumber.FALSE,
          cl: {
            rgb:
              kind === 'warning'
                ? '#A26E28'
                : heading || kind === 'title' || kind === 'kicker'
                  ? '#245D69'
                  : kind === 'meta'
                    ? '#75868E'
                    : '#394D59',
          },
        },
      },
    }
  })
  const dataStream = BRIEF.map(([content]) => content).join('\r') + '\r\n'
  return {
    id: HOST_ID,
    title: 'Lighthouse / Strategy announcement',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 960, height: 1000 },
      marginTop: 32,
      marginBottom: 32,
      marginLeft: 64,
      marginRight: 64,
    },
    body: {
      dataStream,
      paragraphs,
      textRuns: [],
      customBlocks: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'lighthouse-section' }],
    },
    drawings: {},
    drawingsOrder: [],
  }
}

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
      'Original fictional planning content. The deck and host announcement are independent SDK documents, not a Formula Shape integration.',
  }
}
export function createChildData(): ISlideData {
  const pages = [
    slide('strategy', 'A useful first visit', '#102A3B', [
      panel('cover-rule', 40, 44, 72, 5, '#66D0CE'),
      text('cover-kicker', 'LIGHTHOUSE / THE BEGINNER OFFER', 40, 60, 620, 32, 13, '#8BD9D2', true),
      text('strategy-title', 'Start with one\nuseful repair.', 40, 112, 480, 145, 46, '#F4F8F7', true),
      text(
        'cover-body',
        'Bring one small item. Meet a guide.\nLeave with a practical next step.',
        40,
        285,
        495,
        80,
        22,
        '#D5E4E9',
      ),
      panel('cover-card', 574, 124, 184, 228, '#1C4557'),
      text('cover-number', '06', 594, 148, 140, 86, 64, '#ECC27E', true),
      text('cover-weeks', 'WEEKS TO LEARN', 594, 237, 150, 35, 12, '#8BD9D2', true),
      text('cover-note', 'Local first.\nLearn, then grow.', 594, 286, 150, 65, 14, '#F4F8F7'),
      text('cover-footer', 'Internal strategy draft / July 2027', 40, 399, 560, 28, 12, '#8BA7B5'),
    ]),
    slide('evidence', 'Evidence before reach', '#FAF4E9', [
      text('evidence-kicker', '02 / PLANNING ASSUMPTIONS, NOT RESULTS', 40, 28, 700, 30, 13, '#95642E', true),
      text('evidence-title', 'Evidence before reach.', 40, 75, 710, 65, 34, '#263F4A', true),
      panel('card-one', 40, 170, 220, 151, '#ECE5D8'),
      panel('card-two', 290, 170, 220, 151, '#E1EBE4'),
      panel('card-three', 540, 170, 220, 151, '#E5E8EF'),
      text('metric-one', '120', 58, 190, 184, 70, 44, '#95642E', true),
      text('label-one', 'Seats across six\nsmall workshops', 58, 264, 184, 52, 13, '#394D59'),
      text('metric-two', '02', 308, 190, 184, 70, 44, '#347565', true),
      text('label-two', 'Newsletter\n+ window cards', 308, 264, 184, 52, 13, '#394D59'),
      text('metric-three', '03', 558, 190, 184, 70, 44, '#626C9A', true),
      text('label-three', 'Clarity / attendance\n/ practical next step', 558, 264, 184, 52, 13, '#394D59'),
      text(
        'evidence-footer',
        'Ask what visitors can do next, not just whether they booked.',
        40,
        335,
        710,
        62,
        16,
        '#394D59',
      ),
    ]),
    slide('learning', 'Learn before expanding', '#EAF4F0', [
      text('learning-kicker', '03 / A SIX-WEEK LEARNING SEQUENCE', 40, 28, 710, 30, 13, '#347565', true),
      text('learning-title', 'Learn before expanding.', 40, 76, 710, 64, 34, '#214D49', true),
      panel('timeline', 63, 171, 5, 194, '#7DB6A6'),
      panel('step-one', 53, 169, 25, 25, '#347565'),
      panel('step-two', 53, 246, 25, 25, '#B3813E'),
      panel('step-three', 53, 323, 25, 25, '#6778A0'),
      text('week-one', 'WEEKS 1–2 / Make the offer clear', 100, 156, 620, 35, 21, '#214D49', true),
      text('week-one-body', 'Nia tests the message with first-time visitors.', 100, 192, 620, 35, 17, '#49625C'),
      text('week-two', 'WEEKS 3–4 / Rehearse the first visit', 100, 233, 620, 35, 21, '#214D49', true),
      text(
        'week-two-body',
        'Amir observes arrival, guidance and the repair handoff.',
        100,
        269,
        620,
        35,
        17,
        '#49625C',
      ),
      text('week-three', 'WEEKS 5–6 / Decide what to change', 100, 310, 620, 35, 21, '#214D49', true),
      text(
        'week-three-body',
        'Sofia combines participant feedback and attendance notes.',
        100,
        346,
        620,
        35,
        17,
        '#49625C',
      ),
      text('learning-footer', 'Gate: review evidence together before expanding.', 40, 409, 730, 25, 12, '#347565'),
    ]),
  ]
  return {
    id: CHILD_ID,
    name: 'Lighthouse / Strategy in three frames',
    appVersion: '1.0.0-rc.0',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 800, height: 450 },
    slides: Object.fromEntries(pages.map((page) => [page.id, page])),
    slideOrder: pages.map((page) => page.id),
    activeSlideId: 'strategy',
  }
}
