import { agentDocsPublication } from '@/lib/agent-docs/publication'

interface IRouteContext {
  params: Promise<{
    asset: string[]
    lang: string
  }>
}

const DOCS_ORIGIN = 'https://docs.univer.ai'

export const dynamic = 'force-static'
export const dynamicParams = true
export const revalidate = false

export function generateStaticParams() {
  return agentDocsPublication.enumerate()
}

export async function GET(_request: Request, { params }: IRouteContext) {
  const artifact = await agentDocsPublication.publish(await params)
  if (!artifact) {
    return new Response('Not Found\n', { status: 404 })
  }

  const canonicalTarget = artifact.humanPath ?? artifact.canonicalPath
  const links = [
    `<${DOCS_ORIGIN}${canonicalTarget}>; rel="canonical"`,
    `<${DOCS_ORIGIN}${artifact.canonicalPath}>; rel="alternate"; type="${artifact.contentType.split(';')[0]}"`,
    `<${DOCS_ORIGIN}${artifact.describedByPath}>; rel="describedby"; type="text/plain"`,
  ]

  return new Response(artifact.body, {
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=31536000, stale-while-revalidate=86400',
      'Content-Language': artifact.contentLanguage,
      'Content-Location': artifact.canonicalPath,
      'Content-Type': artifact.contentType,
      ETag: artifact.digest,
      Link: links.join(', '),
    },
  })
}
