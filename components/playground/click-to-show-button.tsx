'use client'

import type { ReactNode } from 'react'
import { FerrisWheelIcon } from 'lucide-react'
import { useState } from 'react'
import { PulsatingButton } from '@/components/magicui/pulsating-button'
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
    <div className="relative p-4">
      <div
        className="absolute inset-0 size-full rounded-md border border-dashed"
      />
      <div className="flex justify-center">
        <PulsatingButton
          className="cursor-pointer"
          size="sm"
          onClick={handleClick}
        >
          <span className="flex cursor-pointer items-center gap-2">
            <FerrisWheelIcon />
            {visible ? hideText : showText}
          </span>
        </PulsatingButton>
      </div>

      <div
        className={clsx('relative mt-4', {
          hidden: !visible,
          block: visible,
        })}
      >
        {children}
      </div>
    </div>
  )
}
