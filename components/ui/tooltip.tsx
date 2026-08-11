import * as BaseTooltip from '@base-ui/react/tooltip'

import { clsx } from '@/lib/clsx'

function TooltipProvider({
  delayDuration = 0,
  ...props
}: Omit<BaseTooltip.Tooltip.Provider.Props, 'delay'> & {
  delayDuration?: number
}) {
  return <BaseTooltip.Tooltip.Provider delay={delayDuration} {...props} />
}

function TooltipRoot({ ...props }: BaseTooltip.Tooltip.Root.Props) {
  return (
    <TooltipProvider>
      <BaseTooltip.Tooltip.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({ ...props }: BaseTooltip.Tooltip.Trigger.Props) {
  return <BaseTooltip.Tooltip.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  align,
  alignOffset,
  side,
  ...props
}: BaseTooltip.Tooltip.Popup.Props &
  Pick<BaseTooltip.Tooltip.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'>) {
  return (
    <BaseTooltip.Tooltip.Portal>
      <BaseTooltip.Tooltip.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="z-50 outline-none"
      >
        <BaseTooltip.Tooltip.Popup
          data-slot="tooltip-content"
          className={clsx(
            `animate-in bg-primary text-primary-foreground fade-in-0 zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 w-fit origin-(--transform-origin) rounded-md px-3 py-1.5 text-xs text-balance`,
            className,
          )}
          {...props}
        >
          {children}
          <BaseTooltip.Tooltip.Arrow className="bg-primary z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] data-[side=bottom]:top-1 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" />
        </BaseTooltip.Tooltip.Popup>
      </BaseTooltip.Tooltip.Positioner>
    </BaseTooltip.Tooltip.Portal>
  )
}

export { TooltipContent, TooltipProvider, TooltipRoot, TooltipTrigger }
