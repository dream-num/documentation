import type { ComponentProps } from 'react'
import { SiNpm } from '@icons-pack/react-simple-icons'
import { ExternalLinkIcon } from 'lucide-react'

import { Link } from '@/i18n/navigation'
import { clsx } from '@/lib/clsx'

interface IResolvablePage {
  path: string
}

interface IResolvableSource<Page extends IResolvablePage> {
  resolveHref: (href: string, page: Page) => string
}

export function createDocsRelativeLink<Page extends IResolvablePage>(source: IResolvableSource<Page>, page: Page) {
  function DocsLink({ href, children, className, ...props }: ComponentProps<'a'>) {
    const linkClassName = clsx(
      'text-primary decoration-primary/30 hover:decoration-primary focus-visible:outline-ring font-medium underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
      className,
    )
    if (typeof href !== 'string') {
      return (
        <a href={href} className={linkClassName} {...props}>
          {children}
        </a>
      )
    }

    const resolvedHref = source.resolveHref(href, page)
    const external = /^(?:https?:)?\/\//.test(resolvedHref)

    return (
      <Link href={resolvedHref} className={linkClassName} {...props}>
        {resolvedHref.startsWith('https://www.npmjs.com/package/') ? (
          <SiNpm aria-hidden="true" color="default" className="mr-1 inline size-3" />
        ) : null}
        {children}
        {external ? <ExternalLinkIcon aria-hidden="true" className="ml-1 inline size-3 align-baseline" /> : null}
      </Link>
    )
  }

  return DocsLink
}
