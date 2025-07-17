'use client'

import { motion } from 'motion/react'
import { clsx } from '@/lib/clsx'

interface JitteryTextProps {
  text: string
  duration?: number
  className?: string
}

export default function JitterText({ text, duration, className }: JitteryTextProps) {
  const animationDuration = duration ?? 0.6

  return (
    <div>
      <motion.span
        className={clsx('inline-block', className)}
        animate={{
          y: [1.5, 1, -1, 1.5, -1.5, 1, -0.5, 0],
          x: [0, -1, 1.5, -1.5, 1, -1, 0.5, 0],
          rotate: [0.5, -1.5, 1, -1.5, 1, -1, 1, 0],
        }}
        transition={{
          repeat: Infinity,
          repeatDelay: 0.5,
          repeatType: 'reverse',
          ease: 'easeInOut',
          duration: animationDuration,
        }}
      >
        {text}
      </motion.span>
    </div>
  )
}
