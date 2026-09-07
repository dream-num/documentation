import type { IBoardData } from '@univerjs-pro/boards'
import { BoardPageType, createBoardConnectorElement, createBoardTextBoxShapeElement } from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { BooleanNumber, HorizontalAlign, VerticalAlign } from '@univerjs/core'

// Original synthetic publishing workflow, distributed with this example's source.
// Deliberately unequal sizes distinguish equal edge gaps from equal center distances.
export const CARDS = [
  { id: 'assignment', text: 'Assignment\nIssue 42', left: 70, top: 90, width: 110, height: 85, color: '#F2DEC0' },
  { id: 'draft', text: 'Draft\n1,800 words', left: 280, top: 145, width: 160, height: 110, color: '#DBE8E8' },
  { id: 'copy', text: 'Copy edit\nStyle review', left: 455, top: 65, width: 130, height: 95, color: '#E5EBD4' },
  { id: 'art', text: 'Art direction\nThree figures', left: 690, top: 125, width: 170, height: 120, color: '#E6DFF0' },
  { id: 'publish', text: 'Publish\nSeptember 18', left: 980, top: 80, width: 140, height: 90, color: '#C7DDD1' },
] as const
export const TARGET_IDS = CARDS.map((card) => card.id)
const supporting = [
  {
    id: 'review',
    text: 'Review\npass?',
    left: 200,
    top: 350,
    width: 140,
    height: 100,
    color: '#FEF3C7',
    decision: true,
  },
  {
    id: 'rights',
    text: 'Rights\nclear?',
    left: 610,
    top: 350,
    width: 140,
    height: 100,
    color: '#FEF3C7',
    decision: true,
  },
  { id: 'archive', text: 'Archive\nIssue assets', left: 980, top: 350, width: 140, height: 90, color: '#F1F5F9' },
]
const shapes = [...CARDS, ...supporting].map((card) => {
  const shape = createBoardTextBoxShapeElement({
    ...card,
    horizontalAlign: HorizontalAlign.CENTER,
    verticalAlign: VerticalAlign.MIDDLE,
    textStyle: { fs: 12, bl: BooleanNumber.TRUE, cl: { rgb: '#172033' } },
    textWrap: ShapeTextWrapType.Square,
  })
  shape.shapeData.shapeType = 'decision' in card ? ShapeTypeEnum.Diamond : ShapeTypeEnum.RoundRect
  shape.shapeData.fill = { fillType: ShapeFillEnum.SolidFill, color: card.color }
  shape.shapeData.stroke = { lineStrokeType: ShapeLineTypeEnum.SolidLine, color: '#64748B', width: 1 }
  return shape
})
const connections = [
  ['assignment', 'draft'],
  ['draft', 'copy'],
  ['copy', 'art'],
  ['art', 'publish'],
  ['assignment', 'review'],
  ['review', 'draft'],
  ['draft', 'rights'],
  ['rights', 'art'],
  ['review', 'archive'],
  ['rights', 'archive'],
  ['publish', 'archive'],
  ['copy', 'review'],
]
const connectors = connections.map(([from, to], index) =>
  createBoardConnectorElement({
    id: `editorial-link-${index}`,
    start: { kind: 'shapeSite', shapeId: from, connectionSiteId: 2 },
    end: index === 11 ? { kind: 'free', x: 390, y: 320 } : { kind: 'shapeSite', shapeId: to, connectionSiteId: 0 },
    routing: 'orthogonal',
    routingMode: 'auto',
    style: { stroke: index === 11 ? '#DC2626' : '#94A3B8', strokeWidth: 1, endMarker: { type: 'filledArrow' } },
  }),
)
const elements = [...connectors, ...shapes]
export const DATA: IBoardData = {
  id: 'editorial-alignment-board',
  name: 'Publishing Desk · Alignment and Spacing',
  appVersion: '1.0.0-beta.2',
  defaultPageSize: { width: 1920, height: 1080 },
  activePageId: 'desk',
  pageOrder: ['desk'],
  pages: {
    desk: {
      id: 'desk',
      name: 'Publishing desk',
      pageType: BoardPageType.Page,
      elementOrder: elements.map((element) => element.id),
      elements: Object.fromEntries(elements.map((element) => [element.id, element])),
    },
  },
}
export const VARIANTS = [
  ['top', 'Align top edges'],
  ['middle', 'Align vertical middles'],
  ['bottom', 'Align bottom edges'],
  ['left', 'Align left edges'],
  ['center', 'Align horizontal centers'],
  ['right', 'Align right edges'],
  ['horizontal', 'Equal horizontal gaps'],
  ['vertical', 'Equal vertical gaps'],
  ['row', 'Ordered row · custom gap'],
  ['column', 'Ordered column · custom gap'],
] as const
