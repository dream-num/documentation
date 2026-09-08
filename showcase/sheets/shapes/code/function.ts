import type { FUniver } from '@univerjs/presets'
import { FConnectorShape, type FShape } from '@univerjs-pro/engine-shape/facade'
import { FSheetShape } from '@univerjs-pro/sheets-shape/facade'

// Original inline illustration: no third-party asset or network request.
const IMAGE_FILL =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="240"><rect width="480" height="240" fill="#075985"/><circle cx="100" cy="90" r="68" fill="#fbbf24"/><path d="M0 160 Q120 85 240 160 T480 160 V240 H0Z" fill="#22d3ee"/><path d="M0 210 Q120 135 240 210 T480 210 V240 H0Z" fill="#0d9488"/></svg>',
  )

function bindNodes(connector: FConnectorShape, source: FShape, destination: FShape) {
  const sourceSites = source.getConnectionSites(),
    destinationSites = destination.getConnectionSites()
  if (!sourceSites.length || !destinationSites.length) throw new Error('Missing shape connection site.')
  const start = sourceSites.reduce((a, b) => (a.x >= b.x ? a : b))
  const end = destinationSites.reduce((a, b) => (a.x <= b.x ? a : b))
  connector.bindStart(source.getId(), start.index).bindEnd(destination.getId(), end.index)
}

