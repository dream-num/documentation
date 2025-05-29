// Merge cells interface
export interface IluckySheetConfigMerges {
  [firstRange: string]: IluckySheetConfigMerge // "r_s":{ r,c,rs,cs } format, define a main merge cell
}
// Merge cell interface
export interface IluckySheetConfigMerge {
  r: number
  c: number
  rs: number
  cs: number
}
