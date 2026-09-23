'use client'

import type { ReactNode } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { XIcon } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useId, useRef, useState } from 'react'

import { clsx } from '@/lib/clsx'

interface IImagePreviewProps {
  src: string
  alt: string
  className?: string
  children: ReactNode
}

export function ImagePreview({ src, alt, className, children }: IImagePreviewProps) {
  const t = useTranslations('common')
  const [open, setOpen] = useState(false)
  const layoutId = useId()
  const actionsRef = useRef<Dialog.Root.Actions | null>(null)
  const reduceMotion = useReducedMotion()
  const duration = reduceMotion ? 0 : 0.3

  return (
    <Dialog.Root
      open={open}
      actionsRef={actionsRef}
      onOpenChange={(nextOpen, details) => {
        if (!nextOpen) details.preventUnmountOnClose()
        setOpen(nextOpen)
      }}
    >
      <Dialog.Trigger
        aria-label={`${t('zoom-in')}：${alt}`}
        className={clsx('block w-full cursor-zoom-in', className)}
        render={<motion.button layoutId={layoutId} transition={{ duration }} />}
      >
        {children}
      </Dialog.Trigger>
      <AnimatePresence onExitComplete={() => actionsRef.current?.unmount()}>
        {open && (
          <Dialog.Portal keepMounted>
            <Dialog.Backdrop
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
              render={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration }}
                />
              }
            />
            <motion.div
              layoutRoot
              className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4 pt-16"
            >
              <Dialog.Popup
                className="pointer-events-auto relative rounded-lg bg-white shadow-2xl outline-none"
                render={<motion.div layoutId={layoutId} exit={{ opacity: 0 }} transition={{ duration }} />}
              >
                <Dialog.Title className="sr-only">{alt}</Dialog.Title>
                <img
                  src={src}
                  alt={alt}
                  className="block h-auto max-h-[calc(100dvh-5rem)] w-auto max-w-[calc(100vw-2rem)] rounded-lg"
                />
                <Dialog.Close
                  aria-label={t('zoom-out')}
                  className="absolute -top-12 right-0 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/90 text-black shadow-sm hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  <XIcon className="size-5" />
                </Dialog.Close>
              </Dialog.Popup>
            </motion.div>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
