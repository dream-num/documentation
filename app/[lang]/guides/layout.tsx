import type { ReactNode } from 'react'

interface IProps {
  children: ReactNode
}

export default function Layout({ children }: IProps) {
  return children
}
