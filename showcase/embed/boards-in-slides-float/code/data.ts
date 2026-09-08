import type { IBoardData } from '@univerjs-pro/boards'
import { BoardPageType, createBoardConnectorElement, createBoardTextBoxShapeElement } from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum, type ISlideData } from '@univerjs-pro/slides'
import { BooleanNumber, HorizontalAlign, LocaleType, RichTextBuilder, VerticalAlign } from '@univerjs/core'

export const HOST_ID = 'beacon-observatory-review'
export const CHILD_ID = 'beacon-ingestion-boundaries'
export const PAGE_ID = 'architecture'
type SlideElement = ISlideData['slides'][string]['elements'][string]
function text(
  id: string,
  value: string,
  left: number,
  top: number,
  width: number,
  height: number,
  size: number,
  color: string,
  bold = false,
): SlideElement {
  const doc = RichTextBuilder.create().span(value, { fontSize: size, color, bold }).getData()
  doc.id = `${id}-text`
  doc.documentStyle = { ...doc.documentStyle, textStyle: { ff: 'Arial' } }
  doc.body?.paragraphs?.forEach((paragraph, index) => {
    paragraph.paragraphId = `${id}-p-${index}`
  })
  doc.body?.sectionBreaks?.forEach((section, index) => {
    section.sectionId = `${id}-s-${index}`
  })
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform: { left, top, width, height, rotation: 0 },
    shapeData: {
      shapeType: ShapeTypeEnum.Rect,
      fill: { fillType: ShapeFillEnum.NoFill },
      stroke: { color: 'transparent', width: 0 },
      shapeText: { dataModel: { doc } },
    },
  }
}
function panel(id: string, left: number, top: number, width: number, height: number, color: string): SlideElement {
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform: { left, top, width, height, rotation: 0 },
    shapeData: { shapeType: ShapeTypeEnum.Rect, fill: { color }, stroke: { color, width: 0 } },
  }
}
function slide(id: string, name: string, background: string, elements: SlideElement[]): ISlideData['slides'][string] {
  return {
    id,
    name,
    pageType: PageTypeEnum.Slide,
    background: { type: SlideBackgroundTypeEnum.Solid, color: background },
    elements: Object.fromEntries(elements.map((element) => [element.id, element])),
    elementOrder: elements.map((element) => element.id),
    speakerNotes:
      'Original fictional observatory ingestion proposal. Canvas edits do not change slide text. No sensors, messages, deployments or backend calls.',
  }
}

