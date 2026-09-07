import Papa from 'papaparse'

export const MAX_BYTES = 1024 * 1024

// CSV is parsed by Papa Parse, not by Univer. All fields remain literal text.
export function parseCsv(text: string, delimiter = ',', skipEmptyLines = true): string[][] {
  if (new TextEncoder().encode(text).length > MAX_BYTES) throw new Error('Demo limit: 1 MiB of UTF-8 CSV.')
  if (!text.replace(/^\uFEFF/, '').length) throw new Error('CSV text is empty.')
  if (![',', ';', '\t'].includes(delimiter)) throw new Error('Choose comma, semicolon or tab.')
  const result = Papa.parse<string[]>(text, { delimiter, skipEmptyLines, dynamicTyping: false })
  if (result.errors.length) throw new Error(result.errors.map((error) => error.message).join('; '))
  const rows = result.data
  const columns = rows.reduce((max, row) => Math.max(max, row.length), 0)
  if (!rows.length || !columns) throw new Error('CSV contains no records.')
  if (rows.length > 2000 || columns > 100 || rows.length * columns > 10000)
    throw new Error('Demo parsing limit: 2,000 rows, 100 columns and 10,000 cells.')
  return rows.map((row) => Array.from({ length: columns }, (_, column) => row[column] ?? ''))
}

export async function readCsvFile(file: File): Promise<string> {
  if (file.size > MAX_BYTES) throw new Error('Demo limit: 1 MiB of UTF-8 CSV.')
  return new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer())
}
