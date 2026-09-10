import type { IDocumentData } from '@univerjs/core'
import { ShapeFillEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum, type ISlideData } from '@univerjs-pro/slides'
import { BooleanNumber, DocumentFlavor, LocaleType, NamedStyleType, RichTextBuilder } from '@univerjs/core'

export const HOST_ID = 'summit-route-handout'
export const CHILD_ID = 'summit-shade-discussion'
export const BLOCK_MARKER = '03 / Limitations and next review'
export const BRIEF = [
  ['SUMMIT / Urban routes discussion paper', 'kicker'],
  ['Shade along the way.', 'title'],
  ['Conference handout S-28-07 / 11 July 2028 / Synthetic study', 'meta'],
  ['01 / Question and observation frame', 'heading'],
  [
    'This fictional discussion asks how a walking route changes when shade is considered alongside distance. Three invented routes connect the same two destinations: Arcade, Canal and Garden. Six stops and two observation windows provide a small twelve-note exercise, not a measured city dataset.',
    'body',
  ],
  [
    'Participants would sketch where they can pause, compare the route descriptions and record what remains unknown. The illustrative shaded shares are 30%, 55% and 75%. They are authored teaching values, not temperature readings, forecasts or evidence of a health benefit.',
    'body',
  ],
  [
    'The handout supplies the written method and limitations. The embedded presentation is an independent editable discussion aid. Revising a slide does not change the paper, update source measurements or publish a recommendation.',
    'body',
  ],
  ['02 / Four frames for discussion', 'heading'],
  [
    'Activate the slide block and use its native page controls. The four frames introduce the question, the observation sequence, three illustrative comparisons and the next review. Expand the deck to edit text, move shapes and inspect all four thumbnails.',
    'body',
  ],
  ['', 'body'],
  ['03 / Limitations and next review', 'heading'],
  [
    'SAMPLE / A twelve-note exercise is too small to represent seasonal conditions or all travelers. Street access, mobility needs, weather and changing tree cover are deliberately outside this synthetic dataset. No geographic service or live sensor is connected.',
    'body',
  ],
  [
    'COMPARISON / The bars on slide three are ordinary editable shapes. Their sizes and labels are authored together; changing one does not calculate the other. They do not claim a live chart, Formula Shape or linked workbook integration.',
    'body',
  ],
  [
    'REVIEW / Before any real study, agree on the question, data collection method and appropriate permissions. This demonstration neither advises on heat exposure nor determines a safe route.',
    'body',
  ],
  ['Disposition: discussion material, not route guidance.', 'warning'],
  ['Appendix / Reading and editing', 'heading'],
  [
    'Numbered traditional A4 chapters and deliberate page breaks organize the paper. The native slide block stays in the document body. Edit the title above it to see the UTF-16 anchor move without changing the deck; reload restores the authored data and discards edits.',
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
      paragraphId: `summit-p-${index}`,
      paragraphStyle: {
        namedStyleType:
          kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        ...(content.startsWith('02 /') || content.startsWith('03 /') ? { pageBreakBefore: BooleanNumber.TRUE } : {}),
        ...(heading ? { headingId: `summit-section-${index}` } : {}),
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
                ? '#94682D'
                : heading || kind === 'title' || kind === 'kicker'
                  ? '#22365F'
                  : kind === 'meta'
                    ? '#7786A7'
                    : '#384B5C',
          },
        },
      },
    }
  })
  const dataStream = BRIEF.map(([content]) => content).join('\r') + '\r\n'
  return {
    id: HOST_ID,
    title: 'Summit / Urban routes discussion paper',
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
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'summit-brief-section' }],
    },
    drawings: {},
    drawingsOrder: [],
  }
}

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
      'Original synthetic route discussion. Editable geometry is not a live chart or Formula Shape; the handout and deck have independent state.',
  }
}
export function createChildData(): ISlideData {
  const pages = [
    slide('question', 'The shade question', '#101A34', [
      panel('cover-rule', 40, 44, 72, 5, '#F2B84B'),
      text('cover-kicker', 'SUMMIT / A ROUTE DISCUSSION', 40, 61, 660, 30, 13, '#58C8FF', true),
      text('cover-title', 'Study the shade.\nWalk the route.', 40, 112, 510, 145, 39, '#F5F7FF', true),
      text('cover-body', 'Three invented routes.\nOne question worth comparing.', 40, 288, 510, 70, 22, '#C8D0E4'),
      panel('cover-card', 594, 125, 164, 237, '#22365F'),
      text('cover-number', '12', 614, 149, 124, 80, 58, '#F2B84B', true),
      text('cover-label', 'SYNTHETIC NOTES', 608, 239, 145, 28, 11, '#58C8FF', true),
      text('cover-note', '6 stops\n2 time windows', 614, 282, 125, 70, 15, '#F5F7FF'),
      text('cover-footer', 'Discussion handout / July 2028\nNo live measurements', 40, 390, 440, 50, 12, '#8CBFD4'),
    ]),
    slide('method', 'Observe, sketch, compare', '#EDF2F3', [
      text('method-kicker', '02 / A SMALL OBSERVATION FRAME', 40, 30, 710, 28, 13, '#426781', true),
      text('method-title', 'Observe. Sketch. Compare.', 40, 80, 720, 58, 31, '#22365F', true),
      panel('method-line', 74, 182, 636, 4, '#8CBFD4'),
      panel('observe-card', 40, 171, 220, 175, '#DCE6EF'),
      panel('sketch-card', 290, 171, 220, 175, '#DCEBE6'),
      panel('compare-card', 540, 171, 220, 175, '#F4E4C4'),
      text('observe-number', '01', 58, 189, 170, 42, 26, '#426781', true),
      text('observe-label', 'Six stops', 58, 239, 188, 34, 17, '#22365F', true),
      text('observe-body', 'Pause points, edges\nand unknowns.', 58, 283, 185, 50, 14, '#43576B'),
      text('sketch-number', '02', 308, 189, 170, 42, 26, '#397769', true),
      text('sketch-label', 'Two windows', 308, 239, 188, 34, 17, '#22365F', true),
      text('sketch-body', 'Keep the description\nand timing visible.', 308, 283, 185, 50, 14, '#43576B'),
      text('compare-number', '03', 558, 189, 170, 42, 26, '#94682D', true),
      text('compare-label', 'Three routes', 558, 239, 188, 34, 17, '#22365F', true),
      text('compare-body', 'Discuss differences,\nnot a winning route.', 558, 283, 185, 50, 14, '#43576B'),
      text(
        'method-footer',
        'Twelve discussion notes.\nNot a representative city study.',
        40,
        378,
        440,
        55,
        13,
        '#43576B',
      ),
    ]),
    slide('comparison', 'Three illustrative shares', '#FAF3E6', [
      text('comparison-kicker', '03 / AUTHORED VALUES, NOT FIELD RESULTS', 40, 30, 720, 28, 13, '#94682D', true),
      text('comparison-title', 'Different paths. Different questions.', 40, 80, 730, 58, 28, '#22365F', true),
      text('arcade-label', 'Arcade', 40, 177, 150, 35, 20, '#43576B', true),
      panel('arcade-bar', 220, 183, 180, 24, '#6688FF'),
      text('arcade-share', '30%', 680, 175, 80, 35, 20, '#22365F', true),
      text('canal-label', 'Canal', 40, 241, 150, 35, 20, '#43576B', true),
      panel('canal-bar', 220, 247, 330, 24, '#50C8B0'),
      text('canal-share', '55%', 680, 239, 80, 35, 20, '#22365F', true),
      text('garden-label', 'Garden', 40, 305, 150, 35, 20, '#43576B', true),
      panel('garden-bar', 220, 311, 450, 24, '#F2B84B'),
      text('garden-share', '75%', 680, 303, 80, 35, 20, '#22365F', true),
      text(
        'comparison-footer',
        'Illustrative shaded share.\nEditable shapes, not live charts.',
        40,
        388,
        440,
        55,
        13,
        '#43576B',
      ),
    ]),
    slide('review', 'Questions before a field study', '#E9E4F2', [
      text('review-kicker', '04 / BEFORE THE NEXT WALK', 40, 30, 710, 28, 13, '#655079', true),
      text('review-title', 'Keep the unknowns visible.', 40, 82, 720, 60, 32, '#22365F', true),
      panel('review-strip', 40, 173, 7, 178, '#9B7BFF'),
      text('review-one', 'Ask who the route serves.', 76, 172, 660, 40, 24, '#22365F', true),
      text('review-two', 'Record timing and missing context.', 76, 231, 660, 40, 24, '#22365F', true),
      text('review-three', 'Separate discussion from guidance.', 76, 290, 660, 40, 24, '#22365F', true),
      text(
        'review-footer',
        'No route advice or data collection.\nNo publishing or live service.',
        40,
        391,
        440,
        55,
        13,
        '#655079',
      ),
    ]),
  ]
  return {
    id: CHILD_ID,
    name: 'Summit / Shade discussion in four frames',
    appVersion: '1.0.0-rc.0',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 800, height: 450 },
    slides: Object.fromEntries(pages.map((page) => [page.id, page])),
    slideOrder: pages.map((page) => page.id),
    activeSlideId: 'question',
  }
}
