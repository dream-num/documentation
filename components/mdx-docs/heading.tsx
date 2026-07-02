import type { ComponentProps, ElementType } from 'react'
import { LinkIcon } from 'lucide-react'
import { clsx } from '@/lib/clsx'

const headingClasses = {
  h2: `
    group mt-12 scroll-m-24 border-b pb-2 text-2xl font-semibold tracking-normal
  `,
  h3: 'group mt-10 scroll-m-24 text-xl font-semibold tracking-normal',
  h4: 'group mt-8 scroll-m-24 text-lg font-semibold tracking-normal',
}

export function createHeading<T extends 'h2' | 'h3' | 'h4'>(Tag: T) {
  function Heading({
    className,
    id,
    children,
    ...props
  }: ComponentProps<T>) {
    const Component = Tag as ElementType

    return (
      <Component
        className={clsx(headingClasses[Tag], className)}
        id={id}
        {...props}
      >
        {id
          ? (
              <a className="inline-flex items-center gap-2" href={`#${id}`}>
                <span>{children}</span>
                <LinkIcon
                  aria-hidden="true"
                  className="
                    size-4 opacity-0 transition-opacity
                    group-hover:opacity-60
                  "
                />
              </a>
            )
          : children}
      </Component>
    )
  }

  return Heading
}
