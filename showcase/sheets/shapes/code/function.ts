import type { FUniver } from '@univerjs/presets'
import { FConnectorShape } from '@univerjs-pro/engine-shape/facade'

export function insertShape(univerAPI: FUniver) {
  const fWorkbook = univerAPI.getActiveWorkbook()!
  const fWorksheet = fWorkbook.insertSheet('Facade API Demo')

  // Insert a smiley face shape
  const smileyFace = fWorksheet.insertShape({
    shapeType: univerAPI.Enum.ShapeTypeEnum.SmileyFace,
    transform: { left: 80, top: 40, width: 240, height: 240 },
    shapeData: {
      fill: {
        fillType: univerAPI.Enum.ShapeFillEnum.SolidFill,
        color: '#e6f4ff',
      },
      stroke: {
        lineStrokeType: univerAPI.Enum.ShapeLineTypeEnum.SolidLine,
        color: '#1677ff',
        width: 2,
      },
    },
  })

  if (!smileyFace) {
    throw new Error('Smiley face could not be inserted.')
  }

  // Connect two shapes with a connector line shape
  const leftShape = fWorksheet.insertShape({
    shapeType: univerAPI.Enum.ShapeTypeEnum.RoundRect,
    transform: { left: 400, top: 160, width: 180, height: 80 },
    shapeData: {
      fill: {
        fillType: univerAPI.Enum.ShapeFillEnum.SolidFill,
        color: '#f6ffed',
      },
      stroke: {
        lineStrokeType: univerAPI.Enum.ShapeLineTypeEnum.SolidLine,
        color: '#52c41a',
      },
    },
  })
  const rightShape = fWorksheet.insertShape({
    shapeType: univerAPI.Enum.ShapeTypeEnum.Diamond,
    transform: { left: 760, top: 140, width: 180, height: 120 },
    shapeData: {
      fill: {
        fillType: univerAPI.Enum.ShapeFillEnum.SolidFill,
        color: '#fffbe6',
      },
      stroke: {
        lineStrokeType: univerAPI.Enum.ShapeLineTypeEnum.SolidLine,
        color: '#faad14',
      },
    },
  })
  const connectorShape = fWorksheet.insertShape({
    shapeType: univerAPI.Enum.ShapeTypeEnum.CurvedConnector2,
    transform: { left: 580, top: 180, width: 180, height: 40 },
  })

  if (!leftShape || !rightShape || !(connectorShape instanceof FConnectorShape)) {
    throw new Error('Connected shapes could not be inserted.')
  }

  const startSite = leftShape.getConnectionSites()[0]
  const endSites = rightShape.getConnectionSites()
  const endSite = endSites[2] ?? endSites[0]

  if (!startSite || !endSite) {
    throw new Error('Connection site could not be resolved.')
  }

  connectorShape
    .bindStart(leftShape.getId(), startSite.index)
    .bindEnd(rightShape.getId(), endSite.index)
    .setStartArrow(univerAPI.Enum.ShapeArrowTypeEnum.Arrow)
    .setEndArrow(univerAPI.Enum.ShapeArrowTypeEnum.Arrow)
    .setStrokeColor('#595959')
    .setStrokeWidth(2)

  // Set the active sheet back to the first sheet after 3 seconds
  setTimeout(() => {
    fWorkbook.setActiveSheet(fWorkbook.getSheets()[0])
  }, 3000)
}
