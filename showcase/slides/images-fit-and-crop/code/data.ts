import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import {
  PageElementTypeEnum,
  PageTypeEnum,
  SlideBackgroundTypeEnum,
  type ISlideData,
  type ISlidePageElement,
} from '@univerjs-pro/slides'
import { ImageSourceType, LocaleType, RichTextBuilder } from '@univerjs/core'

// Original, self-contained test artwork: edge markers make source cropping visible.
export function imageSource(alternate = false) {
  return (
    'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="${alternate ? '#DCECE5' : '#E2EBF5'}"/><rect width="100" height="400" fill="#E09E7E"/><rect x="500" width="100" height="400" fill="#7E9BB6"/><circle cx="${alternate ? 390 : 230}" cy="180" r="80" fill="${alternate ? '#4C8270' : '#E5BA57'}"/><path d="M100 340 L300 170 L500 340Z" fill="#315D65"/><text x="22" y="42" font-family="Arial" font-size="24" fill="#243B45">L</text><text x="555" y="42" font-family="Arial" font-size="24" fill="#243B45">R</text><text x="205" y="380" font-family="Arial" font-size="24" fill="#243B45">${alternate ? 'SECOND SOURCE' : 'FIRST SOURCE'}</text></svg>`,
    )
  )
}
function text(id: string, value: string, left: number, top: number, width: number, size = 22): ISlidePageElement {
  const doc = RichTextBuilder.create().span(value, { fontSize: size, color: '#243B45' }).getData()
  doc.id = id + '-doc'
  doc.documentStyle = { ...doc.documentStyle, textStyle: { ff: 'Arial' } }
  doc.body?.paragraphs?.forEach((p, i) => {
    p.paragraphId = id + '-p-' + i
  })
  doc.body?.sectionBreaks?.forEach((s, i) => {
    s.sectionId = id + '-s-' + i
  })
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform: { left, top, width, height: 60, rotation: 0 },
    shapeData: {
      shapeType: ShapeTypeEnum.Rect,
      fill: { fillType: ShapeFillEnum.NoFill },
      stroke: { lineStrokeType: ShapeLineTypeEnum.NoLine, width: 0 },
      shapeText: { dataModel: { doc } },
    },
  }
}
export function createData(): ISlideData {
  const rows = [
    {
      id: 'fit',
      title: '01 / Keep the aspect ratio',
      caption: 'Same 3:2 source. Two proportional frames; neither crops nor stretches.',
      width: 360,
      height: 240,
      crop: undefined,
      alternate: false,
      label: '360 × 240',
      rightWidth: 240,
      rightHeight: 160,
    },
    {
      id: 'crop',
      title: '02 / Crop the source',
      caption: 'Initially: trim 25% from each side. The center stays in a 3:4 frame.',
      width: 360,
      height: 240,
      crop: { left: 90, right: 90, top: 0, bottom: 0 },
      alternate: false,
      label: 'crop 25% each side',
      rightWidth: 180,
      rightHeight: 240,
    },
    {
      id: 'replace',
      title: '03 / Replace the source',
      caption: 'Different artwork, same 3:2 frame. Source replacement does not move the image.',
      width: 360,
      height: 240,
      crop: undefined,
      alternate: true,
      label: 'second source',
      rightWidth: 360,
      rightHeight: 240,
    },
  ]
  const slides = rows.map((row) => {
    const elements: ISlidePageElement[] = [
      text(row.id + '-title', row.title, 60, 40, 920, 34),
      text(row.id + '-caption', row.caption, 60, 110, 920, 20),
      {
        id: row.id + '-original',
        type: PageElementTypeEnum.Image,
        source: imageSource(),
        imageSourceType: ImageSourceType.URL,
        transform: { left: 60, top: 205, width: row.width, height: row.height, rotation: 0 },
      },
      {
        id: row.id + '-sample',
        type: PageElementTypeEnum.Image,
        source: imageSource(row.alternate),
        imageSourceType: ImageSourceType.URL,
        crop: row.crop,
        transform: { left: 590, top: 205, width: row.rightWidth, height: row.rightHeight, rotation: 0 },
      },
      text(row.id + '-left-label', 'Initially: original / full source', 60, 465, 450, 20),
      text(row.id + '-right-label', `Initially: ${row.id === 'fit' ? '240 × 160' : row.label}`, 590, 465, 430, 20),
      text(row.id + '-footer', 'Select an image. Format Shape → Position → Start Crop.', 60, 520, 950, 18),
    ]
    return {
      id: row.id,
      name: row.title,
      pageType: PageTypeEnum.Slide as const,
      background: { type: SlideBackgroundTypeEnum.Solid as const, color: '#F6F8FA' },
      elements: Object.fromEntries(elements.map((e) => [e.id, e])),
      elementOrder: elements.map((e) => e.id),
    }
  })
  return {
    id: 'image-gallery',
    name: 'Images / Aspect ratio and crop',
    appVersion: '1.0.0-rc.0',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1024, height: 576 },
    activeSlideId: 'fit',
    slides: Object.fromEntries(slides.map((s) => [s.id, s])),
    slideOrder: slides.map((s) => s.id),
  }
}
