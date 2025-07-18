import type { IColorScale, IValueConfig } from '@univerjs/preset-sheets-conditional-formatting'
import type { IluckysheetConditionFormat } from '../../common/interface/condition-format'
import { CFRuleType, CFValueType } from '@univerjs/preset-sheets-conditional-formatting'
import { generateRandomId } from '@univerjs/presets'
import { rangeArrayToRanges } from '../../common/utils/selection'

export function colorGradationCondition(condition: IluckysheetConditionFormat) {
  const { cellrange } = condition
  const format = condition.format as string[]

  const cfId = generateRandomId(8)
  const ranges = rangeArrayToRanges(cellrange)

  let config: {
    index: number
    color: string
    value: IValueConfig
  }[] = []

  // Note that the corresponding order is reversed
  if (format.length === 2) {
    config = [
      {
        color: format[1],
        value: {
          type: CFValueType.percent,
          value: 0,
        },
        index: 0,
      },
      {
        color: format[0],
        value: {
          type: CFValueType.percent,
          value: 100,
        },
        index: 1,
      },
    ]
  } else if (format.length === 3) {
    config = [
      {
        color: format[2],
        value: {
          type: CFValueType.percent,
          value: 0,
        },
        index: 0,
      },
      {
        color: format[1],
        value: {
          type: CFValueType.percent,
          value: 50,
        },
        index: 1,
      },
      {
        color: format[0],
        value: {
          type: CFValueType.percent,
          value: 100,
        },
        index: 2,
      },
    ]
  }

  const rule: IColorScale = {
    type: CFRuleType.colorScale,
    config,
  }

  return {
    cfId,
    ranges,
    rule,
    stopIfTrue: false,
  }
}
