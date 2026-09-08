/* eslint-disable no-await-in-loop -- Exercise exact selected Preview lifecycles in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const conditionalRules = (snapshot) =>
  JSON.parse(snapshot.resources.find((resource) => resource.name === 'SHEET_CONDITIONAL_FORMATTING_PLUGIN').data)

const rulesAndLanes = process.env.SHOWCASE_PREVIEW_GROUP === 'rules-and-lanes'
const referencesAndNavigation = process.env.SHOWCASE_PREVIEW_GROUP === 'references-and-navigation'
const tablesAndStickies = process.env.SHOWCASE_PREVIEW_GROUP === 'tables-and-stickies'
const sparklinesAndAttachments = process.env.SHOWCASE_PREVIEW_GROUP === 'sparklines-and-attachments'
const clipboardAndFormulas = process.env.SHOWCASE_PREVIEW_GROUP === 'clipboard-and-formulas'
const sectionBreaks = process.env.SHOWCASE_PREVIEW_GROUP === 'section-breaks'
const cases = sectionBreaks
  ? [{ slug: 'docs-traditional/pagination-rules', root: '.pagination-demo', kind: 'sections' }]
  : clipboardAndFormulas
    ? [
        { slug: 'sheets/clipboard-and-paste-special', root: '.clipboard-gallery', kind: 'clipboard' },
        { slug: 'bases/formula-fields', root: '.base-formula-fields', kind: 'base-formula' },
      ]
    : sparklinesAndAttachments
      ? [
          { slug: 'sheets/sparkline-types', root: '.sparkline-gallery', kind: 'sparkline' },
          { slug: 'bases/attachment-fields', root: '.base-attachment-fields', kind: 'attachment' },
        ]
      : tablesAndStickies
        ? [
            { slug: 'sheets/table-create-and-resize', root: '.table-range-gallery', kind: 'table' },
            { slug: 'boards/text-and-sticky-notes', root: '.text-sticky-demo', kind: 'sticky' },
          ]
        : referencesAndNavigation
          ? [
              { slug: 'sheets/formula-reference-modes', root: '.formula-reference-gallery', kind: 'references' },
              { slug: 'sheets/validation-error-messages', root: '.validation-messages-gallery', kind: 'messages' },
              { slug: 'pdfs/page-navigation-and-zoom', root: '.pdf-navigation-gallery', kind: 'pdf' },
            ]
          : rulesAndLanes
            ? [
                { slug: 'sheets/conditional-format-rules', root: '.conditional-rules-gallery', kind: 'conditional' },
                { slug: 'boards/swimlane-orientation-and-lanes', root: '.swimlane-gallery', kind: 'board' },
              ]
            : [
                { slug: 'sheets/date-number-validation', root: '.date-number-validation-demo', kind: 'sheet' },
                { slug: 'bases/linked-record-picker', root: '.base-linked-record-picker', kind: 'base' },
              ]
assert.equal(
  process.argv.slice(2).length,
  cases.length,
  'Pass one export manifest per selected Preview, in listed order',
)
const sources = await readShowcaseSources()
const out = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/validation-link-previews')
const port = Number(process.env.SHOWCASE_EXPORT_PORT || 4452)
await fs.mkdir(out, { recursive: true })
const report = {
  scope:
    'Actual selected Previews, development React StrictMode and next-themes; not Next routing or native history acceptance.',
  results: [],
}
const browser = await chromium.launch()
try {
  for (const [index, item] of cases.entries()) {
    const manifestPath = process.argv[index + 2]
    const entry = JSON.parse(await fs.readFile(manifestPath, 'utf8')).find(({ slug }) => slug === item.slug)
    assert.ok(entry?.passed, item.slug)
    const source = sources.find(({ slug }) => slug === item.slug)
    for (const [name, content] of Object.entries(source.files))
      assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), content, name)
    const previewSource = await fs.readFile(`showcase/${item.slug}/preview/main.tsx`, 'utf8')
    const resultDirectory = path.join(out, item.kind)
    await fs.mkdir(resultDirectory, { recursive: true })
    await fs.writeFile(path.join(resultDirectory, 'actual-Preview.tsx'), previewSource)
    const { build, preview } = await import(
      pathToFileURL(path.join(entry.links.find(({ name }) => name === 'vite').target, 'dist/node/index.js'))
    )
    const harness = `import React,{StrictMode,useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';import {flushSync} from 'react-dom';
import {ThemeProvider,useTheme} from 'next-themes';import Preview from '/actual-preview.tsx';
window.probe={setups:0,cleanups:0};
function Host(){const[mounted,setMounted]=useState(true);const{setTheme}=useTheme();
window.probe.mount=()=>flushSync(()=>setMounted(true));window.probe.unmount=()=>flushSync(()=>setMounted(false));window.probe.setTheme=setTheme;
useEffect(()=>{window.probe.setups++;return()=>{window.probe.cleanups++}},[]);
return mounted?React.createElement(Preview):null;}
document.documentElement.lang=new URLSearchParams(location.search).get('lang')||'en-US';
createRoot(document.getElementById('app')).render(React.createElement(StrictMode,null,React.createElement(ThemeProvider,{attribute:'class',defaultTheme:'light',enableSystem:false},React.createElement(Host))));`
    await build({
      root: entry.directory,
      configFile: false,
      logLevel: 'warn',
      define: { 'process.env.NODE_ENV': JSON.stringify('development') },
      resolve: {
        alias: {
          'react-dom': path.resolve('node_modules/react-dom'),
          react: path.resolve('node_modules/react'),
          'next-themes': path.resolve('node_modules/next-themes'),
        },
      },
      oxc: { jsx: { runtime: 'automatic' } },
      build: { outDir: path.join(resultDirectory, 'dist'), emptyOutDir: false },
      plugins: [
        {
          name: 'actual-validation-link-preview',
          transformIndexHtml: {
            order: 'pre',
            handler: () =>
              '<html><head><link rel="icon" href="data:,"><style>html,body,#app,.h-full{height:100%;margin:0}.min-h-0{min-height:0}</style></head><body><div id="app"></div><script type="module" src="/preview-harness.jsx"></script></body></html>',
          },
          resolveId(id) {
            if (id === '/preview-harness.jsx' || id === '/actual-preview.tsx') return '\0' + id
            if (id === '../code/create-demo') return path.join(entry.directory, 'src/create-demo.ts')
          },
          load(id) {
            if (id === '\0/preview-harness.jsx') return harness
            if (id === '\0/actual-preview.tsx') return previewSource
          },
        },
      ],
    })
    const server = await preview({
      root: entry.directory,
      configFile: false,
      build: { outDir: path.join(resultDirectory, 'dist') },
      preview: { host: '127.0.0.1', port, strictPort: true },
    })
    try {
      for (const lang of ['en-US', 'zh-CN']) {
        const result = { slug: item.slug, lang, manifestPath, gates: {}, errors: [], writes: [], passed: false }
        report.results.push(result)
        const page = await browser.newPage({
          viewport: { width: 1550, height: 1000 },
          locale: lang,
          timezoneId: lang === 'en-US' ? 'UTC' : 'Asia/Shanghai',
        })
        page.setDefaultTimeout(15000)
        page.on('pageerror', (error) => result.errors.push(error.stack || error.message))
        page.on('console', (message) => {
          if (message.type() === 'error') result.errors.push(message.text())
        })
        page.on('request', (request) => {
          if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) result.writes.push(request.url())
        })
        const settle = () =>
          page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        const save = () =>
          page.evaluate(
            (kind) =>
              kind === 'sections'
                ? window.univerAPI.getActiveDocument().save()
                : kind === 'clipboard'
                  ? window.univerAPI.getWorkbook('bindery-clipboard').save()
                  : kind === 'base-formula'
                    ? window.univerAPI.getBase('kiln-formula-fields').save()
                    : kind === 'sparkline'
                      ? window.univerAPI.getWorkbook('workshop-sparklines').save()
                      : kind === 'attachment'
                        ? window.univerAPI.getBase('repair-attachments').save()
                        : kind === 'table'
                          ? window.univerAPI.getWorkbook('studio-table-ranges').save()
                          : kind === 'references'
                            ? window.univerAPI.getWorkbook('print-room-references').save()
                            : kind === 'messages'
                              ? window.univerAPI.getWorkbook('crate-validation-messages').save()
                              : kind === 'pdf'
                                ? window.univerAPI.getActivePdf().save()
                                : kind === 'sheet'
                                  ? window.univerAPI.getWorkbook('validation-boundaries').save()
                                  : kind === 'base'
                                    ? window.univerAPI.getBase('equipment-record-links').save()
                                    : kind === 'conditional'
                                      ? window.univerAPI.getWorkbook('seed-library-conditional-rules').save()
                                      : window.univerAPI.getActiveBoard().save(),
            item.kind,
          )
        const ready = async () => {
          await page
            .locator(item.root + (['conditional', 'references'].includes(item.kind) ? '' : '[data-ready="true"]'))
            .waitFor()
          await page.locator('canvas:visible').first().waitFor()
          await page.waitForFunction(
            () => window.univerAPI?.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Rendered,
          )
          await page.waitForFunction(() => !document.querySelector('[data-u-comp="workbench-skeleton-content"]'))
          if (item.kind === 'references')
            await page.waitForFunction(
              () =>
                window.univerAPI
                  .getWorkbook('print-room-references')
                  .getSheetBySheetId('relative')
                  .getRange('D5')
                  .getRawValue() === 16,
            )
          if (item.kind === 'base-formula')
            await page.waitForFunction(
              () =>
                window.univerAPI
                  .getBase('kiln-formula-fields')
                  .getTableById('batches')
                  .getRecordById('mug')
                  .getValue('cost') === 96,
            )
          await settle()
        }
        try {
          await page.goto(`http://127.0.0.1:${port}/?lang=${lang}`)
          await ready()
          assert.deepEqual(await page.evaluate(() => [window.probe.setups, window.probe.cleanups]), [2, 1])
          assert.equal(await page.locator(item.root).count(), 1)
          assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
          const initial = await save()
          await fs.writeFile(path.join(resultDirectory, lang + '-initial-model.json'), JSON.stringify(initial, null, 2))
          result.gates.actualStrictModeSingleEditor = true
          await page.evaluate(async (kind) => {
            window.retainedOwner = window.univerAPI
            window.retainedCanvases = [...document.querySelectorAll('canvas')]
            if (kind === 'sections') {
              const doc = window.univerAPI.getActiveDocument()
              const paragraph = doc.findParagraphs({ paragraphId: 'odd-page' })[0]
              if (
                !doc
                  .getSectionAt(paragraph.getRange().startOffset)
                  .setSectionType(window.univerAPI.Enum.SectionType.NEXT_PAGE)
              )
                throw new Error('Section type change rejected')
            } else if (kind === 'clipboard') {
              const book = window.univerAPI.getWorkbook('bindery-clipboard')
              book.setActiveSheet('external')
              book.getActiveSheet().getRange('G5').activate()
              if (!(await window.univerAPI.pasteIntoSheet(undefined, '14\t9\t126\n3\t22\t66')))
                throw new Error('Clipboard payload rejected')
            } else if (kind === 'base-formula')
              window.univerAPI
                .getBase('kiln-formula-fields')
                .getTableById('batches')
                .getRecordById('mug')
                .setValue('units', 15)
            else if (kind === 'sparkline')
              window.univerAPI.getWorkbook('workshop-sparklines').getSheetBySheetId('line').getRange('B5').setValue(30)
            else if (kind === 'attachment') {
              const table = window.univerAPI.getBase('repair-attachments').getTableById('packets')
              table.getRecordById('clock').setValue('files', table.getRecordById('chair').getValue('files'))
            } else if (kind === 'table') {
              const sheet = window.univerAPI.getWorkbook('studio-table-ranges').getSheetBySheetId('expand')
              sheet.getRange('B5').setValue(17)
              if (!(await sheet.setTableRange('deliveries', sheet.getRange('A4:C10').getRange())))
                throw new Error('Range change rejected')
            } else if (kind === 'sticky')
              window.univerAPI.getActiveBoard().getShape('yellow').getText().setText('Preview note\nReady to discuss.')
            else if (kind === 'references')
              window.univerAPI
                .getWorkbook('print-room-references')
                .getSheetBySheetId('absolute')
                .getRange('E5')
                .setValue(6)
            else if (kind === 'messages')
              window.univerAPI
                .getWorkbook('crate-validation-messages')
                .getSheetBySheetId('reject')
                .getRange('B5')
                .setValue(4)
            else if (kind === 'pdf')
              window.univerAPI
                .getActivePdf()
                .getPageById('itinerary')
                .getTextBoxes()
                .find((box) => box.getId() === 'title-itinerary')
                .setText('01 / Preview field itinerary')
            else if (kind === 'sheet')
              window.univerAPI
                .getWorkbook('validation-boundaries')
                .getSheetBySheetId('numbers')
                .getRange('B4')
                .setValue(8)
            else if (kind === 'base')
              window.univerAPI
                .getBase('equipment-record-links')
                .getTableById('requests')
                .getRecordById('training')
                .setLinkedRecordIds('primary', ['lens'])
            else if (kind === 'conditional')
              window.univerAPI
                .getWorkbook('seed-library-conditional-rules')
                .getSheetBySheetId('numbers')
                .getRange('B6')
                .setValue(11)
            else {
              const board = window.univerAPI.getActiveBoard()
              if (!board.setSwimlaneLaneCollapsed('unequal', 'review', false)) throw new Error('Expansion rejected')
              if (!board.renameSwimlaneLane('horizontal', 'review', 'Preview review'))
                throw new Error('Rename rejected')
            }
          }, item.kind)
          if (item.kind === 'references')
            await page.waitForFunction(
              () =>
                window.univerAPI
                  .getWorkbook('print-room-references')
                  .getSheetBySheetId('absolute')
                  .getRange('D5')
                  .getRawValue() === 12,
            )
          await settle()
          if (item.kind === 'base-formula')
            await page.waitForFunction(
              () =>
                window.univerAPI
                  .getBase('kiln-formula-fields')
                  .getTableById('batches')
                  .getRecordById('mug')
                  .getValue('cost') === 120,
            )
          if (item.kind === 'clipboard')
            assert.deepEqual(
              await page.evaluate(() =>
                window.univerAPI
                  .getWorkbook('bindery-clipboard')
                  .getSheetBySheetId('external')
                  .getRange('G5:I6')
                  .getValues(),
              ),
              [
                [14, 9, 126],
                [3, 22, 66],
              ],
            )
          const edited = await save()
          await fs.writeFile(path.join(resultDirectory, lang + '-edited-model.json'), JSON.stringify(edited, null, 2))
          assert.notDeepEqual(edited, initial, 'Preservation must include a real SDK model edit')
          for (const [method, theme] of [
            ['storage', 'dark'],
            ['storage', 'light'],
            ['provider', 'dark'],
            ['provider', 'light'],
          ]) {
            await page.evaluate(
              ({ method: route, theme: value }) => {
                if (route === 'provider') window.probe.setTheme(value)
                else {
                  localStorage.setItem('theme', value)
                  window.dispatchEvent(
                    new StorageEvent('storage', { key: 'theme', newValue: value, storageArea: localStorage }),
                  )
                }
              },
              { method, theme },
            )
            await page.waitForFunction((dark) => window.univerAPI.isDarkMode() === dark, theme === 'dark')
            await settle()
            assert.equal(
              await page.evaluate(
                () =>
                  window.retainedOwner === window.univerAPI &&
                  window.retainedCanvases.every((canvas) => canvas.isConnected),
              ),
              true,
            )
            assert.deepEqual(await save(), edited, `Full edited model through ${method}/${theme}`)
            await page.screenshot({ path: path.join(resultDirectory, `${lang}-${method}-${theme}.png`) })
          }
          result.gates.storageAndProviderThemesRetainFullEditedOwner = true
          if (item.kind === 'references' || item.kind === 'messages') {
            const nameBox = page.locator('input.univer-size-full')
            await nameBox.fill('B5')
            await nameBox.press('Enter')
            await page.keyboard.type('3')
            await page.keyboard.press('Enter')
            await page.waitForFunction((kind) => {
              const book = window.univerAPI.getWorkbook(
                kind === 'references' ? 'print-room-references' : 'crate-validation-messages',
              )
              return book.getActiveSheet().getRange('B5').getRawValue() === 3
            }, item.kind)
            if (item.kind === 'references')
              await page.waitForFunction(
                () =>
                  window.univerAPI
                    .getWorkbook('print-room-references')
                    .getSheetBySheetId('relative')
                    .getRange('D5')
                    .getRawValue() === 24,
              )
            else
              assert.deepEqual(
                await page.evaluate(() =>
                  window.univerAPI
                    .getWorkbook('crate-validation-messages')
                    .getSheetBySheetId('reject')
                    .getRange('B5')
                    .getValidatorStatus(),
                ),
                [['valid']],
              )
            result.gates.nativeTypingAfterThemes = true
          }
          if (item.kind === 'sheet' || item.kind === 'conditional') {
            const workbookId = item.kind === 'sheet' ? 'validation-boundaries' : 'seed-library-conditional-rules'
            const cell = item.kind === 'sheet' ? 'B4' : 'B6'
            const nameBox = page.locator('input.univer-size-full')
            await nameBox.fill(cell)
            await nameBox.press('Enter')
            await page.keyboard.type('9')
            await page.keyboard.press('Enter')
            await page.waitForFunction(
              ({ workbookId: id, cell: address }) =>
                window.univerAPI.getWorkbook(id).getSheetBySheetId('numbers').getRange(address).getRawValue() === 9,
              { workbookId, cell },
            )
            if (item.kind === 'sheet')
              assert.deepEqual(
                await page.evaluate(() =>
                  window.univerAPI
                    .getWorkbook('validation-boundaries')
                    .getSheetBySheetId('numbers')
                    .getRange('B4')
                    .getValidatorStatus(),
                ),
                [['valid']],
              )
            result.gates.nativeTypingAfterThemes = true
          }
          await page.evaluate(() => window.probe.unmount())
          await page.waitForFunction(() => !window.univerAPI && document.querySelectorAll('canvas').length === 0)
          assert.equal(await page.evaluate(() => window.retainedCanvases.every((canvas) => !canvas.isConnected)), true)
          assert.equal(await page.locator(item.root).count(), 0)
          result.gates.actualPreviewUnmount = true
          await page.evaluate(() => window.probe.mount())
          await ready()
          assert.equal(await page.evaluate(() => window.retainedOwner !== window.univerAPI), true)
          assert.equal(await page.locator(item.root).count(), 1)
          if (sectionBreaks) {
            const fresh = await save()
            await fs.writeFile(
              path.join(resultDirectory, lang + '-remounted-model.json'),
              JSON.stringify(fresh, null, 2),
            )
            assert.deepEqual(fresh.documentStyle, initial.documentStyle)
            assert.equal(
              fresh.body.dataStream,
              initial.body.dataStream,
              'Fresh remount restores all original text and break tokens',
            )
            assert.deepEqual(
              fresh.body.sectionBreaks.map(({ startIndex, sectionType }) => ({ startIndex, sectionType })),
              initial.body.sectionBreaks.map(({ startIndex, sectionType }) => ({ startIndex, sectionType })),
              'Fresh remount restores section boundaries/types, not old generated section identities',
            )
          } else if (clipboardAndFormulas) {
            const fresh = await save()
            await fs.writeFile(
              path.join(resultDirectory, lang + '-remounted-model.json'),
              JSON.stringify(fresh, null, 2),
            )
            assert.deepEqual(
              fresh,
              initial,
              'Fresh creation restores the complete original calculated or clipboard specimen',
            )
          } else if (sparklinesAndAttachments) {
            const fresh = await save()
            await fs.writeFile(
              path.join(resultDirectory, lang + '-remounted-model.json'),
              JSON.stringify(fresh, null, 2),
            )
            if (item.kind === 'attachment') {
              assert.deepEqual(fresh, initial, 'Fresh Base restores all original records and attachment descriptors')
            } else {
              assert.deepEqual(
                fresh.sheets,
                initial.sheets,
                'Fresh workbook restores the original sparkline source cells',
              )
              const groups = await page.evaluate(() => {
                const book = window.univerAPI.getWorkbook('workshop-sparklines')
                return ['line', 'column', 'winloss'].map((id) => {
                  const sheet = book.getSheetBySheetId(id)
                  return [...sheet.getAllSubSparkline().values()].map((group) => group.config.type)
                })
              })
              assert.ok(groups.every((types) => types.length === 6 && types.every((type) => type != null)))
              assert.ok(groups.every((types) => types.every((type) => type === types[0])))
              assert.equal(
                new Set(groups.map((types) => types[0])).size,
                3,
                'Fresh remount restores three native plot types',
              )
            }
            // Fresh creation is separate from restoring an edited saved snapshot or its generated identities.
          } else if (tablesAndStickies) {
            const fresh = await save()
            await fs.writeFile(
              path.join(resultDirectory, lang + '-remounted-model.json'),
              JSON.stringify(fresh, null, 2),
            )
            if (item.kind === 'table') {
              assert.deepEqual(fresh.sheets, initial.sheets, 'Fresh table workbook restores original cells')
              assert.deepEqual(
                await page.evaluate(() => {
                  const book = window.univerAPI.getWorkbook('studio-table-ranges')
                  return ['expand', 'shrink', 'create'].map(
                    (id) => book.getSheetBySheetId(id).getSubTableInfos().length,
                  )
                }),
                [1, 1, 0],
              )
              assert.equal(
                await page.evaluate(
                  () =>
                    !!window.univerAPI
                      .getWorkbook('studio-table-ranges')
                      .getSheetBySheetId('expand')
                      .getTableByCell(9, 0),
                ),
                false,
              )
            } else {
              assert.deepEqual(fresh.pageOrder, initial.pageOrder)
              assert.deepEqual(fresh.pages.gallery.elementOrder, initial.pages.gallery.elementOrder)
              assert.equal(
                await page.evaluate(() =>
                  window.univerAPI.getActiveBoard().getShape('yellow').getText().getPlainText(),
                ),
                'One idea\nKeep it short.',
              )
            }
            // Fresh creation checks authored content/ownership, not saved-state reconstruction.
          } else if (referencesAndNavigation) {
            const fresh = await save()
            await fs.writeFile(
              path.join(resultDirectory, lang + '-remounted-model.json'),
              JSON.stringify(fresh, null, 2),
            )
            if (item.kind === 'pdf') {
              // Fresh creation is not snapshot restoration: creation/patch times must advance.
              // Same-owner theme checks above still compare the entire raw snapshot exactly.
              const { editState: freshState, ...freshDocument } = fresh
              const { editState: initialState, ...initialDocument } = initial
              assert.deepEqual(freshDocument, initialDocument)
              const { overlayObjects, objectPatches, ...freshRest } = freshState
              const { overlayObjects: oldObjects, objectPatches: oldPatches, ...initialRest } = initialState
              assert.deepEqual(freshRest, initialRest)
              assert.deepEqual(Object.keys(overlayObjects), Object.keys(oldObjects))
              for (const [id, { createdAt, ...object }] of Object.entries(overlayObjects)) {
                const { createdAt: oldTime, ...oldObject } = oldObjects[id]
                assert.ok(createdAt > oldTime, 'New object has a new creation time')
                assert.deepEqual(object, oldObject, id)
              }
              assert.deepEqual(Object.keys(objectPatches), Object.keys(oldPatches))
              for (const [id, { updatedAt, ...patch }] of Object.entries(objectPatches)) {
                const { updatedAt: oldTime, ...oldPatch } = oldPatches[id]
                assert.ok(updatedAt > oldTime, 'New styling has a new patch time')
                assert.deepEqual(patch, oldPatch, id)
              }
              result.gates.freshPdfContentWithNewCreationTimes = true
            } else {
              assert.deepEqual(fresh.sheets, initial.sheets, 'Fresh workbook reproduces original cells and formulas')
              if (item.kind === 'messages') {
                // This is a new owner, not restoration of the old generated rule identities.
                assert.deepEqual(
                  await page.evaluate(() =>
                    ['reject', 'warning', 'default'].map(
                      (id) =>
                        window.univerAPI
                          .getWorkbook('crate-validation-messages')
                          .getSheetBySheetId(id)
                          .getDataValidations().length,
                    ),
                  ),
                  [1, 1, 1],
                )
              }
            }
          } else if (item.kind === 'sheet') {
            assert.equal(
              await page.evaluate(() =>
                window.univerAPI
                  .getWorkbook('validation-boundaries')
                  .getSheetBySheetId('numbers')
                  .getRange('B4')
                  .getRawValue(),
              ),
              1,
            )
            assert.equal(
              await page.evaluate(
                () =>
                  window.univerAPI
                    .getWorkbook('validation-boundaries')
                    .getSheetBySheetId('numbers')
                    .getDataValidations().length,
              ),
              3,
            )
          } else if (item.kind === 'base')
            assert.deepEqual(
              await page.evaluate(() =>
                window.univerAPI
                  .getBase('equipment-record-links')
                  .getTableById('requests')
                  .getRecordById('training')
                  .getLinkedRecordIds('primary'),
              ),
              [],
            )
          else if (item.kind === 'conditional') {
            assert.equal(
              await page.evaluate(() =>
                window.univerAPI
                  .getWorkbook('seed-library-conditional-rules')
                  .getSheetBySheetId('numbers')
                  .getRange('B6')
                  .getRawValue(),
              ),
              4,
            )
            const fresh = await save()
            await fs.writeFile(
              path.join(resultDirectory, lang + '-remounted-model.json'),
              JSON.stringify(fresh, null, 2),
            )
            assert.deepEqual(fresh.sheets, initial.sheets)
            // Fresh creation is not snapshot restoration: builders mint new rule IDs.
            // Check each complete rule and range, and require new identities explicitly.
            const beforeRules = conditionalRules(initial)
            const freshRules = conditionalRules(fresh)
            assert.deepEqual(Object.keys(freshRules), Object.keys(beforeRules))
            for (const id of Object.keys(beforeRules)) {
              assert.equal(freshRules[id].length, beforeRules[id].length)
              for (const [ruleIndex, rule] of freshRules[id].entries()) {
                const previous = beforeRules[id][ruleIndex]
                assert.deepEqual(rule.rule, previous.rule)
                assert.deepEqual(rule.ranges, previous.ranges)
                assert.equal(rule.stopIfTrue, previous.stopIfTrue)
                assert.notEqual(rule.cfId, previous.cfId)
              }
            }
          } else {
            const restored = await page.evaluate(() => {
              const board = window.univerAPI.getActiveBoard()
              return [
                board.getElement('unequal').containerData.swimlane.lanes.find((lane) => lane.id === 'review').collapsed,
                board.getElement('horizontal').containerData.swimlane.lanes.find((lane) => lane.id === 'review').title,
              ]
            })
            assert.deepEqual(restored, [true, 'Review'])
          }
          result.gates.freshPreviewRemount = true
          await page.screenshot({ path: path.join(resultDirectory, lang + '-remounted.png') })
          await page.evaluate(() => window.probe.unmount())
          await page.waitForFunction(() => !window.univerAPI && document.querySelectorAll('canvas').length === 0)
          assert.deepEqual(result.errors, [])
          assert.deepEqual(result.writes, [])
          result.passed = true
        } catch (error) {
          result.failure = error.stack || String(error)
          await page.screenshot({ path: path.join(resultDirectory, lang + '-failure.png') }).catch(() => {})
        } finally {
          await page.close()
          await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2))
        }
        console.log(item.slug, lang, result.passed ? 'PASS' : result.failure)
      }
    } finally {
      await new Promise((resolve) => server.httpServer.close(resolve))
    }
  }
} finally {
  await browser.close()
}
assert.ok(report.results.length === cases.length * 2 && report.results.every(({ passed }) => passed))
