import type { HTMLAttributes } from 'react'
import { clsx } from '@/lib/clsx'

interface BlobProps extends HTMLAttributes<HTMLDivElement> {
  firstBlobColor: string
  secondBlobColor: string
}

export default function BlurryBlob({
  className,
  firstBlobColor,
  secondBlobColor,
}: BlobProps) {
  return (
    <div className="min-h-52 min-w-52 items-center justify-center">
      <div className="relative w-full max-w-lg">
        <div
          className={clsx(
            `
              absolute -top-28 -right-24 h-72 w-72 animate-blurry-blob rounded-sm bg-blue-400 p-8 opacity-45
              mix-blend-multiply blur-3xl filter
            `,
            className,
            firstBlobColor,
          )}
        />
        <div
          className={clsx(
            `
              absolute -top-64 -left-40 h-72 w-72 animate-blurry-blob rounded-sm bg-purple-400 p-8 opacity-45
              mix-blend-multiply blur-3xl filter
            `,
            className,
            secondBlobColor,
          )}
        />
      </div>
    </div>
  )
}
