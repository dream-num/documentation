import type { IAccessor, ICommand } from '@univerjs/presets'
import { CommandType } from '@univerjs/presets'

export const SingleButtonOperation: ICommand = {
  id: 'custom-menu.operation.single-button',
  type: CommandType.OPERATION,
  handler: async (_accessor: IAccessor) => {
    // alert('Single button operation')
    return true
  },
}
