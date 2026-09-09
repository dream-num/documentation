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
  const { createCatalogItem, productLabel, integrationProductLabel } = await import('../showcase/catalog.ts')
  const { SECTION_IDS, categoriesFor, directoryGroups, COMPOSITIONS, HOST_LABELS, treeLabel } =
    await import('../showcase/directory.ts')
  const catalog = JSON.parse(fs.readFileSync('showcase/catalog.generated.json', 'utf8'))
  const { showcase: registry } = await import('../showcase/data.ts')
  const registered = Object.keys(registry)
  for (const slug of ['embed/cross-unit-formula', 'embed/sheet-to-chart']) {
    assert.ok(!registered.includes(slug), `${slug}: Sheet-in-Sheet demo stays unregistered`)
    assert.ok(!COMPOSITIONS[slug], `${slug}: no retired composition in navigation`)
  }
  assert.ok(registered.includes('sheets/cross-workbook-formula'), 'Keep ordinary cross-workbook formulas')
  assert.deepEqual(catalog.map((item) => item.slug).toSorted(), registered.toSorted())
  for (const locale of ['en-US', 'zh-CN']) {
    assert.equal(productLabel('boards', locale), locale === 'en-US' ? 'Boards' : '白板')
    assert.equal(productLabel('bases', locale), locale === 'en-US' ? 'Bases' : '多维表格')
    assert.equal(treeLabel(productLabel('boards', locale)), 'Canvases')
    assert.equal(treeLabel(productLabel('bases', locale)), 'Relational Tables')
    assert.equal(treeLabel(integrationProductLabel('boards', locale)), 'Canvases')
    assert.equal(treeLabel(integrationProductLabel('bases', locale)), 'Relational Tables')
    assert.equal(treeLabel(HOST_LABELS.boards[locale]), locale === 'en-US' ? 'Canvases as Host' : 'Canvases 作为宿主')
    assert.equal(
      treeLabel(HOST_LABELS.bases[locale]),
      locale === 'en-US' ? 'Relational Tables as Host' : 'Relational Tables 作为宿主',
    )
    assert.equal(treeLabel('Knowledge Base'), 'Knowledge Base')
    const items = catalog.map(({ slug, metadata }, index) => createCatalogItem(slug, metadata, locale, index))
    assert.equal(new Set(items.map((item) => item.slug)).size, registered.length)
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
    assert.equal(compose.length, 66)
    assert.equal(compose.filter((item) => item.category === 'product-embedding').length, 32)
    assert.equal(compose.filter((item) => item.category === 'cross-file-formulas').length, 25)
    assert.equal(compose.filter((item) => item.category === 'showcases').length, 9)
    assert.ok(compose.every((item) => COMPOSITIONS[item.slug]))
    for (const item of compose) {
      assert.equal(item.host, COMPOSITIONS[item.slug].container, `${item.slug}: Host metadata matches the outer editor`)
      assert.equal(
        item.group,
        HOST_LABELS[COMPOSITIONS[item.slug].container][locale],
        `${item.slug}: outer editor is Host`,
      )
    }
    for (const child of ['docs', 'slides', 'boards']) {
      for (const mode of ['float', 'tab']) {
        assert.equal(bySlug[`embed/${child}-in-sheets-formula-${mode}`].group, HOST_LABELS.sheets[locale])
      }
      assert.equal(bySlug[`embed/${child}-in-bases-formula-tab`].group, HOST_LABELS.bases[locale])
    }
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
    for (const slug of [
      'sheets/dynamic-array-formulas',
      'sheets/checkbox-validation',
      'sheets/filter-values-and-conditions',
      'sheets/conditional-format-rules',
    ]) {
      assert.equal(bySlug[slug].section, 'sheets', slug)
      assert.equal(bySlug[slug].category, 'features', slug)
    }
    assert.equal(bySlug['sheets/dynamic-array-formulas'].group, locale === 'en-US' ? 'Formulas' : '公式')
    for (const slug of [
      'docs-traditional/headers-footers-and-section-links',
      'boards/swimlane-orientation-and-lanes',
    ]) {
      assert.equal(bySlug[slug].section, slug.split('/')[0], slug)
      assert.equal(bySlug[slug].category, 'features', slug)
    }
    assert.equal(bySlug['sheets/big-data'].category, 'performance')
    assert.equal(bySlug['docs/big-data'].category, 'performance')
    assert.equal(bySlug['docs-modern/long-document'].category, 'performance')
    const atlas = bySlug['embed/slides-in-sheets-formula-float']
    assert.equal(atlas.composition.container, 'sheets')
    assert.deepEqual(atlas.composition.targets, ['slides'])
    assert.equal(atlas.group, locale === 'en-US' ? 'Sheets as Host' : 'Sheets 作为宿主')
    assert.equal(directoryGroups('embed', 'cross-file-formulas', [], locale).length, 6)
    const formulaHosts = directoryGroups('embed', 'cross-file-formulas', [], locale)
    assert.ok(formulaHosts.includes(HOST_LABELS.boards[locale]))
    assert.ok(formulaHosts.includes(HOST_LABELS.bases[locale]))
    for (const section of SECTION_IDS.filter((value) => !['embed', 'customization-integration'].includes(value))) {
      assert.deepEqual(categoriesFor(section), ['features', 'showcases', 'performance'])
      assert.equal(directoryGroups(section, 'performance', [], locale).length, 3)
    }
    console.log(
      `PASS ${locale}: ${registered.length} unique routes, 66 Compose & Embed, outer-editor hosts and empty folders`,
    )
  }
} finally {
  hooks.deregister()
}
