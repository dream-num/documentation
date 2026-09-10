import type { IBoardData, IBoardPageElement } from '@univerjs-pro/boards'
import {
  BoardPageType,
  createBoardSwimlaneElement,
  createBoardTextBoxShapeElement,
  resolveBoardSwimlaneLaneRegionsInFilledBounds,
} from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { HorizontalAlign, LocaleType, VerticalAlign } from '@univerjs/core'

export function createData(): IBoardData {
  const elements: IBoardPageElement[] = []
  const title = createBoardTextBoxShapeElement({
    id: 'title',
    text: 'Swimlanes / direction, size and retained content',
    left: 40,
    top: 24,
    width: 1030,
    height: 52,
    textStyle: { fs: 25, ff: 'Arial', cl: { rgb: '#263E49' } },
  })
  elements.push(title)
  for (const sample of [
    {
      id: 'horizontal',
      title: '01 / Horizontal lanes',
      orientation: 'horizontal' as const,
      left: 40,
      top: 110,
      width: 470,
      height: 300,
      sizes: [88, 88, 88],
      color: '#ECF4F2',
      cards: ['Label jars', 'Pack trays', 'Check seals'],
    },
    {
      id: 'vertical',
      title: '02 / Vertical lanes',
      orientation: 'vertical' as const,
      left: 560,
      top: 110,
      width: 500,
      height: 300,
      sizes: [165, 165, 170],
      color: '#F2EDF6',
      cards: ['Draw route', 'Review stops', 'Print maps'],
    },
    {
      id: 'unequal',
      title: '03 / Unequal lanes; Review initially collapsed',
      orientation: 'horizontal' as const,
      left: 40,
      top: 490,
      width: 1020,
      height: 300,
      sizes: [64, 120, 80],
      color: '#FBF2E5',
      cards: ['Collect swatches', 'Compare dyes', 'Archive samples'],
    },
  ]) {
    const container = createBoardSwimlaneElement({
      id: sample.id,
      title: sample.title,
      orientation: sample.orientation,
      left: sample.left,
      top: sample.top,
      width: sample.width,
      height: sample.height,
      fillColor: sample.color,
      strokeColor: '#82939D',
      strokeWidth: 1,
      headerSize: sample.orientation === 'horizontal' ? 100 : 36,
      collapsedLaneSize: 32,
      lanes: ['intake', 'review', 'ready'].map((id, index) => ({
        id,
        title: ['Intake', 'Review', 'Ready'][index],
        size: sample.sizes[index],
      })),
    })
    elements.push(container)
    // Use SDK layout geometry to author genuine parented cells, not a host swimlane renderer.
    const lanes = resolveBoardSwimlaneLaneRegionsInFilledBounds(container, {
      left: sample.left,
      top: sample.top,
      width: sample.width,
      height: sample.height,
    })
    for (const [index, region] of lanes.entries()) {
      const card = createBoardTextBoxShapeElement({
        id: `${sample.id}-${region.lane.id}`,
        parentId: sample.id,
        laneId: region.lane.id,
        text: sample.cards[index],
        left: region.contentBounds.left - sample.left + 12,
        top: region.contentBounds.top - sample.top + 10,
        width: sample.orientation === 'horizontal' ? 175 : 138,
        height: 42,
        horizontalAlign: HorizontalAlign.CENTER,
        verticalAlign: VerticalAlign.MIDDLE,
        textStyle: { fs: 15, ff: 'Arial', cl: { rgb: '#263E49' } },
      })
      card.shapeData.shapeType = ShapeTypeEnum.RoundRect
      card.shapeData.fill = { fillType: ShapeFillEnum.SolidFill, color: ['#CCE4DD', '#E5D7ED', '#F4DCAD'][index] }
      card.shapeData.stroke = { lineStrokeType: ShapeLineTypeEnum.SolidLine, color: '#82939D', width: 1 }
      elements.push(card)
    }
  }
  elements.push(
    createBoardTextBoxShapeElement({
      id: 'caption',
      text: 'Right-click a lane header to rename, move or collapse it. Collapsing is not deletion.',
      left: 40,
      top: 830,
      width: 1030,
      height: 42,
      textStyle: { fs: 17, ff: 'Arial', cl: { rgb: '#526673' } },
    }),
  )
  return {
    id: 'swimlane-gallery',
    name: 'Swimlane orientation and lanes',
    appVersion: '1.0.0-rc.0',
    locale: LocaleType.EN_US,
    defaultPageSize: { width: 1100, height: 900 },
    activePageId: 'lanes',
    pageOrder: ['lanes'],
    pages: {
      lanes: {
        id: 'lanes',
        name: 'Swimlane specimens',
        pageType: BoardPageType.Page,
        elementOrder: elements.map(({ id }) => id),
        elements: Object.fromEntries(elements.map((element) => [element.id, element])),
      },
    },
  }
}
