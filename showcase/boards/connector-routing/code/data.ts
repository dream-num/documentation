import type { IBoardConnectorEndpoint, IBoardData } from '@univerjs-pro/boards'
import { BoardPageType, createBoardConnectorElement, createBoardTextBoxShapeElement } from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { BooleanNumber, HorizontalAlign, VerticalAlign } from '@univerjs/core'

// Original synthetic release workflow. Stable IDs; no external services or assets.
export const NODES = [
  { id: 'source', text: 'Source\nSigned commit', left: 50, top: 70 },
  { id: 'lint', text: 'Lint\nStatic analysis', left: 250, top: 70 },
  { id: 'tests', text: 'Tests\npass?', left: 450, top: 55, decision: true },
  { id: 'package', text: 'Package\nBuild artifact', left: 680, top: 70 },
  { id: 'quarantine', text: 'Quarantine\nInvestigate failure', left: 50, top: 320 },
  { id: 'staging', text: 'Staging\nSmoke tests', left: 250, top: 320 },
  { id: 'signed', text: 'Signed\nvalid?', left: 450, top: 305, decision: true },
  { id: 'release', text: 'Release\nPublish artifact', left: 680, top: 320 },
] as const

export const EDGES = [
  { id: 'source-lint', from: 'source', to: 'lint', fromSide: 1, toSide: 3, label: 'Analyze' },
  { id: 'lint-tests', from: 'lint', to: 'tests', fromSide: 1, toSide: 3, label: 'Run tests' },
  { id: 'tests-package', from: 'tests', to: 'package', fromSide: 1, toSide: 3, label: 'Pass' },
  { id: 'tests-quarantine', from: 'tests', to: 'quarantine', fromSide: 2, toSide: 0, label: 'Fail' },
  { id: 'package-signed', from: 'package', to: 'signed', fromSide: 2, toSide: 0, label: 'Verify' },
  { id: 'signed-release', from: 'signed', to: 'release', fromSide: 1, toSide: 3, label: 'Valid' },
  { id: 'signed-quarantine', from: 'signed', to: 'quarantine', fromSide: 3, toSide: 1, label: 'Invalid' },
  { id: 'quarantine-source', from: 'quarantine', to: 'source', fromSide: 3, toSide: 3, label: 'Retry' },
  { id: 'release-staging', from: 'release', to: 'staging', fromSide: 2, toSide: 2, label: 'Deploy' },
  { id: 'staging-tests', from: 'staging', to: 'tests', fromSide: 0, toSide: 2, label: 'Regression' },
  { id: 'lint-quarantine', from: 'lint', to: 'quarantine', fromSide: 2, toSide: 1, label: 'Lint failure' },
  { id: 'staging-release', from: 'staging', to: 'release', fromSide: 1, toSide: 0, label: 'Promotion (detached)' },
] as const

export const VARIANTS = [
  { id: 'orthogonal', label: 'Orthogonal · automatic', routing: 'orthogonal' },
  { id: 'straight', label: 'Straight · direct', routing: 'straight' },
  { id: 'curve', label: 'Curve · smooth', routing: 'curve' },
  { id: 'manual', label: 'Polyline · manual waypoints', routing: 'freePolyline' },
] as const

export function boundEndpoint(shapeId: string, connectionSiteId: number): IBoardConnectorEndpoint {
  return { kind: 'shapeSite', shapeId, connectionSiteId }
}

const shapes = NODES.map((node) => {
  const decision = 'decision' in node
  const shape = createBoardTextBoxShapeElement({
    id: node.id,
    text: node.text,
    left: node.left,
    top: node.top,
    width: 140,
    height: decision ? 100 : 70,
    horizontalAlign: HorizontalAlign.CENTER,
    verticalAlign: VerticalAlign.MIDDLE,
    textStyle: { fs: 13, bl: BooleanNumber.TRUE, cl: { rgb: '#172033' } },
    textWrap: ShapeTextWrapType.Square,
  })
  shape.shapeData.shapeType = decision ? ShapeTypeEnum.Diamond : ShapeTypeEnum.RoundRect
  shape.shapeData.fill = { fillType: ShapeFillEnum.SolidFill, color: decision ? '#FEF3C7' : '#E0F2FE' }
  shape.shapeData.stroke = {
    lineStrokeType: ShapeLineTypeEnum.SolidLine,
    color: decision ? '#B45309' : '#0284C7',
    width: 1.5,
  }
  return shape
})
// Distinct native routes tell different business stories, not four copies of one line.
const connectors = EDGES.map((edge) => {
  const retry = edge.id === 'quarantine-source'
  const returnPath = edge.id === 'release-staging'
  const failure = ['tests-quarantine', 'signed-quarantine', 'lint-quarantine'].includes(edge.id)
  const promotion = edge.id === 'staging-release'
  return createBoardConnectorElement({
    id: edge.id,
    start: boundEndpoint(edge.from, edge.fromSide),
    end: promotion ? { kind: 'free', x: 750, y: 285 } : boundEndpoint(edge.to, edge.toSide),
    routing: retry ? 'freePolyline' : returnPath ? 'curve' : edge.id === 'source-lint' ? 'straight' : 'orthogonal',
    routingMode: retry ? 'manual' : 'auto',
    waypoints: retry
      ? [
          { id: 'retry-west-bottom', x: 10, y: 355, kind: 'manual' },
          { id: 'retry-west-top', x: 10, y: 105, kind: 'manual' },
        ]
      : [],
    style: {
      stroke: promotion ? '#DC2626' : failure ? '#B45309' : retry ? '#7C3AED' : returnPath ? '#0284C7' : '#0F766E',
      strokeWidth: promotion ? 2.5 : 2,
      dash: promotion || failure ? [7, 4] : [],
      endMarker: { type: retry ? 'openArrow' : 'filledArrow' },
    },
    label: {
      id: edge.id + '-label',
      content: edge.label,
      layout: { mode: 'fixedSize', width: edge.label.length * 9 + 14, height: 24 },
      placement: {
        anchor: 'path',
        pathRatio: edge.id === 'staging-tests' ? 0.25 : 0.5,
        offset: {
          space: 'canvas',
          x: edge.id === 'tests-quarantine' ? 100 : edge.id === 'staging-tests' ? 90 : 0,
          y: ['source-lint', 'lint-tests'].includes(edge.id) ? -58 : -18,
        },
      },
      style: { fill: { color: '#FFFFFF', opacity: 0.96 }, interruptLine: true, lineGap: 3 },
    },
  })
})
const elements = [...connectors, ...shapes]
export const DATA: IBoardData = {
  id: 'connector-routing-board',
  name: 'Release Pipeline · Connector Routing',
  appVersion: '1.0.0-rc.0',
  defaultPageSize: { width: 1920, height: 1080 },
  pageOrder: ['workflow'],
  activePageId: 'workflow',
  pages: {
    workflow: {
      id: 'workflow',
      pageType: BoardPageType.Page,
      name: 'Release workflow',
      elementOrder: elements.map((element) => element.id),
      elements: Object.fromEntries(elements.map((element) => [element.id, element])),
    },
  },
}
