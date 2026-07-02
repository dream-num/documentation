import type { ComponentProps } from 'react'
import { clsx } from '@/lib/clsx'

function resolveImageSrc(src: ComponentProps<'img'>['src'] | { src?: unknown }) {
  if (typeof src === 'string') return src
  if (src && typeof src === 'object' && 'src' in src) {
    const staticSrc = src.src
    if (typeof staticSrc === 'string') return staticSrc
  }
  return undefined
}

export function DocsImage({
  className,
  src,
  ...props
}: ComponentProps<'img'> & { src?: ComponentProps<'img'>['src'] | { src?: unknown } }) {
  const resolvedSrc = resolveImageSrc(src)

  if (!resolvedSrc) return null

  return (
    <img
      className={clsx('my-6 rounded-lg border bg-card', className)}
      src={resolvedSrc}
      {...props}
    />
  )
}
