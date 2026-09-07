import type { IDocumentData } from '@univerjs/core'
import { ShapeFillEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum, type ISlideData } from '@univerjs-pro/slides'
import { BooleanNumber, DocumentFlavor, LocaleType, NamedStyleType, RichTextBuilder } from '@univerjs/core'

export const HOST_ID = 'vale-walking-pilot'
export const CHILD_ID = 'vale-decision-memo'
export const PAGE_ID = 'decision'
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
      'Original fictional urban walking pilot. The memo is independently editable; slide labels are not formula-linked. No approvals, bookings or purchases are sent.',
  }
}

export function createHostData(): ISlideData {
  const pages = [
    slide(PAGE_ID, 'Decision and rationale', '#F7F4EB', [
      text('kicker', 'VALE / WALKABLE NEIGHBOURHOODS / 08 JULY 2027', 40, 30, 920, 28, 14, '#66654F', true),
      text('title', 'Test a smaller first step.', 40, 78, 920, 62, 38, '#35382C', true),
      panel('decision-card', 40, 175, 276, 415, '#35382C'),
      text('pilot-number', '06', 62, 193, 230, 95, 70, '#D9DDB9', true),
      text('pilot-label', 'weeks\n2 routes', 62, 298, 230, 70, 23, '#F7F4EB', true),
      text('budget', '$18,600', 62, 380, 230, 58, 32, '#F2C6A6', true),
      text('decision-note', 'Local decision draft.\nNo approval is sent.', 62, 501, 230, 70, 17, '#E6E4D8'),
      text(
        'footer',
        'Double-click the memo to edit the rationale. Slide figures stay independent.',
        40,
        610,
        925,
        30,
        15,
        '#66654F',
      ),
    ]),
    slide('options', 'Three options, different commitments', '#D9DDB9', [
      text('options-kicker', '02 / CHOOSE THE COMMITMENT', 42, 34, 900, 28, 14, '#545744', true),
      text('options-title', 'Learn before scaling.', 42, 92, 900, 65, 40, '#35382C', true),
      panel('wait-card', 42, 210, 282, 292, '#F7F4EB'),
      panel('pilot-card', 359, 210, 282, 292, '#35382C'),
      panel('scale-card', 676, 210, 282, 292, '#F2C6A6'),
      text('wait-title', 'WAIT', 62, 233, 242, 35, 19, '#545744', true),
      text('wait-amount', '$4,200', 62, 295, 242, 60, 34, '#35382C', true),
      text('wait-detail', 'Research only\nNo route trial\n2-week review', 62, 383, 242, 100, 19, '#545744'),
      text('pilot-title', 'PILOT / PROPOSED', 379, 233, 242, 35, 18, '#D9DDB9', true),
      text('pilot-amount', '$18,600', 379, 295, 242, 60, 34, '#F7F4EB', true),
      text('pilot-detail', '2 walking routes\n36 participants\n6-week trial', 379, 383, 242, 100, 19, '#F7F4EB'),
      text('scale-title', 'SCALE', 696, 233, 242, 35, 19, '#75543D', true),
      text('scale-amount', '$54,000', 696, 295, 242, 60, 34, '#35382C', true),
      text('scale-detail', '6 walking routes\n120 participants\n12-week programme', 696, 383, 242, 100, 19, '#75543D'),
      text(
        'options-footer',
        'Illustrative budgets in USD. Costs are authored content, not a live formula model.',
        42,
        558,
        910,
        60,
        17,
        '#545744',
      ),
    ]),
    slide('review', 'A reversible decision', '#F2C6A6', [
      text('review-kicker', '03 / REVIEW BEFORE EXTENDING', 42, 34, 900, 28, 14, '#75543D', true),
      text('review-title', 'What would change our mind?', 42, 104, 910, 80, 39, '#35382C', true),
      panel('rule-one', 42, 235, 910, 82, '#F7F4EB'),
      panel('rule-two', 42, 341, 910, 82, '#E3E7D0'),
      panel('rule-three', 42, 447, 910, 82, '#35382C'),
      text(
        'rule-one-text',
        '01  /  Pause if either route lacks an accessibility walk-through.',
        62,
        257,
        865,
        46,
        23,
        '#35382C',
      ),
      text(
        'rule-two-text',
        '02  /  Review participation and route notes every Friday.',
        62,
        363,
        865,
        46,
        23,
        '#35382C',
      ),
      text(
        'rule-three-text',
        '03  /  Do not expand until the six-week review is complete.',
        62,
        469,
        865,
        46,
        23,
        '#F7F4EB',
      ),
      text(
        'review-footer',
        'Local fictional decision memo. Editing text does not approve or schedule the pilot.',
        42,
        565,
        915,
        52,
        17,
        '#75543D',
      ),
    ]),
  ]
  return {
    id: HOST_ID,
    name: 'Vale / A reversible walking pilot',
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1000, height: 650 },
    slides: Object.fromEntries(pages.map((page) => [page.id, page])),
    slideOrder: pages.map((page) => page.id),
    activeSlideId: PAGE_ID,
  }
}

