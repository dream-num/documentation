const DOCS_HOST = 'docs.univer.ai'

/**
 * next-intl writes the hreflang Link header from the request URL, which is http:// behind the cluster's proxy.
 * Search engines skip alternates that redirect, so the production addresses are rewritten to https://.
 */
export function withHttpsAlternateLinks(link: string): string {
  return link.replaceAll(`<http://${DOCS_HOST}`, `<https://${DOCS_HOST}`)
}
