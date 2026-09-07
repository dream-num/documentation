/* eslint-disable no-await-in-loop -- Exercise real notes and native history in one selected editor. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/sheets/notes'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/notes')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
page.setDefaultTimeout(30000)
const report = { passed: false, errors: [], checks: [] }
const observeKnownDefects = process.env.SHOWCASE_OBSERVE_KNOWN_DEFECTS === '1'
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
try {
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  const root = page.locator('.notes-demo')
  const ready = () => root.locator('xpath=self::*[@data-ready="true"]').waitFor({ timeout: 60000 })
  const read = async () => JSON.parse(await root.locator('pre').textContent())
  const wait = (check, arg) =>
    page.waitForFunction(
      ({ predicate, arg: value }) => {
        const text = document.querySelector('.notes-demo pre')?.textContent
        return text && new Function('s', 'a', `return (${predicate})(s,a)`)(JSON.parse(text), value)
      },
      { predicate: check.toString(), arg },
    )
  const settle = () =>
    page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const action = async (name) => {
    await root.locator(`[data-action="${name}"]`).click()
    await root.locator('xpath=self::*[@data-busy="false"]').waitFor()
    await settle()
    assert.doesNotMatch(await root.getByRole('status').textContent(), /Action failed/)
    if ((await root.getAttribute('data-theme')) === 'light')
      assert.equal(
        await root.locator('[data-u-comp="workbench-layout"]').evaluate((el) => getComputedStyle(el).backgroundColor),
        'rgb(255, 255, 255)',
      )
  }
  const select = async (value) => {
    await root.getByRole('combobox', { name: 'Note target' }).selectOption(value)
    await wait((s, a) => s.target === a, value)
  }
  const popups = page.locator('[data-u-comp="note-textarea"]')
  const popupText = (text) =>
    page.waitForFunction(
      (value) => [...document.querySelectorAll('[data-u-comp="note-textarea"]')].some((el) => el.value === value),
      text,
    )
  await ready()
  const baseline = (await read()).sheets
  assert.deepEqual(
    baseline.map((sheet) => sheet.notes.length),
    [3, 1],
  )
  await popupText('Humidity check before unpacking.')
  assert.equal(await root.locator('[data-action="apply"]').isDisabled(), true)
  const grid = root.locator('canvas[id^="univer-sheet-main-canvas"]:visible')
  const originalText = (await read()).note.note
  await action('size')
  await wait((s) => s.note.width === 320 && s.note.height === 180)
  await page.waitForFunction(() =>
    [...document.querySelectorAll('[data-u-comp="note-textarea"]')].some(
      (el) =>
        Math.round(el.getBoundingClientRect().width) === 320 && Math.round(el.getBoundingClientRect().height) === 180,
    ),
  )
  await action('size')
  await wait((s) => s.note.width === 220 && s.note.height === 110)
  await action('pin')
  await wait((s) => !s.note.show)
  await popups.waitFor({ state: 'hidden' })
  await grid.hover({ position: { x: 260, y: 76 } })
  await popupText(originalText)
  await root.locator('[data-action="pin"]').hover()
  await action('pin')
  await popupText(originalText)
  await root.getByRole('textbox', { name: 'Note draft' }).fill('Humidity 48%; inspected by River team.\n复查 tomorrow.')
  await action('apply')
  await wait((s) => s.note.note.includes('Humidity 48%'))
  await popupText('Humidity 48%; inspected by River team.\n复查 tomorrow.')
  const directText = (await read()).note.note
  await grid.click({ position: { x: 100, y: 76 } })
  await page.keyboard.press('Control+z')
  await settle()
  assert.equal((await read()).note.note, directText, 'Facade mutation does not create Undo history')
  report.checks.push('Native pinned/hover popup, actual dimensions, multiline text and Facade no-Undo boundary')

  await popups.first().fill('Native conservator edit')
  await wait((s) => s.note.note === 'Native conservator edit')
  await grid.click({ position: { x: 100, y: 108 } })
  await page.keyboard.press('Control+z')
  await wait((s, a) => s.note.note === a, directText)
  report.nativeUndoPopup = { expected: directText, actual: await popups.first().inputValue() }
  if (!observeKnownDefects)
    assert.equal(
      report.nativeUndoPopup.actual,
      report.nativeUndoPopup.expected,
      'Native Undo must refresh the visible pinned popup, not only the model',
    )
  else {
    assert.equal(
      report.nativeUndoPopup.actual,
      'Native conservator edit',
      'Observe the disclosed beta.2 stale-popup defect',
    )
    await page.screenshot({ path: path.join(directory, 'native-undo-stale.png') })
  }
  await page.keyboard.press('Control+y')
  await wait((s) => s.note.note === 'Native conservator edit')
  await page.keyboard.press('Control+z')
  await wait((s, a) => s.note.note === a, directText)
  await action('pin')
  await action('pin')
  await popupText(directText)
  await action('read')
  assert.equal(await root.getByRole('textbox', { name: 'Note draft' }).inputValue(), directText)
  assert.ok((await read()).events.some((item) => item.event === 'SheetNoteUpdate'))
  report.checks.push(
    'Native textarea edits, model Undo/Redo with explicit popup reopen, Facade read-draft and actual note events',
  )

  await select('B3:C4')
  assert.match((await read()).note.note, /Light-sensitive/)
  assert.equal((await read()).selection, 'B3:C4')
  const boundary = (await read()).sheets[0].notes.find((note) => note.address === 'C4')
  await root.getByRole('textbox', { name: 'Note draft' }).fill('Covered storage until Friday.\nNo direct sunlight.')
  await action('apply')
  await wait((s) => s.note.note.startsWith('Covered storage'))
  assert.deepEqual(
    (await read()).sheets[0].notes.find((note) => note.address === 'C4'),
    boundary,
  )
  await action('remove')
  await wait((s) => s.note === null)
  for (const name of ['pin', 'size', 'remove'])
    assert.equal(await root.locator(`[data-action="${name}"]`).isDisabled(), true)
  assert.deepEqual(
    (await read()).sheets[0].notes.find((note) => note.address === 'C4'),
    boundary,
  )
  await select('E6')
  await root.getByRole('textbox', { name: 'Note draft' }).fill('Mount reserved — no object assigned yet.')
  await action('apply')
  await wait((s) => s.note?.note.startsWith('Mount reserved'))
  assert.equal((await read()).sheets[0].values[5][4], null)
  await root.getByRole('textbox', { name: 'Note draft' }).fill('   ')
  await settle()
  assert.equal(await root.locator('[data-action="apply"]').isDisabled(), true)
  await action('read')
  const beforeReload = (await read()).sheets
  await action('reload')
  await ready()
  await wait((s) => s.sheets[0].notes.some((note) => note.address === 'E6'))
  assert.deepEqual((await read()).sheets, beforeReload)
  await action('switch')
  await wait((s) => s.sheet === 'Storage')
  await select('B2')
  assert.match((await read()).note.note, /Sensor battery/)
  assert.deepEqual((await read()).sheets[0], beforeReload[0])
  report.checks.push(
    'Top-left-only range semantics, independent neighbor, empty-cell note, blank draft, full two-sheet notes/value round-trip',
  )
  for (let i = 0; i < 3; i++) {
    await action('reset')
    await wait((s) => s.sheet === 'Intake' && s.sheets[0].notes.length === 3)
    assert.deepEqual((await read()).sheets, baseline)
    await root.getByRole('textbox', { name: 'Note draft' }).fill(`Reset cycle ${i + 1}`)
    await action('apply')
    await wait((s, a) => s.note.note === a, `Reset cycle ${i + 1}`)
  }
  await action('reset')
  await popupText(originalText)
  await root.screenshot({ path: path.join(directory, 'light.png') })
  report.checks.push('Three reset cycles restore original data, stable note IDs and popup configuration')
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 })
    await action('pin')
    await root.locator('[data-action="pin"]').focus()
    await page.keyboard.press('Enter')
    await wait((s) => s.note.show)
    for (const name of ['read', 'pin', 'size', 'remove', 'switch', 'reload', 'reset']) {
      const button = root.locator(`[data-action="${name}"]`)
      await button.focus()
      assert.equal(await button.evaluate((el) => el === document.activeElement), true)
    }
    await root.locator('.notes-controls > summary').click()
    assert.ok((await grid.boundingBox()).y < 450)
    await root.screenshot({ path: path.join(directory, `width-${width}.png`) })
    await root.locator('.notes-controls > summary').click()
  }
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  await ready()
  assert.equal(await root.locator('.notes-controls').evaluate((el) => el.open), false)
  assert.ok((await grid.boundingBox()).y < 450)
  await root.locator('.notes-controls > summary').click()
  await select('E6')
  await root.getByRole('textbox', { name: 'Note draft' }).fill('Narrow-screen note')
  await action('apply')
  await wait((s) => s.note?.note === 'Narrow-screen note')
  report.checks.push('760/390/320 keyboard actions, native editor visibility and functional fresh-mobile entry')
  if (url.includes('/playground/')) {
    await page.setViewportSize({ width: 1440, height: 1100 })
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator(`.notes-demo[data-theme="${theme}"][data-ready="true"]`).waitFor()
      assert.deepEqual((await read()).sheets, baseline)
      await action('size')
      await wait((s) => s.note.width === 320)
      await popupText(originalText)
      await root.screenshot({ path: path.join(directory, `theme-${theme}.png`) })
    }
    for (const [locale, title, headings] of [
      ['en-US', 'Cell Notes', ['Variants', 'Actions', 'States']],
      ['zh-CN', '单元格备注', ['变体', '操作', '状态']],
    ]) {
      await page.goto(`${new URL(url).origin}/${locale}/showcase/sheets/notes`, {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      })
      await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
      for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      const embedded = page.frameLocator('iframe').first()
      await embedded.locator('.notes-demo[data-ready="true"]').waitFor()
      const branch = page.locator('aside button').first()
      await branch.click()
      await page.waitForFunction(
        () => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'false',
      )
      await branch.click()
      await page.waitForFunction(() => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'true')
      await embedded.getByRole('textbox', { name: 'Note draft' }).fill(`Guide ${locale} note`)
      await embedded.locator('[data-action="apply"]').click()
      const frame = page.frames().find((item) => item.url().includes('/playground/'))
      await frame.waitForFunction(
        (text) => JSON.parse(document.querySelector('.notes-demo pre').textContent).note.note === text,
        `Guide ${locale} note`,
      )
      await frame.waitForFunction(
        (text) => [...document.querySelectorAll('[data-u-comp="note-textarea"]')].some((el) => el.value === text),
        `Guide ${locale} note`,
      )
      await page.screenshot({ path: path.join(directory, `guide-${locale}.png`) })
    }
    report.checks.push(
      'Both themes, English/Chinese card-free detail pages, hydrated tree and actual iframe note writes',
    )
  }
  assert.deepEqual(report.errors, [])
  report.status = observeKnownDefects ? 'passed-with-known-sdk-defect' : 'passed'
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  report.readback = await page
    .locator('.notes-demo pre')
    .textContent({ timeout: 1000 })
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(JSON.stringify({ ...report, readback: undefined }, null, 2))
assert.ok(report.passed)
