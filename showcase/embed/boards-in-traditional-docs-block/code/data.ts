import type { IBoardData } from '@univerjs-pro/boards'
import type { IDocumentData } from '@univerjs/core'
import { BoardPageType, createBoardConnectorElement, createBoardTextBoxShapeElement } from '@univerjs-pro/boards'
import {
  ShapeFillEnum,
  ShapeLineTypeEnum,
  ShapeTextAutoFitType,
  ShapeTextWrapType,
  ShapeTypeEnum,
} from '@univerjs-pro/engine-shape'
import { BooleanNumber, DocumentFlavor, HorizontalAlign, NamedStyleType, VerticalAlign } from '@univerjs/core'

export const HOST_ID = 'delta-capture-methods'
export const CHILD_ID = 'delta-review-workflow'
export const BLOCK_MARKER = '03 / Interpretation and limitations'
export const BRIEF = [
  ['DELTA / Engineering methods note', 'kicker'],
  ['Keep the method traceable.', 'title'],
  ['Methods note D-18 / 24 August 2028 / Synthetic archive exercise', 'meta'],
  ['01 / Objective and study material', 'heading'],
  [
    'This fictional capture-method exercise follows eighteen draft images from intake to a staged review package. Sixteen are marked clear for the exercise and two remain open for a closer look. These authored counts describe the story; no images are scanned, classified or uploaded by this demonstration.',
    'body',
  ],
  [
    'The method separates three concerns: preserve the image identifier, record why another capture is requested, and keep the written interpretation distinct from the diagram. A fixed control target, CT-04, supplies context for the review discussion, not a calibration certificate or measured performance result.',
    'body',
  ],
  [
    'A staged package is not a published collection. The two open items retain their identifiers when they move through exception review and recapture notes. Names, dates and counts are synthetic; no private archive material or third-party images are bundled.',
    'body',
  ],
  ['02 / Editable method and exception path', 'heading'],
  [
    'The native Canvas below shows eight process cards and ten bound connectors. Follow the top row from intake to staging, then inspect the lower return path. Expand the Canvas to move the exception card, edit its status and use native Undo or Redo. The formal report remains an independent document.',
    'body',
  ],
  ['', 'body'],
  [BLOCK_MARKER, 'heading'],
  [
    'INTERPRETATION / The clear and open counts are authored labels, not a formula. Editing a review status does not recalculate other cards, change the narrative or process an image. Connector bindings express the intended workflow and follow moved shapes; they do not invoke remote services.',
    'body',
  ],
  [
    'LIMITATION / This small fictional batch cannot establish capture quality, archival fitness or a reproducible measurement result. File naming, color checks and review decisions would require their own evidence in a real project. The diagram illustrates responsibility and rework, not certification.',
    'body',
  ],
  [
    'FOLLOW-UP / Keep the control-target description and exception notes with the methods record. Before any real publication, review the source material and the applicable permissions separately. This sample sends no assignments or notifications and does not grant publication rights.',
    'body',
  ],
  ['Disposition: draft method, not a released collection.', 'warning'],
  ['Appendix / Document and Canvas ownership', 'heading'],
  [
    'Traditional A4 chapters and explicit page breaks frame the method. The Canvas is a native body block, not a picture or iframe. Appending text to the report title moves its UTF-16 anchor while preserving the complete Canvas snapshot. Reload restores the original local data and discards edits.',
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
      paragraphId: `delta-p-${index}`,
      paragraphStyle: {
        namedStyleType:
          kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        ...(content.startsWith('02 /') || content.startsWith('03 /') ? { pageBreakBefore: BooleanNumber.TRUE } : {}),
        ...(heading ? { headingId: `delta-section-${index}` } : {}),
        spaceAbove: { v: heading ? 16 : 0 },
        spaceBelow: { v: kind === 'title' ? 12 : 9 },
        lineSpacing: 1.2,
        textStyle: {
          ff: heading || kind === 'kicker' || kind === 'meta' ? 'Arial' : 'Georgia',
          fs: kind === 'title' ? 30 : heading ? 16 : kind === 'meta' || kind === 'kicker' ? 10 : 12,
          bl: heading || kind === 'title' ? BooleanNumber.TRUE : BooleanNumber.FALSE,
          cl: {
            rgb:
              kind === 'warning'
                ? '#9A6339'
                : heading || kind === 'title' || kind === 'kicker'
                  ? '#225B62'
                  : kind === 'meta'
                    ? '#72868D'
                    : '#374C53',
          },
        },
      },
    }
  })
  const dataStream = BRIEF.map(([content]) => content).join('\r') + '\r\n'
  return {
    id: HOST_ID,
    title: 'Delta / Capture methods note',
    documentStyle: {
      documentFlavor: DocumentFlavor.TRADITIONAL,
      pageSize: { width: 794, height: 1123 },
      marginTop: 72,
      marginBottom: 72,
      marginLeft: 72,
      marginRight: 72,
    },
    body: {
      dataStream,
      paragraphs,
      textRuns: [],
      customBlocks: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'delta-brief-section' }],
    },
    drawings: {},
    drawingsOrder: [],
  }
}

