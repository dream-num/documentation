import type { ReactElement, ReactNode } from 'react'

import { TooltipContent, TooltipRoot, TooltipTrigger } from './ui/tooltip'

interface IProps {
  children: ReactElement
  content: ReactNode
}

export function Tooltip(props: IProps) {
  const { children, content } = props

  return (
    <TooltipRoot>
      <TooltipTrigger render={children} />
      <TooltipContent side="bottom">{content}</TooltipContent>
    </TooltipRoot>
  )
}
