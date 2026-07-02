import type { ComponentProps } from 'react'

interface ResolvablePage {
  path: string
}

interface ResolvableSource<Page extends ResolvablePage> {
  resolveHref: (href: string, page: Page) => string
}

export function createDocsRelativeLink<Page extends ResolvablePage>(
  source: ResolvableSource<Page>,
  page: Page,
) {
  function DocsLink({
    href,
    ...props
  }: ComponentProps<'a'>) {
    return (
      <a
        href={typeof href === 'string' ? source.resolveHref(href, page) : href}
        {...props}
      />
    )
  }

  return DocsLink
}
