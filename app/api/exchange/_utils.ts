const DEV_API_ORIGIN = 'https://dev.univer.plus'
const PROD_API_ORIGIN = 'https://univer.ai'
const PRO_API_PREFIX = '/universer-api'

export function getProApiOrigin(hostname?: string | null) {
  if (hostname === 'univer.ai' || hostname?.endsWith('.univer.ai')) {
    return PROD_API_ORIGIN
  }

  return DEV_API_ORIGIN
}

export function getProApiUrl(hostname: string | null | undefined, path: string) {
  return `${getProApiOrigin(hostname)}${PRO_API_PREFIX}${path}`
}

export function getForwardHeaders(request: Request) {
  const headers = new Headers()
  const cookie = request.headers.get('cookie')
  const authorization = request.headers.get('authorization')
  const acceptLanguage = request.headers.get('accept-language')
  const userAgent = request.headers.get('user-agent')

  if (cookie) {
    headers.set('cookie', cookie)
  }

  if (authorization) {
    headers.set('authorization', authorization)
  }

  if (acceptLanguage) {
    headers.set('accept-language', acceptLanguage)
  }

  if (userAgent) {
    headers.set('user-agent', userAgent)
  }

  return headers
}

export async function createProxyErrorResponse(response: Response) {
  const text = await response.text()

  return new Response(text, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      'content-type': response.headers.get('content-type') ?? 'text/plain; charset=utf-8',
    },
  })
}
