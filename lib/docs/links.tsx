import type { ComponentProps } from 'react'

import { Link } from '@/i18n/navigation'

interface IResolvablePage {
  path: string
}

interface IResolvableSource<Page extends IResolvablePage> {
  resolveHref: (href: string, page: Page) => string
}

export function createDocsRelativeLink<Page extends IResolvablePage>(source: IResolvableSource<Page>, page: Page) {
  function DocsLink({ href, ...props }: ComponentProps<'a'>) {
    if (typeof href !== 'string') {
      return <a href={href} {...props} />
    }

    return <Link href={source.resolveHref(href, page)} {...props} />
  }

  return DocsLink
}
