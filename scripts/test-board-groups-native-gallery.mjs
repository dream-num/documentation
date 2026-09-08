/* eslint-disable no-await-in-loop -- Run native drag checks in each locale sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

import { chromium } from 'playwright'
const output = process.env.SHOWCASE_RESULTS_DIR || 'test-results/board-groups-native-gallery'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1500, height: 1050 } })
const report = { passed: false, locales: [], errors: [] }
await page.addInitScript(() => localStorage.setItem('theme', 'light'))
page.on('pageerror', (error) => report.errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
const state = () =>
  page.evaluate(() => {
    const b = window.univerAPI.getActiveBoard()
    return {
      elements: b.describeElements({ includeHidden: true }),
      order: b.getElementOrder(),
      group: b.getElementParentChain('group-a'),
      nested: b.getElementParentChain('nested-a'),
      locked: b.describeElement('locked'),
      unlocked: b.describeElement('unlocked'),
    }
  })
const point = (id) =>
  page.evaluate((elementId) => {
    const p = window.univerAPI.getActiveBoard().getElementViewportPoint(elementId)
    const r = document.querySelector('[data-board-viewport-host] canvas').getBoundingClientRect()
    return { x: r.x + p.x, y: r.y + p.y }
  }, id)
const drag = async (id) => {
  const p = await point(id)
  await page.mouse.move(p.x, p.y)
  await page.mouse.down()
  await page.mouse.move(p.x + 55, p.y + 30, { steps: 12 })
  await page.mouse.up()
  await page.waitForTimeout(250)
}
try {
  for (const locale of ['en-US', 'zh-CN']) {
    await page.goto(
      `${process.env.SHOWCASE_ORIGIN || 'http://localhost:4336'}/${locale}/playground/boards/group-lock-z-order`,
      { waitUntil: 'domcontentloaded', timeout: 120000 },
    )
    const root = page.locator('.group-layer-demo[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    await root.locator('canvas').first().waitFor()
    assert.equal(await root.locator(':scope > fieldset, :scope > details, :scope > output').count(), 0)
    assert.equal(await root.locator(':scope > [role=alert]').isVisible(), false)
    const before = await state()
    assert.equal(before.elements.length, 18)
    assert.equal(before.elements.filter((e) => e.type === 'container').length, 3)
    assert.equal(before.group.length, 1)
    assert.equal(before.nested.length, 2)
    assert.equal(before.locked.locked, true)
    assert.equal(before.unlocked.locked, false)
    assert.ok(before.order.indexOf('layer-front') > before.order.indexOf('layer-middle'))
    const refused = await page.evaluate(() =>
      window.univerAPI.getActiveBoard().translateElement('locked', { dx: 10, dy: 10 }),
    )
    assert.equal(refused, false)
    await page.screenshot({ path: `${output}/${locale}-baseline.png` })
    await drag('locked')
    assert.deepEqual((await state()).locked, before.locked, 'Native drag must not move the locked shape')
    await drag('unlocked')
    const changed = await state()
    assert.notDeepEqual(changed.unlocked, before.unlocked, 'Native drag must change unlocked geometry')
    assert.deepEqual(changed.locked, before.locked)
    await page.screenshot({ path: `${output}/${locale}-dragged.png` })
    const editedSnapshot = await page.evaluate(() => {
      window.__themeOwner = window.univerAPI
      return window.univerAPI.getActiveBoard().save()
    })
    for (const theme of ['dark', 'light']) {
      await page.evaluate((value) => {
        localStorage.setItem('theme', value)
        window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: value }))
      }, theme)
      await page.waitForFunction((dark) => window.univerAPI?.isDarkMode() === dark, theme === 'dark')
      const after = await page.evaluate(() => ({
        sameOwner: window.__themeOwner === window.univerAPI,
        snapshot: window.univerAPI.getActiveBoard().save(),
      }))
      assert.equal(after.sameOwner, true)
      assert.deepEqual(after.snapshot, editedSnapshot)
      await page.screenshot({ path: `${output}/${locale}-${theme}.png` })
    }
    report.locales.push({ locale, before, after: changed, nativeLockedDragRejected: true, nativeUnlockedDrag: true })
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} finally {
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ passed: report.passed, locales: report.locales.length, errors: report.errors }))
  await browser.close()
}