export function createHostData(): ISlideData {
  const pages = [
    slide(PAGE_ID, 'Keep the boundary visible', '#092A42', [
      text('kicker', 'BEACON / OBSERVATORY PLATFORM / 14 SEPTEMBER 2027', 40, 30, 920, 28, 14, '#90CFC7', true),
      text('title', 'Offline is a design condition.', 40, 80, 920, 62, 38, '#F3F6F3', true),
      panel('context', 40, 180, 245, 410, '#16435A'),
      text('sites', '12', 60, 207, 200, 85, 68, '#A5DAC5', true),
      text('sites-label', 'field stations', 60, 297, 200, 38, 22, '#F3F6F3', true),
      text('window', '24 hours', 60, 365, 200, 42, 28, '#F1B07A', true),
      text(
        'context-copy',
        'Local buffer target\n\nProposal / not a\nmeasured guarantee',
        60,
        420,
        200,
        135,
        17,
        '#D0E0E4',
      ),
      text(
        'footer',
        'Double-click the Canvas to edit the boundary diagram. Slides stay independent.',
        40,
        610,
        920,
        28,
        15,
        '#D0E0E4',
      ),
    ]),
    slide('tradeoffs', 'Three boundaries, three responsibilities', '#F2EFE6', [
      text('tradeoff-kicker', '02 / ASSIGN RESPONSIBILITY', 42, 35, 910, 30, 14, '#486575', true),
      text('tradeoff-title', 'Buffer. Validate. Preserve.', 42, 98, 910, 65, 40, '#092A42', true),
      panel('edge-card', 42, 225, 282, 275, '#D5E8DF'),
      panel('ingest-card', 359, 225, 282, 275, '#092A42'),
      panel('review-card', 676, 225, 282, 275, '#F0D0B2'),
      text('edge-title', 'FIELD / LIN', 62, 247, 242, 35, 19, '#315B50', true),
      text('edge-value', '24 h', 62, 312, 242, 65, 40, '#092A42', true),
      text('edge-copy', 'Buffer target\nSequence each batch\nRetry after reconnect', 62, 397, 242, 90, 18, '#315B50'),
      text('ingest-title', 'INGEST / AMARA', 379, 247, 242, 35, 18, '#A5DAC5', true),
      text('ingest-value', '1 key', 379, 312, 242, 65, 40, '#F3F6F3', true),
      text('ingest-copy', 'Station + sequence\nReject duplicates\nValidate payload', 379, 397, 242, 90, 18, '#D0E0E4'),
      text('review-title', 'REVIEW / OTTO', 696, 247, 242, 35, 19, '#795536', true),
      text('review-value', '3 checks', 696, 312, 242, 65, 40, '#092A42', true),
      text('review-copy', 'Clock drift\nSchema version\nOut-of-range samples', 696, 397, 242, 90, 18, '#795536'),
      text(
        'tradeoff-footer',
        'Targets are fictional design inputs. No throughput or reliability benchmark is claimed.',
        42,
        559,
        910,
        60,
        18,
        '#486575',
      ),
    ]),
    slide('checks', 'Evidence before rollout', '#D5E8DF', [
      text('checks-kicker', '03 / FAILURE-CASE REVIEW', 42, 35, 910, 30, 14, '#315B50', true),
      text('checks-title', 'Prove the recovery path.', 42, 102, 910, 65, 42, '#092A42', true),
      panel('check-a', 42, 225, 910, 83, '#F2EFE6'),
      panel('check-b', 42, 340, 910, 83, '#BBD5D5'),
      panel('check-c', 42, 455, 910, 83, '#092A42'),
      text(
        'check-a-text',
        '01  /  Disconnect a station; preserve batch order on reconnect.',
        62,
        247,
        865,
        48,
        23,
        '#092A42',
      ),
      text(
        'check-b-text',
        '02  /  Replay a batch; do not create a second archive record.',
        62,
        362,
        865,
        48,
        23,
        '#092A42',
      ),
      text(
        'check-c-text',
        '03  /  Quarantine invalid readings; keep the raw evidence.',
        62,
        477,
        865,
        48,
        23,
        '#F3F6F3',
      ),
      text(
        'checks-footer',
        'Design review only. Editing the diagram does not deploy or approve this architecture.',
        42,
        577,
        915,
        50,
        17,
        '#315B50',
      ),
    ]),
  ]
  return {
    id: HOST_ID,
    name: 'Beacon / Observatory architecture review',
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1000, height: 650 },
    slides: Object.fromEntries(pages.map((page) => [page.id, page])),
    slideOrder: pages.map((page) => page.id),
    activeSlideId: PAGE_ID,
  }
}

