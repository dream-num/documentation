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
    if (context.parentURL?.includes('/showcase/') && /^\.\/[\w-]+$/.test(specifier))
      return next(`${specifier}.ts`, context)
    return next(specifier, context)
  },
})
try {
  const { createCatalogItem } = await import('../showcase/catalog.ts')
  for (const slug of [
    'docs-traditional/pagination-rules',
    'bases/formula-fields',
    'sheets/clipboard-and-paste-special',
    'sheets/sparkline-types',
    'bases/attachment-fields',
    'slides/connectors-and-endpoints',
    'sheets/table-create-and-resize',
    'boards/text-and-sticky-notes',
    'sheets/formula-reference-modes',
    'sheets/validation-error-messages',
    'pdfs/page-navigation-and-zoom',
    'sheets/conditional-format-visuals',
    'slides/grouping-and-stacking',
    'bases/view-lifecycle',
    'docs-traditional/headers-footers-and-section-links',
    'sheets/conditional-format-rules',
    'boards/swimlane-orientation-and-lanes',
    'sheets/sort-values-and-columns',
    'pdfs/table-themes-and-cell-styles',
    'slides/images-fit-and-crop',
    'bases/linked-record-picker',
    'sheets/date-number-validation',
    'sheets/filter-values-and-conditions',
    'sheets/checkbox-validation',
    'sheets/dynamic-array-formulas',
    'sheets/freeze-panes',
    'sheets/merge-cells',
    'sheets/number-format-gallery',
    'embed/formula-customrange',
    'bases/kanban-cards-and-columns',
    'bases/calendar-month-week-day',
    'bases/gantt-timeline-and-working-days',
    'bases/gallery-covers-and-card-layout',
    'bases/date-time-formats',
    'slides/shape-fill-and-outline',
    'embed/mixed-in-sheets',
    'embed/mixed-in-bases',
    'embed/mixed-in-slides',
    'embed/mixed-in-boards',
    'embed/mixed-in-docs-modern',
    'embed/mixed-in-docs-traditional',
    'slides/layouts-and-placeholders',
    'embed/boards-in-sheets-float',
    'embed/boards-in-sheets-tab',
    'embed/slides-in-sheets-float',
    'embed/slides-in-sheets-tab',
    'sheets/custom-formula',
    'sheets/outline',
    'sheets/permission',
    'sheets/cross-workbook-formula',
    'bases/group-records',
    'pdfs/create-load-viewer',
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
    'sheets/merge-cells',
  ]) {
    const { metadata } = (await import(pathToFileURL(path.join(root, 'showcase', slug, 'index.ts')).href)).default
    if (slug.startsWith('embed/mixed-in-')) {
      assert.deepEqual(metadata.actions, [], 'Native-only mixed stories must not advertise absent host buttons')
      assert.ok(metadata.variants.length > 0, 'Keep the authored capability variants')
      assert.ok(metadata.apis.length > 0, 'Keep the real Facade reference')
    }
    const expected = `/assets/showcase/${slug.replaceAll('/', '-')}.png`
    for (const locale of ['en-US', 'zh-CN']) {
      const item = createCatalogItem(slug, metadata, locale, 0)
      assert.equal(item.image, expected, 'The list must pass the reviewed image through to its card')
      const titlePrefix =
        slug === 'embed/formula-customrange'
          ? locale === 'zh-CN'
            ? '电子表格 + 多维表格 → 现代文档 · '
            : 'Sheets + Bases → Modern Docs · '
          : ''
      assert.equal(item.title, titlePrefix + metadata.title[locale])
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
