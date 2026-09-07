import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'

import { prepareShowcaseSource } from '../showcase/source-files.ts'

const authored = {
  '/src/index.ts': "import { createDemo } from './create-demo'\nimport '@univerjs/preset-docs-core/lib/index.css'\n",
  '/src/create-demo.ts':
    "import {\n  createUniver,\n  LocaleType\n} from '@univerjs/presets'\nconst locale = LocaleType.EN_US\n",
  '/src/styles.css': '.feature { display: flex; color: blue; }\n',
  '/reference/preview.tsx.txt': "import { useTheme } from 'next-themes'\n",
}
const versions = { '@univerjs/presets': '1.0.0-beta.2', '@univerjs/preset-docs-core': '1.0.0-beta.2' }
const result = prepareShowcaseSource(authored, versions)
for (const [filename, content] of Object.entries(authored)) assert.equal(result.files[filename], content)
assert.deepEqual(result.dependencies, versions)
assert.deepEqual(JSON.parse(result.files['/package.json']).dependencies, versions)
assert.equal(JSON.parse(result.files['/package.json']).scripts.dev, 'vite')
assert.equal(JSON.parse(result.files['/package.json']).scripts.build, 'vite build')
assert.equal(JSON.parse(result.files['/package.json']).devDependencies.vite, '8.2.2')
assert.equal(result.files['/pnpm-workspace.yaml'], 'allowBuilds:\n  protobufjs: true\n')
assert.equal(result.files['/src/vite-env.d.ts'], '/// <reference types="vite/client" />\n')
assert.match(result.files['/index.html'], /src="\/src\/index.ts"/)
assert.match(result.files['/index.html'], /<link rel="icon" href="data:,">/)
assert.equal(Object.keys(result.files).filter((name) => name.endsWith('/styles.css')).length, 1)
assert.throws(() => prepareShowcaseSource({ '/x.ts': "import 'missing-package'" }, {}), /Missing dependency version/)
assert.throws(() => prepareShowcaseSource({ 'src/x.ts': 'one', '/src/x.ts': 'two' }, {}), /Conflicting source/)
assert.equal(prepareShowcaseSource({ '/src/styles.css': '' }, {}).files['/src/styles.css'], '')
const typedExport = prepareShowcaseSource(
  { '/src/index.ts': "import Papa from 'papaparse'\n" },
  {
    papaparse: '5.7.0',
    '@types/papaparse': '5.5.2',
    '@types/react': '19.2.18',
  },
)
assert.deepEqual(JSON.parse(typedExport.files['/package.json']).devDependencies, {
  vite: '8.2.2',
  '@types/papaparse': '5.5.2',
})

