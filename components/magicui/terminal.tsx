'use client'

import type { MotionProps } from 'motion/react'
import type { ElementType, ReactNode } from 'react'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
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

interface TypingAnimationProps extends MotionProps {
  children: string
  className?: string
  duration?: number
  delay?: number
  as?: ElementType
}

export function TypingAnimation({
  children,
  className,
  duration = 60,
  delay = 0,
  as: Component = 'span',
  ...props
}: TypingAnimationProps) {
  if (typeof children !== 'string') {
    throw new TypeError('TypingAnimation: children must be a string. Received:')
  }

  const MotionComponent = motion.create(Component, {
    forwardMotionProps: true,
  })

  const [displayedText, setDisplayedText] = useState<string>('')
  const [started, setStarted] = useState(false)
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setStarted(true)
    }, delay)
    return () => clearTimeout(startTimeout)
  }, [delay])

  useEffect(() => {
    if (!started) return

    let i = 0
    const typingEffect = setInterval(() => {
      if (i < children.length) {
        setDisplayedText(children.substring(0, i + 1))
        i++
      } else {
        clearInterval(typingEffect)
      }
    }, duration)

    return () => {
      clearInterval(typingEffect)
    }
  }, [children, duration, started])

  return (
    <MotionComponent
      ref={elementRef}
      className={clsx('font-mono text-sm tracking-tight', className)}
      {...props}
    >
      {displayedText}
    </MotionComponent>
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
        z-0 flex h-full w-full flex-col bg-neutral-50
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
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <div className="h-2 w-2 rounded-full bg-yellow-500" />
          <div className="h-2 w-2 rounded-full bg-green-500" />
        </div>
      </div>
      <pre className="flex-1 overflow-y-auto p-4">
        <code className="grid gap-y-1 overflow-auto">{children}</code>
      </pre>
    </div>
  )
}
