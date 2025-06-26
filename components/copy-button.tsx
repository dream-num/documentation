'use client'

import type { ReactNode } from 'react'
import { clsx } from '@/lib/clsx'

interface IProps {
  children: ReactNode
  className?: string
  text: string
}

export function CopyButton(props: IProps) {
  const { children, className, text } = props

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
  }

  return (
    <button
      className={clsx('cursor-pointer', className)}
      type="button"
      onClick={handleCopy}
    >
      {children}
    </button>
  )
}
