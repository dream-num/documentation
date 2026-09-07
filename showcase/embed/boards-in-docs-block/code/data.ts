import type { IBoardData } from '@univerjs-pro/boards'
import type { IDocumentData } from '@univerjs/core'
import { BoardPageType, createBoardConnectorElement, createBoardTextBoxShapeElement } from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { BooleanNumber, DocumentFlavor, HorizontalAlign, NamedStyleType, VerticalAlign } from '@univerjs/core'

export const HOST_ID = 'pine-architecture-decision'
export const CHILD_ID = 'pine-service-boundaries'
export const BLOCK_MARKER = '03 / Consequences and review conditions'
export const BRIEF = [
  ['PINE / Architecture decision 014', 'kicker'],
  ['A reservation is not an email.', 'title'],
  ['Proposed · 22 August 2027 · Exhibition visits · Owner: Jules Morgan', 'meta'],
  ['01 / The failure we must separate', 'heading'],
  [
    'A fictional exhibition books timed entry slots. A visitor must not lose a confirmed reservation because an email provider is unavailable. Keep the booking receipt visible in the visitor journey and deliver its notification separately.',
    'body',
  ],
  ['02 / Proposed service boundaries', 'heading'],
  [
    'The native Board below separates the booking transaction from asynchronous delivery. Blue nodes own the visitor request, green nodes own durable state, and amber nodes own retry work. Expand the diagram to inspect or move its connected shapes.',
    'body',
  ],
  ['', 'body'],
  [BLOCK_MARKER, 'heading'],
  [
    'Decision / Write the slot reservation and an outbox item in one transaction. A worker sends the notification after commit. Retries must reuse the delivery key; they must never create a second reservation.',
    'body',
  ],
  [
    'Trade-off / The receipt and email may arrive at different times. Operations need a visible retry queue, an age limit and a manual review path. The diagram is a design artifact, not a running message processor.',
    'body',
  ],
  [
    'Review gate / Simulate provider failure, duplicate delivery and an expired retry. Jules owns the reservation contract; Rina owns delivery recovery. Keep this proposal open until those tests have evidence.',
    'body',
  ],
  ['Status: proposed, not deployed.', 'warning'],
  [
    'Editing a Board label or moving a shape does not change this decision record. All services, names and dates are fictional. No bookings, messages or backend calls are sent. Reload loses local edits.',
    'body',
  ],
] as const

export function createHostData(): IDocumentData {
  let offset = 0
  const paragraphs = BRIEF.map(([content, kind], index) => {
    offset += content.length + 1
    const heading = kind === 'heading' || kind === 'warning'
    return {
      startIndex: offset - 1,
      paragraphId: `pine-p-${index}`,
      paragraphStyle: {
        namedStyleType:
          kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        ...(heading ? { headingId: `pine-heading-${index}` } : {}),
        spaceAbove: { v: heading ? 16 : 0 },
        spaceBelow: { v: kind === 'title' ? 12 : 9 },
        lineSpacing: 1.2,
        textStyle: {
          ff: 'Arial',
          fs: kind === 'title' ? 32 : heading ? 18 : kind === 'meta' || kind === 'kicker' ? 11 : 14,
          bl: heading || kind === 'title' ? BooleanNumber.TRUE : BooleanNumber.FALSE,
          cl: {
            rgb:
              kind === 'warning'
                ? '#A06B31'
                : heading || kind === 'title' || kind === 'kicker'
                  ? '#325D51'
                  : kind === 'meta'
                    ? '#7B877D'
                    : '#414F4B',
          },
        },
      },
    }
  })
  const dataStream = BRIEF.map(([content]) => content).join('\r') + '\r\n'
  return {
    id: HOST_ID,
    title: 'Pine / Architecture decision',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 960, height: 1000 },
      marginTop: 32,
      marginBottom: 32,
      marginLeft: 64,
      marginRight: 64,
    },
    body: {
      dataStream,
      paragraphs,
      textRuns: [],
      customBlocks: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'pine-decision-section' }],
    },
    drawings: {},
    drawingsOrder: [],
  }
}

