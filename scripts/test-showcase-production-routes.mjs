import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

const origin = process.env.SHOWCASE_ORIGIN || 'http://localhost:4335'
const catalog = JSON.parse(await fs.readFile('showcase/catalog.generated.json', 'utf8'))
const queue = ['en-US', 'zh-CN'].flatMap((locale) => catalog.map(({ slug }) => `/${locale}/showcase/${slug}`))
const results = []
await Promise.all(Array.from({ length: 4 }, async () => {
  while (queue.length) {
    const route = queue.shift()
    try {
      const response = await fetch(`${origin}${route}`, { signal: AbortSignal.timeout(60000) })
      const html = await response.text()
      const scopedPlaceholder = html.includes('not compiled in this scoped local preview') || html.includes('未纳入本次限定编译')
      results.push({ route, status: response.status, scopedPlaceholder, passed: response.ok && !scopedPlaceholder })
    } catch (error) {
      results.push({ route, passed: false, error: error.message })
    }
  }
}))
const report = { origin, demos: catalog.length, passed: results.every((result) => result.passed), results }
await fs.mkdir('test-results/production-routes', { recursive: true })
await fs.writeFile('test-results/production-routes/report.json', JSON.stringify(report, null, 2))
console.log(`${results.filter((result) => result.passed).length}/${results.length} production routes passed; HTTP/placeholder checks only, not interaction acceptance`)
assert.ok(report.passed, JSON.stringify(results.filter((result) => !result.passed)))
