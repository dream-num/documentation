import type { ILuckyInlineStrItem } from './cell-style'
import type { IPostil } from './postil'

export interface IluckySheetCelldata {
  r: number// cell row number
  c: number// cell column number
  v: Partial<IluckySheetCelldataValue> | string | null // cell value
}

export interface IluckySheetCelldataValue extends ILuckyInlineStrItem {
  ct: ILuckySheetCellFormat | undefined // celltype,Cell value format: text, time, etc.
  bg: string | undefined | null// background,#fff000
  vt: string | number | undefined// Vertical alignment, 0 middle, 1 up, 2 down
  ht: string | number | undefined// Horizontal alignment,0 center, 1 left, 2 right
  mc: IluckySheetCelldataValueMerge | undefined // Merge Cells
  tr: string | number | undefined // Text rotation,0: 0、1: 45 、2: -45、3 Vertical text、4: 90 、5: -90
  tb: string | number | undefined // Text wrap,0 truncation, 1 overflow, 2 word wrap
  m: string | undefined // Display value
  rt: string | number | undefined // text rotation angle 0-180 alignment
  f: string | undefined // formula
  qp: number | undefined // quotePrefix, show number as string
  spl?: ISparkLine // sparkline
  customKey?: Record<string, any> // custom key
  ps?: IPostil // comment
}

export interface ILuckySheetCellFormat {
  fa: string // Format definition string
  t?: string // Cell Type
  s?: Partial<ILuckyInlineStrItem>[]
}

export interface IluckySheetCelldataValueMerge {
  rs?: number // row of merge cell  length, only main merge cell, every merge cell has only one main mergeCell
  cs?: number // column of merge cell  length, only main merge cell, every merge cell has only one main mergeCell
  r: number // main merge cell row Number, other cell link to main cell
  c: number // main merge cell column Number, other cell link to main cell
}

export interface ISparkLine {
  shapes: Record<string, any>
  shapeseq: number[]
  offsetX: number
  offsetY: number
  pixelWidth: number
  pixelHeight: number
}
