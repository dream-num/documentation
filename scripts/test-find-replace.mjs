/* eslint-disable no-await-in-loop -- Exercise one actual workbook in deterministic order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/sheets/find-replace'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/find-replace')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
page.setDefaultTimeout(30000)
const report = { passed: false, errors: [], checks: [] }
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
await page.addInitScript(() => {
  window.findPaint = []
  const original = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
    window.findPaint.push(String(text))
    if (window.findPaint.length > 4000) window.findPaint.splice(0, 2000)
    return original.call(this, text, ...args)
  }
})
try {
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  const root = page.locator('.find-replace-demo')
  await root.locator('xpath=self::*[@data-ready="true"]').waitFor({ timeout: 60000 })
  const read = async () => JSON.parse(await root.locator('pre').textContent())
  const wait = (predicate, arg) =>
    page.waitForFunction(
      ({ check, arg: expected }) => {
        const text = document.querySelector('.find-replace-demo pre')?.textContent
        return text && new Function('s', 'a', `return (${check})(s,a)`)(JSON.parse(text), expected)
      },
      { check: predicate.toString(), arg },
    )
  const action = async (name) => {
    await root.locator(`[data-action="${name}"]`).click()
    await root.locator('xpath=self::*[@data-busy="false"]').waitFor()
    assert.doesNotMatch(await root.getByRole('status').textContent(), /Action failed/)
    const styles = await root.locator('[data-u-comp="workbench-layout"]').evaluate((el) => ({
      background: getComputedStyle(el).backgroundColor,
      display: getComputedStyle(el.querySelector('.univer-flex')).display,
    }))
    assert.equal(styles.display, 'flex', `${name}: native layout CSS stays loaded`)
    if ((await root.getAttribute('data-theme')) === 'light')
      assert.equal(styles.background, 'rgb(255, 255, 255)', `${name}: native workbench stays opaque white`)
  }
  const search = async (text, options = []) => {
    await root.getByRole('textbox', { name: 'Find text', exact: true }).fill(text)
    for (const name of ['case', 'whole', 'formula'])
      await root.locator(`[data-option="${name}"]`).setChecked(options.includes(name))
    await action('search')
    return (await read()).matches.map((item) => item.address).toSorted()
  }
  await wait((s) => s.values[8][1] === 'DRAFT' && s.values[8][2] === 58)
  await page.waitForFunction(() => window.findPaint.includes('Sea kale'))
  const native = root.locator('[data-u-comp="workbench-layout"]')
  report.styles = await native.evaluate((el) => ({
    background: getComputedStyle(el).backgroundColor,
    white: getComputedStyle(el).getPropertyValue('--univer-gray-0').trim(),
  }))
  assert.equal(report.styles.background, 'rgb(255, 255, 255)')
  assert.equal(report.styles.white, '#FFFFFF')
  assert.deepEqual(await search('draft'), ['B9', 'C2', 'C3', 'C4', 'C5', 'E2'])
  const initial = (await read()).current
  await action('next')
  const next = (await read()).current
  assert.notEqual(next, initial)
  assert.equal((await read()).selection, next)
  await action('previous')
  assert.equal((await read()).current, initial)
  assert.equal((await read()).selection, initial)
  report.checks.push('Partial text, six matched cells, next/previous native selection')
  assert.deepEqual(await search('draft', ['case']), ['C3', 'E2'])
  assert.deepEqual(await search('draft', ['whole']), ['B9', 'C2', 'C3', 'C4'])
  assert.deepEqual(await search('draft', ['case', 'whole']), ['C3'])
  assert.deepEqual(await search('UPPER'), [])
  assert.deepEqual(await search('UPPER', ['formula']), ['B9'])
  await root.getByRole('textbox', { name: 'Replacement text' }).fill('LOWER')
  await action('replace')
  await wait((s) => s.formulas[8][1] === '=LOWER(C2)' && s.values[8][1] === 'draft')
  await search('draft', ['whole'])
  // Cycle to the calculated result: it is searchable but not replaceable in value mode.
  for (let i = 0; (await read()).current !== 'B9' && i < 6; i++) await action('next')
  assert.equal((await read()).current, 'B9')
  assert.equal(await root.locator('[data-action="replace"]').isDisabled(), true)
  assert.equal((await read()).matches.find((item) => item.address === 'B9').replaceable, false)
  await action('reset')
  await wait((s) => s.values[8][1] === 'DRAFT')
  await root.getByRole('textbox', { name: 'Replacement text' }).fill('Reviewed')
  assert.deepEqual(await search('海岸'), ['E8'])
  assert.deepEqual(await search('0', ['whole']), ['D3'])
  assert.deepEqual(await search('A.B'), ['E6'])
  assert.deepEqual(await search('A*B'), ['E7'])
  assert.deepEqual(await search('unmatched-999'), [])
  for (const name of ['next', 'previous', 'replace', 'all'])
    assert.equal(await root.locator(`[data-action="${name}"]`).isDisabled(), true)
  assert.deepEqual(await search(''), [])
  assert.match(await root.getByRole('status').textContent(), /Enter search text/)
  report.checks.push('Case, whole cell, formula/value, Unicode, literal punctuation, zero, no-match and empty input')
  assert.deepEqual(await search('  draft  '), ['B9', 'C2', 'C3', 'C4', 'C5', 'E2'])
  assert.deepEqual(await search('   '), [])

  await search('draft', ['case', 'whole'])
  await action('replace')
  await wait((s) => s.values[2][2] === 'Reviewed')
  assert.equal((await read()).lastReplacement.sdkReturn, true)
  assert.equal((await read()).values[1][2], 'Draft')
  const grid = root.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
  await grid.click({ position: { x: 200, y: 75 } })
  await page.keyboard.press('Control+z')
  await wait((s) => s.values[2][2] === 'draft')
  await page.keyboard.press('Control+y')
  await wait((s) => s.values[2][2] === 'Reviewed')
  assert.equal(
    await root.locator('[data-action="replace"]').isDisabled(),
    true,
    'Native Undo/Redo invalidates stale search results',
  )
  await search('draft', ['case'])
  await root.getByRole('textbox', { name: 'Replacement text' }).fill('')
  await action('all')
  await wait((s) => s.values[1][4] === ' label;  insert')
  assert.equal((await read()).values[1][2], 'Draft')
  await action('switch')
  assert.deepEqual(await search('draft'), ['C2', 'C4'])
  assert.equal((await read()).values[1][2], 'Draft')
  report.checks.push(
    'Single and repeated-text replacement, empty replacement, native Undo/Redo, other-sheet preservation',
  )
  for (let i = 0; i < 3; i++) {
    await action('reset')
    await wait((s) => s.sheet === 'Current stock' && s.values[8][1] === 'DRAFT')
    assert.equal((await read()).values[2][2], 'draft')
    assert.equal((await read()).values[1][4], 'draft label; draft insert')
    await search('Draft', ['case', 'whole'])
    await root.getByRole('textbox', { name: 'Replacement text' }).fill('Approved')
    await action('replace')
    await wait((s) => s.values[1][2] === 'Approved' && s.values[8][1] === 'APPROVED')
  }
  report.checks.push('Three reset cycles and native formula recalculation after replacement')
  await action('reset')
  const bounds = await grid.boundingBox()
  await page.mouse.move(bounds.x + 450, bounds.y + 75)
  await page.mouse.down()
  await page.mouse.move(bounds.x + 450, bounds.y + 165, { steps: 8 })
  await page.mouse.up()
  await wait((s) => s.selection.includes(':'))
  assert.deepEqual(await search('draft'), ['B9', 'C2', 'C3', 'C4', 'C5', 'E2'])
  report.checks.push(
    'Formula-text replacement, non-replaceable calculated result, whitespace rules and whole-sheet search after native multi-cell selection',
  )
  await grid.click({ position: { x: 200, y: 75 } })
  await page.keyboard.press('Control+f')
  const nativeFind = page.getByPlaceholder('Find', { exact: true })
  await nativeFind.fill('Beach pea')
  await page.locator('[data-u-comp="pager"]').getByText('1/1', { exact: true }).waitFor()
  assert.equal(await nativeFind.evaluate((el) => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)')
  await page.keyboard.press('Escape')
  await nativeFind.waitFor({ state: 'hidden' })
  await search('draft')
  assert.equal((await read()).matches.length, 6)
  report.checks.push(
    'Native Ctrl+F, real 1/1 result, styled SDK search input, Escape and host search after native panel close',
  )
  await root.screenshot({ path: path.join(directory, 'light.png') })
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 })
    await search('海岸')
    assert.equal((await read()).matches.length, 1)
    const geometry = await root.evaluate((el) => ({ client: el.clientWidth, scroll: el.scrollWidth }))
    assert.ok(geometry.scroll <= geometry.client + 1)
    for (const name of ['search', 'next', 'previous', 'replace', 'all', 'switch', 'reset']) {
      const button = root.locator(`[data-action="${name}"]`)
      await button.focus()
      assert.equal(await button.evaluate((el) => el === document.activeElement), true)
    }
    await root.locator('.find-controls > summary').click()
    await root.screenshot({ path: path.join(directory, `width-${width}.png`) })
    const visibleGrid = await grid.boundingBox()
    assert.ok(visibleGrid.y < 500, 'Collapsed host controls leave visible native editing space')
    await root.locator('.find-controls > summary').click()
  }
  report.checks.push('760/390/320 widths and keyboard-focusable enabled controls')
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  await root.locator('xpath=self::*[@data-ready="true"]').waitFor()
  assert.equal(await root.locator('.find-controls').evaluate((el) => el.open), false)
  assert.ok((await grid.boundingBox()).y < 500)
  await root.locator('.find-controls > summary').click()
  assert.deepEqual(await search('海岸'), ['E8'])
  report.checks.push('Fresh 320px entry keeps native editor visible and opens functional controls on demand')
  if (url.includes('/playground/')) {
    await page.setViewportSize({ width: 1440, height: 1100 })
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator(`.find-replace-demo[data-theme="${theme}"][data-ready="true"]`).waitFor()
      await wait((s) => s.values[8][1] === 'DRAFT')
      assert.deepEqual(await search('draft'), ['B9', 'C2', 'C3', 'C4', 'C5', 'E2'])
      await root.screenshot({ path: path.join(directory, `theme-${theme}.png`) })
    }
    for (const [locale, title, headings] of [
      ['en-US', 'Find and Replace', ['Variants', 'Actions', 'States']],
      ['zh-CN', '查找和替换', ['变体', '操作', '状态']],
    ]) {
      await page.goto(`${new URL(url).origin}/${locale}/showcase/sheets/find-replace`, {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      })
      await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
      for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      // The embedded SDK is the readiness condition; unrelated site requests may stay active.
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      const embedded = page.frameLocator('iframe').first()
      await embedded.locator('.find-replace-demo[data-ready="true"]').waitFor()
      const branch = page.locator('aside button').first()
      await branch.click()
      await page.waitForFunction(
        () => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'false',
      )
      await branch.click()
      await page.waitForFunction(() => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'true')
      await embedded.locator('[data-action="switch"]').click()
      await embedded.locator('.find-replace-demo[data-busy="false"]').waitFor()
      await embedded.locator('[data-action="search"]').click()
      const frame = page.frames().find((item) => item.url().includes('/playground/'))
      await frame.waitForFunction(
        () => JSON.parse(document.querySelector('.find-replace-demo pre').textContent).matches.length === 2,
      )
      await embedded.locator('[data-action="all"]').click()
      await frame.waitForFunction(() => {
        const s = JSON.parse(document.querySelector('.find-replace-demo pre').textContent)
        return s.values[1][2] === 'Reviewed' && s.values[3][2] === 'Reviewed'
      })
      await page.screenshot({ path: path.join(directory, `guide-${locale}.png`) })
    }
    report.checks.push(
      'Light/dark and English/Chinese card-free detail pages, hydrated tree and working iframe replacements',
    )
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  report.lastReadback = await page
    .locator('.find-replace-demo pre')
    .textContent({ timeout: 1000 })
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(JSON.stringify({ ...report, lastReadback: undefined }, null, 2))
assert.ok(report.passed)
