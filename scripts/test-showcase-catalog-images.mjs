/* eslint-disable no-await-in-loop -- Load only reviewed metadata entries, never their SDK previews. */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { registerHooks } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.resolve('.')
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (specifier === './preview')
      return { url: 'data:text/javascript,export default function Preview(){}', shortCircuit: true }
    if (specifier === '@/showcase/read-files')
      return { url: pathToFileURL(path.join(root, 'showcase/read-files.ts')).href, shortCircuit: true }
    if (specifier === './types' && context.parentURL === pathToFileURL(path.join(root, 'showcase/catalog.ts')).href)
      return { url: pathToFileURL(path.join(root, 'showcase/types.ts')).href, shortCircuit: true }
    return next(specifier, context)
  },
})
try {
  const { createCatalogItem } = await import('../showcase/catalog.ts')
  for (const slug of [
    'docs-modern/responsive-width-and-zoom',
    'sheets/hyper-link',
    'embed/lazy-load-editor',
    'bases/create-base-and-tables',
    'boards/create-save-and-restore-board',
    'slides/page-size-and-overflow',
    'pdfs/text-markup',
    'bases/filter-builder',
    'pdfs/ink-freehand-review',
    'docs-modern/paragraph-heading-blocks',
    'bases/multi-field-sort',
    'pdfs/image-placement-crop',
    'slides/save-restore-deck',
    'docs-traditional/paragraph-typesetting',
    'pdfs/financial-report',
    'docs-modern/product-brief',
    'slides/reorder-and-sections',
    'docs-modern/lists-task-items',
    'boards/connector-routing',
    'sheets/images',
    'docs-modern/callout-blocks',
    'docs-traditional/page-setup',
    'embed/crm-quote-calculator',
    'sheets/notes',
    'docs-modern/quote-blocks',
    'slides/quarterly-business-review',
    'bases/content-pipeline',
    'slides/technical-architecture-overview',
    'docs-modern/code-blocks',
    'sheets/print',
    'slides/basic-via-plugin',
    'sheets/read-only',
    'sheets/csv-import-plugin',
    'docs-modern/company-knowledge-base',
    'docs-modern/incident-postmortem',
    'sheets/univer-pro-import-export',
    'docs-traditional/research-paper',
    'docs-modern/document-tables',
    'boards/incident-response',
    'docs-traditional/services-agreement',
    'embed/univer-events-to-host',
    'embed/multiple-isolated-instances',
    'slides/product-launch',
    'docs-traditional/corporate-annual-report',
    'sheets/custom-header',
    'sheets/custom-menu',
    'sheets/custom-shortcuts',
    'sheets/crosshair-highlighting',
    'sheets/custom-event',
    'embed/mount-dispose-remount',
    'sheets/find-replace',
    'sheets/custom-canvas',
  ]) {
    const { metadata } = (await import(pathToFileURL(path.join(root, 'showcase', slug, 'index.ts')).href)).default
    const expected = `/assets/showcase/${slug.replaceAll('/', '-')}.png`
    for (const locale of ['en-US', 'zh-CN']) {
      const item = createCatalogItem(slug, metadata, locale, 0)
      assert.equal(item.image, expected, 'The list must pass the reviewed image through to its card')
      assert.equal(item.title, metadata.title[locale])
    }
    const bytes = fs.readFileSync(path.join(root, 'public', expected.slice(1)))
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'Published PNG exists')
    assert.ok(bytes.length > 10000, 'Reviewed native screenshot, not an empty placeholder asset')
    const withoutImage = { ...metadata, image: undefined }
    assert.equal(
      createCatalogItem(slug, withoutImage, 'en-US', 0).image,
      undefined,
      'Unreviewed cases retain their icon fallback',
    )
  }
  console.log('PASS reviewed catalog images, both locales, real PNG files and unchanged icon fallback')
} finally {
  hooks.deregister()
}
