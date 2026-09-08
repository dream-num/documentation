import type { IDocumentData, IParagraph, ITextRun } from '@univerjs/core'
import { DocumentFlavor, NamedStyleType } from '@univerjs/core'

export function createData(): IDocumentData {
  const topics = ['Research', 'Access', 'Materials', 'Delivery', 'Training', 'Support']
  const sites = ['North studio', 'River workshop', 'Harbor library', 'Garden laboratory']
  const paragraphs: IParagraph[] = []
  const textRuns: ITextRun[] = []
  let dataStream = ''
  const append = (text: string, style: NamedStyleType, emphasis?: string) => {
    const start = dataStream.length
    dataStream += text + '\r'
    paragraphs.push({
      startIndex: dataStream.length - 1,
      paragraphId: 'long-paragraph-' + paragraphs.length,
      paragraphStyle: {
        namedStyleType: style,
        spaceBelow: { v: style === NamedStyleType.NORMAL_TEXT ? 8 : 18 },
        textStyle: { fs: style === NamedStyleType.TITLE ? 26 : style === NamedStyleType.HEADING_1 ? 19 : 13 },
      },
    })
    if (emphasis) {
      const st = start + text.indexOf(emphasis)
      textRuns.push({ st, ed: st + emphasis.length, ts: { bl: 1, cl: { rgb: '#0F766E' } } })
    }
  }
  append('Field guide: a working archive', NamedStyleType.TITLE)
  append(
    '24 chapters, 288 field notes and 315 paragraphs. Scroll, edit and inspect this native modern document; this sample does not report a performance score.',
    NamedStyleType.NORMAL_TEXT,
  )
  for (let chapter = 0; chapter < 24; chapter++) {
    const topic = topics[chapter % topics.length]
    const site = sites[Math.floor(chapter / topics.length)]
    append(`Chapter ${String(chapter + 1).padStart(2, '0')} / ${site} / ${topic}`, NamedStyleType.HEADING_1)
    for (let note = 0; note < 12; note++) {
      const marker = `Record ${String(chapter + 1).padStart(2, '0')}.${String(note + 1).padStart(2, '0')}`
      const variants = [
        `${marker}: ${site} reviewed ${topic.toLowerCase()} needs with ${8 + chapter + note} participants. The group recorded questions before choosing a small, reversible next step.`,
        `${marker}: Observation at ${site}: shared labels reduced handover questions. Keep the original wording beside the proposed revision until the next ${topic.toLowerCase()} review.`,
        `${marker}: Decision for ${topic.toLowerCase()}: test the revised checklist with two teams. The owner will compare incomplete entries and unexpected delays, not just the final total.`,
        `${marker}: Open question: does the ${site.toLowerCase()} workflow still work when a new colleague joins midway? Capture one clear example and include the context that made it difficult.`,
        `${marker}: Follow-up for ${site}: reserve ${15 + note * 2} minutes for a walkthrough. Ask participants to describe what they expected before explaining the intended ${topic.toLowerCase()} process.`,
        `${marker}: Evidence note: the ${topic.toLowerCase()} team retained a short summary, a decision owner and a review date. This is original sample prose, not imported customer or project data.`,
      ]
      append(variants[note % variants.length], NamedStyleType.NORMAL_TEXT, marker)
    }
  }
  append(
    'Archive complete. Edit this closing sentence to verify work at the end of the document.',
    NamedStyleType.NORMAL_TEXT,
  )
  dataStream += '\n'
  return {
    id: 'modern-long-document',
    title: 'Field guide: a working archive',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 850, height: 1123 },
      marginTop: 30,
      marginBottom: 30,
      marginLeft: 48,
      marginRight: 48,
    },
    body: {
      dataStream,
      paragraphs,
      textRuns,
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'archive-section' }],
    },
  }
}
