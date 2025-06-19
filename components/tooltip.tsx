import type { ReactNode } from 'react'
import { TooltipContent, TooltipRoot, TooltipTrigger } from './ui/tooltip'

interface IProps {
  children: ReactNode
  content: ReactNode
}

export function Tooltip(props: IProps) {
  const { children, content } = props

  return (
    <TooltipRoot>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {content}
      </TooltipContent>
    </TooltipRoot>
  )
}
