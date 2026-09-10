import type { FBoard } from '@univerjs-pro/boards/facade'
import {
  BoardPageType,
  createBoardConnectorElement,
  createBoardTextBoxShapeElement,
  createBoardTextElement,
  type IBoardData,
} from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { HorizontalAlign, VerticalAlign } from '@univerjs/core'

export const LAYOUTS: {
  id: string
  label: string
  layers: string[][]
  options: NonNullable<Parameters<FBoard['arrangeElementsInLayers']>[1]>
}[] = [
  {
    id: 'horizontal',
    label: 'Horizontal / centered layers',
    layers: [['h-intake'], ['h-scan', 'h-review'], ['h-store', 'h-return']],
    options: {
      direction: 'horizontal',
      layerGap: 55,
      itemGap: 28,
      align: 'center',
      itemAlign: 'center',
      start: { x: 60, y: 160 },
    },
  },
  {
    id: 'vertical',
    label: 'Vertical / centered layers',
    layers: [['v-intake'], ['v-scan', 'v-review'], ['v-store', 'v-return']],
    options: {
      direction: 'vertical',
      layerGap: 55,
      itemGap: 28,
      align: 'center',
      itemAlign: 'center',
      start: { x: 670, y: 160 },
    },
  },
  {
    id: 'unequal',
    label: 'Unequal sizes / start alignment',
    layers: [['u-intake'], ['u-scan', 'u-review'], ['u-store', 'u-return']],
    options: {
      direction: 'horizontal',
      layerGap: 55,
      itemGap: 28,
      align: 'start',
      itemAlign: 'start',
      start: { x: 60, y: 600 },
    },
  },
]

export function createData(): IBoardData {
  const colors = ['#DAE8E4', '#E9DECA', '#DDDFF0']
  const groups = LAYOUTS.flatMap((sample, groupIndex) => {
    const ids = sample.layers.flat()
    const texts = ['Receive', 'Digitize', 'Assess', 'Archive', 'Return']
    const shapes = ids.map((id, index) => {
      const shape = createBoardTextBoxShapeElement({
        id,
        text: texts[index],
        left: sample.options.start!.x + index * 150,
        top: sample.options.start!.y,
        width: groupIndex === 2 && index % 2 ? 155 : 120,
        height: groupIndex === 2 && index === 2 ? 90 : 58,
        horizontalAlign: HorizontalAlign.CENTER,
        verticalAlign: VerticalAlign.MIDDLE,
        textStyle: { fs: 17, cl: { rgb: '#304857' } },
      })
      shape.shapeData.shapeType = ShapeTypeEnum.RoundRect
      shape.shapeData.isTextBox = false
      shape.shapeData.fill = { fillType: ShapeFillEnum.SolidFill, color: colors[groupIndex] }
      return shape
    })
    const connectors = [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4],
    ].map(([from, to], index) =>
      createBoardConnectorElement({
        id: sample.id + '-link-' + index,
        start: { kind: 'shapeSite', shapeId: ids[from], connectionSiteId: groupIndex === 1 ? 2 : 1 },
        end: { kind: 'shapeSite', shapeId: ids[to], connectionSiteId: groupIndex === 1 ? 0 : 3 },
        routing: 'straight',
        routingMode: 'auto',
        style: { stroke: '#69838D', strokeWidth: 1.5, endMarker: { type: 'filledArrow' } },
      }),
    )
    return [
      connectors,
      shapes,
      createBoardTextElement({
        id: sample.id + '-label',
        text: sample.label,
        left: sample.options.start!.x,
        top: sample.options.start!.y - 55,
        width: 480,
        height: 42,
        textStyle: { fs: 21, cl: { rgb: '#304857' } },
      }),
    ].flat()
  })
  const elements = [
    ...groups,
    createBoardTextElement({
      id: 'title',
      text: 'Boards / explicit layered layouts',
      left: 60,
      top: 25,
      width: 1080,
      height: 48,
      textStyle: { fs: 29, cl: { rgb: '#304857' } },
    }),
  ]
  return {
    id: 'layered-archive-board',
    name: 'Archive intake / layered layouts',
    appVersion: '1.0.0-rc.0',
    defaultPageSize: { width: 1200, height: 950 },
    activePageId: 'layouts',
    pageOrder: ['layouts'],
    pages: {
      layouts: {
        id: 'layouts',
        name: 'Three layered layouts',
        pageType: BoardPageType.Page,
        elements: Object.fromEntries(elements.map((element) => [element.id, element])),
        elementOrder: elements.map((element) => element.id),
      },
    },
  }
}
