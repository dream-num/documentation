'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { clsx } from '@/lib/clsx'

interface IProps {
  children: ReactNode
  showText: string
  hideText: string
}

export function ClickToShowButton(props: IProps) {
  const { children, showText, hideText } = props

  const [visible, setVisible] = useState(false)

  function handleClick() {
    setVisible(prev => !prev)
  }

  return (
    <div className="grid gap-3">
      <button
        type="button"
        onClick={handleClick}
        className="
          mx-auto inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium
          text-neutral-600 transition-colors
          hover:bg-neutral-100 hover:text-neutral-900
          dark:text-neutral-400
          dark:hover:bg-neutral-800 dark:hover:text-neutral-200
        "
      >
        {visible ? hideText : showText}
      </button>

      <div
        className={clsx('relative', {
          hidden: !visible,
          block: visible,
        })}
      >
        {children}
      </div>
    </div>
  )
}
