import type { Ctor } from '@univerjs/presets'
import type {
  BaseValueObject,
  IFunctionInfo,
  IFunctionNames,
} from '@univerjs/presets/preset-sheets-core'

import {
  ArrayValueObject,
  AsyncObject,
  BaseFunction,
  FunctionType,
  NumberValueObject,
  StringValueObject,
} from '@univerjs/presets/preset-sheets-core'

/**
 * function name
 */
export enum FUNCTION_NAMES_USER {
  CUSTOMSUM = 'CUSTOMSUM',
  CUSTOM_ASYNC_OBJECT = 'CUSTOM_ASYNC_OBJECT',
  CUSTOM_ASYNC_ARRAY = 'CUSTOM_ASYNC_ARRAY',
}

/**
 * i18n
 */
export const functionEnUS = {
  formula: {
    functionList: {
      CUSTOMSUM: {
        description: 'You can add individual values, cell references or ranges or a mix of all three.',
        abstract: 'Adds its arguments',
        links: [
          {
            title: 'Instruction',
            url: 'https://support.microsoft.com/en-us/office/sum-function-043e1c7d-7726-4e80-8f32-07b23e057f89',
          },
        ],
        functionParameter: {
          number1: {
            name: 'number1',
            detail:
              'The first number you want to add. The number can be like 4, a cell reference like B6, or a cell range like B2:B8.',
          },
          number2: {
            name: 'number2',
            detail:
              'This is the second number you want to add. You can specify up to 255 numbers in this way.',
          },
        },
      },
      CUSTOM_ASYNC_OBJECT: {
        description: 'Query info.',
        abstract: 'Query info',
        links: [
          {
            title: 'Instruction',
            url: 'https://univer.ai',
          },
        ],
        functionParameter: {
          value: {
            name: 'Info',
            detail: 'Query info',
          },
        },
      },
      CUSTOM_ASYNC_ARRAY: {
        description: 'Query table data.',
        abstract: 'Query table data',
        links: [
          {
            title: 'Instruction',
            url: 'https://univer.ai',
          },
        ],
        functionParameter: {
          value: {
            name: 'Table name',
            detail: 'Query table name',
          },
        },
      },
    },
  },
}

export const functionZhCN = {
  formula: {
    functionList: {
      CUSTOMSUM: {
        description: '将单个值、单元格引用或是区域相加，或者将三者的组合相加。',
        abstract: '求参数的和',
        links: [
          {
            title: '教学',
            url: 'https://support.microsoft.com/zh-cn/office/sum-%E5%87%BD%E6%95%B0-043e1c7d-7726-4e80-8f32-07b23e057f89',
          },
        ],
        functionParameter: {
          number1: {
            name: '数值1',
            detail:
              '要相加的第一个数字。 该数字可以是 4 之类的数字，B6 之类的单元格引用或 B2:B8 之类的单元格范围。',
          },
          number2: {
            name: '数值2',
            detail:
              '这是要相加的第二个数字。 可以按照这种方式最多指定 255 个数字。',
          },
        },
      },
      CUSTOM_ASYNC_OBJECT: {
        description: '查询信息。',
        abstract: '查询信息',
        links: [
          {
            title: '教学',
            url: 'https://univer.ai',
          },
        ],
        functionParameter: {
          value: {
            name: '信息',
            detail: '查询信息',
          },
        },
      },
      CUSTOM_ASYNC_ARRAY: {
        description: '查询表格数据。',
        abstract: '查询表格数据',
        links: [
          {
            title: '教学',
            url: 'https://univer.ai',
          },
        ],
        functionParameter: {
          value: {
            name: '表格名称',
            detail: '查询的表格名称',
          },
        },
      },
    },
  },
}

/**
 * description
 */
