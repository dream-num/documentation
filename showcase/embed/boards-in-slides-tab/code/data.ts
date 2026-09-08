import type { IBoardData } from '@univerjs-pro/boards'
import { BoardPageType, createBoardTextBoxShapeElement } from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum, type ISlideData } from '@univerjs-pro/slides'
import { BooleanNumber, HorizontalAlign, LocaleType, RichTextBuilder, VerticalAlign } from '@univerjs/core'
export const HOST_ID = 'kite-volunteer-workshop'
export const CHILD_ID = 'kite-shift-retrospective'
export const PAGE_ID = 'kickoff'
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
      'Fictional community makerspace retrospective. Native Canvas cards remain independent of slide commitments. No invitations, approvals or team messages are sent.',
  }
}

export function createHostData(): ISlideData {
  const pages = [
    slide(PAGE_ID, 'A better next shift', '#222C2A', [
      panel('teal-band', 0, 0, 1000, 28, '#2C6A62'),
      text('kicker', 'KITE / VOLUNTEER RETROSPECTIVE / 05 OCTOBER 2027', 42, 54, 915, 30, 14, '#A6D1BF', true),
      text('title', 'Make room for\nthe next shift.', 42, 122, 880, 160, 55, '#F5F1E8', true),
      panel('time-card', 42, 340, 238, 236, '#2C6A62'),
      text('minutes', '45', 65, 360, 190, 90, 70, '#EDC97D', true),
      text('minute-label', 'minutes', 65, 480, 190, 68, 23, '#F5F1E8'),
      text('phase-one', '05 min / Frame the question', 325, 350, 620, 48, 27, '#D6CEE8', true),
      text('phase-two', '25 min / Capture and cluster', 325, 425, 620, 48, 27, '#EDC97D', true),
      text('phase-three', '15 min / Choose the next tests', 325, 500, 620, 48, 27, '#A6D1BF', true),
      text(
        'footer',
        '7 contributors · 9 authored observations · Open Retrospective Canvas in the page list',
        42,
        604,
        920,
        32,
        16,
        '#C5D4CC',
      ),
    ]),
    slide('experiments', 'Three small experiments', '#F5F1E8', [
      text('experiment-kicker', '02 / TURN NOTES INTO TESTS', 42, 35, 915, 30, 14, '#587266', true),
      text('experiment-title', 'Keep the next step small.', 42, 99, 915, 66, 41, '#222C2A', true),
      panel('buddy-card', 42, 230, 282, 274, '#D6CEE8'),
      panel('stock-card', 359, 230, 282, 274, '#EDC97D'),
      panel('handoff-card', 676, 230, 282, 274, '#A6D1BF'),
      text('buddy-title', 'BUDDY / MAYA', 62, 255, 242, 32, 19, '#514668', true),
      text('buddy-count', '2 shifts', 62, 313, 242, 60, 36, '#222C2A', true),
      text('buddy-copy', 'Pair newcomers\nAsk what confused\nNo names in notes', 62, 400, 242, 85, 18, '#514668'),
      text('stock-title', 'STOCK / ELLIS', 379, 255, 242, 32, 19, '#766032', true),
      text('stock-count', '1 shelf', 379, 313, 242, 60, 36, '#222C2A', true),
      text('stock-copy', 'Label loan shelf\nCheck returns\nLog missing tools', 379, 400, 242, 85, 18, '#766032'),
      text('handoff-title', 'HANDOFF / NOOR', 696, 255, 242, 32, 19, '#335E51', true),
      text('handoff-count', '5 min', 696, 313, 242, 60, 36, '#222C2A', true),
      text('handoff-copy', 'Closing checklist\nName next owner\nReview in 2 weeks', 696, 400, 242, 85, 18, '#335E51'),
      text(
        'experiment-footer',
        'Draft experiments, not assigned tasks. Editing the Canvas does not update these slides.',
        42,
        562,
        915,
        58,
        17,
        '#587266',
      ),
    ]),
    slide('checkin', 'Review the learning', '#D6CEE8', [
      text('checkin-kicker', '03 / TWO-WEEK CHECK-IN', 42, 35, 915, 30, 14, '#675678', true),
      text('checkin-title', 'What made the shift easier?', 42, 106, 915, 70, 40, '#222C2A', true),
      panel('listen', 42, 239, 910, 80, '#F5F1E8'),
      panel('look', 42, 348, 910, 80, '#EBCAC8'),
      panel('choose', 42, 457, 910, 80, '#222C2A'),
      text('listen-copy', 'LISTEN / Could newcomers find a person to ask?', 62, 260, 865, 48, 25, '#222C2A'),
      text('look-copy', 'LOOK / Which tools still lacked a clear return place?', 62, 369, 865, 48, 25, '#222C2A'),
      text('choose-copy', 'CHOOSE / Keep, change or stop each small experiment.', 62, 478, 865, 48, 25, '#F5F1E8'),
      text(
        'checkin-footer',
        'Fictional facilitation pack. No attendance tracking, voting, reminders or messages.',
        42,
        578,
        915,
        46,
        17,
        '#675678',
      ),
    ]),
  ]
  return {
    id: HOST_ID,
    name: 'Kite / A better volunteer shift',
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1000, height: 650 },
    slides: Object.fromEntries(pages.map((page) => [page.id, page])),
    slideOrder: pages.map((page) => page.id),
    activeSlideId: PAGE_ID,
  }
}

