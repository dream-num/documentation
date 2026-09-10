import type { IDocumentData } from '@univerjs/core'
import { ShapeFillEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum, type ISlideData } from '@univerjs-pro/slides'
import { BooleanNumber, DocumentFlavor, LocaleType, NamedStyleType, RichTextBuilder } from '@univerjs/core'

export const HOST_ID = 'mosaic-repair-research'
export const CHILD_ID = 'mosaic-methods-appendix'
export const PAGE_ID = 'question'
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
      'Original fictional repair-service discovery. Counts describe this authored sample, not population estimates. Appendix edits do not recalculate the slides.',
  }
}

export function createHostData(): ISlideData {
  const pages = [
    slide(PAGE_ID, 'The research question', '#D1DE8D', [
      text('kicker', 'MOSAIC / REPAIR SERVICE DISCOVERY / 23 AUGUST 2027', 42, 32, 920, 28, 14, '#3E5540', true),
      text('title', 'What keeps repair\nwithin reach?', 42, 111, 906, 156, 54, '#203B32', true),
      panel('sample-band', 42, 327, 915, 178, '#203B32'),
      text('interviews', '18', 64, 348, 240, 84, 62, '#D1DE8D', true),
      text('interviews-label', 'interviews', 64, 440, 240, 36, 21, '#F7F5E9'),
      text('workshops', '03', 380, 348, 240, 84, 62, '#D1DE8D', true),
      text('workshops-label', 'repair workshops', 380, 440, 260, 36, 21, '#F7F5E9'),
      text('observations', '24', 704, 348, 230, 84, 62, '#D1DE8D', true),
      text('observations-label', 'observed visits', 704, 440, 230, 36, 21, '#F7F5E9'),
      text(
        'appendix-link',
        'Open Research appendix in the native page list for methods and limitations.',
        42,
        553,
        920,
        62,
        19,
        '#3E5540',
      ),
    ]),
    slide('patterns', 'What participants described', '#F7F5E9', [
      text('patterns-kicker', '02 / INTERVIEW CODING', 42, 34, 910, 28, 14, '#627060', true),
      text('patterns-title', 'Different barriers. Different next tests.', 42, 94, 920, 64, 35, '#203B32', true),
      text('parts-label', 'Parts availability', 42, 223, 275, 38, 22, '#203B32'),
      panel('parts-bar', 330, 222, 490, 40, '#203B32'),
      text('parts-count', '7', 850, 218, 90, 48, 28, '#203B32', true),
      text('instructions-label', 'Unclear instructions', 42, 300, 275, 38, 22, '#203B32'),
      panel('instructions-bar', 330, 299, 350, 40, '#A7BE80'),
      text('instructions-count', '5', 710, 295, 90, 48, 28, '#203B32', true),
      text('time-label', 'Time to return', 42, 377, 275, 38, 22, '#203B32'),
      panel('time-bar', 330, 376, 280, 40, '#91AEB8'),
      text('time-count', '4', 640, 372, 90, 48, 28, '#203B32', true),
      text('unclear-label', 'No single barrier', 42, 454, 275, 38, 22, '#203B32'),
      panel('unclear-bar', 330, 453, 140, 40, '#D6B696'),
      text('unclear-count', '2', 500, 449, 90, 48, 28, '#203B32', true),
      text(
        'patterns-footer',
        'One primary code per interview; 18 fictional interviews. Descriptive counts, not a population estimate.',
        42,
        550,
        917,
        66,
        17,
        '#627060',
      ),
    ]),
    slide('limits', 'Boundaries before decisions', '#344F65', [
      text('limits-kicker', '03 / WHAT THIS STUDY CANNOT SAY', 42, 34, 910, 28, 14, '#D1DE8D', true),
      text('limits-title', 'Keep the caveats with the story.', 42, 104, 915, 74, 38, '#F7F5E9', true),
      text('limits-one', '01  /  Three workshops are not the whole city.', 58, 247, 890, 60, 27, '#F7F5E9'),
      text('limits-two', '02  /  Observation counts are not unique people.', 58, 347, 890, 60, 27, '#D1DE8D'),
      text(
        'limits-three',
        '03  /  Test a parts guide before redesigning the service.',
        58,
        447,
        890,
        76,
        26,
        '#D9E7EC',
      ),
      text(
        'limits-footer',
        'Use the editable appendix to qualify the finding, not to claim statistical certainty.',
        42,
        563,
        916,
        52,
        17,
        '#D9E7EC',
      ),
    ]),
  ]
  return {
    id: HOST_ID,
    name: 'Mosaic / Repair within reach',
    appVersion: '1.0.0-rc.0',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1000, height: 650 },
    slides: Object.fromEntries(pages.map((page) => [page.id, page])),
    slideOrder: pages.map((page) => page.id),
    activeSlideId: PAGE_ID,
  }
}

export const MEMO = [
  ['MOSAIC / RESEARCH APPENDIX', 'kicker'],
  ['Methods before conclusions.', 'title'],
  ['Study note 02 · 23 August 2027 · Research owner: Elena Brooks', 'meta'],
  ['01 / Research question', 'heading'],
  [
    'What helps a first-time visitor return to a community repair workshop? We explored parts availability, instructions and return visits. This is a fictional discovery study for an SDK demonstration, not published research.',
    'body',
  ],
  ['02 / Method and setting', 'heading'],
  [
    'Eighteen short interviews were conducted across three workshops: eight at Canal Room, six at Elm Studio and four at Junction Lab. Twenty-four visits were observed over two Saturdays. Eight interviewees provided a follow-up note one week later.',
    'body',
  ],
  ['03 / Sample and consent', 'heading'],
  [
    'Participants were adults who chose to speak after a repair session. The sample excludes people who did not attend, could not travel to the workshop or declined an interview. Names and contact details are not stored in this demo.',
    'body',
  ],
  ['04 / Coding decisions', 'heading'],
  [
    'Each interview received one primary barrier code: parts availability (7), unclear instructions (5), time to return (4), or no single barrier (2). Observation notes were reviewed separately; repeat visits were not counted as new interview participants.',
    'body',
  ],
  ['05 / Limitations', 'warning'],
  [
    'The workshop sample is small and self-selected. Observed visits may include the same person more than once. Weather, opening hours and repair type were not controlled. The counts should guide the next question, not a city-wide prevalence estimate.',
    'body',
  ],
  ['06 / Next learning step', 'heading'],
  [
    'Prototype a one-page parts guide with two volunteers from each workshop. Record where the guide helps or confuses people, then revise it before a wider trial. Do not treat an appendix edit as approval to contact participants.',
    'body',
  ],
  [
    'Data boundary: original fictional content. No participant contact, research consent collection, external source loading or automatic slide recalculation occurs.',
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
      paragraphId: `mosaic-paragraph-${index}`,
      paragraphStyle: {
        namedStyleType:
          kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        ...(heading ? { headingId: `mosaic-section-${index}` } : {}),
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
                ? '#7C5539'
                : kind === 'meta'
                  ? '#6C776E'
                  : heading || kind === 'title' || kind === 'kicker'
                    ? '#315444'
                    : '#263D34',
          },
        },
      },
    }
  })
  const dataStream = MEMO.map(([content]) => content).join('\r') + '\r\n'
  return {
    id: CHILD_ID,
    title: 'Mosaic / Methods and limitations',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 860, height: 1000 },
      marginTop: 24,
      marginBottom: 28,
      marginLeft: 52,
      marginRight: 52,
    },
    body: {
      dataStream,
      paragraphs,
      textRuns: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'mosaic-memo-section' }],
    },
  }
}
