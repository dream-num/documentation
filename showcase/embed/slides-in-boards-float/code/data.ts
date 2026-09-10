import type { IBoardData } from '@univerjs-pro/boards'
import { BoardPageType, createBoardTextBoxShapeElement } from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum, type ISlideData } from '@univerjs-pro/slides'
import { BooleanNumber, HorizontalAlign, LocaleType, RichTextBuilder, VerticalAlign } from '@univerjs/core'

export const HOST_ID = 'prism-pitch-storyboard'
export const CHILD_ID = 'prism-night-sky-pitch'
export const PAGE_ID = 'storyboard'
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
    boardCard('title-band', '', 90, 45, 1450, 125, 12, '#142339', '#142339'),
    boardCard('story-title', 'PRISM / FROM STORY TO A SMALL TEST', 115, 65, 1360, 62, 29, '#DCE9F6', undefined, true),
    boardCard(
      'story-subtitle',
      'Night-sky pop-up / Original fictional proposal / 20 April 2028',
      118,
      130,
      1340,
      30,
      14,
      '#ADC6D9',
    ),
    boardCard(
      'tension',
      '01 / THE TENSION\nA distant observatory is not an easy evening out.',
      110,
      225,
      390,
      120,
      18,
      '#273A50',
      '#E3EDF5',
    ),
    boardCard(
      'offer',
      '02 / THE OFFER\nBring a small night-sky session to two local venues.',
      110,
      375,
      390,
      120,
      18,
      '#31564C',
      '#DCEEE8',
    ),
    boardCard(
      'learn',
      '03 / THE LEARNING\nCompare arrival, comfort and what people remember.',
      110,
      525,
      390,
      120,
      18,
      '#624C31',
      '#F4E5CC',
    ),
    boardCard(
      'ask',
      '04 / THE ASK\nDiscuss eight sessions first.\nDecide on a wider launch later.',
      110,
      675,
      390,
      120,
      18,
      '#694849',
      '#F2DADD',
    ),
    boardCard('deck-caption', 'EDITABLE PITCH / 4 PAGES', 580, 183, 450, 30, 13, '#46647B', undefined, true),
    boardCard(
      'decision-note',
      'NEXT / Confirm access questions before the pilot.',
      570,
      815,
      960,
      90,
      20,
      '#31564C',
      '#DCEEE8',
      true,
    ),
    boardCard(
      'board-footer',
      'Narrative notes and Slides are independent. Planned seats are not bookings; no events or purchases are created.',
      115,
      948,
      1400,
      60,
      14,
      '#617285',
    ),
  ]
  return {
    id: HOST_ID,
    name: 'Prism / Night-sky pitch storyboard',
    appVersion: '1.0.0-rc.0',
    defaultPageSize: { width: 1650, height: 1080 },
    pageOrder: [PAGE_ID],
    activePageId: PAGE_ID,
    pages: {
      [PAGE_ID]: {
        id: PAGE_ID,
        name: 'Tension, offer, learning, ask',
        pageType: BoardPageType.Page,
        elements: Object.fromEntries(elements.map((el) => [el.id, el])),
        elementOrder: elements.map((el) => el.id),
      },
    },
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
      'Original fictional astronomy pop-up proposal. Slides and Board are independent, not live bookings or a Formula Shape integration. No invitations, approvals, purchases or tracking.',
  }
}

