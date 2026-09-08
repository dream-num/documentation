import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

// Unit-check the authored failure callback without mocking a successful SDK startup.
// Actual selected exports separately cover the normal startup path.
const slugs = ['sheets', 'slides', 'bases', 'boards', 'docs-modern', 'docs-traditional'].map(
  (host) => `embed/mixed-in-${host}`,
)
slugs.push('embed/formula-customrange')
const sources = await Promise.all(slugs.map((slug) => fs.readFile(`showcase/${slug}/code/create-demo.ts`, 'utf8')))
for (const [index, slug] of slugs.entries()) {
  const source = sources[index]
  assert.match(source, /root\.dataset\.ready = 'false'\s+container\.append\(root\)/)
  const callbacks = [...source.matchAll(/\.catch\(\(error\) => \{([\s\S]*?)\n\s*\}\)/g)]
    .map((match) => match[1])
    .filter((body) => body.includes('root.dataset.error'))
  assert.equal(callbacks.length, 1, `${slug}: exactly one resource-startup failure callback`)
  const handle = new Function('disposed', 'root', 'document', 'locale', 'LocaleType', 'console', 'error', callbacks[0])
  for (const locale of ['en-US', 'zh-CN'])
    for (const disposed of [false, true]) {
      const children = [],
        logged = []
      const root = { dataset: { ready: 'false' }, prepend: (node) => children.push(node) }
      const document = {
        createElement: (tag) => ({
          tag,
          attributes: {},
          setAttribute(name, value) {
            this.attributes[name] = value
          },
        }),
      }
      const error = new Error('Child materialization rejected')
      handle(disposed, root, document, locale, { ZH_CN: 'zh-CN' }, { error: (value) => logged.push(value) }, error)
      if (disposed) {
        assert.deepEqual(root.dataset, { ready: 'false' })
        assert.deepEqual(children, [])
        assert.deepEqual(logged, [])
      } else {
        assert.equal(root.dataset.ready, 'error')
        assert.equal(root.dataset.error, String(error))
        assert.equal(children.length, 1)
        assert.equal(children[0].tag, 'p')
        assert.equal(children[0].attributes.role, 'alert')
        assert.match(
          children[0].textContent,
          locale === 'zh-CN' ? /未能.*加载.*重新加载/ : /could not load.*Reload to retry/,
        )
        assert.deepEqual(logged, [error], 'Retain the real diagnostic rather than hiding the error')
      }
    }
  console.log(`PASS ${slug}: initial state, EN/ZH failure alerts and disposed guard (callback unit test)`)
}
