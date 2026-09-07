'use client'

import type { MotionProps } from 'motion/react'
import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { clsx } from '@/lib/clsx'

interface IAnimatedSpanProps extends MotionProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function AnimatedSpan({
  children,
  delay = 0,
  className,
  ...props
}: IAnimatedSpanProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay / 1000 }}
      className={clsx('grid text-sm font-normal tracking-tight', className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface TerminalProps {
  children: ReactNode
  className?: string
}

export function Terminal({ children, className }: TerminalProps) {
  return (
    <div
      className={clsx(`
        z-0 flex size-full flex-col bg-neutral-50
        dark:bg-neutral-900
      `, className)}
    >
      <div
        className={`
          flex flex-col gap-y-2 border-b border-border bg-white p-4
          dark:bg-neutral-800
        `}
      >
        <div className="flex flex-row gap-x-2">
          <div className="size-2 rounded-full bg-red-500" />
          <div className="size-2 rounded-full bg-yellow-500" />
          <div className="size-2 rounded-full bg-green-500" />
        </div>
      </div>
      <pre className="flex-1 overflow-y-auto p-4">
        <code className="grid gap-y-1 overflow-auto">{children}</code>
      </pre>
    </div>
  )
}
