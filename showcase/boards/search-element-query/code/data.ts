import type { IBoardData } from '@univerjs-pro/boards'
import { BoardPageType, createBoardConnectorElement, createBoardTextBoxShapeElement } from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { BooleanNumber, HorizontalAlign, VerticalAlign } from '@univerjs/core'

// Original synthetic hardware-release review. No customer or third-party template data.
// IDs deliberately omit "risk": text-search results must come from the content being demonstrated.
export const NODES = [
  { id: 'intake', text: 'Intake\nOrion sensor · R7', left: 50, top: 180, width: 185, height: 90, fill: '#E0F2FE' },
  {
    id: 'supply',
    text: 'Risk register\nLead time +18 days',
    left: 310,
    top: 60,
    width: 205,
    height: 90,
    fill: '#FEF3C7',
  },
  { id: 'review-a', text: 'Risk\n> 10?', left: 600, top: 70, width: 150, height: 105, fill: '#FFEDD5', decision: true },
  { id: 'plan', text: 'Mitigation\nDual-source housing', left: 310, top: 290, width: 205, height: 90, fill: '#EDE9FE' },
  {
    id: 'review-b',
    text: 'Audit\nready?',
    left: 600,
    top: 300,
    width: 150,
    height: 105,
    fill: '#DCFCE7',
    decision: true,
  },
  {
    id: 'compliance',
    text: 'risk review\nSafety sign-off',
    left: 855,
    top: 290,
    width: 205,
    height: 90,
    fill: '#FCE7F3',
  },
  { id: 'release', text: 'Release\n2027-03-31', left: 855, top: 70, width: 205, height: 90, fill: '#DCFCE7' },
  { id: 'archive', text: 'Archive\nEvidence pack', left: 1110, top: 190, width: 180, height: 90, fill: '#F1F5F9' },
] as const

const links = [
  ['intake', 'supply'],
  ['intake', 'plan'],
  ['supply', 'review-a'],
  ['review-a', 'plan'],
  ['review-a', 'release'],
  ['plan', 'review-b'],
  ['review-b', 'compliance'],
  ['compliance', 'release'],
  ['release', 'archive'],
  ['compliance', 'archive'],
  ['archive', 'intake'],
  ['review-b', 'archive'],
] as const

const shapes = NODES.map((node) => {
  const element = createBoardTextBoxShapeElement({
    id: node.id,
    text: node.text,
    left: node.left,
    top: node.top,
    width: node.width,
    height: node.height,
    horizontalAlign: HorizontalAlign.CENTER,
    verticalAlign: VerticalAlign.MIDDLE,
    textStyle: { fs: 13, bl: BooleanNumber.TRUE, cl: { rgb: '#172033' } },
    textWrap: ShapeTextWrapType.Square,
  })
  element.name = node.id
  element.shapeData.shapeType = 'decision' in node ? ShapeTypeEnum.Diamond : ShapeTypeEnum.RoundRect
  element.shapeData.fill = { fillType: ShapeFillEnum.SolidFill, color: node.fill }
  element.shapeData.stroke = { lineStrokeType: ShapeLineTypeEnum.SolidLine, color: '#64748B', width: 1.5 }
  return element
})

const connectors = links.map(([from, to], index) => {
  const element = createBoardConnectorElement({
    id: `route-${index}`,
    start: { kind: 'shapeSite', shapeId: from, connectionSiteId: 1 },
    end: index === 11 ? { kind: 'free', x: 1030, y: 450 } : { kind: 'shapeSite', shapeId: to, connectionSiteId: 3 },
    routing: 'orthogonal',
    routingMode: 'auto',
    style: { stroke: index === 11 ? '#DC2626' : '#94A3B8', strokeWidth: 1.5, endMarker: { type: 'filledArrow' } },
    label:
      index === 3
        ? { id: 'transfer-label', text: 'Risk transfer', width: 100, height: 24 }
        : index === 4
          ? { id: 'approval-label', text: 'Approved', width: 80, height: 24 }
          : undefined,
  })
  // Name + label intentionally yield two hits for one connector in the all-types search.
  element.name = index === 3 ? 'Risk route' : `Review route ${index + 1}`
  return element
})

const elements = [...connectors, ...shapes]
export const DATA: IBoardData = {
  id: 'orion-review-board',
  name: 'Orion Release · Search and Element Query',
  appVersion: '1.0.0-beta.2',
  defaultPageSize: { width: 1920, height: 1080 },
  activePageId: 'review',
  pageOrder: ['review'],
  pages: {
    review: {
      id: 'review',
      name: 'Release readiness · 2027-03-31',
      pageType: BoardPageType.Page,
      elementOrder: elements.map((element) => element.id),
      elements: Object.fromEntries(elements.map((element) => [element.id, element])),
    },
  },
}
