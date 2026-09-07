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
  const { createCatalogItem } = await import('../showcase/catalog.ts')
  const { SECTION_IDS, categoriesFor, directoryGroups, COMPOSITIONS } = await import('../showcase/directory.ts')
  const catalog = JSON.parse(fs.readFileSync('showcase/catalog.generated.json', 'utf8'))
  const registered = [...fs.readFileSync('showcase/data.ts', 'utf8').matchAll(/^\s*'([^']+)':.*import/gm)].map(
    (match) => match[1],
  )
  assert.deepEqual(catalog.map((item) => item.slug).toSorted(), registered.toSorted())
  for (const locale of ['en-US', 'zh-CN']) {
    const items = catalog.map(({ slug, metadata }, index) => createCatalogItem(slug, metadata, locale, index))
    assert.equal(new Set(items.map((item) => item.slug)).size, 165)
    for (const item of items) {
      assert.ok(SECTION_IDS.includes(item.section), item.slug)
      assert.ok(categoriesFor(item.section).includes(item.category), item.slug)
      assert.ok(item.group && item.sectionName, item.slug)
    }
    const bySlug = Object.fromEntries(items.map((item) => [item.slug, item]))
    const integration = items.filter((item) => item.section === 'customization-integration')
    assert.equal(integration.length, 28)
    assert.ok(integration.every((item) => item.integrationProduct && item.integrationProductName))
    assert.equal(
      new Set(integration.map((item) => `${item.integrationProduct}:${item.category}:${item.title}`)).size,
      integration.length,
      'No duplicate titles inside a product/category',
    )
    assert.equal(bySlug['embed/multiple-isolated-instances'].integrationProduct, 'sheets')
    assert.equal(bySlug['embed/crm-quote-calculator'].integrationProduct, 'sheets')
    assert.equal(bySlug['docs/slim-via-preset'].integrationProduct, 'docs-modern')
    assert.notEqual(bySlug['docs/slim-via-preset'].title, bySlug['docs/slim-via-plugin'].title)
    const compose = items.filter((item) => item.section === 'embed')
    assert.equal(compose.length, 68)
    assert.equal(compose.filter((item) => item.category === 'product-embedding').length, 32)
    assert.equal(compose.filter((item) => item.category === 'cross-file-formulas').length, 27)
    assert.equal(compose.filter((item) => item.category === 'showcases').length, 9)
    assert.ok(compose.every((item) => COMPOSITIONS[item.slug]))
    for (const slug of [
      'embed/crm-quote-calculator',
      'embed/lazy-load-editor',
      'embed/mount-dispose-remount',
      'embed/multiple-isolated-instances',
      'embed/univer-events-to-host',
      'sheets/custom-canvas',
    ])
      assert.equal(bySlug[slug].section, 'customization-integration', slug)
    assert.equal(bySlug['slides/basic-via-plugin'].section, 'slides')
    assert.equal(bySlug['sheets/univer-pro-import-export'].category, 'features')
    assert.equal(bySlug['sheets/big-data'].category, 'performance')
    assert.equal(bySlug['docs/big-data'].category, 'performance')
    const atlas = bySlug['embed/slides-in-sheets-formula-float']
    assert.equal(atlas.composition.container, 'sheets')
    assert.deepEqual(atlas.composition.targets, ['slides'])
    assert.equal(atlas.group, locale === 'en-US' ? 'Slides as Host' : 'Slides 作为宿主')
    assert.equal(directoryGroups('embed', 'cross-file-formulas', [], locale).length, 6)
    for (const section of SECTION_IDS.filter((value) => !['embed', 'customization-integration'].includes(value))) {
      assert.deepEqual(categoriesFor(section), ['features', 'showcases', 'performance'])
      assert.equal(directoryGroups(section, 'performance', [], locale).length, 3)
    }
    console.log(`PASS ${locale}: 165 unique routes, 68 Compose & Embed, target-based formula hosts and empty folders`)
  }
} finally {
  hooks.deregister()
}
