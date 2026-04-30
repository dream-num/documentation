import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createProxyErrorResponse, getForwardHeaders, getProApiUrl } from '../../../_utils'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{
    fileId: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { fileId } = await context.params
  const upstreamUrl = getProApiUrl(request.nextUrl.hostname, `/file/${encodeURIComponent(fileId)}/sign-url`)
  const upstreamResponse = await fetch(upstreamUrl, {
    headers: getForwardHeaders(request),
    cache: 'no-store',
  })

  if (!upstreamResponse.ok) {
    return createProxyErrorResponse(upstreamResponse)
  }

  const body = await upstreamResponse.json()

  if (typeof body?.url === 'string' && body.url.length > 0) {
    body.url = `/api/exchange/file/${encodeURIComponent(fileId)}/download`
  }

  return NextResponse.json(body, {
    status: upstreamResponse.status,
  })
}