const NODES = [
  { id: 'visitor', text: 'Visitor receipt\nBooking reference', left: 40, top: 85, color: '#DCEBF2' },
  { id: 'booking', text: 'Booking API\nReserve one slot', left: 320, top: 85, color: '#DCEBF2' },
  { id: 'ledger', text: 'Slot ledger\nSaved reservation', left: 600, top: 85, color: '#DDEEE2' },
  { id: 'outbox', text: 'Outbox\nDelivery key', left: 40, top: 235, color: '#DDEEE2' },
  { id: 'worker', text: 'Delivery worker\nSend after commit', left: 250, top: 235, color: '#E6E2F2' },
  { id: 'retry', text: 'Retry queue\n30 min / Open', left: 670, top: 235, color: '#F7E8C8' },
  { id: 'provider', text: 'Email provider\nMay be offline', left: 460, top: 235, color: '#F3DED5' },
] as const
const EDGES = [
  ['request', 'visitor', 1, 'booking', 3],
  ['reserve', 'booking', 1, 'ledger', 3],
  ['enqueue', 'booking', 2, 'outbox', 0],
  ['deliver', 'outbox', 1, 'worker', 3],
  ['send', 'worker', 1, 'provider', 3],
  ['failure', 'provider', 1, 'retry', 3],
  ['replay', 'retry', 2, 'outbox', 2],
] as const

export function createChildData(): IBoardData {
  const shapes = NODES.map((node) => {
    const shape = createBoardTextBoxShapeElement({
      id: node.id,
      text: node.text,
      left: node.left,
      top: node.top,
      width: 180,
      height: 72,
      horizontalAlign: HorizontalAlign.CENTER,
      verticalAlign: VerticalAlign.MIDDLE,
      textStyle: { fs: 12, bl: BooleanNumber.TRUE, cl: { rgb: '#2F4945' } },
      textWrap: ShapeTextWrapType.Square,
    })
    shape.shapeData.shapeType = ShapeTypeEnum.RoundRect
    shape.shapeData.fill = { fillType: ShapeFillEnum.SolidFill, color: node.color }
    shape.shapeData.stroke = { lineStrokeType: ShapeLineTypeEnum.SolidLine, color: '#81978E', width: 1.5 }
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
        stroke: id === 'failure' || id === 'replay' ? '#B38343' : '#64887B',
        strokeWidth: 2,
        endMarker: { type: 'filledArrow' },
      },
    }),
  )
  const labels = [
    createBoardTextBoxShapeElement({
      id: 'title',
      text: 'PINE / Reservation and delivery',
      left: 40,
      top: 15,
      width: 750,
      height: 54,
      textStyle: { fs: 24, bl: BooleanNumber.TRUE, cl: { rgb: '#325D51' } },
    }),
    createBoardTextBoxShapeElement({
      id: 'transaction',
      text: 'SAME TRANSACTION / reserve + enqueue',
      left: 435,
      top: 186,
      width: 400,
      height: 35,
      textStyle: { fs: 10, cl: { rgb: '#4E7A60' } },
    }),
    createBoardTextBoxShapeElement({
      id: 'decision',
      text: 'BOUNDARY / Confirm before email. Retries reuse the delivery key.',
      left: 40,
      top: 368,
      width: 820,
      height: 40,
      textStyle: { fs: 12, cl: { rgb: '#6C5A47' } },
      textWrap: ShapeTextWrapType.Square,
    }),
    createBoardTextBoxShapeElement({
      id: 'footer',
      text: 'Design proposal only / no live bookings or message delivery',
      left: 40,
      top: 418,
      width: 820,
      height: 30,
      textStyle: { fs: 11, cl: { rgb: '#7B877D' } },
    }),
  ]
  const elements = [...connectors, ...shapes, ...labels]
  return {
    id: CHILD_ID,
    name: 'Pine / Service boundaries',
    appVersion: '1.0.0-beta.2',
    defaultPageSize: { width: 890, height: 470 },
    pageOrder: ['boundaries'],
    activePageId: 'boundaries',
    pages: {
      boundaries: {
        id: 'boundaries',
        name: 'Reservation and delivery',
        pageType: BoardPageType.Page,
        elementOrder: elements.map((element) => element.id),
        elements: Object.fromEntries(elements.map((element) => [element.id, element])),
      },
    },
  }
}
