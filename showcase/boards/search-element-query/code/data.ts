import type { IBoardData } from '@univerjs-pro/boards'
import { BoardPageType, createBoardConnectorElement, createBoardTextBoxShapeElement } from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { HorizontalAlign, VerticalAlign } from '@univerjs/core'

export function createData(_legacyLocale = false): IBoardData {
  const cards = [
    { id: 'card-a', en: 'Risk\nFirst note', left: 80, top: 90, fill: '#FEF3C7' },
    { id: 'card-b', en: 'risk\nSecond note', left: 360, top: 90, fill: '#FCE7F3' },
    {
      id: 'card-c',
      en: 'Risk review\nThird note',
      left: 80,
      top: 300,
      fill: '#EDE9FE',
    },
    { id: 'card-d', en: 'Archive\nReference note', left: 360, top: 300, fill: '#E0F2FE' },
  ]
  const shapes = cards.map((card) => {
    const element = createBoardTextBoxShapeElement({
      id: card.id,
      text: card.en,
      left: card.left,
      top: card.top,
      width: 200,
      height: 90,
      horizontalAlign: HorizontalAlign.CENTER,
      verticalAlign: VerticalAlign.MIDDLE,
      textStyle: { fs: 14, cl: { rgb: '#172033' } },
    })
    element.name = card.id
    element.shapeData.shapeType = ShapeTypeEnum.RoundRect
    element.shapeData.fill = { fillType: ShapeFillEnum.SolidFill, color: card.fill }
    element.shapeData.stroke = { lineStrokeType: ShapeLineTypeEnum.SolidLine, color: '#64748B', width: 1.5 }
    return element
  })
  const connectors = [
    { id: 'link-a', from: 'card-a', to: 'card-b', name: 'Risk route', label: 'Risk label' },
    { id: 'link-b', from: 'card-c', to: 'card-d', name: 'Reference route', label: 'Approved' },
  ].map((link) => {
    const element = createBoardConnectorElement({
      id: link.id,
      start: { kind: 'shapeSite', shapeId: link.from, connectionSiteId: 1 },
      end: { kind: 'shapeSite', shapeId: link.to, connectionSiteId: 3 },
      routing: 'orthogonal',
      routingMode: 'auto',
      style: { stroke: '#64748B', strokeWidth: 1.5, endMarker: { type: 'filledArrow' } },
      label: { id: link.id + '-label', text: link.label, width: 90, height: 24 },
    })
    // Name and label deliberately produce two hits for one element.
    element.name = link.name
    return element
  })
  const elements = [...connectors, ...shapes]
  return {
    id: 'native-query-board',
    name: 'Search and element query',
    appVersion: '1.0.0-rc.0',
    defaultPageSize: { width: 900, height: 650 },
    activePageId: 'query',
    pageOrder: ['query'],
    pages: {
      query: {
        id: 'query',
        name: 'Query samples',
        pageType: BoardPageType.Page,
        elementOrder: elements.map((element) => element.id),
        elements: Object.fromEntries(elements.map((element) => [element.id, element])),
      },
    },
  }
}
