import type { IDocumentData } from '@univerjs/core'
import { ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { BooleanNumber, DocumentFlavor, NamedStyleType } from '@univerjs/core'
import { TextWrappingStyle } from '@univerjs/preset-docs-drawing'

export const SHAPES = [
  {
    id: 'shape-rectangle',
    en: 'Rectangle',
    type: ShapeTypeEnum.Rect,
    fill: '#dbeafe',
    stroke: '#2563eb',
    width: 180,
    rotation: 0,
    wrapping: TextWrappingStyle.INLINE,
  },
  {
    id: 'shape-rounded',
    en: 'Rounded rectangle',
    type: ShapeTypeEnum.RoundRect,
    fill: '#d1fae5',
    stroke: '#047857',
    width: 200,
    rotation: 0,
    wrapping: TextWrappingStyle.INLINE,
  },
  {
    id: 'shape-ellipse',
    en: 'Ellipse',
    type: ShapeTypeEnum.Ellipse,
    fill: '#fef3c7',
    stroke: '#d97706',
    width: 180,
    rotation: 0,
    wrapping: TextWrappingStyle.INLINE,
  },
  {
    id: 'shape-diamond',
    en: 'Diamond',
    type: ShapeTypeEnum.Diamond,
    fill: '#ede9fe',
    stroke: '#7c3aed',
    width: 160,
    rotation: 8,
    wrapping: TextWrappingStyle.INLINE,
  },
  {
    id: 'shape-outline',
    en: 'Outline',
    type: ShapeTypeEnum.RoundRect,
    fill: '',
    stroke: '#7c3aed',
    width: 180,
    rotation: 0,
    wrapping: TextWrappingStyle.WRAP_SQUARE,
  },
  {
    id: 'shape-background',
    en: 'Behind text',
    type: ShapeTypeEnum.Rect,
    fill: '#e0f2fe',
    stroke: '#7dd3fc',
    width: 440,
    rotation: 0,
    wrapping: TextWrappingStyle.BEHIND_TEXT,
  },
] as const

export function createData(_legacyLocale = false): IDocumentData {
  const rows = [
    { id: 'shape-title', text: 'Shapes', title: true },
    ...SHAPES.flatMap((sample) => [
      { id: sample.id + '-heading', text: sample.en, title: false },
      {
        id: sample.id + '-anchor',
        text:
          sample.id === 'shape-outline'
            ? 'Text follows the outline. A violet border leaves the background clear, with body text flowing beside the shape. This paragraph shows the position of the shape relative to surrounding text.'
            : sample.id === 'shape-background'
              ? 'Text over a pale blue background.'
              : '',
        title: false,
      },
    ]),
  ]
  let offset = 0
  const dataStream = rows.map((row) => row.text).join('\r') + '\r\n'
  return {
    id: 'native-shapes-gallery',
    title: 'Shapes',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 760, height: 1123 },
      marginTop: 24,
      marginBottom: 80,
      marginLeft: 64,
      marginRight: 64,
    },
    body: {
      dataStream,
      textRuns: [],
      paragraphs: rows.map((row) => {
        offset += row.text.length + 1
        return {
          startIndex: offset - 1,
          paragraphId: row.id,
          paragraphStyle: {
            namedStyleType: row.title ? NamedStyleType.TITLE : NamedStyleType.NORMAL_TEXT,
            spaceAbove: { v: row.id.endsWith('-heading') ? 12 : 0 },
            spaceBelow: { v: 8 },
            lineSpacing: 1.2,
            textStyle: { fs: row.title ? 24 : 13, bl: row.title ? BooleanNumber.TRUE : BooleanNumber.FALSE },
          },
        }
      }),
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'shapes-section' }],
    },
  }
}
