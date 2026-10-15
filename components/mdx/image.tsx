import type { ComponentProps } from 'react'
import { clsx } from '@/lib/clsx'
import { ImagePreview } from './image-preview'

export function DocsImage({
  className,
  src,
  alt = '',
  ...props
}: ComponentProps<'img'> & { src?: ComponentProps<'img'>['src'] | { src?: unknown } }) {
  function resolveImageSrc() {
    if (typeof src === 'string') return src
    if (src && typeof src === 'object' && 'src' in src && typeof src.src === 'string') return src.src
    return undefined
  }

  const resolvedSrc = resolveImageSrc()

  if (!resolvedSrc) return null

  return (
    <ImagePreview src={resolvedSrc} alt={alt} className="my-6">
      <img className={clsx('bg-card rounded-lg border', className)} src={resolvedSrc} alt={alt} {...props} />
    </ImagePreview>
  )
}
