import type { IBoardData } from '@univerjs-pro/boards'
import { BoardPageType, createBoardConnectorElement, createBoardTextBoxShapeElement } from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { BooleanNumber, HorizontalAlign, VerticalAlign } from '@univerjs/core'

// Original synthetic museum-campaign fixture. The overlapping cards make every z-order change visible.
export const NODES = [
  {
    id: 'photo',
    text: 'Hero photograph\nTIFF · 42 MB',
    left: 70,
    top: 105,
    width: 250,
    height: 175,
    fill: '#172033',
    stroke: '#344054',
    textColor: '#F9FAFB',
  },
  {
    id: 'caption',
    text: 'Caption\nA newly attributed coastal study',
    left: 170,
    top: 220,
    width: 235,
    height: 90,
    fill: '#E0F2FE',
    stroke: '#0284C7',
    textColor: '#172033',
  },
  {
    id: 'credit',
    text: 'Credit line\nAvery Collection · 1927',
    left: 105,
    top: 285,
    width: 195,
    height: 70,
    fill: '#FEF3C7',
    stroke: '#D97706',
    textColor: '#172033',
  },
  {
    id: 'priority',
    text: 'Priority\nOpening-week feature',
    left: 270,
    top: 75,
    width: 165,
    height: 72,
    fill: '#FCE7F3',
    stroke: '#DB2777',
    textColor: '#831843',
  },
  {
    id: 'curatorial-review',
    text: 'Curator\nOK?',
    left: 515,
    top: 105,
    width: 150,
    height: 105,
    fill: '#EDE9FE',
    stroke: '#7C3AED',
    textColor: '#3B0764',
    decision: true,
  },
  {
    id: 'rights-review',
    text: 'Rights\ncleared?',
    left: 515,
    top: 320,
    width: 150,
    height: 105,
    fill: '#FFEDD5',
    stroke: '#EA580C',
    textColor: '#7C2D12',
    decision: true,
  },
  {
    id: 'publish',
    text: 'Publish package\nOctober 14 · 09:00',
    left: 805,
    top: 105,
    width: 175,
    height: 90,
    fill: '#DCFCE7',
    stroke: '#16A34A',
    textColor: '#14532D',
  },
  {
    id: 'archive',
    text: 'Rights archive\nFive-year retention',
    left: 805,
    top: 330,
    width: 175,
    height: 85,
    fill: '#F1F5F9',
    stroke: '#64748B',
    textColor: '#334155',
  },
] as const

export const MEDIA_IDS = ['photo', 'caption', 'credit'] as const

const links = [
  ['photo', 'curatorial-review'],
  ['caption', 'curatorial-review'],
  ['credit', 'rights-review'],
  ['priority', 'curatorial-review'],
  ['curatorial-review', 'publish'],
  ['curatorial-review', 'rights-review'],
  ['rights-review', 'publish'],
  ['rights-review', 'archive'],
  ['publish', 'archive'],
  ['archive', 'photo'],
  ['caption', 'rights-review'],
  ['priority', 'publish'],
] as const

const shapes = NODES.map((node) => {
  const shape = createBoardTextBoxShapeElement({
    id: node.id,
    text: node.text,
    left: node.left,
    top: node.top,
    width: node.width,
    height: node.height,
    horizontalAlign: HorizontalAlign.CENTER,
    verticalAlign: VerticalAlign.MIDDLE,
    textStyle: { fs: 12, bl: BooleanNumber.TRUE, cl: { rgb: node.textColor } },
    textWrap: ShapeTextWrapType.Square,
  })
  shape.name = node.text.split('\n')[0]
  shape.shapeData.shapeType = 'decision' in node ? ShapeTypeEnum.Diamond : ShapeTypeEnum.RoundRect
  shape.shapeData.fill = { fillType: ShapeFillEnum.SolidFill, color: node.fill }
  shape.shapeData.stroke = { lineStrokeType: ShapeLineTypeEnum.SolidLine, color: node.stroke, width: 1.5 }
  return shape
})

const connectors = links.map(([from, to], index) =>
  createBoardConnectorElement({
    id: `campaign-link-${index}`,
    start: { kind: 'shapeSite', shapeId: from, connectionSiteId: 1 },
    end:
      index === links.length - 1
        ? { kind: 'free', x: 745, y: 75 }
        : { kind: 'shapeSite', shapeId: to, connectionSiteId: 3 },
    routing: 'orthogonal',
    routingMode: 'auto',
    style: {
      stroke: index === links.length - 1 ? '#DC2626' : '#94A3B8',
      strokeWidth: 1.5,
      endMarker: { type: 'filledArrow' },
    },
  }),
)

const elements = [...connectors, ...shapes]
export const DATA: IBoardData = {
  id: 'museum-campaign-board',
  name: 'Museum Campaign · Groups, Locks, and Layers',
  appVersion: '1.0.0-beta.2',
  defaultPageSize: { width: 1920, height: 1080 },
  activePageId: 'campaign',
  pageOrder: ['campaign'],
  pages: {
    campaign: {
      id: 'campaign',
      name: 'Autumn exhibition campaign',
      pageType: BoardPageType.Page,
      elementOrder: elements.map((element) => element.id),
      elements: Object.fromEntries(elements.map((element) => [element.id, element])),
    },
  },
}

export const LAYER_VARIANTS = [
  ['front', 'Bring Priority to front'],
  ['forward', 'Move Priority one step forward'],
  ['backward', 'Move Priority one step backward'],
  ['back', 'Send Priority to back'],
] as const
