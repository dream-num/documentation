import type { IBoardData } from '@univerjs-pro/boards'
import { BoardPageType, createBoardShapeElement, createBoardTextElement } from '@univerjs-pro/boards'
import {
  ShapeFillEnum,
  ShapeGradientTypeEnum,
  ShapeLineDashEnum,
  ShapeLineTypeEnum,
  ShapeTypeEnum,
} from '@univerjs-pro/engine-shape'

export function createData(): IBoardData {
  const specimens = [
    { id: 'no-fill', label: 'No fill', row: 0, column: 0, width: 2, dash: ShapeLineDashEnum.Solid },
    { id: 'solid', label: 'Solid fill', row: 0, column: 1, width: 2, dash: ShapeLineDashEnum.Solid },
    { id: 'gradient', label: 'Linear gradient', row: 0, column: 2, width: 2, dash: ShapeLineDashEnum.Solid },
    { id: 'thin', label: '1 pt outline', row: 1, column: 0, width: 1, dash: ShapeLineDashEnum.Solid },
    { id: 'medium', label: '4 pt outline', row: 1, column: 1, width: 4, dash: ShapeLineDashEnum.Solid },
    { id: 'heavy', label: '8 pt outline', row: 1, column: 2, width: 8, dash: ShapeLineDashEnum.Solid },
    { id: 'line-solid', label: 'Solid line', row: 2, column: 0, width: 3, dash: ShapeLineDashEnum.Solid },
    { id: 'line-dash', label: 'Dashed line', row: 2, column: 1, width: 3, dash: ShapeLineDashEnum.Dash },
    { id: 'line-dot', label: 'Round dots', row: 2, column: 2, width: 3, dash: ShapeLineDashEnum.RoundDot },
  ]
  const elements = [
    createBoardTextElement({
      id: 'title',
      text: 'Paint and outline / independent properties',
      left: 70,
      top: 30,
      width: 920,
      height: 50,
      textStyle: { fs: 30, cl: { rgb: '#36554C' } },
    }),
    createBoardTextElement({
      id: 'hint',
      text: 'Compare one property per row. Select a shape to use its native formatting tools.',
      left: 70,
      top: 85,
      width: 920,
      height: 40,
      textStyle: { fs: 18, cl: { rgb: '#36554C' } },
    }),
    ...specimens.flatMap((specimen) => {
      const left = 80 + specimen.column * 300
      const top = 160 + specimen.row * 205
      const shape = createBoardShapeElement({
        id: specimen.id,
        shapeType: ShapeTypeEnum.RightTriangle,
        left,
        top,
        width: 185,
        height: 115,
      })
      shape.shapeData.fill =
        specimen.id === 'no-fill'
          ? { fillType: ShapeFillEnum.NoFill }
          : specimen.id === 'gradient'
            ? {
                fillType: ShapeFillEnum.GradientFill,
                gradientType: ShapeGradientTypeEnum.Linear,
                gradientAngle: 0,
                gradientStops: [
                  { position: 0, color: '#D49A82' },
                  { position: 1, color: '#B9CDA7' },
                ],
              }
            : { fillType: ShapeFillEnum.SolidFill, color: '#D49A82' }
      shape.shapeData.stroke = {
        lineStrokeType: ShapeLineTypeEnum.SolidLine,
        width: specimen.width,
        color: '#36554C',
        dashType: specimen.dash,
      }
      return [
        shape,
        createBoardTextElement({
          id: specimen.id + '-label',
          text: specimen.label,
          left,
          top: top + 130,
          width: 230,
          height: 42,
          textStyle: { fs: 20, cl: { rgb: '#36554C' } },
        }),
      ]
    }),
  ]
  return {
    id: 'board-fill-outline-lab',
    name: 'Paint and outline',
    appVersion: '1.0.0-beta.2',
    defaultPageSize: { width: 1100, height: 850 },
    activePageId: 'specimens',
    pageOrder: ['specimens'],
    pages: {
      specimens: {
        id: 'specimens',
        name: 'Paint specimens',
        pageType: BoardPageType.Page,
        elements: Object.fromEntries(elements.map((element) => [element.id, element])),
        elementOrder: elements.map((element) => element.id),
      },
    },
  }
}
