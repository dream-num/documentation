import type { IMenuButtonItem } from '@univerjs/presets/preset-sheets-core'
import { MenuItemType } from '@univerjs/presets/preset-sheets-core'
import { SingleButtonOperation } from '../../commands/operations/single-button.operation'

export function CustomMenuItemSingleButtonFactory(): IMenuButtonItem<string> {
  return {
    // Bind the command id, clicking the button will trigger this command
    id: SingleButtonOperation.id,
    // The type of the menu item, in this case, it is a button
    type: MenuItemType.BUTTON,
    // The icon of the button, which needs to be registered in ComponentManager
    icon: 'ButtonIcon',
    // The tooltip of the button. Prioritize matching internationalization. If no match is found, the original string will be displayed
    tooltip: 'customMenu.singleButton',
    // The title of the button. Prioritize matching internationalization. If no match is found, the original string will be displayed
    title: 'customMenu.button',
  }
}
