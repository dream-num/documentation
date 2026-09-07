/* eslint-disable no-await-in-loop -- Test each native setter with its own workbook and history. */
// Strict native regression, independent of the showcase's builder-based workaround.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const drawingRequire = createRequire(require.resolve('@univerjs/preset-sheets-drawing'))
const { Univer, IUniverInstanceService, DrawingTypeEnum, ImageSourceType } = require('@univerjs/core')
const { FUniver } = require('@univerjs/core/facade')
const { UniverSheetsPlugin } = require('@univerjs/sheets')
const { UniverDrawingPlugin } = require('@univerjs/drawing')
const { IRenderManagerService, RenderManagerService } = require('@univerjs/engine-render')
const { UniverSheetsDrawingPlugin } = drawingRequire('@univerjs/sheets-drawing')
require('@univerjs/sheets/facade')
drawingRequire('@univerjs/sheets-drawing/facade')
const univer = new Univer()
univer.__getInjector().add([IRenderManagerService, { useClass: RenderManagerService }])
univer.registerPlugin(UniverSheetsPlugin)
univer.registerPlugin(UniverDrawingPlugin)
univer.registerPlugin(UniverSheetsDrawingPlugin)
const api = FUniver.newAPI(univer)
const failures = []
try {
  for (const operation of ['source', 'crop', 'rotate']) {
    const workbook = api.createWorkbook({
      id: 'direct-' + operation,
      sheetOrder: ['one'],
      sheets: { one: { id: 'one', name: 'One', rowCount: 20, columnCount: 10, cellData: {} } },
    })
    const sheet = workbook.getActiveSheet()
    const original = {
      unitId: workbook.getId(),
      subUnitId: 'one',
      drawingId: 'image',
      drawingType: DrawingTypeEnum.DRAWING_IMAGE,
      imageSourceType: ImageSourceType.BASE64,
      source: 'old-source',
      anchorType: '0',
      transform: { left: 100, top: 100, width: 80, height: 60, angle: 0 },
      sheetTransform: {
        from: { row: 3, column: 1, rowOffset: 4, columnOffset: 12 },
        to: { row: 5, column: 2, rowOffset: 0, columnOffset: 4 },
        angle: 0,
      },
    }
    sheet.insertImages([structuredClone(original)])
    univer.__getInjector().get(IUniverInstanceService).focusUnit(workbook.getId())
    const current = sheet.getImageById('image')
    if (operation === 'source') current.setSource('new-source', ImageSourceType.BASE64)
    if (operation === 'crop') current.setCrop(10, 10, 10, 10)
    if (operation === 'rotate') {
      // Rotation needs a model skeleton; the builder materializes it without a UI.
      await sheet.newOverGridImage().setSource('old-source').setWidth(80).setHeight(60).buildAsync()
      current.setRotate(30)
    }
    workbook.undo()
    const data = JSON.parse(workbook.save().resources.find((item) => item.name === 'SHEET_DRAWING_PLUGIN').data).one
      .data.image
    const expected = operation === 'source' ? original.source : operation === 'crop' ? null : 0
    const actual =
      operation === 'source' ? data.source : operation === 'crop' ? (data.srcRect ?? null) : data.transform.angle
    console.log(JSON.stringify({ operation, expected, actual }))
    try {
      assert.deepEqual(actual, expected)
    } catch {
      failures.push(operation + ': direct Facade setter Undo retains changed data')
    }
    api.disposeUnit(workbook.getId())
  }
  assert.deepEqual(failures, [], 'Direct image setters must preserve Undo data')
} finally {
  univer.dispose()
}
