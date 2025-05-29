import type { IluckySheetSelection } from './selection'

// pivot table interface
export interface IluckySheetPivotTable {
  pivot_select_save: IluckySheetSelection// Pivot table data source range
  pivotDataSheetIndex: string | number | undefined // data source sheet index, index is unique id
  column: IluckySheetPivotTableField[]// column area, include filed
  row: IluckySheetPivotTableField[] // row area, include filed
  filter: IluckySheetPivotTableField[] // filter area, include filed
  filterparm?: IluckySheetPivotTablefilterParam// save param after apply filter
  values: IluckySheetPivotTableField[]
  showType: string
  pivotDatas: any[][]
  drawPivotTable: boolean
  pivotTableBoundary: number[]
}

export interface IluckySheetPivotTableField {
  index: number
  name: string
  fullname: string
  sumtype?: string
  nameindex?: number
}

export interface IluckySheetPivotTablefilterParam {
  [index: string]: IluckySheetPivotTablefilterParamItem
}

export interface IluckySheetPivotTablefilterParamItem {
  caljs: IluckySheetPivotTablefilterParamItemCaljs
  rowhidden: IluckySheetPivotTablefilterParamItemRowhidden
  selected: IluckySheetPivotTablefilterParamItemSelected
}

export interface IluckySheetPivotTablefilterParamItemCaljs {
  text: string
  type: string
  value: string
  value1: string
}

export interface IluckySheetPivotTablefilterParamItemRowhidden {
  [index: number]: number
}

export interface IluckySheetPivotTablefilterParamItemSelected {
  [index: number]: number
}
