import type { ReactNode } from 'react'
import { isValidElement } from 'react'
import { clsx } from '@/lib/clsx'

interface IconFrameElementProps {
  className?: unknown
  children?: ReactNode
  type?: unknown
}

function getClassName(node: ReactNode): string {
  if (!isValidElement<IconFrameElementProps>(node)) return ''

  const ownClassName = typeof node.props.className === 'string' ? node.props.className : ''
  const childClassName = Array.isArray(node.props.children)
    ? node.props.children.map(getClassName).join(' ')
    : getClassName(node.props.children)

  return `${ownClassName} ${childClassName}`
}

function hasFilledBackground(icon: ReactNode) {
  if (isValidElement<IconFrameElementProps>(icon) && icon.props.type === 'pro') return true

  const className = getClassName(icon)
  return /(?:^|\s)(?:bg-|from-|via-|to-|text-white)/.test(className)
}

export function NavIconFrame({ icon }: { icon: ReactNode }) {
  const filled = hasFilledBackground(icon)

  return (
    <span
      className={clsx(
        `
          inline-flex size-7 min-w-7 shrink-0 items-center justify-center overflow-hidden rounded-md
          [&_svg]:size-4!
        `,
        filled
          ? `
            bg-background p-0 text-white
            *:flex! *:size-full! *:items-center! *:justify-center! *:rounded-md! *:border-0! *:p-1.5! *:shadow-none!
          `
          : `
            border bg-background p-1.5 text-muted-foreground
            *:flex! *:size-4! *:min-w-4! *:items-center! *:justify-center! *:border-0! *:bg-transparent! *:p-0!
            *:leading-none! *:shadow-none!
          `,
      )}
    >
      {icon}
    </span>
  )
}
