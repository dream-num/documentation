import assert from 'node:assert/strict'
import fs from 'node:fs'
import { registerHooks } from 'node:module'

const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (context.parentURL?.includes('/showcase/') && /^\.\/[\w-]+$/.test(specifier))
      return next(`${specifier}.ts`, context)
    return next(specifier, context)
  },
})
try {
  const { createCatalogItem } = await import('../catalog.ts')
  const { SECTION_IDS, categoriesFor, COMPOSITIONS, HOST_LABELS } = await import('../directory.ts')
  const catalog = JSON.parse(fs.readFileSync('showcase/catalog.generated.json', 'utf8'))
  const { showcase: registry } = await import('../data.ts')
  const registered = Object.keys(registry)
  assert.deepEqual(catalog.map((item) => item.slug).toSorted(), registered.toSorted())
  for (const locale of ['en-US', 'zh-CN']) {
    const items = catalog.map(({ slug, metadata }, index) => createCatalogItem(slug, metadata, locale, index))
    assert.equal(new Set(items.map((item) => item.slug)).size, registered.length)
    for (const item of items) {
      assert.ok(SECTION_IDS.includes(item.section), item.slug)
      assert.ok(categoriesFor(item.section).includes(item.category), item.slug)
      assert.ok(item.group && item.sectionName, item.slug)
    }
    const integration = items.filter((item) => item.section === 'customization-integration')
    assert.ok(integration.every((item) => item.integrationProduct && item.integrationProductName))
    assert.equal(
      new Set(integration.map((item) => `${item.integrationProduct}:${item.category}:${item.title}`)).size,
      integration.length,
      'No duplicate titles inside a product/category',
    )
    const compose = items.filter((item) => item.section === 'embed')
    assert.ok(compose.every((item) => COMPOSITIONS[item.slug]))
    for (const item of compose) {
      assert.equal(item.host, COMPOSITIONS[item.slug].container, `${item.slug}: Host metadata matches the outer editor`)
      assert.equal(
        item.group,
        HOST_LABELS[COMPOSITIONS[item.slug].container][locale],
        `${item.slug}: outer editor is Host`,
      )
    }
    console.log(`PASS ${locale}: ${registered.length} unique routes, valid product categories and outer-editor hosts`)
  }
} finally {
  hooks.deregister()
}
