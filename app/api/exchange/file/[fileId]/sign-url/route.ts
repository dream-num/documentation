import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createProxyErrorResponse, getForwardHeaders, getProApiUrl } from '../../../_utils'

export const runtime = 'nodejs'
const STATIC_EXPORT_PLACEHOLDER_FILE_ID = '__static_export_placeholder__'

interface RouteContext {
  params: Promise<{
    fileId: string
  }>
}

export async function generateStaticParams() {
  return [{ fileId: STATIC_EXPORT_PLACEHOLDER_FILE_ID }]
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { fileId } = await context.params
  if (fileId === STATIC_EXPORT_PLACEHOLDER_FILE_ID) {
    return NextResponse.json({
      error: 'Exchange file signing is unavailable in static exports.',
    }, {
      status: 404,
    })
  }

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
