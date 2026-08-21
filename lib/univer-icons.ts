export const univerIconNames = [
  'BasesMultiIcon',
  'BoardsMultiIcon',
  'DocsMultiIcon',
  'PdfMultiIcon',
  'SheetsMultiIcon',
  'SlidesMultiIcon',
  'SymbolsIcon',
] as const

export type UniverIconName = (typeof univerIconNames)[number]

export function isUniverIconName(value: string): value is UniverIconName {
  return univerIconNames.includes(value as UniverIconName)
}
