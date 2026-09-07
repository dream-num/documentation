import type { FUniver } from '@univerjs/presets'
import { FConnectorShape, type FShape } from '@univerjs-pro/engine-shape/facade'

// An original, self-contained vector illustration, not a third-party image or remote request.
export const IMAGE_FILL =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="240" viewBox="0 0 480 240"><rect width="480" height="240" fill="#075985"/><circle cx="100" cy="90" r="68" fill="#fbbf24"/><path d="M0 160 Q120 85 240 160 T480 160 V240 H0Z" fill="#22d3ee"/><path d="M0 210 Q120 135 240 210 T480 210 V240 H0Z" fill="#0d9488"/></svg>',
  )

export function bindNodes(connector: FConnectorShape, source: FShape, destination: FShape) {
  // Resolve connection sites from current geometry; do not assume preset-specific indices.
  const sourceSites = source.getConnectionSites(),
    destinationSites = destination.getConnectionSites()
  if (!sourceSites.length || !destinationSites.length)
    throw new Error('The selected node geometry has no connection site.')
  const start = sourceSites.reduce((a, b) => (a.x >= b.x ? a : b))
  const end = destinationSites.reduce((a, b) => (a.x <= b.x ? a : b))
  connector.bindStart(source.getId(), start.index).bindEnd(destination.getId(), end.index)
}

export function seedWorkbench(api: FUniver) {
  const sheet = api.getActiveWorkbook()!.getSheetBySheetId('workbench')!
  const E = api.Enum
  const nodes = [
    { name: 'Intake', type: E.ShapeTypeEnum.RoundRect, x: 65, y: 65, w: 170, h: 85, color: '#bae6fd' },
    { name: 'Sample decision', type: E.ShapeTypeEnum.Diamond, x: 335, y: 50, w: 180, h: 115, color: '#fde68a' },
    { name: 'Release', type: E.ShapeTypeEnum.RoundRect, x: 615, y: 65, w: 170, h: 85, color: '#99f6e4' },
    { name: 'Crew ready', type: E.ShapeTypeEnum.SmileyFace, x: 65, y: 220, w: 115, h: 100, color: '#ddd6fe' },
  ].map((node) => {
    const shape = sheet.insertShape({
      name: node.name,
      description: 'Marlow reservoir commissioning · original fictional workflow',
      shapeType: node.type,
      transform: { left: node.x, top: node.y, width: node.w, height: node.h },
      shapeData: {
        fill: { fillType: E.ShapeFillEnum.SolidFill, color: node.color },
        stroke: { lineStrokeType: E.ShapeLineTypeEnum.SolidLine, color: '#0f172a', width: 2 },
      },
    })
    if (!shape) throw new Error('The SDK did not insert ' + node.name)
    if (node.name !== 'Crew ready') {
      shape
        .getText()
        .setText(node.name)
        .setFontSize(16)
        .setColor('#0f172a')
        .setHorizontalAlign(E.HorizontalAlign.CENTER)
        .setVerticalAlign(E.VerticalAlign.MIDDLE)
    }
    return shape
  })
  for (let i = 0; i < 2; i++) {
    const connector = sheet.insertShape({
      name: i === 0 ? 'Intake to sample' : 'Sample to release',
      shapeType: E.ShapeTypeEnum.BentConnector3,
      transform: { left: 235 + 280 * i, top: 108, width: 100, height: 10 },
    })
    if (!(connector instanceof FConnectorShape)) throw new Error('The SDK did not create a connector.')
    bindNodes(connector, nodes[i], nodes[i + 1])
    connector.setEndArrow(E.ShapeArrowTypeEnum.Arrow).setStrokeColor('#334155').setStrokeWidth(3)
  }
  return nodes[0].getId()
}
