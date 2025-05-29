export interface IluckySheetFilter {
  [index: string]: IluckySheetFilterItem
}

export interface IluckySheetFilterItem {
  caljs: IluckySheetFilterItemCaljs
  rowhidden: IluckySheetFilterItemRowhidden
  optionstate: boolean
  cindex: number
  str: number
  edr: number
  stc: number
  edc: number
}

export interface IluckySheetFilterItemCaljs {
  value: string
  text: string
  type: string
}

export interface IluckySheetFilterItemRowhidden {
  [index: string]: number
}
