import type { ISlideData, ISlidePageElement, ISlideShapeElement } from '@univerjs-pro/slides'
import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum } from '@univerjs-pro/slides'
import { LocaleType } from '@univerjs/core'

const elements: ISlidePageElement[] = [
  text('title', 'Technical Architecture Overview', 74, 46, 900, 54, 32, '#101828', true),
  text('subtitle', 'Command, event, and local data boundaries', 78, 100, 760, 34, 17, '#667085'),
  component('host', 'Host Application', 60, 205, '#4B68D9'),
  component('runtime', 'Univer Runtime', 460, 205, '#7256B9'),
  component('renderer', 'Render Engine', 860, 205, '#A97208'),
  component('data-layer', 'Local Data Layer', 460, 420, '#287E6C'),
  text('command-flow', '→', 350, 250, 100, 34, 26, '#175CD3', true),
  text('event-flow', '→', 750, 250, 100, 34, 26, '#7F56D9', true),
  text('data-flow', 'READ / WRITE ↓', 460, 350, 280, 34, 18, '#027A48', true),
  text('validation', 'Local state / owned by this browser session', 260, 565, 680, 42, 20, '#027A48', true),
]

export const ARCHITECTURE_DATA: ISlideData = {
  id: 'technical-architecture',
  name: 'Technical Architecture Overview',
  appVersion: '1.0.0-rc.0',
  rev: 1,
  locale: LocaleType.EN_US,
  defaultPageSize: { width: 1200, height: 675 },
  slideOrder: ['component-map', 'command-flow', 'recovery'],
  activeSlideId: 'component-map',
  slides: {
    'component-map': {
      id: 'component-map',
      name: 'Component Map',
      pageType: PageTypeEnum.Slide,
      background: { type: SlideBackgroundTypeEnum.Solid, color: '#F5F7FF' },
      speakerNotes:
        'Conceptual integration map, not an SDK internal call graph. Host commands enter the runtime; rendering reflects model changes; host event subscriptions observe results. Arrows are authored labels, not attached connectors.',
      elementOrder: elements.map((element) => element.id),
      elements: Object.fromEntries(elements.map((element) => [element.id, element])),
    },
    'command-flow': {
      id: 'command-flow',
      name: 'From intent to visible result',
      pageType: PageTypeEnum.Slide,
      background: { type: SlideBackgroundTypeEnum.Solid, color: '#101A34' },
      speakerNotes:
        'Conceptual workflow: validate a host request, call a documented Facade, then inspect the real native output. These three authored steps are not a runtime event trace or an invented API.',
      ...pageElements([
        text('title', 'From intent to visible result', 60, 65, 1080, 85, 38, '#F5F7FF', true),
        text('subtitle', 'Three responsibilities / one native editor', 60, 155, 1080, 50, 23, '#58C8FF'),
        component('intent', '01  Host intent', 60, 260, '#4B68D9'),
        component('facade', '02  Facade call', 460, 260, '#7256B9'),
        component('result', '03  Native result', 860, 260, '#287E6C'),
        text('input', 'Validate input\nChoose a stable unit ID', 60, 390, 320, 130, 18, '#C8D0E4'),
        text('command', 'Use documented methods\nKeep errors visible', 460, 390, 320, 130, 18, '#C8D0E4'),
        text('output', 'Inspect actual rendering\nObserve real events', 860, 390, 320, 130, 18, '#C8D0E4'),
        text(
          'footer',
          'Conceptual flow / no simulated command dispatcher or event log',
          60,
          590,
          1080,
          40,
          18,
          '#C8D0E4',
        ),
      ]),
    },
    recovery: {
      id: 'recovery',
      name: 'Keep ownership explicit',
      pageType: PageTypeEnum.Slide,
      background: { type: SlideBackgroundTypeEnum.Solid, color: '#FFF8ED' },
      speakerNotes:
        'The README shows real save and same-ID recreation. Saved SDK JSON is not a binary office-file converter. The previous owner must be disposed before creating the restored owner; Undo stacks are not promised to persist.',
      ...pageElements([
        text('title', 'Keep ownership explicit', 60, 65, 1080, 85, 38, '#111A2E', true),
        text('subtitle', 'The host owns lifecycle. The SDK owns the document model.', 60, 155, 1080, 60, 25, '#4F8095'),
        component('capture', 'Capture the model', 60, 300, '#4B68D9'),
        component('release', 'Release the owner', 460, 300, '#7256B9'),
        component('restore', 'Restore the same ID', 860, 300, '#287E6C'),
        text('capture-note', 'Save complete SDK JSON\nKeep authored content', 60, 435, 320, 110, 18, '#39455E'),
        text('release-note', 'Dispose subscriptions\nUnmount the old editor', 460, 435, 320, 110, 18, '#39455E'),
        text('restore-note', 'Create from the snapshot\nVerify fresh native edits', 860, 435, 320, 110, 18, '#39455E'),
        text(
          'footer',
          'Local snapshots are not binary import/export or durable storage.',
          60,
          590,
          1080,
          40,
          19,
          '#536078',
        ),
      ]),
    },
  },
}

function pageElements(items: ISlidePageElement[]) {
  return {
    elementOrder: items.map((item) => item.id),
    elements: Object.fromEntries(items.map((item) => [item.id, item])),
  }
}

function text(
  id: string,
  value: string,
  left: number,
  top: number,
  width: number,
  height: number,
  fontSize: number,
  color: string,
  bold = false,
): ISlidePageElement {
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform: { left, top, width, height, rotation: 0 },
    shapeData: {
      shapeType: ShapeTypeEnum.Rect,
      isTextBox: true,
      fill: { fillType: ShapeFillEnum.NoFill },
      stroke: { lineStrokeType: ShapeLineTypeEnum.NoLine, width: 0 },
      textRectPadding: { left: 0, top: 0, right: 0, bottom: 0 },
      shapeText: { isHorizontal: true, isRichText: false, text: value, fontFamily: 'Arial', color, fontSize, bold },
    },
  }
}

function component(id: string, value: string, left: number, top: number, color: string): ISlideShapeElement {
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform: { left, top, width: 280, height: 105, rotation: 0 },
    shapeData: {
      shapeType: ShapeTypeEnum.RoundRect,
      fill: { color },
      stroke: { color: '#FFFFFF', width: 2 },
      shapeText: { isHorizontal: true, isRichText: false, text: value, fontSize: 22, color: '#FFFFFF', bold: true },
    },
  }
}