export const FUNCTION_LIST_USER: IFunctionInfo[] = [
  {
    functionName: FUNCTION_NAMES_USER.CUSTOMSUM,
    aliasFunctionName: 'formula.functionList.CUSTOMSUM.aliasFunctionName',
    functionType: FunctionType.Univer,
    description: 'formula.functionList.CUSTOMSUM.description',
    abstract: 'formula.functionList.CUSTOMSUM.abstract',
    functionParameter: [
      {
        name: 'formula.functionList.CUSTOMSUM.functionParameter.number1.name',
        detail:
          'formula.functionList.CUSTOMSUM.functionParameter.number1.detail',
        example: 'A1:A20',
        require: 1,
        repeat: 0,
      },
      {
        name: 'formula.functionList.CUSTOMSUM.functionParameter.number2.name',
        detail:
          'formula.functionList.CUSTOMSUM.functionParameter.number2.detail',
        example: 'B2:B10',
        require: 0,
        repeat: 1,
      },
    ],
  },
  {
    functionName: FUNCTION_NAMES_USER.CUSTOM_ASYNC_OBJECT,
    aliasFunctionName: 'formula.functionList.CUSTOM_ASYNC_OBJECT.aliasFunctionName',
    functionType: FunctionType.Univer,
    description: 'formula.functionList.CUSTOM_ASYNC_OBJECT.description',
    abstract: 'formula.functionList.CUSTOM_ASYNC_OBJECT.abstract',
    functionParameter: [
      {
        name: 'formula.functionList.CUSTOM_ASYNC_OBJECT.functionParameter.value.name',
        detail:
          'formula.functionList.CUSTOM_ASYNC_OBJECT.functionParameter.value.detail',
        example: '"info"',
        require: 1,
        repeat: 0,
      },
    ],
  },
  {
    functionName: FUNCTION_NAMES_USER.CUSTOM_ASYNC_ARRAY,
    aliasFunctionName: 'formula.functionList.CUSTOM_ASYNC_ARRAY.aliasFunctionName',
    functionType: FunctionType.Univer,
    description: 'formula.functionList.CUSTOM_ASYNC_ARRAY.description',
    abstract: 'formula.functionList.CUSTOM_ASYNC_ARRAY.abstract',
    functionParameter: [
      {
        name: 'formula.functionList.CUSTOM_ASYNC_ARRAY.functionParameter.value.name',
        detail:
          'formula.functionList.CUSTOM_ASYNC_ARRAY.functionParameter.value.detail',
        example: '"sheet1"',
        require: 1,
        repeat: 0,
      },
    ],
  },
]

/**
 * Function algorithm
 */
export class Customsum extends BaseFunction {
  override calculate(...variants: BaseValueObject[]) {
    let accumulatorAll: BaseValueObject = new NumberValueObject(0)
    for (let i = 0; i < variants.length; i++) {
      let variant = variants[i]

      if (variant.isError()) {
        return variant
      }

      if (accumulatorAll.isError()) {
        return accumulatorAll
      }

      if (variant.isArray()) {
        variant = (variant as ArrayValueObject).sum()
      }

      accumulatorAll = accumulatorAll.plus(variant as BaseValueObject)
    }

    return accumulatorAll
  }
}

/**
 * Get data asynchronously and assign it to array formula
 */
export class CustomAsyncArray extends BaseFunction {
  override calculate(value: BaseValueObject) {
    return new AsyncObject(asyncArrayFunction(value))
  }

  override isAsync(): boolean {
    return true
  }
}

async function asyncArrayFunction(value: BaseValueObject) {
  return new Promise((resolve: (value: ArrayValueObject) => void) => {
    setTimeout(() => {
      resolve(ArrayValueObject.createByArray([['Async Table: ', value.getValue()], ['1', '2'], ['3', '4']]))
    }, 1000)
  })
}

/**
 * Get data asynchronously and assign it to a single formula value
 */
export class CustomAsyncObject extends BaseFunction {
  override calculate(value: BaseValueObject) {
    return new AsyncObject(asyncObjectFunction(value))
  }

  override isAsync(): boolean {
    return true
  }
}

async function asyncObjectFunction(value: BaseValueObject) {
  return new Promise((resolve: (value: BaseValueObject) => void) => {
    setTimeout(() => {
      resolve(StringValueObject.create(`Async Info: ${value.getValue()}`))
    }, 1000)
  })
}

export const functionUser: Array<[Ctor<BaseFunction>, IFunctionNames]> = [
  [Customsum, FUNCTION_NAMES_USER.CUSTOMSUM],
  [CustomAsyncObject, FUNCTION_NAMES_USER.CUSTOM_ASYNC_OBJECT],
  [CustomAsyncArray, FUNCTION_NAMES_USER.CUSTOM_ASYNC_ARRAY],
]
