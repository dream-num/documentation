'use client'

import * as BaseMenu from '@base-ui/react/menu'

import { clsx } from '@/lib/clsx'

function DropdownMenu({ ...props }: BaseMenu.Menu.Root.Props) {
  return <BaseMenu.Menu.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuTrigger({ ...props }: BaseMenu.Menu.Trigger.Props) {
  return <BaseMenu.Menu.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  align = 'end',
  alignOffset,
  side,
  ...props
}: BaseMenu.Menu.Popup.Props & Pick<BaseMenu.Menu.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'>) {
  return (
    <BaseMenu.Menu.Portal>
      <BaseMenu.Menu.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="z-50 outline-none"
      >
        <BaseMenu.Menu.Popup
          data-slot="dropdown-menu-content"
          className={clsx(
            `bg-popover text-popover-foreground data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 min-w-40 origin-(--transform-origin) overflow-hidden rounded-md border p-1 shadow-md outline-none`,
            className,
          )}
          {...props}
        />
      </BaseMenu.Menu.Positioner>
    </BaseMenu.Menu.Portal>
  )
}

function DropdownMenuItem({ className, ...props }: BaseMenu.Menu.Item.Props) {
  return (
    <BaseMenu.Menu.Item
      data-slot="dropdown-menu-item"
      className={clsx(
        `data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0`,
        className,
      )}
      {...props}
    />
  )
}

export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger }
