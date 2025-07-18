import type { IIconSet } from '@univerjs/preset-sheets-conditional-formatting'
import type { IluckysheetCFIconsFormat, IluckysheetConditionFormat } from '../../common/interface/condition-format'
import { CFNumberOperator, CFRuleType, CFValueType } from '@univerjs/preset-sheets-conditional-formatting'
import { generateRandomId } from '@univerjs/presets'
import { rangeArrayToRanges } from '../../common/utils/selection'

const defaultIconType = '3Arrows'

const iconTypeMap: Record<string, string> = {
  '0-3-0': '3Arrows',
  '5-3-0': '3ArrowsGray',
  '0-3-1': '3Triangles',
  '0-4-2': '4Arrows',
  '0-5-3': '5Arrows',
  '5-4-1': '4ArrowsGray',
  '5-5-2': '5ArrowsGray',
  '0-3-4': '3TrafficLights1',
  '5-3-4': '3TrafficLights2',
  '0-3-7': '3Symbols',
  '5-3-7': '3Symbols2',
  '0-3-9': '3Stars',
  '0-3-5': '3Signs',
  '0-3-8': '3Flags',
  '0-5-11': '5Boxes',
  '0-5-10': '5Quarters',
  '5-4-9': '4Rating',
  '5-5-10': '5Rating',
  '0-4-6': '4RedToBlack',
  '5-4-5': '4TrafficLights',
}

export function iconSetCondition(condition: IluckysheetConditionFormat) {
  const { cellrange } = condition
  const format = condition.format as IluckysheetCFIconsFormat

  const cfId = generateRandomId(8)
  const ranges = rangeArrayToRanges(cellrange)

  const { leftMin, len, top } = format
  const iconType = iconTypeMap[`${leftMin}-${len}-${top}`] || defaultIconType

  const config = getIconConfig(iconType)

  const rule: IIconSet = {
    type: CFRuleType.iconSet,
    config,
    isShowValue: true,
  }

  return {
    cfId,
    ranges,
    rule,
    stopIfTrue: false,
  }
}

/**
 * Get configuration based on iconType
 *
 * @param iconType
 * @returns
 */
function getIconConfig(iconType: string) {
  const len = getConfigLength(iconType)

  return Array.from({ length: len }, (_, i) => {
    const value = Math.round((100 / len) * (len - 1 - i))
    const iconId = getIconId(iconType, i, len)

    return {
      operator: CFNumberOperator.greaterThanOrEqual,
      value: {
        type: CFValueType.percent,
        value,
      },
      iconType,
      iconId,
    }
  })
}

/**
 * Get the config length to be configured from iconType
 * 3Arrows => 3
 * 4Arrows => 4
 *
 * @param iconType
 */
function getConfigLength(iconType: string) {
  return Number.parseInt(iconType[0])
}

/**
 * Rating icons need to be reversed
 * @param iconType
 */
function getIconId(iconType: string, i: number, len: number) {
  if (iconType === '4Rating' || iconType === '5Rating') {
    return (len - 1 - i).toString()
  }

  return i.toString()
}
