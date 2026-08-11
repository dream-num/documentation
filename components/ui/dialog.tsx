'use client'

import * as BaseDialog from '@base-ui/react/dialog'
import { XIcon } from 'lucide-react'

import { clsx } from '@/lib/clsx'

function Dialog({ ...props }: BaseDialog.Dialog.Root.Props) {
  return <BaseDialog.Dialog.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: BaseDialog.Dialog.Trigger.Props) {
  return <BaseDialog.Dialog.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: BaseDialog.Dialog.Portal.Props) {
  return <BaseDialog.Dialog.Portal data-slot="dialog-portal" {...props} />
}

function DialogOverlay({ className, ...props }: BaseDialog.Dialog.Backdrop.Props) {
  return (
    <BaseDialog.Dialog.Backdrop
      data-slot="dialog-overlay"
      className={clsx(
        `bg-background/80 data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0 fixed inset-0 z-50 backdrop-blur-sm`,
        className,
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: BaseDialog.Dialog.Popup.Props & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <BaseDialog.Dialog.Popup
        data-slot="dialog-content"
        className={clsx(
          `bg-background data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-1/2 gap-4 rounded-lg border p-6 shadow-lg duration-200`,
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <BaseDialog.Dialog.Close className="focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </BaseDialog.Dialog.Close>
        ) : null}
      </BaseDialog.Dialog.Popup>
    </DialogPortal>
  )
}

function DialogTitle({ className, ...props }: BaseDialog.Dialog.Title.Props) {
  return (
    <BaseDialog.Dialog.Title
      data-slot="dialog-title"
      className={clsx('text-lg leading-none font-semibold tracking-normal', className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: BaseDialog.Dialog.Description.Props) {
  return (
    <BaseDialog.Dialog.Description
      data-slot="dialog-description"
      className={clsx('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

export { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger }
