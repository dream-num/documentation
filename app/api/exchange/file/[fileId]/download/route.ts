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
  const signUrlResponse = await fetch(
    getProApiUrl(request.nextUrl.hostname, `/file/${encodeURIComponent(fileId)}/sign-url`),
    {
      headers: getForwardHeaders(request),
      cache: 'no-store',
    },
  )

  if (!signUrlResponse.ok) {
    return createProxyErrorResponse(signUrlResponse)
  }

  const signUrlBody = await signUrlResponse.json()
  const downloadUrl = signUrlBody?.url

  if (typeof downloadUrl !== 'string' || downloadUrl.length === 0) {
    return NextResponse.json({
      error: 'Missing signed download url.',
    }, {
      status: 502,
    })
  }

  const fileResponse = await fetch(downloadUrl, {
    cache: 'no-store',
  })

  if (!fileResponse.ok) {
    return createProxyErrorResponse(fileResponse)
  }

  const headers = new Headers()
  const contentType = fileResponse.headers.get('content-type')
  const contentDisposition = fileResponse.headers.get('content-disposition')
  const contentLength = fileResponse.headers.get('content-length')

  if (contentType) {
    headers.set('content-type', contentType)
  }

  if (contentDisposition) {
    headers.set('content-disposition', contentDisposition)
  }

  if (contentLength) {
    headers.set('content-length', contentLength)
  }

  headers.set('cache-control', 'no-store')

  return new Response(fileResponse.body, {
    status: fileResponse.status,
    statusText: fileResponse.statusText,
    headers,
  })
}
