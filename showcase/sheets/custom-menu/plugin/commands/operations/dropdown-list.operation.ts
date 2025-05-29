import type { IAccessor, ICommand } from '@univerjs/presets'
import { CommandType } from '@univerjs/presets'

export const DropdownListFirstItemOperation: ICommand = {
  id: 'custom-menu.operation.dropdown-list-first-item',
  type: CommandType.OPERATION,
  handler: async (_accessor: IAccessor) => {
    // alert('Dropdown list first item operation')
    return true
  },
}

export const DropdownListSecondItemOperation: ICommand = {
  id: 'custom-menu.operation.dropdown-list-second-item',
  type: CommandType.OPERATION,
  handler: async (_accessor: IAccessor) => {
    // alert('Dropdown list second item operation')
    return true
  },
}
