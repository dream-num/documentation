import type { IBoardData } from '@univerjs-pro/boards'
import type { IDocumentData } from '@univerjs/core'
import { BoardPageType, createBoardTextBoxShapeElement } from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { BooleanNumber, DocumentFlavor, HorizontalAlign, NamedStyleType, VerticalAlign } from '@univerjs/core'

export const HOST_ID = 'maple-library-discovery'
export const CHILD_ID = 'maple-interview-brief'
export const PAGE_ID = 'discovery'
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
    boardCard('title-band', '', 90, 45, 1380, 125, 12, '#332D4F', '#332D4F'),
    boardCard('discovery-title', 'MAPLE / A BETTER FIRST VISIT', 115, 63, 1320, 62, 31, '#E9DFFA', undefined, true),
    boardCard(
      'discovery-subtitle',
      'Library collection desk / Synthetic research notes / 12 March 2028',
      118,
      129,
      1300,
      30,
      14,
      '#F3ECFA',
    ),
    boardCard('observation-label', 'WHAT WE NOTICED', 110, 205, 300, 38, 15, '#665088', undefined, true),
    boardCard('hypothesis-label', 'WHAT WE MIGHT TRY', 440, 205, 300, 38, 15, '#42645C', undefined, true),
    boardCard(
      'arrival-note',
      'A01 / ARRIVAL\nA new reader brought a screenshot of the opening hours.',
      110,
      265,
      300,
      150,
      18,
      '#40364F',
      '#E9DFFA',
    ),
    boardCard(
      'arrival-idea',
      'H01 / ONE CLEAR START\nTest a short arrival checklist, not a longer email.',
      440,
      265,
      300,
      150,
      18,
      '#334F48',
      '#DCEEE7',
    ),
    boardCard(
      'desk-note',
      'A02 / WHICH DESK?\nTwo visitors paused at the returns and pickup signs.',
      110,
      440,
      300,
      150,
      18,
      '#40364F',
      '#E9DFFA',
    ),
    boardCard(
      'desk-idea',
      'H02 / A CLEAR NEXT STEP\nTest two signs with the same pickup task.',
      440,
      440,
      300,
      150,
      18,
      '#334F48',
      '#DCEEE7',
    ),
    boardCard(
      'code-note',
      'A03 / HOLD CODE\nOne visitor opened three messages to find the right code.',
      110,
      615,
      300,
      150,
      18,
      '#40364F',
      '#E9DFFA',
    ),
    boardCard(
      'code-idea',
      'H03 / ONE CARD\nTry one card with the code, desk and expiry date.',
      440,
      615,
      300,
      150,
      18,
      '#334F48',
      '#DCEEE7',
    ),
    boardCard(
      'decision-note',
      'NEXT / Ask before choosing a solution.',
      110,
      808,
      630,
      92,
      20,
      '#6C432E',
      '#F6DECF',
      true,
    ),
    boardCard('brief-caption', 'EDITABLE INTERVIEW BRIEF', 795, 190, 300, 30, 12, '#665088', undefined, true),
    boardCard(
      'board-footer',
      'All observations are fictional. Editing the brief does not change these cards or recruit participants.',
      115,
      940,
      1340,
      65,
      15,
      '#706A7C',
    ),
  ]
  return {
    id: HOST_ID,
    name: 'Maple / Library first-visit discovery',
    appVersion: '1.0.0-rc.0',
    defaultPageSize: { width: 1600, height: 1080 },
    pageOrder: [PAGE_ID],
    activePageId: PAGE_ID,
    pages: {
      [PAGE_ID]: {
        id: PAGE_ID,
        name: 'Notice, question, learn',
        pageType: BoardPageType.Page,
        elements: Object.fromEntries(elements.map((el) => [el.id, el])),
        elementOrder: elements.map((el) => el.id),
      },
    },
  }
}

export const MEMO = [
  ['MAPLE / DISCOVERY BRIEF', 'kicker'],
  ['Understand the first visit.', 'title'],
  ['Draft 02 · 12 March 2028 · Research lead: Imani Cole', 'meta'],
  ['01 / The question', 'heading'],
  [
    'Where does a first library collection become confusing? Explore the steps from arrival to finding the desk and presenting a hold code. The Board contains three synthetic observations and three hypotheses, not findings from real participants.',
    'body',
  ],
  ['02 / A small, varied sample', 'heading'],
  [
    'Plan six fictional interviews: three first-time visitors and three returning readers. Include different arrival times and ways of using reminders. This small sample can reveal questions to investigate; it cannot estimate how common a problem is.',
    'body',
  ],
  ['03 / A twenty-minute conversation', 'heading'],
  [
    'Use four minutes for context, twelve for a recent collection story and four for reflection. Ask for a specific occasion: What did you look for first? What happened next? Where did you pause? Avoid presenting the proposed checklist before hearing the story.',
    'body',
  ],
  ['04 / Probe without leading', 'heading'],
  [
    'Ask how the visitor found the collection desk and the hold code. If they mention several messages, ask what distinguished the useful one. Do not assume that more signage or a new app is the answer. Invite an example that contradicts the Board hypothesis.',
    'body',
  ],
  ['05 / Notes and participant choice', 'warning'],
  [
    'Explain the purpose and ask whether note-taking is acceptable. Let the participant skip a question or stop. Use a session label rather than contact details in working notes. This local demo collects no participant data, records no audio and sends no invitations.',
    'body',
  ],
  ['06 / Separate evidence from interpretation', 'heading'],
  [
    'Record the observed step, the question it raises and a possible explanation separately. Mark a quotation only when it is an exact approved record; these example cards contain no real quotations. A changed document title must not rewrite the observation cards.',
    'body',
  ],
  ['07 / Decide what to test next', 'heading'],
  [
    'After the conversations, compare arrival, desk-finding and hold-code steps. Choose one reversible change and write what would disconfirm it. Keep unresolved access questions visible before proposing a pilot. An edited brief is not research completion or permission to launch.',
    'body',
  ],
  [
    'Local boundary: all people, observations and plans are fictional. Board and Docs remain independent. Reload loses edits; no recruitment, recording, publishing or automatic card updates.',
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
      paragraphId: `maple-paragraph-${index}`,
      paragraphStyle: {
        namedStyleType:
          kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        ...(heading ? { headingId: `maple-section-${index}` } : {}),
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
                ? '#9A583A'
                : kind === 'meta'
                  ? '#706A7C'
                  : heading || kind === 'title' || kind === 'kicker'
                    ? '#665088'
                    : '#332D4F',
          },
        },
      },
    }
  })
  const dataStream = MEMO.map(([content]) => content).join('\r') + '\r\n'
  return {
    id: CHILD_ID,
    title: 'Maple / Discovery interview brief',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 680, height: 1000 },
      marginTop: 24,
      marginBottom: 28,
      marginLeft: 28,
      marginRight: 28,
    },
    body: {
      dataStream,
      paragraphs,
      textRuns: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'maple-memo-section' }],
    },
  }
}