// Feature Previews contain lifecycle adapters, not alternate controls or behavior.
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const packageVersions = Object.fromEntries(
  Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies }).map((name) => [
    name,
    JSON.parse(fs.readFileSync(`node_modules/${name}/package.json`, 'utf8')).version,
  ]),
)
const require = createRequire(import.meta.url)
// A captured ref is intentional: delayed setup and cleanup must use the same node.
function hasSharedFactoryMount(preview) {
  if (/createDemo\(container(?:Ref)?\.current\s*[,)]/.test(preview)) return true
  return [...preview.matchAll(/const ([A-Za-z_]\w*) = container(?:Ref)?\.current\b/g)].some(([, alias]) =>
    new RegExp(`createDemo\\(${alias}\\s*[,)]`).test(preview),
  )
}
assert.ok(hasSharedFactoryMount('createDemo(containerRef.current, false)'))
assert.ok(hasSharedFactoryMount('const container = containerRef.current; createDemo(container, false)'))
assert.ok(hasSharedFactoryMount('const element = container.current; createDemo(element, false)'))
assert.ok(!hasSharedFactoryMount('const element = container.current; createDemo(otherElement, false)'))
assert.ok(!hasSharedFactoryMount('createDemo(container, false)'))
assert.ok(!hasSharedFactoryMount('const container = anotherNode; createDemo(container, false)'))
for (const slug of [
  'embed/bases-in-docs-block',
  'embed/slides-in-docs-block',
  'embed/boards-in-docs-block',
  'embed/sheets-in-docs-block',
  'embed/sheets-in-slides-float',
  'embed/sheets-in-slides-tab',
  'embed/bases-in-slides-tab',
  'embed/boards-in-sheets-tab',
  'sheets/lit',
  'docs/lit',
  'sheets/hide-headers',
  'sheets/custom-menu',
  'sheets/custom-event',
  'sheets/custom-shortcuts',
  'sheets/custom-formula',
  'sheets/custom-header',
  'sheets/find-replace',
  'sheets/notes',
  'sheets/hyper-link',
  'sheets/outline',
  'sheets/crosshair-highlighting',
  'sheets/csv-import-plugin',
  'sheets/list-validation',
  'sheets/images',
  'sheets/cross-workbook-formula',
  'sheets/custom-canvas',
  'sheets/permission',
  'sheets/charts',
  'sheets/shapes',
  'sheets/big-data',
  'sheets/read-only',
  'sheets/slim-via-preset',
  'sheets/basic-via-preset',
  'docs/slim-via-preset',
  'sheets/watermark',
  'docs/watermark',
  'docs-traditional/page-setup',
  'docs-modern/paragraph-heading-blocks',
  'docs-modern/lists-task-items',
  'docs-modern/callout-blocks',
  'docs-modern/quote-blocks',
  'docs-modern/code-blocks',
  'docs-modern/links-and-bookmarks',
  'docs-modern/document-tables',
  'docs-modern/column-layouts',
  'docs-modern/images-and-wrapping',
  'docs-modern/shapes-in-documents',
  'docs-modern/charts-in-documents',
  'docs-modern/responsive-width-and-zoom',
  'docs-traditional/paragraph-typesetting',
  'docs-traditional/pagination-rules',
  'bases/filter-builder',
  'bases/create-base-and-tables',
  'bases/record-lifecycle',
  'bases/text-number-currency',
  'bases/select-options',
  'bases/multi-field-sort',
  'bases/view-field-layout',
  'bases/group-records',
  'slides/save-restore-deck',
  'slides/slide-lifecycle',
  'slides/reorder-and-sections',
  'slides/layouts-and-placeholders',
  'slides/theme-and-background',
  'slides/text-editing-and-autofit',
  'slides/page-size-and-overflow',
  'slides/product-launch',
  'pdfs/create-load-viewer',
  'pdfs/text-markup',
  'pdfs/ink-freehand-review',
  'pdfs/image-placement-crop',
  'docs-traditional/fonts-fallback-and-glyphs',
  'pdfs/financial-report',
  'embed/crm-quote-calculator',
  'embed/slides-in-sheets-float',
  'embed/slides-in-sheets-tab',
  'embed/docs-in-sheets-float',
  'embed/docs-in-sheets-tab',
  'embed/bases-in-sheets-float',
  'embed/bases-in-sheets-tab',
  'embed/boards-in-sheets-float',
  'embed/mount-dispose-remount',
  'embed/lazy-load-editor',
  'embed/multiple-isolated-instances',
  'embed/univer-events-to-host',
  'boards/connector-routing',
  'boards/create-save-and-restore-board',
  'boards/alignment-spacing',
  'boards/group-lock-z-order',
  'boards/search-element-query',
]) {
  const directory = `showcase/${slug}`
  const preview = fs.readFileSync(`${directory}/preview/main.tsx`, 'utf8')
  const standalone = fs.readFileSync(`${directory}/code/index.ts`, 'utf8')
  assert.ok(hasSharedFactoryMount(preview), `${slug}: mount the shared factory on the Preview ref`)
  assert.match(standalone, /createDemo\((?:container|document\.getElementById\('app'\)!)/)
  assert.doesNotMatch(preview, /onClick|useState|<button|<select/)
  const sdkSource = fs.readFileSync(`${directory}/code/create-demo.ts`, 'utf8')
  assert.doesNotMatch(sdkSource, /__baseDiagnostic/, 'Temporary diagnostic globals must not ship')
  if (sdkSource.includes("from '@univerjs-pro/embed-ui'")) {
    // Embed UI evaluates browser canvas APIs at module load, before React effects.
    const entry = fs.readFileSync(`${directory}/preview/index.ts`, 'utf8')
    assert.match(entry, /^['"]use client['"]/, `${slug}: the browser-only boundary must be a Client Component`)
    assert.match(
      entry,
      /dynamic\(\(\) => import\('\.\/main'\), \{ ssr: false \}\)/,
      `${slug}: do not evaluate native Embed UI during server prerendering`,
    )
  }
  const authoredFiles = Object.fromEntries(
    fs
      .readdirSync(`${directory}/code`, { recursive: true })
      .filter((name) => fs.statSync(path.join(directory, 'code', name)).isFile())
      .map((name) => [
        `/src/${name.replaceAll('\\', '/')}`,
        fs.readFileSync(path.join(directory, 'code', name), 'utf8'),
      ]),
  )
  const prepared = prepareShowcaseSource(authoredFiles, packageVersions)
  for (const [name, source] of Object.entries(authoredFiles)) {
    assert.equal(prepared.files[name], source, `${slug}: preserve actual ${name}, not a rewritten example`)
    for (const [, css] of source.matchAll(/import\s*['"]([^'"]+\.css)['"]/g)) {
      if (css.startsWith('.')) {
        const cssPath = path.posix.join(path.posix.dirname(name), css)
        assert.ok(cssPath in prepared.files, `${slug}: export local stylesheet ${cssPath}`)
      } else {
        const packageName = css.startsWith('@') ? css.split('/').slice(0, 2).join('/') : css.split('/')[0]
        assert.ok(prepared.dependencies[packageName], `${slug}: include CSS dependency ${packageName}`)
        assert.ok(fs.existsSync(require.resolve(css)), `${slug}: SDK stylesheet must resolve: ${css}`)
      }
    }
  }
  for (const [, css] of preview.matchAll(/import\s*['"](@[^'"]+\.css)['"]/g))
    assert.ok(
      Object.values(authoredFiles).some((source) => source.includes(css)),
      `${slug}: Preview-only SDK CSS must also be imported by exported source: ${css}`,
    )
  assert.ok(Object.keys(prepared.dependencies).some((name) => name.startsWith('@univerjs/')))
}
console.log('PASS Showcase source preservation, dependencies, styles, entry point, and thin Preview adapters')

if (process.env.SHOWCASE_SOURCE_DIR) {
  const slug = process.env.SHOWCASE_SOURCE_SLUG
  assert.match(slug ?? '', /^[\w-]+\/[\w-]+$/, 'Set SHOWCASE_SOURCE_SLUG to the copied demo route')
  const directory = `showcase/${slug}/code`
  const files = Object.fromEntries(
    fs
      .readdirSync(directory, { recursive: true })
      .filter((name) => fs.statSync(path.join(directory, name)).isFile())
      .map((name) => [`/src/${name.replaceAll('\\', '/')}`, fs.readFileSync(path.join(directory, name), 'utf8')]),
  )
  const prepared = prepareShowcaseSource(files, packageVersions)
  for (const [name, expected] of Object.entries(prepared.files)) {
    const actual = fs.readFileSync(path.join(process.env.SHOWCASE_SOURCE_DIR, name.slice(1)), 'utf8')
    if (name === '/package.json') assert.deepEqual(JSON.parse(actual), JSON.parse(expected))
    else if (name === '/index.html') assert.equal(actual.trimEnd(), expected.trimEnd())
    else assert.equal(actual, expected, `${slug}: copied ${name} must match displayed source byte-for-byte`)
  }
  console.log(`PASS independent source project: ${slug}`)
}
