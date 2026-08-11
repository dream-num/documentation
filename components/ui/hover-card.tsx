import * as BasePreviewCard from '@base-ui/react/preview-card'

import { clsx } from '@/lib/clsx'

function HoverCard({ ...props }: BasePreviewCard.PreviewCard.Root.Props) {
  return <BasePreviewCard.PreviewCard.Root data-slot="hover-card" {...props} />
}

function HoverCardTrigger({ ...props }: BasePreviewCard.PreviewCard.Trigger.Props) {
  return <BasePreviewCard.PreviewCard.Trigger data-slot="hover-card-trigger" {...props} />
}

function HoverCardContent({
  className,
  align = 'center',
  sideOffset = 4,
  alignOffset,
  side,
  ...props
}: BasePreviewCard.PreviewCard.Popup.Props &
  Pick<BasePreviewCard.PreviewCard.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'>) {
  return (
    <BasePreviewCard.PreviewCard.Portal>
      <BasePreviewCard.PreviewCard.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="z-50 outline-none"
      >
        <BasePreviewCard.PreviewCard.Popup
          data-slot="hover-card-content"
          className={clsx(
            `bg-popover text-popover-foreground data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 w-64 origin-(--transform-origin) rounded-md border p-4 shadow-md outline-hidden`,
            className,
          )}
          {...props}
        />
      </BasePreviewCard.PreviewCard.Positioner>
    </BasePreviewCard.PreviewCard.Portal>
  )
}

export { HoverCard, HoverCardContent, HoverCardTrigger }
