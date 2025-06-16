import type { ReactNode } from 'react'

interface IProps {
  children: ReactNode
}

export function IconWrapper(props: IProps) {
  const { children } = props

  return (
    <div className="flex size-6 items-center justify-center text-lg">
      {children}
    </div>
  )
}
