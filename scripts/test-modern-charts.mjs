/* eslint-disable no-await-in-loop -- Exercise chart mutations and exports on the same live document. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/docs-modern/charts-in-documents'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/modern-charts')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch(),
  page = await browser.newPage({ viewport: { width: 1600, height: 1400 }, colorScheme: 'light' })
const errors = [],
  results = []
const observe = process.env.SHOWCASE_OBSERVE_KNOWN_DEFECTS === '1'
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
const chart = (state) => state.charts[0]
const independent = (state) => ({
  tables: state.tables,
  columns: state.columns.map(({ config, ...column }) => {
    const { startIndex: _start, endIndex: _end, ...format } = config
    return { ...column, config: format }
  }),
  images: state.images.map((image) => ({
    id: image.drawingId,
    source: image.source,
    title: image.title,
    description: image.description,
    size: image.docTransform.size,
  })),
})
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 300000 })
  const root = page.locator('.charts-demo')
  await page.locator('.charts-demo[data-ready=true]').waitFor({ timeout: 120000 })
  const read = async () => JSON.parse(await root.locator('output').textContent())
  const click = async (name, expectedError) => {
    await root.getByRole('button', { name, exact: true }).click()
    await page.waitForFunction(() => document.querySelector('.charts-demo fieldset')?.disabled === false)
    const alert = root.locator('[role=alert]')
    if (expectedError) {
      assert.equal(await alert.isVisible(), true)
      assert.match(await alert.textContent(), expectedError)
    } else assert.equal(await alert.isVisible(), false, await alert.textContent())
    return read()
  }
  const select = (name, value) => root.getByRole('combobox', { name, exact: true }).selectOption(value)
  const waitForRender = async (predicate) => {
    let current = await read()
    for (let attempt = 0; attempt < 30 && !predicate(chart(current).renderSpec); attempt++) {
      await page.waitForTimeout(100)
      current = await click('Inspect')
    }
    assert.ok(
      predicate(chart(current).renderSpec),
      'The actual chart render specification must settle to the requested variant',
    )
    return current
  }
  const fill = (name, value) => root.getByRole('spinbutton', { name, exact: true }).fill(String(value))
  const capture = (name) => root.screenshot({ path: path.join(directory, `${name}.png`) })
  await page.waitForTimeout(800)
  const baseline = await click('Inspect'),
    content = independent(baseline)
  assert.equal(baseline.charts.length, 1)
  assert.deepEqual(chart(baseline).totals, [162, 73])
  assert.equal(chart(baseline).checksum, 235)
  assert.deepEqual(
    chart(baseline).renderSpec.series.map((series) => series.data),
    [
      [42, 57, 63],
      [18, 24, 31],
    ],
  )
  assert.ok(chart(baseline).anchor)
  assert.ok(chart(baseline).rendered?.visible)
  await fs.writeFile(path.join(directory, 'baseline.json'), JSON.stringify(baseline, null, 2))
  await capture('initial')
  assert.equal((await click('Insert chart')).charts.length, 1)
  let state = await click('Update month')
  assert.deepEqual(chart(state).totals, [176, 73])
  assert.equal(chart(state).checksum, 249)
  assert.deepEqual(chart(state).anchor, chart(baseline).anchor)
  assert.deepEqual(independent(state), content)
  assert.deepEqual(
    chart(state).renderSpec.series.map((series) => series.data),
    [
      [42, 71, 63],
      [18, 24, 31],
    ],
  )
  await fs.writeFile(path.join(directory, 'corrected.json'), JSON.stringify(state, null, 2))
  state = await click('Undo')
  assert.deepEqual(chart(state).totals, [162, 73])
  assert.deepEqual(
    chart(state).renderSpec.series.map((series) => series.data),
    [
      [42, 57, 63],
      [18, 24, 31],
    ],
  )
  state = await click('Redo')
  assert.deepEqual(chart(state).totals, [176, 73])
  assert.deepEqual(
    chart(state).renderSpec.series.map((series) => series.data),
    [
      [42, 71, 63],
      [18, 24, 31],
    ],
  )
  await fill('Repairs', -1)
  await click('Update month', /Repairs must/)
  await fill('Repairs', 71)
  await select('Series', 'repairs')
  await click('Apply series')
  for (const type of ['line', 'area', 'bar', 'columnStacked', 'pie', 'donut', 'column']) {
    await select('Series', type === 'columnStacked' ? 'all' : 'repairs')
    await click('Apply series')
    await select('Chart type', type)
    state = await click('Apply type')
    assert.equal(chart(state).type, type)
    assert.deepEqual(chart(state).totals, [176, 73])
    assert.deepEqual(chart(state).anchor, chart(baseline).anchor)
    assert.deepEqual(independent(state), content)
    const spec = chart(state).renderSpec
    if (type === 'line' || type === 'area') {
      assert.equal(spec.series[0].type, 'line')
      assert.equal(Boolean(spec.series[0].areaStyle), type === 'area')
    } else if (type === 'pie' || type === 'donut') {
      assert.equal(spec.series[0].type, 'pie')
      assert.equal(Array.isArray(spec.series[0].radius), type === 'donut')
      assert.deepEqual(
        spec.series[0].data.map((item) => item.value),
        [42, 71, 63],
      )
    } else {
      assert.equal(spec.series[0].type, 'bar')
      assert.equal(spec.xAxis[0].type, type === 'bar' ? 'value' : 'category')
      if (type === 'columnStacked') {
        assert.equal(spec.series.length, 2)
        assert.ok(spec.series.every((series) => series.stack === 'total'))
      }
    }
    await click('Show chart')
    await capture(type)
    results.push({ type, renderSpec: chart(state).renderSpec })
  }
  for (const series of ['workshops', 'all', 'repairs']) {
    await select('Series', series)
    state = await click('Apply series')
    const expectedNames =
      series === 'all' ? ['Repairs', 'Workshops'] : series === 'repairs' ? ['Repairs'] : ['Workshops']
    state = await waitForRender(
      (spec) => JSON.stringify(spec.series.map((item) => item.name)) === JSON.stringify(expectedNames),
    )
    assert.deepEqual(
      chart(state).renderSpec.series.map((item) => item.name),
      series === 'all' ? ['Repairs', 'Workshops'] : series === 'repairs' ? ['Repairs'] : ['Workshops'],
    )
    results.push({ series, renderSpec: chart(state).renderSpec })
  }
  await select('Series', 'all')
  await click('Apply series')
  await select('Dataset', 'pause')
  state = await click('Load dataset')
  assert.deepEqual(chart(state).info.dataSource.values[2], ['May', 0, 34])
  assert.deepEqual(chart(state).totals, [156, 102])
  await select('Dataset', 'quarter')
  await click('Load dataset')
  await select('Dataset', 'corrected')
  state = await click('Load dataset')
  assert.equal(chart(state).checksum, 249)
  await root.getByRole('textbox', { name: 'Title', exact: true }).fill('Saffron corrected quarter')
  state = await click('Set title')
  assert.match(JSON.stringify(chart(state).renderSpec), /Saffron corrected quarter/)
  for (const legend of ['right', 'hidden', 'bottom']) {
    await select('Legend', legend)
    state = await click('Apply legend')
    assert.equal(chart(state).renderSpec.legend.show, legend !== 'hidden')
    if (legend !== 'hidden')
      assert.equal(chart(state).renderSpec.legend.orient, legend === 'right' ? 'vertical' : 'horizontal')
    results.push({ legend, renderSpec: chart(state).renderSpec })
  }
  await select('Palette', 'violet')
  state = await click('Apply palette')
  assert.match(JSON.stringify(chart(state).renderSpec).toLowerCase(), /#7c3aed/)
  await fill('Width', 480)
  await fill('Height', 260)
  if (process.env.SHOWCASE_CHART_RESIZE_API === 'facade') await select('Resize API', 'facade')
  state = await click('Resize')
  assert.deepEqual(chart(state).info.size, { width: 480, height: 260 })
  for (let attempt = 0; attempt < 30 && chart(state).rendered.width !== 480; attempt++) {
    await page.waitForTimeout(100)
    state = await click('Inspect')
  }
  if (observe && chart(state).rendered.width !== 480) {
    assert.equal(chart(state).rendered.width, 560)
    assert.equal(chart(state).rendered.height, 300)
    assert.equal(chart(state).rendered.scaleX, 1)
    assert.equal(chart(state).rendered.scaleY, 1)
    assert.equal(state.layout[0].drawings.find((d) => d.id === chart(state).drawingId).width, 480)
    results.push({ knownGap: 'native frame remains 560x300 after model/skeleton resize to 480x260' })
  } else {
    assert.equal(chart(state).rendered.width, 480)
    assert.equal(chart(state).rendered.height, 260)
  }
  if (process.env.SHOWCASE_CHART_RESIZE_API !== 'facade') {
    state = await click('Undo')
    assert.deepEqual(chart(state).info.size, { width: 560, height: 300 })
    for (let attempt = 0; attempt < 30 && chart(state).rendered.width !== 560; attempt++) {
      await page.waitForTimeout(100)
      state = await click('Inspect')
    }
    if (observe && chart(state).rendered.width !== 560) {
      assert.equal(chart(state).rendered.width, 480)
      assert.equal(chart(state).rendered.height, 260)
      assert.equal(chart(state).rendered.scaleX, 1)
      assert.equal(state.layout[0].drawings.find((d) => d.id === chart(state).drawingId).width, 560)
      results.push({ knownGap: 'drawing-size Undo restores model/skeleton to 560x300 but frame retains 480x260' })
    } else assert.equal(chart(state).rendered.width, 560)
    state = await click('Redo')
    assert.deepEqual(chart(state).info.size, { width: 480, height: 260 })
    assert.equal(chart(state).rendered.width, 480)
  }
  await fill('Height', 0)
  await click('Resize', /Height must/)
  await fill('Height', 260)
  const downloadPromise = page.waitForEvent('download')
  await click('Export PNG')
  const download = await downloadPromise,
    pngPath = path.join(directory, 'exported-chart.png')
  assert.equal(download.suggestedFilename(), 'saffron-repair-chart.png')
  await download.saveAs(pngPath)
  const png = await fs.readFile(pngPath)
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
  assert.ok(png.length > 1000)
  assert.ok(png.readUInt32BE(16) >= 480)
  assert.equal(png.readUInt32BE(16) / png.readUInt32BE(20), 480 / 260)
  const colors = await page.evaluate(async (base64) => {
    const image = new Image()
    image.src = 'data:image/png;base64,' + base64
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas unavailable for PNG verification')
    context.drawImage(image, 0, 0)
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
    let violet = 0,
      blue = 0
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] === 124 && data[i + 1] === 58 && data[i + 2] === 237) violet++
      if (data[i] === 37 && data[i + 1] === 99 && data[i + 2] === 235) blue++
    }
    return { violet, blue }
  }, png.toString('base64'))
  assert.ok(
    colors.violet > 1000 && colors.blue > 1000,
    'PNG must contain the two selected series colors, not a blank image',
  )
  results.push({ export: { bytes: png.length, width: png.readUInt32BE(16), height: png.readUInt32BE(20) } })
  state = await click('Insert note before chart')
  assert.equal(chart(state).anchor.id, chart(baseline).anchor.id)
  assert.ok(chart(state).anchor.offset > chart(baseline).anchor.offset)
  const saved = chart(state)
  state = await click('Reload snapshot')
  assert.deepEqual(chart(state).anchor, saved.anchor)
  assert.deepEqual(chart(state).info.dataSource, saved.info.dataSource)
  assert.equal(chart(state).checksum, 249)
  assert.equal(chart(state).id, saved.id)
  assert.deepEqual(independent(state), content)
  state = await click('Delete chart')
  assert.equal(state.charts.length, 0)
  state = await click('Undo')
  assert.equal(state.charts.length, 1)
  state = await click('Redo')
  assert.equal(state.charts.length, 0)
  await click('Export PNG', /Chart is absent/)
  state = await click('Insert chart')
  assert.equal(state.charts.length, 1)
  await click('Reset')
  state = await click('Update month')
  const id = state.unitId
  for (const width of [760, 520, 390, 320]) {
    await page.setViewportSize({ width, height: 1400 })
    await page.waitForTimeout(300)
    state = await click('Inspect')
    assert.equal(state.unitId, id)
    assert.equal(state.pageWidth, state.layout[0].width)
    assert.equal(chart(state).checksum, 249)
    assert.ok(chart(state).info.size.width <= state.pageWidth - 133.3)
    if (observe && chart(state).rendered.width !== chart(state).info.size.width) {
      assert.equal(chart(state).rendered.width, 560)
      assert.equal(chart(state).rendered.scaleX, 1)
      results.push({
        knownGap: 'native frame retains initial width during viewport reflow',
        viewport: width,
        modelWidth: chart(state).info.size.width,
      })
    } else assert.equal(chart(state).rendered.width, chart(state).info.size.width)
    assert.deepEqual(independent(state), content)
    await click('Show chart')
    await capture(`narrow-${width}`)
  }
  await page.setViewportSize({ width: 1600, height: 1400 })
  await page.waitForTimeout(300)
  state = await click('Undo')
  assert.equal(chart(state).checksum, 235)
  state = await click('Redo')
  assert.equal(chart(state).checksum, 249)
  state = await click('Empty document')
  assert.equal(state.charts.length, 0)
  await click('Update month', /Chart is absent/)
  state = await click('Insert chart')
  assert.equal(state.charts.length, 1)
  state = await click('Reset')
  assert.deepEqual(chart(state).totals, [162, 73])
  const controls = root.locator('fieldset').locator('input, select, button')
  await controls.first().focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  for (let index = 0; index < (await controls.count()); index++) {
    assert.equal(await controls.nth(index).evaluate((el) => el === document.activeElement), true)
    assert.equal(
      await controls
        .nth(index)
        .evaluate((el) => el.matches(':focus-visible') && getComputedStyle(el).outlineWidth === '2px'),
      true,
    )
    await page.keyboard.press('Tab')
  }
  assert.equal(await root.locator('summary').evaluate((el) => el === document.activeElement), true)
  results.push({ keyboard: 'all host controls reachable with visible focus', count: await controls.count() })
  const title = root.getByRole('textbox', { name: 'Title', exact: true })
  await title.focus()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.type('Keyboard chart')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  await page.waitForFunction(() => document.querySelector('.charts-demo fieldset')?.disabled === false)
  assert.match(JSON.stringify(chart(await read()).renderSpec), /Keyboard chart/)
  await click('Reset')
  if (new URL(url).pathname.includes('/playground/')) {
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator(`.charts-demo[data-theme=${theme}][data-ready=true]`).waitFor({ timeout: 120000 })
      state = await click('Inspect')
      assert.equal(chart(state).checksum, 235)
      await capture(theme)
      assert.equal(await root.locator('.charts-editor canvas').count(), 1)
    }
  }
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('.charts-demo[data-ready=true]').waitFor({ timeout: 120000 })
  state = await click('Inspect')
  assert.equal(chart(state).checksum, 235)
  assert.equal(await root.count(), 1)
  assert.equal(await root.locator('.charts-editor canvas').count(), 1)
  assert.deepEqual(errors, [])
  await fs.writeFile(
    path.join(directory, 'report.json'),
    JSON.stringify(
      {
        status: results.some((result) => result.knownGap) ? 'passed-with-known-frame-gap' : 'passed',
        url,
        results,
        errors,
      },
      null,
      2,
    ),
  )
  console.log(
    results.some((result) => result.knownGap)
      ? 'PASS chart interactions with known native-frame gap; size/responsive acceptance remains failing'
      : 'PASS native chart data, variants, export, anchors, history, responsive layout and lifecycle',
  )
} catch (cause) {
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
  await fs.writeFile(
    path.join(directory, 'failure.json'),
    JSON.stringify(
      {
        error: String(cause),
        stack: cause.stack,
        errors,
        results,
        readback: await page
          .locator('.charts-demo output')
          .textContent()
          .catch(() => null),
      },
      null,
      2,
    ),
  )
  throw cause
} finally {
  await browser.close()
}
