import type { ReactNode } from 'react'
import { isValidElement } from 'react'

import { clsx } from '@/lib/clsx'

interface IIconFrameElementProps {
  className?: unknown
  children?: ReactNode
  type?: unknown
}

function getClassName(node: ReactNode): string {
  if (!isValidElement<IIconFrameElementProps>(node)) return ''

  const ownClassName = typeof node.props.className === 'string' ? node.props.className : ''
  const childClassName = Array.isArray(node.props.children)
    ? node.props.children.map(getClassName).join(' ')
    : getClassName(node.props.children)

  return `${ownClassName} ${childClassName}`
}

function hasFilledBackground(icon: ReactNode) {
  if (isValidElement<IIconFrameElementProps>(icon) && icon.props.type === 'pro') return true

  const className = getClassName(icon)
  return /(?:^|\s)(?:bg-|from-|via-|to-|text-white)/.test(className)
}

export function NavIconFrame({ icon }: { icon: ReactNode }) {
  const filled = hasFilledBackground(icon)

  return (
    <span
      className={clsx(
        `inline-flex size-7 min-w-7 shrink-0 items-center justify-center overflow-hidden rounded-md has-[[data-icon-variant=pro]]:border-0! has-[[data-icon-variant=pro]]:p-0! [&_svg]:size-4! [&>[data-icon-variant=pro]]:flex! [&>[data-icon-variant=pro]]:size-full! [&>[data-icon-variant=pro]]:items-center! [&>[data-icon-variant=pro]]:justify-center! [&>[data-icon-variant=pro]]:rounded-md! [&>[data-icon-variant=pro]]:p-1.5! [&>[data-icon-variant=pro]]:shadow-none!`,
        filled
          ? `bg-background p-0 text-white *:flex! *:size-full! *:items-center! *:justify-center! *:rounded-md! *:border-0! *:p-1.5! *:shadow-none!`
          : `bg-background text-muted-foreground border p-1.5 *:flex! *:size-4! *:min-w-4! *:items-center! *:justify-center! *:border-0! *:bg-transparent! *:p-0! *:leading-none! *:shadow-none!`,
      )}
    >
      {icon}
    </span>
  )
}