const NODES = [
  { id: 'intake', text: 'Batch D-18\n18 draft images', left: 30, top: 110, color: '#DCEBF2' },
  { id: 'capture', text: 'Capture pass\nFraming + naming', left: 265, top: 110, color: '#DCEBF2' },
  { id: 'compare', text: 'Review gate\n16 clear / 2 open', left: 500, top: 110, color: '#E8E3F5' },
  { id: 'release', text: 'Staged package\n16 draft files', left: 735, top: 110, color: '#DDEEE5' },
  { id: 'reference', text: 'Control target\nCT-04 / Fixed', left: 30, top: 285, color: '#E5EDF0' },
  { id: 'recapture', text: 'Recapture notes\n2 frames / Planned', left: 265, top: 285, color: '#F6E7C9' },
  { id: 'review', text: 'Exception review\n2 frames / Open', left: 500, top: 285, color: '#F4DCD6' },
  { id: 'record', text: 'Methods record\nNo publication', left: 735, top: 285, color: '#DDEEE5' },
] as const
const EDGES = [
  ['capture-input', 'intake', 1, 'capture', 3],
  ['compare-output', 'capture', 1, 'compare', 3],
  ['stage-clear', 'compare', 1, 'release', 3],
  ['inspect-open', 'compare', 2, 'review', 0],
  ['request-recapture', 'review', 3, 'recapture', 1],
  ['repeat-capture', 'recapture', 0, 'capture', 2],
  ['record-package', 'release', 2, 'record', 0],
  ['record-exception', 'review', 1, 'record', 3],
  ['reference-recapture', 'reference', 1, 'recapture', 3],
  ['reference-intake', 'reference', 0, 'intake', 2],
] as const

export function createChildData(): IBoardData {
  const shapes = NODES.map((node) => {
    const shape = createBoardTextBoxShapeElement({
      id: node.id,
      text: node.text,
      left: node.left,
      top: node.top,
      width: 190,
      height: 92,
      horizontalAlign: HorizontalAlign.CENTER,
      verticalAlign: VerticalAlign.MIDDLE,
      textStyle: { fs: 12, bl: BooleanNumber.TRUE, cl: { rgb: '#294B59' } },
      textWrap: ShapeTextWrapType.Square,
    })
    shape.shapeData.shapeType = ShapeTypeEnum.RoundRect
    // Process cards keep their authored geometry; they are not auto-growing text boxes.
    shape.shapeData.isTextBox = false
    shape.shapeData.shapeText!.autoFitType = ShapeTextAutoFitType.NoAutoFit
    shape.shapeData.fill = { fillType: ShapeFillEnum.SolidFill, color: node.color }
    shape.shapeData.stroke = { lineStrokeType: ShapeLineTypeEnum.SolidLine, color: '#708BA0', width: 1.5 }
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
        stroke: ['inspect-open', 'request-recapture', 'repeat-capture'].includes(id) ? '#B77745' : '#628A91',
        strokeWidth: 2,
        endMarker: { type: 'filledArrow' },
      },
    }),
  )
  const labels = [
    createBoardTextBoxShapeElement({
      id: 'title',
      text: 'DELTA / Capture, review, record.',
      left: 30,
      top: 10,
      width: 890,
      height: 44,
      textStyle: { fs: 24, bl: BooleanNumber.TRUE, cl: { rgb: '#225B62' } },
    }),
    createBoardTextBoxShapeElement({
      id: 'subtitle',
      text: '18 draft images / Keep identifiers through the return path',
      left: 30,
      top: 62,
      width: 890,
      height: 30,
      textStyle: { fs: 12, cl: { rgb: '#627D85' } },
    }),
    createBoardTextBoxShapeElement({
      id: 'footer',
      text: 'Authored workflow, not an automated pipeline.\nNo scanning, uploads or publication.',
      left: 30,
      top: 416,
      width: 530,
      height: 58,
      textStyle: { fs: 11, cl: { rgb: '#627D85' } },
      textWrap: ShapeTextWrapType.Square,
    }),
  ]
  const elements = [...connectors, ...shapes, ...labels]
  return {
    id: CHILD_ID,
    name: 'Delta / Capture and exception workflow',
    appVersion: '1.0.0-beta.2',
    defaultPageSize: { width: 960, height: 480 },
    pageOrder: ['method'],
    activePageId: 'method',
    pages: {
      method: {
        id: 'method',
        name: 'Capture and review',
        pageType: BoardPageType.Page,
        elementOrder: elements.map((el) => el.id),
        elements: Object.fromEntries(elements.map((el) => [el.id, el])),
      },
    },
  }
}