const LANES = [
  { id: 'keep', title: 'KEEP / What helped', left: 40, color: '#A6D1BF', background: '#EDF4EF' },
  { id: 'change', title: 'CHANGE / Friction', left: 400, color: '#EBCAC8', background: '#FAEFED' },
  { id: 'try', title: 'TRY / A small next step', left: 760, color: '#D6CEE8', background: '#F1EFF7' },
] as const
const NOTES = [
  ['welcome', 'keep', 0, 'Welcome tour\nA person, not a PDF.'],
  ['labels', 'keep', 1, 'Picture labels\nEasy to scan mid-shift.'],
  ['pairing', 'keep', 2, 'Shared setup\nTwo people check tools.'],
  ['returns', 'change', 0, 'Unclear returns\nThree places for one kit.'],
  ['handoff', 'change', 1, 'Late handoff\nClosing notes got lost.'],
  ['schedule', 'change', 2, 'Shift swaps\nLatest plan unclear.'],
  ['buddy', 'try', 0, 'Buddy trial\nTwo shifts with a partner.'],
  ['shelf', 'try', 1, 'One loan shelf\nLabel each return space.'],
  ['checklist', 'try', 2, 'Closing checklist\nFive minutes, one owner.'],
] as const
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
  return shape
}
export function createChildData(): IBoardData {
  const lanes = LANES.flatMap((lane) => [
    boardCard(lane.id + '-lane', '', lane.left, 100, 330, 500, 12, '#222C2A', lane.background),
    boardCard(lane.id + '-heading', lane.title, lane.left + 16, 112, 298, 50, 18, '#222C2A', undefined, true),
  ])
  const notes = NOTES.map(([id, laneId, row, value]) => {
    const lane = LANES.find((item) => item.id === laneId)!
    return boardCard(id, value, lane.left + 16, 185 + row * 133, 298, 108, 18, '#303831', lane.color)
  })
  const elements = [
    ...lanes,
    ...notes,
    boardCard('board-title', 'KITE / THE NEXT SHIFT', 40, 26, 1020, 55, 32, '#2C6A62', undefined, true),
    boardCard(
      'board-footer',
      'Local notes, not a vote. Move a card to explore a theme; column membership is visual only.',
      80,
      622,
      1000,
      38,
      16,
      '#66756A',
    ),
  ]
  return {
    id: CHILD_ID,
    name: 'Kite / Shift retrospective',
    appVersion: '1.0.0-beta.2',
    defaultPageSize: { width: 1130, height: 685 },
    pageOrder: ['retro'],
    activePageId: 'retro',
    pages: {
      retro: {
        id: 'retro',
        name: 'Keep, change, try',
        pageType: BoardPageType.Page,
        elements: Object.fromEntries(elements.map((element) => [element.id, element])),
        elementOrder: elements.map((element) => element.id),
      },
    },
  }
}
