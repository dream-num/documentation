import type { ComponentProps } from 'react'
import { ExternalLinkIcon } from 'lucide-react'

import { Link } from '@/i18n/navigation'

interface IResolvablePage {
  path: string
}

interface IResolvableSource<Page extends IResolvablePage> {
  resolveHref: (href: string, page: Page) => string
}

export function createDocsRelativeLink<Page extends IResolvablePage>(source: IResolvableSource<Page>, page: Page) {
  function DocsLink({ href, children, ...props }: ComponentProps<'a'>) {
    if (typeof href !== 'string') {
      return (
        <a href={href} {...props}>
          {children}
        </a>
      )
    }

    const resolvedHref = source.resolveHref(href, page)
    const external = /^(?:https?:)?\/\//.test(resolvedHref)

    return (
      <Link href={resolvedHref} {...props}>
        {children}
        {external ? <ExternalLinkIcon aria-hidden="true" className="ml-1 inline size-3 align-baseline" /> : null}
      </Link>
    )
  }

  return DocsLink
}
