import process from 'node:process'

function isExternalHref(href: string) {
  return /^(?:https?:)?\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')
}

export function resolveGuideHref(
  href: string,
  page: { slugs: string[], path: string },
  getPageUrl: (path: string[]) => string | undefined,
) {
  if (href.startsWith('#') || href.startsWith('/')) {
    return href
  }
  if (isExternalHref(href)) {
    return href
  }

  const [pathPart, hashPart] = href.split('#')
  const currentDir = page.slugs.slice(0, -1)
  const normalized = pathPart
    .replace(/\.mdx$/, '')
    .split('/')
    .reduce<string[]>((segments, segment) => {
      if (segment === '' || segment === '.') {
        return segments
      }
      if (segment === '..') {
        return segments.slice(0, -1)
      }
      return [...segments, segment]
    }, currentDir)

  const url = getPageUrl(normalized)
  if (!url) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Unable to resolve Guides link "${href}" from "${page.path}"`)
    }
    return href
  }

  return hashPart ? `${url}#${hashPart}` : url
}