const NODES = [
  { id: 'station', text: 'Field station\nTime + sample', left: 40, top: 95, color: '#D5E8DF' },
  { id: 'buffer', text: 'Local buffer\n24 h target', left: 350, top: 95, color: '#D5E8DF' },
  { id: 'ingest', text: 'Ingest gateway\nUnique batch key', left: 660, top: 95, color: '#D1E1ED' },
  { id: 'archive', text: 'Archive\nAccepted samples', left: 40, top: 300, color: '#D1E1ED' },
  { id: 'validate', text: 'Validation\n3 quality checks', left: 350, top: 300, color: '#DDD7EC' },
  { id: 'quarantine', text: 'Quarantine\nReview required', left: 660, top: 300, color: '#F0D0B2' },
] as const
const EDGES = [
  ['sample', 'station', 1, 'buffer', 3],
  ['upload', 'buffer', 1, 'ingest', 3],
  ['inspect', 'ingest', 2, 'validate', 0],
  ['accept', 'validate', 3, 'archive', 1],
  ['reject', 'validate', 1, 'quarantine', 3],
  ['recheck', 'quarantine', 2, 'validate', 2],
] as const
export function createChildData(): IBoardData {
  const shapes = NODES.map((node) => {
    const shape = createBoardTextBoxShapeElement({
      id: node.id,
      text: node.text,
      left: node.left,
      top: node.top,
      width: 220,
      height: 88,
      horizontalAlign: HorizontalAlign.CENTER,
      verticalAlign: VerticalAlign.MIDDLE,
      textStyle: { fs: 17, bl: BooleanNumber.TRUE, cl: { rgb: '#173A50' } },
      textWrap: ShapeTextWrapType.Square,
    })
    shape.shapeData.shapeType = ShapeTypeEnum.RoundRect
    shape.shapeData.fill = { fillType: ShapeFillEnum.SolidFill, color: node.color }
    shape.shapeData.stroke = { lineStrokeType: ShapeLineTypeEnum.SolidLine, color: '#6B8996', width: 1.5 }
    return shape
  })
  const connectors = EDGES.map(([id, from, fromSide, to, toSide]) =>
    createBoardConnectorElement({
      id,
      start: { kind: 'shapeSite', shapeId: from, connectionSiteId: fromSide },
      end: { kind: 'shapeSite', shapeId: to, connectionSiteId: toSide },
      routing: 'orthogonal',
      routingMode: 'auto',
      style: {
        stroke: id === 'reject' || id === 'recheck' ? '#B07743' : '#4C7D86',
        strokeWidth: 2,
        endMarker: { type: 'filledArrow' },
      },
    }),
  )
  const labels = [
    createBoardTextBoxShapeElement({
      id: 'board-title',
      text: 'BEACON / DATA INGESTION BOUNDARIES',
      left: 40,
      top: 24,
      width: 850,
      height: 48,
      textStyle: { fs: 24, bl: BooleanNumber.TRUE, cl: { rgb: '#173A50' } },
    }),
    createBoardTextBoxShapeElement({
      id: 'transport',
      text: 'RECONNECT / preserve station sequence; acknowledge only after durable receipt',
      left: 40,
      top: 218,
      width: 850,
      height: 48,
      textStyle: { fs: 15, cl: { rgb: '#527B78' } },
      textWrap: ShapeTextWrapType.Square,
    }),
    createBoardTextBoxShapeElement({
      id: 'review-note',
      text: 'RECHECK / retain the original payload and record why it was rejected',
      left: 40,
      top: 443,
      width: 850,
      height: 38,
      textStyle: { fs: 16, cl: { rgb: '#8B623D' } },
    }),
    createBoardTextBoxShapeElement({
      id: 'board-footer',
      text: 'Fictional architecture / no connected sensors, storage writes or deployments',
      left: 40,
      top: 490,
      width: 850,
      height: 34,
      textStyle: { fs: 14, cl: { rgb: '#647985' } },
    }),
  ]
  const elements = [...connectors, ...shapes, ...labels]
  return {
    id: CHILD_ID,
    name: 'Beacon / Ingestion boundaries',
    appVersion: '1.0.0-beta.2',
    defaultPageSize: { width: 920, height: 545 },
    pageOrder: ['boundaries'],
    activePageId: 'boundaries',
    pages: {
      boundaries: {
        id: 'boundaries',
        name: 'Ingestion boundaries',
        pageType: BoardPageType.Page,
        elementOrder: elements.map((element) => element.id),
        elements: Object.fromEntries(elements.map((element) => [element.id, element])),
      },
    },
  }
}