export function seedGallery(api: FUniver, _legacyChinese = false) {
  const workbook = api.getActiveWorkbook()!
  const E = api.Enum
  function shape(
    sheetId: string,
    name: string,
    type: Parameters<ReturnType<typeof workbook.getActiveSheet>['insertShape']>[0]['shapeType'],
    left: number,
    top: number,
    color = '#bae6fd',
    width = 160,
    height = 85,
  ) {
    const result = workbook.getSheetBySheetId(sheetId)!.insertShape({
      name,
      shapeType: type,
      transform: { left, top, width, height },
      shapeData: {
        fill: { fillType: E.ShapeFillEnum.SolidFill, color },
        stroke: { lineStrokeType: E.ShapeLineTypeEnum.SolidLine, color: '#075985', width: 2 },
      },
    })
    if (!result) throw new Error('The SDK did not insert ' + name)
    result
      .getText()
      .setText(name)
      .setFontSize(15)
      .setColor('#0f172a')
      .setHorizontalAlign(E.HorizontalAlign.CENTER)
      .setVerticalAlign(E.VerticalAlign.MIDDLE)
    return result
  }
  const presets = [
    E.ShapeTypeEnum.RoundRect,
    E.ShapeTypeEnum.Rect,
    E.ShapeTypeEnum.Ellipse,
    E.ShapeTypeEnum.Diamond,
    E.ShapeTypeEnum.SmileyFace,
    E.ShapeTypeEnum.Heart,
    E.ShapeTypeEnum.Star5,
    E.ShapeTypeEnum.Cloud,
  ]
  const names = ['Rounded 40%', 'Gradient', 'Image', 'Crop 20%', 'Smiley', 'Heart', 'Star', 'No fill']
  const colors = ['#bae6fd', '#99f6e4', '#fde68a', '#fed7aa', '#ddd6fe', '#fecdd3', '#fef08a', '#ccfbf1']
  const gallery = presets.map((type, i) =>
    shape('geometry', names[i], type, 65 + (i % 4) * 205, 60 + Math.floor(i / 4) * 150, colors[i]),
  )
  gallery[0].setAdjustValues({ adj: 40000 })
  gallery[1].setGradientFill(
    E.ShapeGradientTypeEnum.Linear,
    [
      { position: 0, color: '#38bdf8' },
      { position: 1, color: '#99f6e4' },
    ],
    45,
  )
  for (const i of [2, 3])
    gallery[i].setImageFill(IMAGE_FILL, E.ShapeImageSourceTypeEnum.URL, {
      imageOpacity: 1,
      imageRotateWithShape: false,
      imageTile: {},
      stretchFillRect: { left: 0, top: 0, right: 0, bottom: 0 },
      imageFillMode: E.ShapeImageFillModeEnum.Stretch,
      srcRect: { left: i === 3 ? 20 : 0, right: i === 3 ? 20 : 0, top: 0, bottom: 0 },
    })
  gallery[7].setNoneFill()
  shape('geometry', 'Custom path', E.ShapeTypeEnum.Rect, 45, 330, '#99f6e4', 200, 100).setCustomGeometryFromSvgPath({
    pathData: 'M0 0 L160 0 L200 50 L160 100 L0 100 L40 50 Z',
    width: 200,
    height: 100,
  })

  const text = [
    shape('text', 'Left / top', E.ShapeTypeEnum.Rect, 45, 65),
    shape('text', 'Center / middle', E.ShapeTypeEnum.RoundRect, 285, 65, '#99f6e4'),
    shape('text', 'Right / bottom', E.ShapeTypeEnum.Rect, 525, 65, '#fde68a'),
  ]
  text[0]
    .getText()
    .setHorizontalAlign(E.HorizontalAlign.LEFT)
    .setVerticalAlign(E.VerticalAlign.TOP)
    .setTextStyle({ bl: 1, fs: 18, cl: { rgb: '#075985' } })
  text[1].setStroke({ color: '#0f766e', width: 4, dashType: E.ShapeLineDashEnum.Dash })
  text[1].getText().setTextStyle({ it: 1, fs: 16, cl: { rgb: '#0f766e' } })
  text[2].getText().setHorizontalAlign(E.HorizontalAlign.RIGHT).setVerticalAlign(E.VerticalAlign.BOTTOM)
  text[2].setStroke({ color: '#b45309', width: 4, opacity: 0.5 })
  shape('text', 'Rotation 20°', E.ShapeTypeEnum.Rect, 70, 255, '#ddd6fe').setRotation(20)
  shape('text', 'Behind', E.ShapeTypeEnum.Rect, 340, 245, '#bae6fd')
  shape('text', 'In front', E.ShapeTypeEnum.Ellipse, 410, 285, '#fecdd3').bringToFront()

  const routes = [E.ShapeTypeEnum.StraightConnector1, E.ShapeTypeEnum.BentConnector3, E.ShapeTypeEnum.CurvedConnector2]
  const routeNames = ['Straight', 'Elbow', 'Curved']
  routes.forEach((route, i) => {
    const y = 65 + i * 150
    const source = shape('connectors', 'Start ' + (i + 1), E.ShapeTypeEnum.RoundRect, 45, y, colors[i])
    const target = shape('connectors', 'End ' + (i + 1), E.ShapeTypeEnum.Diamond, 475, y - 10, colors[i + 3], 160, 105)
    const connector = workbook.getSheetBySheetId('connectors')!.insertShape({
      name: routeNames[i],
      shapeType: route,
      transform: { left: 205, top: y + 43, width: 270, height: 1 },
    })
    if (!(connector instanceof FConnectorShape)) throw new Error('Expected connector.')
    bindNodes(connector, source, target)
    connector
      .setStrokeColor('#075985')
      .setStrokeWidth(3)
      .setStartArrow(i === 1 ? E.ShapeArrowTypeEnum.DiamondArrow : E.ShapeArrowTypeEnum.None)
      .setEndArrow(
        i === 0 ? E.ShapeArrowTypeEnum.Arrow : i === 1 ? E.ShapeArrowTypeEnum.OpenArrow : E.ShapeArrowTypeEnum.None,
      )
  })

  const anchors = [E.SheetDrawingAnchorType.Position, E.SheetDrawingAnchorType.Both, E.SheetDrawingAnchorType.None]
  const anchorNames = ['Move with cells', 'Move and size', 'Fixed position']
  anchors.forEach((kind, i) => {
    const sample = shape('placement', anchorNames[i], E.ShapeTypeEnum.RoundRect, 45 + i * 240, 65, colors[i], 205, 115)
    if (!(sample instanceof FSheetShape) || !sample.setPlacement({ kind, bounds: sample.getTransform()! }))
      throw new Error('The SDK rejected sheet anchoring.')
  })
}
