import * as BaseScrollArea from '@base-ui/react/scroll-area'

import { clsx } from '@/lib/clsx'

function ScrollArea({ className, children, ...props }: BaseScrollArea.ScrollArea.Root.Props) {
  return (
    <BaseScrollArea.ScrollArea.Root data-slot="scroll-area" className={clsx('relative', className)} {...props}>
      <BaseScrollArea.ScrollArea.Viewport
        data-slot="scroll-area-viewport"
        className={clsx(
          'size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1',
          'focus-visible:ring-ring/50',
        )}
      >
        {children}
      </BaseScrollArea.ScrollArea.Viewport>
      <ScrollBar />
      <BaseScrollArea.ScrollArea.Corner />
    </BaseScrollArea.ScrollArea.Root>
  )
}

function ScrollBar({ className, orientation = 'vertical', ...props }: BaseScrollArea.ScrollArea.Scrollbar.Props) {
  return (
    <BaseScrollArea.ScrollArea.Scrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={clsx(
        'group/scrollbar flex touch-none p-0.5 select-none',
        orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent',
        orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent',
        className,
      )}
      {...props}
    >
      <BaseScrollArea.ScrollArea.Thumb
        data-slot="scroll-area-thumb"
        className={clsx(
          'relative flex-1 rounded-full transition-colors',
          'bg-muted-foreground/35 group-hover/scrollbar:bg-muted-foreground/55',
        )}
      />
    </BaseScrollArea.ScrollArea.Scrollbar>
  )
}

export { ScrollArea, ScrollBar }
