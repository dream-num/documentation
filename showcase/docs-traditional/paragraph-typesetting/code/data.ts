import {
  BooleanNumber,
  DocumentFlavor,
  HorizontalAlign,
  NamedStyleType,
  SpacingRule,
  type IDocumentData,
  type IParagraphStyle,
} from '@univerjs/core'

// Original, fictional museum content; no copied collection records.
export const TITLE = 'Museum Collection Note — Paragraph Typesetting'
export const PARAGRAPHS = [
  'The North Gallery Collection',
  'Accession NG-2048 · Clay vessel · Fictional teaching collection',
  'Object description',
  'This small blue vessel was designed for daily use rather than ceremony. A narrow neck preserves the liquid while the broad foot supports it on an uneven surface. Fine concentric marks record the turning process, and an unglazed patch near the base reveals the original clay. The catalog records both the object and the evidence used to describe it; spacing should make a long observation readable without hiding uncertainty.',
  'Catalog record',
  'Material: glazed stoneware. Height: 184 mm. Rim diameter: 62 mm. Display case: North 04. Attribution remains provisional; the demonstration uses fictional provenance and does not reproduce a real museum record.',
]
export const BASE_STYLE: IParagraphStyle = {
  spacingRule: SpacingRule.AUTO,
  snapToGrid: BooleanNumber.FALSE,
  lineSpacing: 1,
  spaceAbove: { v: 0 },
  spaceBelow: { v: 6 },
  indentFirstLine: { v: 0 },
  hanging: { v: 0 },
  indentStart: { v: 0 },
  indentEnd: { v: 0 },
  horizontalAlign: HorizontalAlign.LEFT,
}
export const VARIANTS: { id: string; label: string; style: IParagraphStyle }[] = [
  { id: 'compact', label: 'Compact', style: { ...BASE_STYLE } },
  {
    id: 'book',
    label: 'Book style',
    style: {
      ...BASE_STYLE,
      lineSpacing: 1.4,
      spaceAbove: { v: 8 },
      spaceBelow: { v: 14 },
      indentFirstLine: { v: 28 },
      horizontalAlign: HorizontalAlign.JUSTIFIED,
    },
  },
  {
    id: 'hanging',
    label: 'Hanging indent',
    style: { ...BASE_STYLE, lineSpacing: 1.2, indentStart: { v: 36 }, hanging: { v: 36 }, spaceBelow: { v: 12 } },
  },
  {
    id: 'double',
    label: 'Double spaced',
    style: { ...BASE_STYLE, lineSpacing: 2, spaceAbove: { v: 12 }, spaceBelow: { v: 20 }, indentEnd: { v: 24 } },
  },
]

