import type { IBoardData } from '@univerjs-pro/boards'
import { BoardPageType, createBoardShapeElement, createBoardTextElement } from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeGradientTypeEnum, ShapeLineTypeEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'

export function createData(): IBoardData {
  const specimens = [
    { id: 'linear-0', label: 'Linear / 0 degrees', row: 0, column: 0 },
    { id: 'linear-90', label: 'Linear / 90 degrees', row: 0, column: 1 },
    { id: 'radial', label: 'Radial / three stops', row: 0, column: 2 },
    { id: 'opaque', label: 'Fill opacity / 100%', row: 1, column: 0 },
    { id: 'translucent', label: 'Fill opacity / 55%', row: 1, column: 1 },
    { id: 'transparent', label: 'Fill opacity / 20%', row: 1, column: 2 },
    { id: 'no-shadow', label: 'No shadow', row: 2, column: 0 },
    { id: 'sharp-shadow', label: 'Shadow / sharp edge', row: 2, column: 1 },
    { id: 'soft-shadow', label: 'Shadow / 16 px blur', row: 2, column: 2 },
  ]
  const elements = [
    createBoardTextElement({
      id: 'title',
      text: 'Light, transparency and depth',
      left: 70,
      top: 25,
      width: 960,
      height: 55,
      textStyle: { fs: 30, cl: { rgb: '#254B5A' } },
    }),
    createBoardTextElement({
      id: 'hint',
      text: 'Compare one property per row. The middle row reveals a native stripe underneath.',
      left: 70,
      top: 80,
      width: 960,
      height: 45,
      textStyle: { fs: 18, cl: { rgb: '#254B5A' } },
    }),
    ...specimens.flatMap((sample) => {
      const left = 90 + sample.column * 300
      const top = 150 + sample.row * 210
      const shape = createBoardShapeElement({
        id: sample.id,
        shapeType: ShapeTypeEnum.RoundRect,
        left,
        top,
        width: 180,
        height: 105,
      })
      shape.shapeData.stroke = { lineStrokeType: ShapeLineTypeEnum.NoLine, width: 0 }
      shape.shapeData.fill =
        sample.row === 0
          ? {
              fillType: ShapeFillEnum.GradientFill,
              gradientType: sample.id === 'radial' ? ShapeGradientTypeEnum.Radial : ShapeGradientTypeEnum.Linear,
              gradientAngle: sample.id === 'linear-90' ? 90 : 0,
              gradientStops: [
                { position: 0, color: '#24566B' },
                { position: 0.5, color: '#4FA7A0' },
                { position: 1, color: '#E2BE83' },
              ],
            }
          : {
              fillType: ShapeFillEnum.SolidFill,
              color: '#4FA7A0',
              opacity: sample.id === 'translucent' ? 0.55 : sample.id === 'transparent' ? 0.2 : 1,
            }
      if (sample.id === 'sharp-shadow' || sample.id === 'soft-shadow') {
        shape.shapeData.outerShadow = {
          color: '#18394A',
          opacity: 0.4,
          blurRadius: sample.id === 'soft-shadow' ? 16 : 0,
          direction: 45,
          distance: 14,
        }
      }
      const stripe = createBoardShapeElement({
        id: sample.id + '-stripe',
        shapeType: ShapeTypeEnum.Rect,
        left: left - 15,
        top: top + 40,
        width: 210,
        height: 25,
      })
      stripe.shapeData.fill = { fillType: ShapeFillEnum.SolidFill, color: '#D5B47E' }
      stripe.shapeData.stroke = { lineStrokeType: ShapeLineTypeEnum.NoLine, width: 0 }
      const specimenElements = [
        shape,
        createBoardTextElement({
          id: sample.id + '-label',
          text: sample.label,
          left,
          top: top + 140,
          width: 265,
          height: 45,
          textStyle: { fs: 19, cl: { rgb: '#254B5A' } },
        }),
      ]
      if (sample.row === 1) specimenElements.unshift(stripe)
      return specimenElements
    }),
  ]
  return {
    id: 'board-gradient-shadow-lab',
    name: 'Gradient and shadow',
    appVersion: '1.0.0-beta.2',
    defaultPageSize: { width: 1100, height: 850 },
    activePageId: 'effects',
    pageOrder: ['effects'],
    pages: {
      effects: {
        id: 'effects',
        name: 'Light and depth',
        pageType: BoardPageType.Page,
        elements: Object.fromEntries(elements.map((e) => [e.id, e])),
        elementOrder: elements.map((e) => e.id),
      },
    },
  }
}
