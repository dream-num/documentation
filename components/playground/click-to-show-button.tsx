'use client'

import type { ReactNode } from 'react'
import { FerrisWheelIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
    <div className="grid gap-4">
      <div className="flex justify-center">
        <Button
          className="
            h-9 cursor-pointer rounded-full border border-neutral-200/70 bg-white/80 px-4 text-xs font-semibold
            tracking-wide text-neutral-700 shadow-sm backdrop-blur-sm transition
            hover:border-neutral-300 hover:bg-white
            dark:border-neutral-800/70 dark:bg-neutral-950/70 dark:text-neutral-200
            dark:hover:border-neutral-700
          "
          size="sm"
          variant="outline"
          onClick={handleClick}
        >
          <span className="flex items-center gap-2">
            <FerrisWheelIcon className="size-4" />
            {visible ? hideText : showText}
          </span>
        </Button>
      </div>

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