export function createChildData(): ISlideData {
  const pages = [
    slide('invitation', 'A nearby night sky', '#111C30', [
      panel('cover-rule', 40, 40, 72, 5, '#EFAFA0'),
      text('cover-kicker', 'PRISM / NEIGHBORHOOD NIGHT SKY', 40, 62, 710, 30, 13, '#8DCFC4', true),
      text('cover-title', 'Bring the night\nclose to home.', 40, 112, 485, 150, 44, '#F4F6FC', true),
      text(
        'cover-body',
        'A guided evening in familiar places.\nOne portable kit. Room for first-time questions.',
        40,
        288,
        485,
        77,
        17,
        '#BDCDDE',
      ),
      panel('cover-number-card', 566, 120, 190, 240, '#243951'),
      text('cover-number', '08', 586, 137, 150, 80, 64, '#EFAFA0', true),
      text('cover-unit', 'PILOT SESSIONS', 586, 229, 155, 28, 12, '#8DCFC4', true),
      text('cover-detail', '20 seats each\n2 local venues\n4 learning weeks', 586, 273, 151, 79, 14, '#F4F6FC'),
      text(
        'cover-footer',
        'Planning draft / 20 April 2028 / No attendance or booking claim',
        40,
        400,
        715,
        28,
        11,
        '#8DCFC4',
      ),
    ]),
    slide('journey', 'A simple evening', '#E8F2EE', [
      text('journey-kicker', '02 / A JOURNEY WITH ROOM TO ASK', 40, 30, 720, 28, 13, '#4D7569', true),
      text('journey-title', 'Welcome. Wonder. Reflect.', 40, 75, 720, 62, 33, '#173E3B', true),
      ...[
        ['01', 'Arrive', 'Find the room.\nChoose a comfortable seat.', '#F7FAF8'],
        ['02', 'Explore', 'Follow one sky story.\nAsk a first question.', '#D0E6DE'],
        ['03', 'Take away', 'Name a new idea.\nAsk one question.', '#F4E5CC'],
      ].flatMap(([number, label, body, color], i) => {
        const left = 40 + i * 245
        return [
          panel('step-' + i, left, 168, 225, 200, color),
          text('step-number-' + i, number, left + 16, 180, 190, 42, 30, '#2B5A50', true),
          text('step-title-' + i, label, left + 16, 232, 190, 38, 23, '#173E3B', true),
          text('step-body-' + i, body, left + 16, 290, 195, 64, 14, '#395C54'),
        ]
      }),
      text(
        'journey-footer',
        '160 planned places across eight sessions. Capacity is not attendance.',
        40,
        405,
        720,
        26,
        12,
        '#4D7569',
      ),
    ]),
    slide('resources', 'A bounded investment', '#F8F3EA', [
      text('resources-kicker', '03 / A PLAN TO TEST, NOT A SPEND COMMITMENT', 40, 28, 720, 28, 12, '#88694B', true),
      text('resources-title', 'USD 8,400 for a small pilot.', 40, 72, 720, 62, 32, '#322D3C', true),
      ...[
        ['Facilitation', 3600, '#467D78'],
        ['Portable kit', 2400, '#7D80AE'],
        ['Access support', 1600, '#CE9679'],
        ['Learning review', 800, '#A8B984'],
      ].flatMap(([label, amount, color], i) => {
        const y = 155 + i * 51
        return [
          text('cost-label-' + i, String(label), 40, y, 188, 31, 16, '#4D4957', true),
          panel('cost-track-' + i, 237, y + 6, 385, 22, '#EAE3D9'),
          panel('cost-bar-' + i, 237, y + 6, (385 * Number(amount)) / 3600, 22, String(color)),
          text('cost-amount-' + i, Number(amount).toLocaleString('en-US'), 654, y, 103, 34, 19, '#322D3C', true),
        ]
      }),
      text(
        'resources-footer',
        'Authored USD assumptions / Editable shapes, not a live chart or Formula Shape.',
        40,
        394,
        720,
        37,
        12,
        '#766B61',
      ),
    ]),
    slide('decision', 'What would change the plan?', '#EADFEF', [
      text('decision-kicker', '04 / MAKE THE NEXT DECISION REVERSIBLE', 40, 28, 720, 28, 12, '#766086', true),
      text('decision-title', 'Learn before a wider launch.', 40, 74, 720, 65, 31, '#352D46', true),
      ...[
        ['Before', 'Walk both venues and clarify access needs.'],
        ['During', 'Note arrival friction and unanswered questions.'],
        ['After', 'Compare all eight sessions before proposing more.'],
      ].flatMap(([label, body], i) => {
        const y = 165 + i * 72
        return [
          panel('gate-card-' + i, 40, y, 715, 59, ['#F7F3F9', '#DCEEE8', '#F4E5CC'][i]),
          text('gate-label-' + i, label, 55, y + 9, 107, 36, 19, '#352D46', true),
          text('gate-body-' + i, body, 178, y + 9, 560, 38, 16, '#4F455D'),
        ]
      }),
      text(
        'decision-footer',
        'No recruitment, approvals, purchases or automatic updates to the Board.',
        40,
        407,
        720,
        24,
        11,
        '#766086',
      ),
    ]),
  ]
  return {
    id: CHILD_ID,
    name: 'Prism / A nearby night sky',
    appVersion: '1.0.0-rc.0',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 800, height: 450 },
    slides: Object.fromEntries(pages.map((p) => [p.id, p])),
    slideOrder: pages.map((p) => p.id),
    activeSlideId: 'invitation',
  }
}
