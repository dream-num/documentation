/* eslint-disable no-await-in-loop -- Check one selected drawing and its native history at a time. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import { ASSETS } from '../showcase/sheets/images/code/data.ts'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/sheets/images'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/images')
const observe = process.env.SHOWCASE_OBSERVE_KNOWN_DEFECTS === '1'
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
const report = { passed: false, errors: [], failures: [], checks: [], networkWrites: [], knownSDKDefects: [] }
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
page.on('request', (request) => {
  if (!['GET', 'HEAD'].includes(request.method()))
    report.networkWrites.push({
      url: request.url(),
      method: request.method(),
      nextAction: !!request.headers()['next-action'],
      frame: request.frame().url(),
    })
})
const root = page.locator('.sheet-images-demo')
const ready = () => page.locator('.sheet-images-demo[data-ready="true"][data-busy="false"]').waitFor({ timeout: 90000 })
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const read = async () => JSON.parse(await root.locator('pre').textContent())
const selected = (state) => state.drawings?.inventory?.data?.[state.hostFloatingTarget]
const layout = (state) => state.layout.drawings.find((drawing) => drawing.drawingId === state.hostFloatingTarget)
const check = async (name, fn) => {
  try {
    await fn()
    report.checks.push(name)
  } catch (error) {
    report.failures.push({ name, error: error.stack || String(error) })
  }
}
async function css() {
  const styles = await root.locator('[data-u-comp="workbench-layout"]').evaluate((el) => ({
    background: getComputedStyle(el).backgroundColor,
    white: getComputedStyle(el).getPropertyValue('--univer-gray-0').trim(),
    display: getComputedStyle(el.querySelector('.univer-flex')).display,
  }))
  if ((await root.getAttribute('data-theme')) === 'light') assert.equal(styles.background, 'rgb(255, 255, 255)')
  assert.equal(styles.display, 'flex')
  assert.ok(styles.white)
}
async function action(name) {
  await root.locator(`[data-action="${name}"]`).click()
  await ready()
  await settle()
  await css()
  assert.doesNotMatch(await root.getByRole('status').textContent(), /Action failed/)
}
async function variant(name) {
  await root.getByRole('combobox', { name: 'Image variant', exact: true }).selectOption(name)
  await settle()
  await action('apply')
}
async function choose(index) {
  const items = (await read()).layout.drawings
  await root.getByRole('combobox', { name: 'Floating target', exact: true }).selectOption(items[index].drawingId)
  await settle()
}
async function colors() {
  return root.locator('canvas[id^="univer-sheet-main-canvas"]:visible').evaluate((canvas) => {
    const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
    const counts = { teal: 0, purple: 0, amber: 0 }
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] === 15 && data[i + 1] === 118 && data[i + 2] === 110 && data[i + 3] === 255) counts.teal++
      if (data[i] === 126 && data[i + 1] === 34 && data[i + 2] === 206 && data[i + 3] === 255) counts.purple++
      if (data[i] === 180 && data[i + 1] === 83 && data[i + 2] === 9 && data[i + 3] === 255) counts.amber++
    }
    return counts
  })
}
try {
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  await ready()
  await settle()
  const initial = await read()
  await check('Three distinct cell/floating sources, native white workbench and painted assets', async () => {
    assert.equal(initial.layout.drawings.length, 3)
    assert.deepEqual(
      initial.cells.map((row) => Object.values(row[0].p.drawings)[0].source.asset),
      ['route', 'sensor', 'tag'],
    )
    assert.deepEqual(
      initial.cells.map((row) => row[3].v),
      [12, 0, 8],
    )
    await css()
    report.initialPaint = await colors()
    assert.ok(Object.values(report.initialPaint).every((count) => count > 500))
    await root.screenshot({ path: path.join(directory, 'initial.png') })
  })
  for (const [name, validate] of [
    [
      'square',
      (s) => {
        assert.equal(layout(s).bounds.width, 120)
        assert.equal(layout(s).bounds.height, 120)
      },
    ],
    ['crop', (s) => assert.deepEqual(selected(s).srcRect, { top: 20, left: 20, bottom: 20, right: 20 })],
    ['rotate', (s) => assert.equal(selected(s).transform.angle, 30)],
    [
      'move',
      (s) => {
        assert.equal(layout(s).placement.from.row, 3)
        assert.equal(layout(s).placement.from.column, 4)
      },
    ],
  ])
    await check(`${name}: actual transform, native canvas change and Undo/Redo`, async () => {
      await action('reset')
      await choose(name === 'move' ? 1 : 0) // Align the viewport before comparing native pixels.
      const before = await read(),
        beforeModel = structuredClone(selected(before))
      const canvas = root.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
      const beforePaint = await canvas.screenshot()
      await variant(name)
      validate(await read())
      assert.notDeepEqual(await canvas.screenshot(), beforePaint, 'Native canvas must change')
      await root.screenshot({ path: path.join(directory, `${name}.png`) })
      const after = structuredClone(selected(await read()))
      await action('undo')
      const undone = selected(await read())
      assert.deepEqual(undone.srcRect ?? null, beforeModel.srcRect ?? null, 'Undo crop')
      assert.deepEqual(undone.transform, beforeModel.transform, 'Undo transform')
      await action('redo')
      assert.deepEqual(selected(await read()), after, 'Redo exact image data')
      assert.deepEqual((await read()).reference, before.reference)
    })
  await check('Reset crop/rotation and explicit fit; source replacement with native history', async () => {
    await action('reset')
    await variant('crop')
    await variant('uncrop')
    assert.deepEqual(selected(await read()).srcRect, { top: 0, left: 0, bottom: 0, right: 0 })
    await variant('rotate')
    await variant('upright')
    await variant('fit')
    assert.equal(selected(await read()).transform.angle, 0)
    assert.equal(layout(await read()).bounds.width, 240)
    await root.getByRole('combobox', { name: 'Image source', exact: true }).selectOption('tag')
    await action('replace')
    assert.equal(selected(await read()).source.asset, 'tag')
    await action('undo')
    assert.equal(selected(await read()).source.asset, 'route')
    await action('redo')
    assert.equal(selected(await read()).source.asset, 'tag')
  })
  await check('Four layer operations, overlapping native paint, and boundary no-op', async () => {
    await action('reset')
    const id = (await read()).hostFloatingTarget
    const order = () => read().then((s) => s.layout.drawings.map((item) => item.drawingId))
    const start = await order()
    const basePaint = await colors()
    await variant('forward')
    assert.deepEqual(await order(), [start[1], id, start[2]])
    assert.ok((await colors()).teal > basePaint.teal, 'Front route paints over the overlapping badge')
    await variant('backward')
    assert.deepEqual(await order(), start)
    await variant('front')
    assert.equal((await order()).at(-1), id)
    await variant('front')
    assert.equal((await order()).at(-1), id)
    await variant('back')
    assert.equal((await order())[0], id)
  })
  for (const [mode, kind] of [
    ['position', '0'],
    ['both', '1'],
    ['absolute', '2'],
  ])
    await check(`${mode}: placement and row-height behavior`, async () => {
      await action('reset')
      await choose(1)
      await variant(mode)
      const before = layout(await read())
      assert.equal(before.placement.kind, kind)
      await variant('taller')
      const after = layout(await read())
      if (mode === 'both') assert.ok(after.bounds.height > before.bounds.height)
      else assert.deepEqual(after.bounds, before.bounds)
      await variant('shorter')
      assert.equal((await read()).row6.h, 90)
      await action('undo')
      assert.equal((await read()).row6.h, 150)
    })
  await check('Absolute placement remains fixed after switching native sheets', async () => {
    await action('reset')
    await choose(1)
    await variant('absolute')
    const before = layout(await read())
    await root.getByText('Reference', { exact: true }).click()
    await settle()
    assert.equal((await read()).activeSheet, 'Reference')
    await root.getByText('Field inventory', { exact: true }).click()
    await settle()
    await action('inspect') // SDK renderer callbacks can mutate data without emitting a command event.
    const after = layout(await read())
    report.absoluteReactivation = { before, after }
    assert.deepEqual(after.bounds, before.bounds, 'Native sheet reactivation must preserve fixed image bounds')
  })
  await check('Absolute placement snapshot round trip (known beta.2 limitation)', async () => {
    await action('reset')
    await choose(1)
    await variant('absolute')
    const before = layout(await read())
    await action('reload')
    await action('inspect')
    const after = (await read()).layout.drawings.find((entry) => entry.drawingId === before.drawingId)
    report.absoluteReload = { before, after }
    if (observe) {
      assert.deepEqual(
        after.bounds,
        { ...before.bounds, left: before.bounds.left + 46, top: before.bounds.top + 20 },
        'Observe only the reproduced row/column-header offset defect',
      )
      report.knownSDKDefects.push(
        'Absolute placement reload adds 46px left and 20px top on this beta.2 fixture; fixed-position round trip is NOT certified.',
      )
    } else assert.deepEqual(after.bounds, before.bounds, 'Reload must preserve absolute image bounds')
  })
  await check('Top-left cell insertion, last-cell boundary, clear and native image download', async () => {
    await action('reset')
    const baseline = await read()
    await root.getByRole('combobox', { name: 'Cell target', exact: true }).selectOption('A4:B5')
    await root.getByRole('combobox', { name: 'Image source', exact: true }).selectOption('sensor')
    await action('cell')
    const after = await read()
    assert.equal(Object.values(after.cells[0][0].p.drawings)[0].source.asset, 'sensor')
    assert.deepEqual(after.cells[0].slice(1), baseline.cells[0].slice(1))
    assert.deepEqual(after.cells.slice(1), baseline.cells.slice(1))
    const downloading = page.waitForEvent('download')
    await action('save-cell')
    assert.match(await root.getByRole('status').textContent(), /not converted to PNG/)
    assert.match(await root.locator('[data-action="save-cell"]').textContent(), /format caveat/)
    const download = await downloading
    await download.saveAs(path.join(directory, download.suggestedFilename()))
    const bytes = await fs.readFile(await download.path())
    assert.deepEqual(
      bytes,
      Buffer.from(ASSETS[1].source.split(',')[1], 'base64'),
      'Native download retains the exact original image bytes',
    )
    report.cellDownload = { filename: download.suggestedFilename(), actualFormat: 'SVG', originalBytesPreserved: true }
    await action('clear-cell')
    assert.equal((await read()).cells[0][0]?.p ?? null, null)
    await action('save-cell')
    assert.match(await root.getByRole('status').textContent(), /false/)
    await action('undo')
    assert.equal(Object.values((await read()).cells[0][0].p.drawings)[0].source.asset, 'sensor')
    await root.getByRole('combobox', { name: 'Cell target', exact: true }).selectOption('L36')
    await action('cell')
    assert.ok((await read()).targetCell[0][0].p.drawings)
    assert.equal((await read()).layout.drawings.length, 3)
  })
  await check('Native SVG data-URL download has a matching extension (known beta.2 limitation)', async () => {
    assert.ok(report.cellDownload?.originalBytesPreserved)
    if (observe) {
      assert.equal(report.cellDownload.filename, 'A4.png')
      report.knownSDKDefects.push(
        'Native SVG data-URL cell download preserves SVG bytes but names the file A4.png; it does not convert to PNG.',
      )
    } else assert.match(report.cellDownload.filename, /\.svg$/, 'Original SVG bytes need a matching file extension')
  })
  await check('Native drawing drag produces real location and selection readback', async () => {
    await action('reset')
    const before = (await read()).layout.drawings[0]
    const canvas = root.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
    const box = await canvas.boundingBox()
    // Initial atCell scrolls to row 4; this point is inside the unobstructed route picture.
    await page.mouse.move(box.x + 600, box.y + 70)
    await page.mouse.down()
    await page.mouse.move(box.x + 640, box.y + 100, { steps: 8 })
    await page.mouse.up()
    await settle()
    const after = await read()
    assert.ok(after.nativeSelectedImages.includes(before.drawingId))
    assert.notDeepEqual(after.layout.drawings.find((item) => item.drawingId === before.drawingId).bounds, before.bounds)
  })
  await check('PNG/JPEG staging, same-file selection, invalid input preservation and snapshot reload', async () => {
    await action('reset')
    for (const mime of ['image/png', 'image/jpeg']) {
      const data = await page.evaluate((type) => {
        const canvas = document.createElement('canvas')
        canvas.width = 80
        canvas.height = 48
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#e11d48'
        ctx.fillRect(0, 0, 80, 48)
        ctx.fillStyle = '#fff'
        ctx.fillRect(10, 10, 20, 20)
        return canvas.toDataURL(type).split(',')[1]
      }, mime)
      const buffer = Buffer.from(data, 'base64'),
        before = await read()
      const upload = { name: mime === 'image/png' ? 'local-fixture.png' : 'local-fixture.jpg', mimeType: mime, buffer }
      for (let i = 0; i < 2; i++) {
        await root.getByLabel('Local image', { exact: true }).setInputFiles(upload)
        await ready()
        await settle()
      }
      assert.deepEqual((await read()).drawings, before.drawings, 'Staging changes no workbook')
      await action('insert')
      assert.equal((await read()).layout.drawings.length, before.layout.drawings.length + 1)
      assert.equal(selected(await read()).source.embedded, true)
    }
    const before = await read(),
      priorSource = await root.getByLabel('Image source', { exact: true }).inputValue()
    const widePng = await page.evaluate(() => {
      const canvas = document.createElement('canvas')
      canvas.width = 4097
      canvas.height = 1
      return canvas.toDataURL('image/png').split(',')[1]
    })
    for (const upload of [
      { name: 'wrong.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') },
      { name: 'empty.png', mimeType: 'image/png', buffer: Buffer.alloc(0) },
      { name: 'bad.png', mimeType: 'image/png', buffer: Buffer.from('not png') },
      { name: 'corrupt.png', mimeType: 'image/png', buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]) },
      { name: 'wide.png', mimeType: 'image/png', buffer: Buffer.from(widePng, 'base64') },
      { name: 'huge.png', mimeType: 'image/png', buffer: Buffer.alloc(2 * 1024 * 1024 + 1) },
    ]) {
      await root.getByLabel('Local image', { exact: true }).setInputFiles(upload)
      await ready()
      await settle()
      assert.match(await root.getByRole('status').textContent(), /Action failed/)
      assert.deepEqual((await read()).drawings, before.drawings)
      assert.equal(await root.getByLabel('Image source', { exact: true }).inputValue(), priorSource)
    }
    await root.getByLabel('Local image', { exact: true }).dispatchEvent('cancel')
    assert.match(await root.getByRole('status').textContent(), /cancelled/)
    const downloading = page.waitForEvent('download')
    await action('download')
    const download = await downloading
    const data = JSON.parse(await fs.readFile(await download.path(), 'utf8'))
    await download.saveAs(path.join(directory, 'snapshot.json'))
    assert.ok(
      JSON.parse(data.resources.find((item) => item.name === 'SHEET_DRAWING_PLUGIN').data).inventory.order.length === 5,
    )
    await action('reload')
    assert.deepEqual((await read()).layout, before.layout)
    assert.deepEqual((await read()).cells, before.cells)
    await action('remove')
    assert.equal((await read()).layout.drawings.length, 4)
    await action('undo')
    assert.equal((await read()).layout.drawings.length, 5)
  })
  await check('Empty, reinsert, three resets, keyboard action and 760/390/320 widths', async () => {
    await action('empty')
    assert.equal((await read()).layout.drawings.length, 0)
    assert.equal(await root.locator('[data-action="remove"]').isDisabled(), true)
    await action('insert')
    assert.equal((await read()).layout.drawings.length, 1)
    await action('cell')
    assert.ok((await read()).targetCell[0][0].p.drawings)
    for (let i = 0; i < 3; i++) {
      await action('reset')
      assert.equal((await read()).layout.drawings.length, 3)
    }
    await root.locator('[data-action="insert"]').focus()
    await page.keyboard.press('Enter')
    await ready()
    await settle()
    assert.equal((await read()).layout.drawings.length, 4)
    for (const width of [760, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 })
      await settle()
      const bounds = await root.boundingBox()
      const overflow = await root.evaluate((el) => el.scrollWidth - el.clientWidth)
      assert.ok(overflow <= 1, `Host does not overflow at ${width}: ${overflow}`)
      assert.ok(bounds.width <= width)
      await root.screenshot({ path: path.join(directory, `width-${width}.png`) })
    }
    await page.reload()
    await ready()
    assert.equal(await root.locator('.images-controls').getAttribute('open'), null)
    assert.ok((await root.locator('canvas[id^="univer-sheet-main-canvas"]:visible').boundingBox()).y < 420)
    await root.locator('.images-controls > summary').click()
    const portrait = (await read()).layout.drawings[2].drawingId
    await root.getByLabel('Floating target', { exact: true }).selectOption(portrait)
    await settle()
    assert.equal((await read()).viewport.startColumn, 8, 'Narrow-screen target reveals its native column')
    await root.screenshot({ path: path.join(directory, 'mobile-portrait.png') })
  })
  if (url.includes('/playground/'))
    await check('Light/dark recreation, EN/ZH guides, hydrated tree and live iframe variant', async () => {
      await page.setViewportSize({ width: 1440, height: 1100 })
      for (const theme of ['dark', 'light']) {
        await page.emulateMedia({ colorScheme: theme })
        await page.locator(`.sheet-images-demo[data-theme="${theme}"][data-ready="true"][data-busy="false"]`).waitFor()
        await variant('crop')
        assert.equal(selected(await read()).srcRect.left, 20)
        await root.screenshot({ path: path.join(directory, `theme-${theme}.png`) })
      }
      for (const [locale, title, headings] of [
        ['en-US', 'Cell and floating images', ['Variants', 'Actions', 'States']],
        ['zh-CN', '单元格与浮动图片', ['变体', '操作', '状态']],
      ]) {
        await page.goto(`${new URL(url).origin}/${locale}/showcase/sheets/images`, {
          waitUntil: 'domcontentloaded',
          timeout: 180000,
        })
        await page.getByRole('heading', { name: title, level: 1, exact: true }).waitFor()
        for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
        await page.locator('iframe').first().scrollIntoViewIfNeeded()
        const embedded = page.frameLocator('iframe').first()
        await embedded.locator('.sheet-images-demo[data-ready="true"][data-busy="false"]').waitFor()
        await embedded.getByLabel('Image variant', { exact: true }).selectOption('crop')
        await embedded.locator('[data-action="apply"]').click()
        const frame = page.frames().find((entry) => entry.url().includes('/playground/'))
        await frame.waitForFunction(() => {
          const demoRoot = document.querySelector('.sheet-images-demo'),
            state = JSON.parse(demoRoot.querySelector('pre').textContent)
          return (
            demoRoot.dataset.busy === 'false' &&
            state.drawings.inventory.data[state.hostFloatingTarget].srcRect.left === 20
          )
        })
        const branch = page.locator('aside button').first()
        await branch.click()
        await page.waitForFunction(
          () => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'false',
        )
        await branch.click()
        await page.waitForFunction(
          () => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'true',
        )
      }
    })
  report.passed =
    !report.failures.length &&
    !report.errors.length &&
    !report.networkWrites.some((item) => !item.nextAction || !item.frame.includes('/showcase/'))
} catch (error) {
  report.failures.push({ name: 'setup', error: error.stack || String(error) })
} finally {
  report.status = report.passed
    ? report.knownSDKDefects.length
      ? 'passed-with-known-sdk-defects'
      : 'passed'
    : 'failed'
  await page.screenshot({ path: path.join(directory, 'final.png') }).catch(() => {})
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
}
assert.equal(report.passed, true, 'Images must pass actual SDK state, paint, errors and file checks')
