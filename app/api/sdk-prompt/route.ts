const SDK_PROMPT_URL = 'https://univer.ai/sdk-docs/llms.txt'

export async function GET() {
  try {
    const response = await fetch(SDK_PROMPT_URL, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) throw new Error('SDK prompt unavailable')
    const prompt = await response.text()
    if (!prompt.trim()) throw new Error('SDK prompt is empty')
    return new Response(prompt, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return Response.json({ error: 'SDK prompt unavailable' }, { status: 502 })
  }
}