export const MEMO = [
  ['VALE / DECISION NOTE', 'kicker'],
  ['Start with two routes.', 'title'],
  ['Draft 03 · 8 July 2027 · Owner: Mina Patel', 'meta'],
  ['01 / Recommendation', 'heading'],
  [
    'Run a six-week walking pilot with 36 participants across two neighbourhood routes. The proposed $18,600 budget covers facilitation, access reviews, participant support and a written evaluation.',
    'body',
  ],
  ['02 / Why not scale now?', 'heading'],
  [
    'A six-route programme would commit $54,000 before we understand crossing delays and rest-stop needs. A research-only option costs $4,200 but leaves those on-route questions unanswered.',
    'body',
  ],
  ['03 / Budget and exclusions', 'heading'],
  [
    'Facilitation: $8,400. Access reviews: $3,200. Participant support: $4,600. Evaluation: $2,400. The total excludes permanent street works, equipment purchases and later expansion.',
    'body',
  ],
  ['04 / Evidence before launch', 'heading'],
  [
    'Complete an accessibility walk-through on both routes, confirm two indoor rest stops, and agree an opt-out process. Invitations remain drafts until these checks are recorded.',
    'body',
  ],
  ['05 / Stop and review', 'warning'],
  [
    'Pause a route if its access review is incomplete. Review attendance and route notes each Friday; use the final six-week review to decide whether to extend, redesign or stop.',
    'body',
  ],
  [
    'Decision status: pending. This fictional memo is local only; narrative figures do not automatically update the slides.',
    'meta',
  ],
] as const

export function createChildData(): IDocumentData {
  let offset = 0
  const paragraphs = MEMO.map(([content, kind], index) => {
    offset += content.length + 1
    const heading = kind === 'heading' || kind === 'warning'
    return {
      startIndex: offset - 1,
      paragraphId: `vale-paragraph-${index}`,
      paragraphStyle: {
        namedStyleType:
          kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        ...(heading ? { headingId: `vale-section-${index}` } : {}),
        spaceAbove: { v: heading ? 14 : 0 },
        spaceBelow: { v: kind === 'title' ? 12 : 8 },
        lineSpacing: 1.15,
        textStyle: {
          ff: 'Arial',
          fs: kind === 'title' ? 30 : heading ? 16 : kind === 'meta' || kind === 'kicker' ? 11 : 13,
          bl: kind === 'title' || heading ? BooleanNumber.TRUE : BooleanNumber.FALSE,
          cl: {
            rgb:
              kind === 'warning'
                ? '#966348'
                : kind === 'meta'
                  ? '#757562'
                  : heading || kind === 'title' || kind === 'kicker'
                    ? '#545744'
                    : '#35382C',
          },
        },
      },
    }
  })
  const dataStream = MEMO.map(([content]) => content).join('\r') + '\r\n'
  return {
    id: CHILD_ID,
    title: 'Vale / Executive decision memo',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 640, height: 1000 },
      marginTop: 24,
      marginBottom: 28,
      marginLeft: 28,
      marginRight: 28,
    },
    body: {
      dataStream,
      paragraphs,
      textRuns: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'vale-memo-section' }],
    },
  }
}
