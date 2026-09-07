/* eslint-disable no-await-in-loop -- Follow native keyboard order and theme cleanup on one page. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/docs-modern/shapes-in-documents'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/modern-shape-accessibility')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch(),
  page = await browser.newPage({ viewport: { width: 1600, height: 1400 }, colorScheme: 'light' })
const errors = [],
  results = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
const root = page.locator('.shapes-demo')
const ready = () => page.locator('.shapes-demo[data-ready=true]').waitFor({ timeout: 120000 })
const settled = () => page.waitForFunction(() => document.querySelector('.shapes-demo fieldset')?.disabled === false)
const read = async () => JSON.parse(await root.locator('output').textContent())
const inspect = async () => {
  await root.getByRole('button', { name: 'Inspect', exact: true }).click()
  await settled()
  assert.equal(await root.getByRole('alert').isVisible(), false)
  return read()
}
const badge = (state) => state.shapes.find((shape) => shape.id === 'aster-decision-badge')
const semantic = (state) => ({
  shapes: state.shapes.map((shape) => ({
    id: shape.id,
    type: shape.type,
    text: shape.text,
    transform: shape.transform,
  })),
  paragraphs: state.paragraphs.map((p) => p.text),
  tables: state.tables,
  charts: state.charts.map((c) => c.dataSource.values),
  images: state.images.map((i) => ({ id: i.drawingId, source: i.source })),
})
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 300000 })
  await ready()
  const baseline = await inspect()
  const controls = root.locator('fieldset').locator('input, select, button')
  const count = await controls.count()
  await controls.first().focus()
  for (let i = 0; i < count; i++) {
    assert.equal(
      await controls.nth(i).evaluate((el) => el === document.activeElement),
      true,
      `Tab reaches control ${i}`,
    )
    const focus = await controls.nth(i).evaluate((el) => ({
      name: el.getAttribute('aria-label') || el.textContent.trim(),
      visible: el.matches(':focus-visible'),
      outline: getComputedStyle(el).outlineWidth,
    }))
    assert.ok(focus.name, 'Every control has an accessible name')
    assert.equal(focus.visible, true)
    assert.equal(focus.outline, '2px')
    await page.keyboard.press('Tab')
  }
  assert.equal(await root.locator('summary').evaluate((el) => el === document.activeElement), true)
  await page.keyboard.press('Enter')
  assert.equal(await root.locator('details').getAttribute('open'), '')
  await page.keyboard.press('Enter')
  const label = root.getByRole('textbox', { name: 'Label', exact: true })
  await label.focus()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.type('KEYBOARD REVIEW')
  await page.keyboard.press('Tab')
  assert.equal(
    await root.getByRole('button', { name: 'Set label', exact: true }).evaluate((el) => el === document.activeElement),
    true,
  )
  await page.keyboard.press('Enter')
  await settled()
  assert.match(badge(await read()).text, /KEYBOARD REVIEW/)
  await root.getByRole('button', { name: 'Undo', exact: true }).focus()
  await page.keyboard.press('Space')
  await settled()
  assert.equal(badge(await read()).text, badge(baseline).text)
  results.push({ hostKeyboard: 'tab order, visible focus, details, label edit and SDK Undo', controls: count })

  const documentation = new URL(url).pathname.includes('/playground/')
  for (const theme of ['dark', 'light', 'dark']) {
    await page.emulateMedia({ colorScheme: theme })
    const expected = documentation ? theme : 'light'
    await page.locator(`.shapes-demo[data-theme=${expected}][data-ready=true]`).waitFor({ timeout: 120000 })
    const state = await inspect()
    assert.deepEqual(semantic(state), semantic(baseline))
    assert.equal(await root.count(), 1)
    assert.equal(await root.locator('.shapes-editor canvas').count(), 1)
    assert.equal(
      await root.evaluate((el) => getComputedStyle(el).backgroundColor),
      expected === 'dark' ? 'rgb(16, 24, 40)' : 'rgb(255, 255, 255)',
    )
    await root.screenshot({ path: path.join(directory, `${theme}.png`) })
  }
  results.push({
    theme: documentation
      ? 'light/dark/light/dark SDK recreation'
      : 'standalone documented light default; dark integration requires documentation run',
  })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await ready()
  assert.deepEqual(semantic(await inspect()), semantic(baseline))
  assert.equal(await root.count(), 1)
  assert.equal(await root.locator('.shapes-editor canvas').count(), 1)
  assert.deepEqual(errors, [])
  await fs.writeFile(
    path.join(directory, 'report.json'),
    JSON.stringify({ status: 'passed-host-keyboard-and-lifecycle', url, results, errors }, null, 2),
  )
  console.log(
    'PASS host keyboard controls, theme policy and single-canvas lifecycle; not a full SDK accessibility audit',
  )
} catch (cause) {
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
  await fs.writeFile(
    path.join(directory, 'failure.json'),
    JSON.stringify({ error: String(cause), stack: cause.stack, errors, results }, null, 2),
  )
  throw cause
} finally {
  await browser.close()
}