// A three-chapter catalog dossier: descriptive prose, evidence entries and editorial review.
export function createData(): IDocumentData {
  const style = (id: string) => structuredClone(VARIANTS.find((v) => v.id === id)!.style)
  const rows: { text: string; style: IParagraphStyle }[] = [
    { text: PARAGRAPHS[0], style: { ...BASE_STYLE, namedStyleType: NamedStyleType.TITLE } },
    { text: PARAGRAPHS[1], style: { ...BASE_STYLE, spaceBelow: { v: 20 } } },
    {
      text: PARAGRAPHS[2],
      style: { ...BASE_STYLE, namedStyleType: NamedStyleType.HEADING_2, keepNext: BooleanNumber.TRUE },
    },
    { text: PARAGRAPHS[3], style: style('book') },
    {
      text: PARAGRAPHS[4],
      style: { ...BASE_STYLE, namedStyleType: NamedStyleType.HEADING_2, keepNext: BooleanNumber.TRUE },
    },
    { text: PARAGRAPHS[5], style: style('compact') },
    {
      text: 'Surface and handling observations',
      style: { ...BASE_STYLE, namedStyleType: NamedStyleType.HEADING_2, keepNext: BooleanNumber.TRUE },
    },
    {
      text: 'The blue glaze pools most deeply below the shoulder. A narrow band at the foot has no glaze, allowing the clay color to remain visible. These observations describe the fictional object as presented; they do not establish a workshop, date, or place of manufacture. A curator should keep an observation separate from any later interpretation.',
      style: style('book'),
    },
    {
      text: 'Handling record: the vessel rests on a padded support during measurement. Staff photograph the rim, shoulder and foot separately so that the scale remains readable. A repeated measurement should record both the tool and the viewing angle. The recorded height is an illustration, not evidence about an actual museum collection.',
      style: style('compact'),
    },
    {
      text: 'Prepared by Mira Chen / fictional collections editor',
      style: { ...BASE_STYLE, horizontalAlign: HorizontalAlign.RIGHT, spaceAbove: { v: 18 } },
    },
    {
      text: '02 / Provenance and evidence',
      style: {
        ...BASE_STYLE,
        pageBreakBefore: BooleanNumber.TRUE,
        namedStyleType: NamedStyleType.HEADING_1,
        keepNext: BooleanNumber.TRUE,
      },
    },
    {
      text: 'Evidence is filed by source rather than by confidence. Each entry names what can be observed, what has been inferred, and what remains unresolved. Hanging references make the source identifier easy to find when a reviewer compares several records on paper.',
      style: style('compact'),
    },
    {
      text: 'NG-R01 / Intake ledger. The fictional ledger describes a blue vessel received with two packing fragments. It contains no maker signature and gives no reliable production date. A later note repeats the same description, so the two entries are not independent evidence.',
      style: style('hanging'),
    },
    {
      text: 'NG-R02 / Imaging session. Side lighting reveals a shallow abrasion beside the foot. The image log records the camera angle and scale; it does not assign a cause. A change in lighting can exaggerate surface marks and must not become an unsupported damage claim.',
      style: style('hanging'),
    },
    {
      text: 'Attribution review: the turning marks are consistent with a formed vessel, but the visible features are insufficient to name a workshop. The catalog retains the word provisional. A readable paragraph must not convert a tentative observation into a confident attribution merely because the page looks finished.',
      style: style('book'),
    },
    {
      text: 'Reviewer note: compare the intake description with the new photographs before amending the material field. Reserve space for a written correction. If the two records disagree, keep both descriptions and identify which one is currently used for display. Do not erase the earlier wording from the evidence packet.',
      style: style('double'),
    },
    {
      text: 'Evidence review / 14 September 2027 / fictional schedule',
      style: { ...BASE_STYLE, horizontalAlign: HorizontalAlign.RIGHT },
    },
    {
      text: '03 / Display and editorial review',
      style: {
        ...BASE_STYLE,
        pageBreakBefore: BooleanNumber.TRUE,
        namedStyleType: NamedStyleType.HEADING_1,
        keepNext: BooleanNumber.TRUE,
      },
    },
    {
      text: 'A short label invites attention. A catalog preserves uncertainty.',
      style: { ...BASE_STYLE, horizontalAlign: HorizontalAlign.CENTER, spaceAbove: { v: 18 }, spaceBelow: { v: 24 } },
    },
    {
      text: 'DISPLAY DRAFT: Blue vessel, glazed stoneware. The broad foot and narrow neck suggest practical use. The maker and production date are not established. This label is an original teaching text for an invented collection; it must never be presented as a museum attribution.',
      style: style('book'),
    },
    {
      text: 'Access review: avoid unexplained specialist terms in the public label. Keep the longer material description in the collection note. The display text should distinguish what a visitor can see from what a researcher has proposed. A reviewer may add a plain-language sentence without rewriting the catalog evidence.',
      style: style('double'),
    },
    {
      text: 'Editorial decision: retain the object dimensions, remove an unsupported workshop name, and keep the provisional attribution visible. The final copy should be checked against the source packet after any change in line spacing or indentation. Page layout is a reading aid, not a substitute for evidence.',
      style: style('compact'),
    },
    {
      text: 'Release checklist: verify accession number; compare dimensions; retain uncertainty; record the reviewer and date. The catalog note, source entries and public label serve different readers, so each uses a different paragraph treatment within the same document.',
      style: style('hanging'),
    },
    {
      text: 'Approved for fictional teaching use / North Gallery team',
      style: { ...BASE_STYLE, horizontalAlign: HorizontalAlign.RIGHT, spaceAbove: { v: 20 } },
    },
  ]
  const dataStream = rows.map((row) => row.text).join('\r') + '\r\n'
  let offset = 0
  return {
    id: 'north-gallery-typesetting',
    title: TITLE,
    documentStyle: {
      documentFlavor: DocumentFlavor.TRADITIONAL,
      pageSize: { width: 794, height: 1123 },
      marginTop: 72,
      marginRight: 72,
      marginBottom: 72,
      marginLeft: 72,
      textStyle: { fs: 11, ff: 'Georgia' },
    },
    body: {
      dataStream,
      textRuns: [],
      paragraphs: rows.map((row, index) => {
        offset += row.text.length + 1
        return {
          startIndex: offset - 1,
          paragraphId: 'north-paragraph-' + index,
          paragraphStyle: structuredClone(row.style),
        }
      }),
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'north-catalog-section' }],
    },
  }
}
