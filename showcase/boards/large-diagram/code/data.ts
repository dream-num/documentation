import {
  BoardPageType,
  createBoardConnectorElement,
  createBoardTextBoxShapeElement,
  createBoardTextElement,
  type IBoardData,
} from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { HorizontalAlign, VerticalAlign } from '@univerjs/core'

export function createData(): IBoardData {
  const stages = [
    'Intake',
    'Plan',
    'Design',
    'Review',
    'Prototype',
    'Test',
    'Source',
    'Assemble',
    'Inspect',
    'Pack',
    'Dispatch',
    'Archive',
  ]
  const colors = ['#DDECE8', '#E7E0EF', '#F4E7CE', '#DDE7F0']
  const shapes = Array.from({ length: 144 }, (_, index) => {
    const row = Math.floor(index / 12)
    const col = index % 12
    const shape = createBoardTextBoxShapeElement({
      id: `flow-${row + 1}-stage-${col + 1}`,
      text: `Line ${String(row + 1).padStart(2, '0')} / ${stages[col]}`,
      left: 70 + col * 220,
      top: 140 + row * 145,
      width: 160,
      height: 64,
      horizontalAlign: HorizontalAlign.CENTER,
      verticalAlign: VerticalAlign.MIDDLE,
      textStyle: { fs: 15, cl: { rgb: '#304857' } },
    })
    shape.shapeData.shapeType = ShapeTypeEnum.RoundRect
    shape.shapeData.isTextBox = false
    shape.shapeData.fill = { fillType: ShapeFillEnum.SolidFill, color: colors[row % colors.length] }
    return shape
  })
  const connectors = Array.from({ length: 132 }, (_, index) => {
    const row = Math.floor(index / 11) + 1
    const col = (index % 11) + 1
    const x = 230 + (col - 1) * 220
    const y = 172 + (row - 1) * 145
    return createBoardConnectorElement({
      id: `link-${row}-${col}`,
      start: { kind: 'shapeSite', shapeId: `flow-${row}-stage-${col}`, connectionSiteId: 1, fallbackPoint: { x, y } },
      end: {
        kind: 'shapeSite',
        shapeId: `flow-${row}-stage-${col + 1}`,
        connectionSiteId: 3,
        fallbackPoint: { x: x + 60, y },
      },
      transform: { left: x, top: y, width: 60, height: 1, rotation: 0 },
      routing: 'straight',
      routingMode: 'auto',
      style: { stroke: '#718B97', strokeWidth: 1.5, endMarker: { type: 'filledArrow' } },
    })
  })
  const elements = [
    ...connectors,
    ...shapes,
    createBoardTextElement({
      id: 'title',
      text: 'Production network / 144 nodes + 132 connectors',
      left: 70,
      top: 40,
      width: 1100,
      height: 50,
      textStyle: { fs: 28, cl: { rgb: '#304857' } },
    }),
  ]
  return {
    id: 'large-production-network',
    name: 'Production network',
    appVersion: '1.0.0-rc.0',
    defaultPageSize: { width: 2780, height: 1900 },
    activePageId: 'network',
    pageOrder: ['network'],
    pages: {
      network: {
        id: 'network',
        name: 'Twelve production lines',
        pageType: BoardPageType.Page,
        elements: Object.fromEntries(elements.map((e) => [e.id, e])),
        elementOrder: elements.map((e) => e.id),
      },
    },
  }
}
