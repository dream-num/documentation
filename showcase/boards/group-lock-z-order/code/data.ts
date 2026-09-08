import type { IBoardData } from '@univerjs-pro/boards'
import { BoardPageType, createBoardTextBoxShapeElement } from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { BooleanNumber, HorizontalAlign, VerticalAlign } from '@univerjs/core'

export const GROUP_IDS = ['group-a', 'group-b', 'group-c'] as const
export const NESTED_IDS = ['nested-a', 'nested-b'] as const
export function createData(_legacyLocale = false): IBoardData {
  const nodes = [
    {
      id: 'label-layers',
      en: '01 · Layer order',
      left: 40,
      top: 30,
      width: 340,
      height: 42,
      fill: '#F1F5F9',
    },
    { id: 'layer-back', en: 'Back', left: 60, top: 100, width: 180, height: 110, fill: '#BAE6FD' },
    { id: 'layer-middle', en: 'Middle', left: 130, top: 145, width: 180, height: 110, fill: '#FDE68A' },
    { id: 'layer-front', en: 'Front', left: 200, top: 190, width: 180, height: 110, fill: '#FDA4AF' },
    {
      id: 'label-group',
      en: '02 · One group',
      left: 490,
      top: 30,
      width: 350,
      height: 42,
      fill: '#F1F5F9',
    },
    { id: 'group-a', en: 'A', left: 510, top: 120, width: 95, height: 95, fill: '#A7F3D0' },
    { id: 'group-b', en: 'B', left: 625, top: 120, width: 95, height: 95, fill: '#99F6E4' },
    { id: 'group-c', en: 'C', left: 740, top: 120, width: 95, height: 95, fill: '#BAE6FD' },
    {
      id: 'label-nested',
      en: '03 · Nested groups',
      left: 40,
      top: 365,
      width: 340,
      height: 42,
      fill: '#F1F5F9',
    },
    { id: 'nested-a', en: 'Inner A', left: 65, top: 535, width: 115, height: 90, fill: '#DDD6FE' },
    { id: 'nested-b', en: 'Inner B', left: 195, top: 535, width: 115, height: 90, fill: '#C4B5FD' },
    {
      id: 'nested-peer',
      en: 'Outer peer',
      left: 335,
      top: 535,
      width: 115,
      height: 90,
      fill: '#FBCFE8',
    },
    {
      id: 'label-lock',
      en: '04 · Locked / movable',
      left: 510,
      top: 365,
      width: 350,
      height: 42,
      fill: '#F1F5F9',
    },
    { id: 'locked', en: 'Locked', left: 550, top: 460, width: 130, height: 100, fill: '#CBD5E1' },
    { id: 'unlocked', en: 'Drag me', left: 720, top: 460, width: 130, height: 100, fill: '#FDE68A' },
  ]
  const elements = nodes.map((node) => {
    const shape = createBoardTextBoxShapeElement({
      id: node.id,
      text: node.en,
      left: node.left,
      top: node.top,
      width: node.width,
      height: node.height,
      horizontalAlign: HorizontalAlign.CENTER,
      verticalAlign: VerticalAlign.MIDDLE,
      textStyle: { fs: 16, bl: BooleanNumber.TRUE, cl: { rgb: '#243746' } },
      textWrap: ShapeTextWrapType.Square,
    })
    shape.name = node.en
    shape.shapeData.shapeType = ShapeTypeEnum.RoundRect
    shape.shapeData.fill = { fillType: ShapeFillEnum.SolidFill, color: node.fill }
    shape.shapeData.stroke = { lineStrokeType: ShapeLineTypeEnum.SolidLine, color: '#64748B', width: 1 }
    return shape
  })
  return {
    id: 'groups-locks-layers',
    name: 'Groups, locks and layers',
    appVersion: '1.0.0-beta.2',
    defaultPageSize: { width: 1000, height: 660 },
    activePageId: 'gallery',
    pageOrder: ['gallery'],
    pages: {
      gallery: {
        id: 'gallery',
        name: 'Feature specimens',
        pageType: BoardPageType.Page,
        elementOrder: elements.map((e) => e.id),
        elements: Object.fromEntries(elements.map((e) => [e.id, e])),
      },
    },
  }
}
