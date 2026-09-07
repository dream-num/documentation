import type { IDocumentData } from '@univerjs/core'
import { CustomRangeType, DocumentFlavor, NamedStyleType } from '@univerjs/core'

export const PRIMARY_ID = 'beacon-ingest'
export const COMPARISON_ID = 'beacon-query'
export const LANGUAGES = ['typescript', 'javascript', 'json', 'python', 'sql', 'plaintext'] as const
export const SAMPLES = [
  {
    id: 'typescript',
    label: 'TypeScript · readings',
    lines: [
      '// Beacon batch: preserve tabs, spaces, and blank lines.',
      'type Reading = { station: string; lux: number };',
      '',
      'const readings: Reading[] = [',
      '\t{ station: "north", lux: 18 },',
      '\t{ station: "courtyard", lux: 32 },',
      '];',
      'const summary = readings.map(({ station, lux }) => station + ": " + lux + " lx — review required before publishing the community-lighting digest");',
    ],
  },
  {
    id: 'json',
    label: 'JSON · batch manifest',
    lines: [
      '{',
      '  "batch": "beacon-2027-03",',
      '  "stations": ["north", "courtyard"],',
      '  "reviewed": false,',
      '  "unit": "lx"',
      '}',
    ],
  },
  {
    id: 'python',
    label: 'Python · review filter',
    lines: [
      '# Beacon review queue',
      'readings = [18, 32, 47, 11]',
      '',
      'for lux in readings:',
      '\tif lux < 20:',
      '\t\tprint("Review:", lux)',
    ],
  },
  {
    id: 'sql',
    label: 'SQL · daily summary',
    lines: [
      '-- Beacon daily summary',
      'SELECT station, MIN(lux) AS minimum_lux',
      'FROM beacon_readings',
      "WHERE observed_on = '2027-03-31'",
      'GROUP BY station;',
    ],
  },
] as const
export const COMPARISON_LINES = [
  'SELECT station, AVG(lux) AS mean_lux',
  'FROM beacon_readings',
  'GROUP BY station;',
] as const

// Original fictional sensor-product brief, with exact code whitespace and deterministic content.
export function createData(sampleId = 'typescript', empty = false): IDocumentData {
  const sample = SAMPLES.find((candidate) => candidate.id === sampleId)
  if (!sample) throw new Error('Unknown sample: ' + sampleId)
  const normal = NamedStyleType.NORMAL_TEXT
  const heading = NamedStyleType.HEADING_1
  const rows: readonly (readonly [string, NamedStyleType])[] = empty
    ? [['', normal]]
    : [
        ['Beacon — Community Lighting Digest', NamedStyleType.TITLE],
        ['31 March 2027 · Observation tools team · Prototype brief', normal],
        ['01 · Product purpose', heading],
        [
          'Beacon gathers fictional evening light readings so volunteer reviewers can compare observations before preparing a neighborhood digest.',
          normal,
        ],
        ['02 · Ingestion example', heading],
        ...sample.lines.map((text) => [text, normal] as const),
        ['03 · Review rules', heading],
        ['Keep every original observation, including readings awaiting review', normal],
        ['Record station names separately from presentation labels', normal],
        ['[CAUTION] These invented readings demonstrate SDK behavior, not lighting safety thresholds.', normal],
        ['04 · Comparison query', heading],
        ...COMPARISON_LINES.map((text) => [text, normal] as const),
        ...SAMPLES.filter((item) => item.id !== sampleId).flatMap((item) =>
          [item.label, ...item.lines].map(
            (text, index) => [text, index === 0 ? NamedStyleType.HEADING_2 : normal] as const,
          ),
        ),
        ['05 · Acceptance checklist', heading],
        ['Verify tabs and blank lines survive a copy and snapshot reload', normal],
        ['Confirm a language change leaves code text untouched', normal],
        ['06 · Editorial handoff', heading],
        ['[QUOTE] A trustworthy digest distinguishes measured data from the story we tell about it.', normal],
        ['— Beacon workshop, fictional attribution', normal],
        ['Read the \u001Fobservation review guide\u001E before preparing the digest.', normal],
      ]
  const dataStream = rows.map(([text]) => text).join('\r') + '\r\n'
  let offset = 0
  return {
    id: 'beacon-code-demo',
    title: 'Beacon — Community Lighting Digest',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 820, height: 1123 },
      marginTop: 24,
      marginBottom: 24,
      marginLeft: 40,
      marginRight: 40,
    },
    body: {
      dataStream,
      paragraphs: rows.map(([text, style], index) => {
        offset += text.length + 1
        return {
          startIndex: offset - 1,
          paragraphId: 'para_beacon_' + index,
          paragraphStyle: {
            namedStyleType: style,
            lineSpacing: 1,
            spaceBelow: { v: 8 },
          },
        }
      }),
      textRuns: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'beacon-section' }],
      customRanges: empty
        ? []
        : [
            {
              rangeId: 'beacon-guide',
              rangeType: CustomRangeType.HYPERLINK,
              startIndex: dataStream.indexOf('\u001F'),
              endIndex: dataStream.indexOf('\u001E'),
              properties: { url: 'https://example.org/beacon-review' },
            },
          ],
    },
  }
}
