import type { IWorkbookData, IWorksheetData } from '@univerjs/presets'
import type { ILuckyJson } from '../common/interface/lucky-json'
import type { ILuckySheet } from '../common/interface/lucky-sheet'
import { border } from './border'

export function worksheetConfig(workbookData: Partial<IWorkbookData>, worksheetData: Partial<IWorksheetData>, luckyJson: Partial<ILuckyJson>, sheet: Partial<ILuckySheet>) {
  if (sheet.config) {
    // merge cell
    if (sheet.config.merge) {
      worksheetData.mergeData = []
      for (const key of Object.keys(sheet.config.merge)) {
        const merge: {
          r: number
          c: number
          rs: number
          cs: number
        } = sheet.config.merge[key]
        const mergeReact = {
          startRow: merge.r,
          endRow: merge.r + merge.rs - 1,
          startColumn: merge.c,
          endColumn: merge.c + merge.cs - 1,
        }
        worksheetData.mergeData.push(mergeReact)
      }
    }

    // Borders are first set in order to each cell object. When setting, it is necessary to traverse the adjacent cells in four directions to remove duplicates. Finally, after the cell style is determined, it is uniformly extracted to styles.
    if (sheet.config.borderInfo) {
      border(worksheetData, sheet)
    }

    // row height
    if (sheet.config.rowlen) {
      worksheetData.rowData = {}
      for (const [rowIndex, height] of Object.entries(sheet.config.rowlen)) {
        worksheetData.rowData[Number(rowIndex)] = {
          h: Number(height),
          hd: 0,
        }
      }
    }
    // column width
    if (sheet.config.columnlen) {
      worksheetData.columnData = {}
      for (const [colIndex, width] of Object.entries(sheet.config.columnlen)) {
        worksheetData.columnData[Number(colIndex)] = {
          w: Number(width),
          hd: 0,
        }
      }
    }
    // hidden row
    if (sheet.config.rowhidden) {
      if (!worksheetData.rowData) {
        worksheetData.rowData = {}
      }
      const rowData = worksheetData.rowData
      for (const [rowIndex, _] of Object.entries(sheet.config.rowhidden)) {
        if (!rowData[Number(rowIndex)]) {
          rowData[Number(rowIndex)] = {}
        }

        rowData[Number(rowIndex)].hd = 1
      }
    }
    // hidden column
    if (sheet.config.colhidden) {
      if (!worksheetData.columnData) {
        worksheetData.columnData = {}
      }
      const columnData = worksheetData.columnData
      for (const [colIndex, _] of Object.entries(sheet.config.colhidden)) {
        if (!columnData[Number(colIndex)]) {
          columnData[Number(colIndex)] = {}
        }
        columnData[Number(colIndex)].hd = 1
      }
    }
  }
}
