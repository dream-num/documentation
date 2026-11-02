import * as BaseSelect from '@base-ui/react/select'
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { clsx } from '@/lib/clsx'

const Select = BaseSelect.Select.Root

function SelectGroup(props: BaseSelect.Select.Group.Props) {
  return <BaseSelect.Select.Group data-slot="select-group" {...props} />
}

function SelectValue(props: BaseSelect.Select.Value.Props) {
  return <BaseSelect.Select.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: BaseSelect.Select.Trigger.Props & {
  size?: 'sm' | 'default'
}) {
  return (
    <BaseSelect.Select.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={clsx(
        `flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 *:data-[slot=select-value]:truncate dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground`,
        className,
      )}
      {...props}
    >
      {children}
      <BaseSelect.Select.Icon render={<ChevronDownIcon className="size-4 opacity-50" />} />
    </BaseSelect.Select.Trigger>
  )
}

function SelectContent({
  className,
  children,
  align = 'center',
  alignItemWithTrigger = false,
  alignOffset,
  collisionPadding,
  side,
  sideOffset = 4,
  ...props
}: BaseSelect.Select.Popup.Props &
  Pick<
    BaseSelect.Select.Positioner.Props,
    'align' | 'alignItemWithTrigger' | 'alignOffset' | 'collisionPadding' | 'side' | 'sideOffset'
  >) {
  return (
    <BaseSelect.Select.Portal>
      <BaseSelect.Select.Positioner
        align={align}
        alignItemWithTrigger={alignItemWithTrigger}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        side={side}
        sideOffset={sideOffset}
        className="z-50 outline-none"
      >
        <BaseSelect.Select.Popup
          data-slot="select-content"
          className={clsx(
            `relative max-h-(--available-height) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2`,
            className,
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <BaseSelect.Select.List className="w-full min-w-(--anchor-width) scroll-my-1 p-1">
            {children}
          </BaseSelect.Select.List>
          <SelectScrollDownButton />
        </BaseSelect.Select.Popup>
      </BaseSelect.Select.Positioner>
    </BaseSelect.Select.Portal>
  )
}

function SelectLabel({ className, ...props }: BaseSelect.Select.GroupLabel.Props) {
  return (
    <BaseSelect.Select.GroupLabel
      data-slot="select-label"
      className={clsx('px-2 py-1.5 text-xs text-muted-foreground', className)}
      {...props}
    />
  )
}

function SelectItem({ className, children, ...props }: BaseSelect.Select.Item.Props) {
  return (
    <BaseSelect.Select.Item
      data-slot="select-item"
      className={clsx(
        `relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2`,
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <BaseSelect.Select.ItemIndicator>
          <CheckIcon className="size-4" />
        </BaseSelect.Select.ItemIndicator>
      </span>
      <BaseSelect.Select.ItemText>{children}</BaseSelect.Select.ItemText>
    </BaseSelect.Select.Item>
  )
}

function SelectSeparator({ className, ...props }: BaseSelect.Select.Separator.Props) {
  return (
    <BaseSelect.Select.Separator
      data-slot="select-separator"
      className={clsx('pointer-events-none -mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({ className, ...props }: BaseSelect.Select.ScrollUpArrow.Props) {
  return (
    <BaseSelect.Select.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={clsx('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </BaseSelect.Select.ScrollUpArrow>
  )
}

function SelectScrollDownButton({ className, ...props }: BaseSelect.Select.ScrollDownArrow.Props) {
  return (
    <BaseSelect.Select.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={clsx('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </BaseSelect.Select.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
