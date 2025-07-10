import type { IluckySheetSelection } from './selection'

// Border cell interface
export interface IluckySheetborderInfoCell {
  rangeType: string
  value: IluckySheetborderInfoCellValue
}
export interface IluckySheetborderInfoCellValue {
  row_index: number
  col_index: number
  l?: IluckySheetborderInfoCellValueStyle | null
  r?: IluckySheetborderInfoCellValueStyle | null
  t?: IluckySheetborderInfoCellValueStyle | null
  b?: IluckySheetborderInfoCellValueStyle | null
}
export interface IluckySheetborderInfoCellValueStyle {
  style: string | number
  color: string
}

// border range interface
export interface IluckySheetborderInfoRange {
  rangeType: string
  borderType: string
  style: string
  color: string
  range: IluckySheetSelection[]
}

export type IluckySheetborderInfo = IluckySheetborderInfoCell | IluckySheetborderInfoRange
