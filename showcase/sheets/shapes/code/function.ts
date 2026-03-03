import type { FUniver } from '@univerjs/presets'

export async function insertShape(univerAPI: FUniver) {
  const fWorkbook = univerAPI.getActiveWorkbook()!
  const fWorksheet = await fWorkbook.insertSheet('Facade API Demo')

  // Insert a smiley face shape
  const smileyFace = fWorksheet.newShape()
    .setShapeType(univerAPI.Enum.ShapeTypeEnum.SmileyFace)
    .setPosition(1, 1, 0, 0)
    .setWidth(240)
    .setHeight(240)
    .setShapeSolidFill('#e6f4ff')
    .setStrokeColor('#1677ff')
    .setStrokeWidth(2)
    .build()
  await fWorksheet.insertShape(smileyFace)

  // Connect two shapes with a connector line shape
  const leftShape = fWorksheet.newShape()
  const leftShapeInfo = leftShape
    .setShapeType(univerAPI.Enum.ShapeTypeEnum.RoundRect)
    .setPosition(3, 5, 0, 0)
    .setWidth(180)
    .setHeight(80)
    .setShapeSolidFill('#f6ffed')
    .setStrokeColor('#52c41a')
    .build()
  await fWorksheet.insertShape(leftShapeInfo)

  const rightShape = fWorksheet.newShape()
  const rightShapeInfo = rightShape
    .setShapeType(univerAPI.Enum.ShapeTypeEnum.Diamond)
    .setPosition(3, 9, 0, 0)
    .setWidth(180)
    .setHeight(120)
    .setShapeSolidFill('#fffbe6')
    .setStrokeColor('#faad14')
    .build()
  await fWorksheet.insertShape(rightShapeInfo)

  const connectorShape = fWorksheet.newConnector()
  const connectorShapeInfo = connectorShape
    .setShapeType(univerAPI.Enum.ShapeTypeEnum.CurvedConnector2)
    .setPosition(4, 7, 0, 0)
    .setWidth(220)
    .setHeight(40)
    .setStartArrowType(univerAPI.Enum.ShapeArrowTypeEnum.Arrow)
    .setEndArrowType(univerAPI.Enum.ShapeArrowTypeEnum.Arrow)
    .setStrokeColor('#595959')
    .setStrokeWidth(2)
    .build()
  await fWorksheet.insertShape(connectorShapeInfo)
  await fWorksheet.connectShapes({
    connector: connectorShape,
    startTarget: { shape: leftShape, connectionSiteIndex: 0 },
    endTarget: { shape: rightShape, connectionSiteIndex: 2 },
  })

  // Set the active sheet back to the first sheet after 3 seconds
  setTimeout(() => {
    fWorkbook.setActiveSheet(fWorkbook.getSheets()[0])
  }, 3000)
}
