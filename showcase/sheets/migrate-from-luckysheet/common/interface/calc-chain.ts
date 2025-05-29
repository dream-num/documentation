export interface IluckysheetCalcChain {
  r: number
  c: number
  index: string | number | undefined
  func?: any[]// [true, 152, "=SUBTOTAL(9,OFFSET(F15,ROW(F15:F18)-ROW(F15),1,3))"] [calculated, final value, formula]
  color?: string
  parent?: string | null
  chidren?: Record<string, any>
  times?: number
}
