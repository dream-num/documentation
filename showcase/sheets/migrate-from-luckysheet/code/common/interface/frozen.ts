export interface IluckysheetFrozen {
  type: FrozenType
  range?: {
    row_focus: number
    column_focus: number
  }
}

export type FrozenType = 'row' | 'column' | 'both' | 'rangeRow' | 'rangeColumn' | 'rangeBoth' | 'cancel'
