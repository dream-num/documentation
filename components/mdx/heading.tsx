import type { ComponentProps, ElementType } from 'react'
import { LinkIcon } from 'lucide-react'

import { clsx } from '@/lib/clsx'

const headingClasses = {
  h2: `
    group mt-10 scroll-m-24 text-[22px]/[30px] text-foreground first:mt-0 font-semibold tracking-normal
  `,
  h3: 'group mt-8 scroll-m-24 text-lg/7 text-foreground font-semibold tracking-normal',
  h4: 'group mt-6 scroll-m-24 text-base/6 text-foreground font-semibold tracking-normal',
}

export function createHeading<T extends 'h2' | 'h3' | 'h4'>(Tag: T) {
  function Heading({ className, id, children, ...props }: ComponentProps<T>) {
    const Component = Tag as ElementType

    return (
      <Component className={clsx(headingClasses[Tag], className)} id={id} {...props}>
        {id ? (
          <a className="inline-flex items-center gap-2" href={`#${id}`}>
            <span>{children}</span>
            <LinkIcon aria-hidden="true" className="size-4 opacity-0 transition-opacity group-hover:opacity-60" />
          </a>
        ) : (
          children
        )}
      </Component>
    )
  }

  return Heading
}
