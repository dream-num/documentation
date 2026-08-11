import * as BasePopover from '@base-ui/react/popover'

import { clsx } from '@/lib/clsx'

function Popover({ ...props }: BasePopover.Popover.Root.Props) {
  return <BasePopover.Popover.Root data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }: BasePopover.Popover.Trigger.Props) {
  return <BasePopover.Popover.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  alignOffset,
  collisionPadding,
  side,
  ...props
}: BasePopover.Popover.Popup.Props &
  Pick<BasePopover.Popover.Positioner.Props, 'align' | 'alignOffset' | 'collisionPadding' | 'side' | 'sideOffset'>) {
  return (
    <BasePopover.Popover.Portal>
      <BasePopover.Popover.Positioner
        align={align}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        side={side}
        sideOffset={sideOffset}
        className="z-50 outline-none"
      >
        <BasePopover.Popover.Popup
          data-slot="popover-content"
          className={clsx(
            `bg-popover text-popover-foreground data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 w-72 origin-(--transform-origin) rounded-md border p-4 shadow-md outline-hidden`,
            className,
          )}
          {...props}
        />
      </BasePopover.Popover.Positioner>
    </BasePopover.Popover.Portal>
  )
}

export { Popover, PopoverContent, PopoverTrigger }
