import type { IWorkbookData } from '@univerjs/core'

export function dehydrateWorkbookDataForComparison(rawData: IWorkbookData): void {
  dehydrateStyles(rawData)
}

function dehydrateStyles(rawData: IWorkbookData): void {
  rawData.styles = {}

  const styleCacheMap = new Map<string, string>()
  let styleIndex = 0

  for (const worksheet in rawData.sheets) {
    const worksheetData = rawData.sheets[worksheet]
    const cellData = worksheetData.cellData
    if (cellData) {
      for (const rowIndex in cellData) {
        const rowData = cellData[rowIndex]
        for (const colIndex in rowData) {
          const cellData = rowData[colIndex]
          const styleHash = cellData.s as string | undefined
          if (styleHash) {
            if (styleCacheMap.has(styleHash)) {
              cellData.s = styleCacheMap.get(styleHash)
            } else {
              cellData.s = `${styleIndex++}`
              styleCacheMap.set(styleHash, cellData.s)
            }
          }
        }
      }
    }
  }
}
