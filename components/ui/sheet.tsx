'use client'

import type { ComponentProps } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'
import { clsx } from '@/lib/clsx'

function Sheet({
  ...props
}: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetContent({
  className,
  children,
  side = 'left',
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & {
  side?: 'left' | 'right'
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className="
          fixed inset-0 z-50 bg-background/80 backdrop-blur-sm
          data-[state=closed]:animate-out data-[state=closed]:fade-out-0
          data-[state=open]:animate-in data-[state=open]:fade-in-0
        "
      />
      <DialogPrimitive.Content
        data-side={side}
        data-slot="sheet-content"
        className={clsx(
          `
            fixed inset-y-0 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col border bg-background shadow-lg transition
            ease-in-out
            data-[side=left]:left-0 data-[side=left]:border-r
            data-[side=right]:right-0 data-[side=right]:border-l
            data-[state=closed]:animate-out data-[state=closed]:duration-300
            data-[side=left]:data-[state=closed]:slide-out-to-left
            data-[side=right]:data-[state=closed]:slide-out-to-right
            data-[state=open]:animate-in data-[state=open]:duration-500
            data-[side=left]:data-[state=open]:slide-in-from-left
            data-[side=right]:data-[state=open]:slide-in-from-right
          `,
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="
            absolute top-4 right-4 rounded-xs opacity-70 transition-opacity
            hover:opacity-100
            focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none
            disabled:pointer-events-none
          "
        >
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

function SheetTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={clsx('text-lg font-semibold tracking-normal', className)}
      {...props}
    />
  )
}

export { Sheet, SheetContent, SheetTitle, SheetTrigger }
