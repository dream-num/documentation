'use client'

import * as BaseDialog from '@base-ui/react/dialog'
import { XIcon } from 'lucide-react'
import { clsx } from '@/lib/clsx'

function Sheet({ ...props }: BaseDialog.Dialog.Root.Props) {
  return <BaseDialog.Dialog.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: BaseDialog.Dialog.Trigger.Props) {
  return <BaseDialog.Dialog.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetContent({
  className,
  children,
  side = 'left',
  ...props
}: BaseDialog.Dialog.Popup.Props & {
  side?: 'left' | 'right'
}) {
  return (
    <BaseDialog.Dialog.Portal>
      <BaseDialog.Dialog.Backdrop className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0" />
      <BaseDialog.Dialog.Popup
        data-side={side}
        data-slot="sheet-content"
        className={clsx(
          `fixed inset-y-0 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col border bg-background shadow-lg transition ease-in-out data-closed:animate-out data-closed:duration-300 data-open:animate-in data-open:duration-500 data-[side=left]:left-0 data-[side=left]:border-r data-[side=left]:data-closed:slide-out-to-left data-[side=left]:data-open:slide-in-from-left data-[side=right]:right-0 data-[side=right]:border-l data-[side=right]:data-closed:slide-out-to-right data-[side=right]:data-open:slide-in-from-right`,
          className,
        )}
        {...props}
      >
        {children}
        <BaseDialog.Dialog.Close className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </BaseDialog.Dialog.Close>
      </BaseDialog.Dialog.Popup>
    </BaseDialog.Dialog.Portal>
  )
}

function SheetTitle({ className, ...props }: BaseDialog.Dialog.Title.Props) {
  return (
    <BaseDialog.Dialog.Title
      data-slot="sheet-title"
      className={clsx('text-lg font-semibold tracking-normal', className)}
      {...props}
    />
  )
}

export { Sheet, SheetContent, SheetTitle, SheetTrigger }
