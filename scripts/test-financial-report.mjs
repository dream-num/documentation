/* eslint-disable no-await-in-loop -- Verify the actual financial review in user-action order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/financial-report')
await fs.mkdir(directory, { recursive: true })
const report = { passed: false, checks: [], errors: [] }
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
const root = page.locator('.financial-report')
const idle = () =>
  root.locator('.financial-controls > fieldset:not([disabled])').waitFor({ state: 'attached', timeout: 120000 })
const read = async () => JSON.parse(await root.locator('output').textContent())
const marks = (state) => state.pages.flatMap((item) => item.annotations)
const content = (state) => state.pages.map(({ annotations: _annotations, ...item }) => item)
const number = (text) => Number(text.replace(/^\((.*)\)$/, '-$1'))
const equalMoney = (actual, expected) => assert.equal(Math.round(actual * 10), Math.round(expected * 10))
const click = async (action, errorPattern) => {
  await root.locator(`[data-action="${action}"]`).click()
  await idle()
  const error = root.locator(':scope > [role=alert]')
  if (errorPattern) assert.match(await error.textContent(), errorPattern)
  else assert.equal(await error.isVisible(), false, await error.textContent())
  return read()
}
const fixture = async (value) => {
  await root.locator('[data-input=fixture]').selectOption(value)
  return click('fixture', value === 'error' ? /opacity/ : undefined)
}
const activeCanvas = () => root.locator('[data-pdf-active-page-id] > canvas').first()
const settle = () =>
  page.evaluate(async () => {
    await document.fonts.ready
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  })
const pixels = async () => {
  await settle()
  return activeCanvas().evaluate((element) => {
    const sx = element.width / 595.276,
      sy = element.height / 841.89
    return [
      ...element
        .getContext('2d')
        .getImageData(Math.round(46 * sx), Math.round(180 * sy), Math.round(500 * sx), Math.round(80 * sy)).data,
    ]
  })
}
const download = async (filename) => {
  const pending = page.waitForEvent('download')
  await click('download')
  const result = await pending
  assert.equal(result.suggestedFilename(), 'asteria-annual-review.json')
  const file = path.join(directory, filename)
  await result.saveAs(file)
  return JSON.parse(await fs.readFile(file, 'utf8'))
}
try {
  await page.goto(process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/pdfs/financial-report', {
    waitUntil: 'load',
    timeout: 180000,
  })
  await idle()
  await activeCanvas().waitFor()
  const initial = await read()
  assert.equal(initial.pages.length, 14)
  assert.equal(new Set(initial.pages.map((item) => item.text.find((box) => box.id.startsWith('title-')).text)).size, 14)
  assert.equal(initial.pages.flatMap((item) => item.tables).length, 14)
  assert.equal(initial.reviewDate, '2027-03-31T09:00:00Z')
  assert.equal(marks(initial).length, 0)
  const cell = (index, label) => initial.pages[index].tables[0].cells.find((row) => row[0] === label)[1]
  const amount = (index, label) => number(cell(index, label))
  equalMoney(amount(1, 'Revenue') + amount(1, 'Cost of sales'), amount(1, 'Gross profit'))
  equalMoney(
    amount(1, 'Gross profit') + amount(1, 'Research and development') + amount(1, 'Selling and administration'),
    amount(1, 'Operating profit'),
  )
  equalMoney(
    amount(1, 'Operating profit') + amount(1, 'Net finance costs') + amount(1, 'Income tax'),
    amount(1, 'Net profit'),
  )
  equalMoney(amount(2, 'Total liabilities') + amount(2, 'Total equity'), amount(2, 'Total assets'))
  equalMoney(amount(3, 'Operating cash flow') + amount(3, 'Capital expenditure'), amount(3, 'Free cash flow'))
  equalMoney(
    amount(3, 'Operating cash flow') +
      amount(3, 'Net investing cash flow') +
      amount(3, 'Net financing cash flow') +
      amount(3, 'Exchange effect') +
      33.8,
    62,
  )
  equalMoney(amount(7, 'Total borrowings') + amount(7, 'Cash'), amount(7, 'Net debt'))
  equalMoney(
    amount(8, 'Total receivables') + amount(8, 'Inventory') + amount(8, 'Trade payables'),
    amount(8, 'Net working capital'),
  )
  assert.equal(((amount(1, 'Operating profit') / amount(1, 'Revenue')) * 100).toFixed(1), '16.9')
  assert.ok(JSON.stringify(initial.pages).includes('No auditor has examined'))
  assert.equal(
    await root.locator('[data-u-comp=workbench-layout]').evaluate((e) => getComputedStyle(e).backgroundColor),
    'rgb(255, 255, 255)',
  )
  assert.equal(await root.locator('[data-u-comp=workbench-skeleton-toolbar]').count(), 0)
  await page.screenshot({ path: path.join(directory, 'annual-report.png') })
  report.checks.push(
    'Fourteen distinct sections and native tables, financial reconciliations, frozen review date, white native workbench',
  )
  if (process.env.SHOWCASE_PAGES === '1') {
    for (const [index, item] of initial.pages.entries()) {
      const input = root.locator('[data-pdf-footer] input[aria-label="Page"]')
      await input.fill(String(index + 1))
      await input.press('Enter')
      const native = root.locator(`[data-pdf-active-page-id="${item.id}"] > canvas`).first()
      await native.waitFor()
      await page.waitForFunction(
        (id) => JSON.parse(document.querySelector('.financial-report output').textContent).activePageId === id,
        item.id,
      )
      await settle()
      const capture = await native.evaluate((element) => {
        const rgba = element.getContext('2d').getImageData(0, 0, element.width, element.height).data
        let marginInk = 0
        // Content ends at 546pt. The rightmost 25pt of this A4 fixture must remain clear.
        for (let y = Math.ceil((element.height * 160) / 841.89); y < (element.height * 760) / 841.89; y++) {
          for (let x = Math.ceil((element.width * 570) / 595.276); x < element.width; x++) {
            const offset = (y * element.width + x) * 4
            if (rgba[offset + 3] > 128 && Math.min(...rgba.slice(offset, offset + 3)) < 180) marginInk++
          }
        }
        return { png: element.toDataURL('image/png'), marginInk, width: element.width, height: element.height }
      })
      assert.equal(capture.marginInk, 0, `Page ${index + 1}: body must not overflow into the right margin`)
      assert.ok(capture.width > 500 && capture.height > 700)
      await fs.writeFile(
        path.join(directory, `page-${index + 1}.png`),
        Buffer.from(capture.png.split(',')[1], 'base64'),
      )
    }
    report.checks.push('All fourteen pages navigate through the native footer and render without right-margin overflow')
  }

  await root.locator('.financial-controls > summary').click()
  let state = await click('find')
  assert.equal(state.activePageId, initial.pages[6].id)
  assert.deepEqual(state.snapshot, initial.snapshot, 'Find is navigation, not a durable edit')
  await activeCanvas().waitFor()
  const plain = await pixels()
  state = await click('highlight')
  assert.equal(marks(state).length, 1)
  assert.equal(marks(state)[0].type, 'highlight')
  assert.deepEqual(marks(state)[0].transform, state.pages[6].text.find((box) => box.id === 'margin-note').transform)
  assert.deepEqual(content(state), content(initial))
  assert.equal(await root.locator('[data-action=highlight]').isDisabled(), true)
  const highlighted = await pixels()
  assert.notDeepEqual(highlighted, plain)
  await root.locator('.financial-controls > summary').click()
  await page.screenshot({ path: path.join(directory, 'margin-review.png') })
  await root.locator('.financial-controls > summary').click()
  state = await click('undo')
  assert.equal(marks(state).length, 0)
  assert.equal(
    await root.locator('[data-action=highlight]').isDisabled(),
    false,
    'Undo must not leave a stale host flag',
  )
  assert.deepEqual(await pixels(), plain)
  await click('redo')
  assert.deepEqual(await pixels(), highlighted)
  await click('remove')
  assert.equal(await root.locator('[data-action=highlight]').isDisabled(), false)
  await click('highlight')
  report.checks.push('Live Facade margin lookup, native annotation pixels, bounds, remove and Undo/Redo re-enable Add')
  await click('remove')
  await click('find')
  await root.locator('.financial-controls > summary').click()
  const rect = await activeCanvas().boundingBox()
  await page.mouse.dblclick(rect.x + (80 / 595.276) * rect.width, rect.y + (190 / 841.89) * rect.height)
  assert.equal(await root.locator('[data-pdf-text-input]').evaluate((e) => e === document.activeElement), true)
  await page.keyboard.press('Control+A')
  await page.keyboard.insertText('Operating margin: 16.9%. Reviewer checked the definition.')
  await root.locator('.financial-controls > summary').click()
  await page.waitForFunction(
    () =>
      JSON.parse(document.querySelector('.financial-report output').textContent).pages[6].text.find(
        (box) => box.id === 'margin-note',
      ).text === 'Operating margin: 16.9%. Reviewer checked the definition.',
  )
  await click('highlight')
  report.checks.push('Native paragraph double-click and keyboard editing changes the actual Facade text before export')
  await root.locator('.financial-controls > summary').click()
  await settle()
  await activeCanvas().evaluate((element) => {
    const scroll = element.closest('[data-pdf-scroll-container]')
    const bounds = element.getBoundingClientRect()
    const targetY = bounds.y + (330 / 841.89) * bounds.height
    const viewport = scroll.getBoundingClientRect()
    if (targetY > viewport.bottom - 40) scroll.scrollTop += targetY - viewport.bottom + 40
  })
  await settle()
  const tableRect = await activeCanvas().boundingBox()
  // Double-click the value glyphs, not blank space in the cell: the native editor uses a text hit test.
  await page.mouse.dblclick(
    tableRect.x + (310 / 595.276) * tableRect.width,
    tableRect.y + (330 / 841.89) * tableRect.height,
  )
  await page.waitForFunction(() => document.activeElement?.matches('[data-pdf-text-input]'), undefined, {
    timeout: 10000,
  })
  await page.keyboard.press('Control+A')
  await page.keyboard.insertText('73.0')
  await root.locator('.financial-controls > summary').click()
  await page.waitForFunction(
    () =>
      JSON.parse(document.querySelector('.financial-report output').textContent).pages[6].tables[0].cells[1][1] ===
      '73.0',
  )
  assert.equal(
    (await read()).pages[6].text.find((box) => box.id === 'margin-note').text,
    'Operating margin: 16.9%. Reviewer checked the definition.',
    'Native PDF tables do not recalculate narrative ratios',
  )
  report.checks.push(
    'Native table cell keyboard edit is read through Facade and does not pretend to recalculate ratios',
  )
  const edited = (await read()).snapshot
  state = await click('reload')
  assert.deepEqual(state.snapshot, edited)
  assert.deepEqual(await download('review.json'), edited)
  state = await click('reset')
  assert.deepEqual(state.snapshot, initial.snapshot)
  const states = {}
  for (const name of ['default', 'empty', 'boundary', 'error']) {
    state = await fixture(name)
    states[name] = state.snapshot
    assert.equal(state.reviewDate, initial.reviewDate)
    assert.equal(await root.locator('[data-action=undo]').isDisabled(), true)
    if (name === 'empty') {
      assert.equal(state.pages.length, 1)
      assert.equal(state.pages[0].text.length + state.pages[0].tables.length, 0)
      for (const action of ['find', 'highlight', 'remove'])
        assert.equal(await root.locator(`[data-action=${action}]`).isDisabled(), true)
    } else {
      assert.deepEqual(content(state), content(initial))
      if (name === 'boundary') {
        assert.equal(marks(state)[0].style.opacity, 0)
        assert.deepEqual(await pixels(), plain)
      }
      if (name === 'error') assert.equal(marks(state)[0].style.opacity, 0.3)
    }
    assert.deepEqual(await download(`${name}.json`), states[name])
  }
  for (const name of Object.keys(states)) assert.deepEqual((await fixture(name)).snapshot, states[name])
  await root.locator('[data-input=fixture]').evaluate((e) => e.add(new Option('Unknown', 'unknown')))
  await root.locator('[data-input=fixture]').selectOption('unknown')
  const beforeInvalid = (await read()).snapshot
  state = await click('fixture', /Unknown state/)
  assert.deepEqual(state.snapshot, beforeInvalid)
  await click('reset')
  report.checks.push(
    'Four exact repeatable fixtures, invalid-state preservation, full JSON reload/download and exact Reset',
  )

  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    await idle()
    await settle()
    assert.ok(await root.evaluate((e) => e.scrollWidth <= e.clientWidth + 1))
    await root.locator('[data-action=highlight]').focus()
    assert.equal(await root.locator('[data-action=highlight]').evaluate((e) => e === document.activeElement), true)
    await page.keyboard.press('Enter')
    await page.waitForFunction(
      () =>
        JSON.parse(document.querySelector('.financial-report output').textContent).pages.flatMap(
          (item) => item.annotations,
        ).length === 1,
      undefined,
      { timeout: 10000 },
    )
    await idle()
    assert.equal(marks(await read()).length, 1)
    await click('reset')
  }
  report.checks.push('Keyboard activation and 760/390/320 host widths without horizontal overflow')
  if (process.env.SHOWCASE_DETAILS === '1') {
    const origin = new URL(process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030').origin
    await page.setViewportSize({ width: 1440, height: 1100 })
    for (const [locale, title, labels] of [
      ['en-US', 'Financial Report Review', ['Variants', 'Actions', 'States']],
      ['zh-CN', '财务报告审阅', ['变体', '操作', '状态']],
    ]) {
      const response = await page.goto(`${origin}/${locale}/showcase/pdfs/financial-report`, {
        waitUntil: 'load',
        timeout: 180000,
      })
      assert.equal(response.status(), 200)
      await page.getByRole('heading', { name: title, exact: true, level: 1 }).waitFor()
      for (const name of labels) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      assert.equal(await page.locator('aside').getByRole('button', { expanded: true }).count(), 3)
      assert.equal(await page.locator('aside').getByRole('link', { name: title, exact: true }).count(), 1)
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      await page.waitForFunction(() => {
        const frame = document.querySelector('iframe')
        return frame && frame.clientHeight >= 640 && getComputedStyle(frame).opacity === '1'
      })
      const preview = page.frameLocator('iframe').first().locator('.financial-report')
      const ready = () =>
        preview
          .locator('.financial-controls > fieldset:not([disabled])')
          .waitFor({ state: 'attached', timeout: 120000 })
      const previewState = async () => JSON.parse(await preview.locator('output').textContent())
      await ready()
      const original = await previewState()
      assert.equal(original.pages.length, 14)
      assert.equal(
        await preview.locator('[data-u-comp=workbench-layout]').evaluate((e) => getComputedStyle(e).backgroundColor),
        'rgb(255, 255, 255)',
      )
      await preview.locator('.financial-controls > summary').click()
      await preview.locator('[data-action=find]').click()
      await ready()
      assert.equal((await previewState()).activePageId, original.pages[6].id)
      await preview.locator('[data-action=highlight]').click()
      await ready()
      assert.equal(marks(await previewState()).length, 1)
      await preview.locator('[data-action=undo]').click()
      await ready()
      assert.equal(marks(await previewState()).length, 0)
      assert.equal(await preview.locator('[data-action=highlight]').isDisabled(), false)
      await preview.locator('.financial-controls > summary').click()
      await page.screenshot({ path: path.join(directory, `guide-${locale}.png`) })
    }
    report.checks.push(
      'English/Chinese card-free detail pages, four-level navigation and actual iframe Find/Highlight/Undo',
    )
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
  throw error
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
}
