export type SnapshotKind = 'sheets' | 'docs' | 'slides' | 'boards' | 'bases' | 'pdfs' | 'unknown'
export interface ISnapshotIssue {
  code:
    | 'object'
    | 'unknown'
    | 'id'
    | 'collection'
    | 'order'
    | 'missing'
    | 'duplicate'
    | 'unlisted'
    | 'coordinate'
    | 'bounds'
    | 'style'
    | 'body'
    | 'resource'
  path: string
  severity: 'error' | 'warning'
}
export interface ISnapshotReport {
  kind: SnapshotKind
  issues: ISnapshotIssue[]
  counts: { units: number; cells: number; formulas: number; styles: number; resources: number }
  sections: { name: string; bytes: number }[]
}
export const SNAPSHOT_MAX_BYTES = 8 * 1024 * 1024
export const SNAPSHOT_SAMPLES = {
  sheets: {
    id: 'sample-workbook',
    name: 'Snapshot example',
    appVersion: '1.0.0-rc.0',
    locale: 'enUS',
    sheetOrder: ['sheet-1'],
    styles: { heading: { bl: 1, bg: { rgb: '#E8EEFF' } } },
    sheets: {
      'sheet-1': {
        id: 'sheet-1',
        name: 'Sales',
        rowCount: 30,
        columnCount: 10,
        cellData: {
          0: { 0: { v: 'Product', s: 'heading' }, 1: { v: 'Sales', s: 'heading' } },
          1: { 0: { v: 'Books' }, 1: { v: 120 } },
          2: { 0: { v: 'Total' }, 1: { f: '=SUM(B2:B2)' } },
        },
      },
    },
    resources: [],
  },
  docs: {
    id: 'sample-document',
    title: 'Snapshot example',
    body: { dataStream: 'Hello, Univer!\r\n', paragraphs: [{ startIndex: 14 }] },
    documentStyle: {},
  },
}

export function isSnapshotObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function inspectSnapshot(value: unknown): ISnapshotReport {
  const report: ISnapshotReport = {
    kind: 'unknown',
    issues: [],
    counts: { units: 0, cells: 0, formulas: 0, styles: 0, resources: 0 },
    sections: [],
  }
  const issue = (code: ISnapshotIssue['code'], path: string, severity: ISnapshotIssue['severity'] = 'error') => {
    if (report.issues.length < 200) report.issues.push({ code, path, severity })
  }
  if (!isSnapshotObject(value)) {
    issue('object', '$')
    return report
  }
  report.sections = Object.entries(value)
    .map(([name, item]) => ({ name, bytes: new TextEncoder().encode(JSON.stringify(item)).length }))
    .toSorted((a, b) => b.bytes - a.bytes)
  if ('sheets' in value || 'sheetOrder' in value) report.kind = 'sheets'
  else if ('body' in value) report.kind = 'docs'
  else if ('tables' in value || 'tableOrder' in value) report.kind = 'bases'
  else if ('pageOrder' in value) report.kind = 'boards'
  else if ('slideOrder' in value) report.kind = 'slides'
  else if ('document' in value && ('schema' in value || 'editState' in value)) report.kind = 'pdfs'
  else issue('unknown', '$')
  if (typeof value.id !== 'string' || !value.id.trim()) issue('id', '$.id', 'warning')
  const collection = {
    sheets: ['sheets', 'sheetOrder'],
    bases: ['tables', 'tableOrder'],
    boards: ['pages', 'pageOrder'],
    slides: ['slides', 'slideOrder'],
  } as const
  if (report.kind in collection) {
    const [itemsKey, orderKey] = collection[report.kind as keyof typeof collection]
    const items = value[itemsKey]
    const order = value[orderKey]
    if (!isSnapshotObject(items)) issue('collection', `$.${itemsKey}`)
    else {
      report.counts.units = Object.keys(items).length
      if (!Array.isArray(order)) issue('order', `$.${orderKey}`)
      else {
        const seen = new Set<string>()
        order.forEach((id, index) => {
          const path = `$.${orderKey}[${index}]`
          if (typeof id !== 'string' || !Object.hasOwn(items, id)) issue('missing', path)
          if (seen.has(id)) issue('duplicate', path)
          seen.add(id)
        })
        for (const id of Object.keys(items))
          if (!seen.has(id)) issue('unlisted', `$.${itemsKey}[${JSON.stringify(id)}]`, 'warning')
      }
      for (const [id, item] of Object.entries(items)) {
        const path = `$.${itemsKey}[${JSON.stringify(id)}]`
        if (!isSnapshotObject(item)) {
          issue('object', path)
          continue
        }
        if (item.id !== id) issue('id', `${path}.id`, 'warning')
        if (report.kind !== 'sheets') continue
        if (item.cellData !== undefined && !isSnapshotObject(item.cellData)) {
          issue('collection', `${path}.cellData`)
          continue
        }
        for (const [row, cells] of Object.entries(isSnapshotObject(item.cellData) ? item.cellData : {})) {
          const rowPath = `${path}.cellData[${JSON.stringify(row)}]`
          if (!/^\d+$/.test(row) || !Number.isSafeInteger(Number(row))) issue('coordinate', rowPath)
          if (!isSnapshotObject(cells)) {
            issue('object', rowPath)
            continue
          }
          for (const [column, cell] of Object.entries(cells)) {
            if (cell === null) continue
            const cellPath = `${rowPath}[${JSON.stringify(column)}]`
            report.counts.cells++
            if (!/^\d+$/.test(column) || !Number.isSafeInteger(Number(column))) issue('coordinate', cellPath)
            if (
              (typeof item.rowCount === 'number' && Number(row) >= item.rowCount) ||
              (typeof item.columnCount === 'number' && Number(column) >= item.columnCount)
            )
              issue('bounds', cellPath)
            if (!isSnapshotObject(cell)) {
              issue('object', cellPath)
              continue
            }
            if (typeof cell.f === 'string') report.counts.formulas++
            if (typeof cell.s === 'string' && (!isSnapshotObject(value.styles) || !Object.hasOwn(value.styles, cell.s)))
              issue('style', `${cellPath}.s`)
          }
        }
      }
    }
  }
  if (report.kind === 'docs') {
    report.counts.units = 1
    if (
      !isSnapshotObject(value.body) ||
      typeof value.body.dataStream !== 'string' ||
      !value.body.dataStream.endsWith('\r\n')
    )
      issue('body', '$.body.dataStream')
  }
  if (report.kind === 'pdfs') report.counts.units = 1
  if (isSnapshotObject(value.styles)) report.counts.styles = Object.keys(value.styles).length
  if (value.resources !== undefined) {
    if (!Array.isArray(value.resources)) issue('resource', '$.resources')
    else {
      report.counts.resources = value.resources.length
      value.resources.forEach((resource, index) => {
        if (!isSnapshotObject(resource) || typeof resource.name !== 'string' || typeof resource.data !== 'string')
          issue('resource', `$.resources[${index}]`)
      })
    }
  }
  return report
}
