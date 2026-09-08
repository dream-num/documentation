import { BoardPageType, createBoardShapeElement, createBoardTextElement, type IBoardData } from '@univerjs-pro/boards'
import { ShapeTypeEnum } from '@univerjs-pro/engine-shape'

export function createData(): IBoardData {
  const variants = [
    { id: 'original', label: 'Triangle · 0°', rotation: 0, flipX: false, flipY: false },
    { id: 'diagonal', label: 'Rotate 45°', rotation: 45, flipX: false, flipY: false },
    { id: 'quarter-turn', label: 'Rotate 90°', rotation: 90, flipX: false, flipY: false },
    { id: 'flip-x', label: 'Flip horizontally', rotation: 0, flipX: true, flipY: false },
    { id: 'flip-y', label: 'Flip vertically', rotation: 0, flipX: false, flipY: true },
    { id: 'flip-both', label: 'Flip both axes', rotation: 0, flipX: true, flipY: true },
    { id: 'arrow-original', label: 'Bent arrow · 0°', rotation: 0, flipX: false, flipY: false },
    { id: 'arrow-half-turn', label: 'Rotate 180°', rotation: 180, flipX: false, flipY: false },
    { id: 'arrow-combined', label: 'Rotate 90° + flip X', rotation: 90, flipX: true, flipY: false },
  ]
  const elements = [
    createBoardTextElement({
      id: 'title',
      text: 'Rotation and reflection',
      left: 70,
      top: 30,
      width: 920,
      height: 50,
      textStyle: { fs: 30, cl: { rgb: '#394859' } },
    }),
    createBoardTextElement({
      id: 'hint',
      text: 'Same dimensions. Different transforms. Labels stay upright and separate.',
      left: 70,
      top: 85,
      width: 920,
      height: 40,
      textStyle: { fs: 18, cl: { rgb: '#394859' } },
    }),
    ...variants.flatMap((item, index) => {
      const left = 80 + (index % 3) * 300
      const top = 170 + Math.floor(index / 3) * 225
      const shape = createBoardShapeElement({
        id: item.id,
        shapeType: index < 6 ? ShapeTypeEnum.RightTriangle : ShapeTypeEnum.BentUpArrow,
        left,
        top,
        width: 170,
        height: 110,
        fillColor: index < 6 ? '#CE9C8A' : '#A7BCA3',
        strokeColor: '#394859',
        strokeWidth: 2,
      })
      shape.transform = { ...shape.transform, rotation: item.rotation, flipX: item.flipX, flipY: item.flipY }
      return [
        shape,
        createBoardTextElement({
          id: item.id + '-label',
          text: item.label,
          left: left - 5,
          top: top + 160,
          width: 240,
          height: 42,
          textStyle: { fs: 19, cl: { rgb: '#394859' } },
        }),
      ]
    }),
  ]
  return {
    id: 'board-transform-lab',
    name: 'Rotation and reflection',
    appVersion: '1.0.0-beta.2',
    defaultPageSize: { width: 1100, height: 850 },
    activePageId: 'specimens',
    pageOrder: ['specimens'],
    pages: {
      specimens: {
        id: 'specimens',
        name: 'Transform specimens',
        pageType: BoardPageType.Page,
        elements: Object.fromEntries(elements.map((e) => [e.id, e])),
        elementOrder: elements.map((e) => e.id),
      },
    },
  }
}
