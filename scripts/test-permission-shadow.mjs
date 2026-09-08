/* eslint-disable no-await-in-loop -- Compare each permission state with actual native paint and editing. */
// Historical host-profile harness; current gallery acceptance is test-sheet-protection-native-gallery.mjs.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const url = process.env.SHOWCASE_DEMO_URL || 'http://127.0.0.1:4207'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/permission-shadow')
await fs.mkdir(directory, { recursive: true })
const report = { passed: false, checks: [], errors: [], networkWrites: [] }
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
page.setDefaultTimeout(30000)
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('request', (request) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method()))
    report.networkWrites.push({
      url: request.url(),
      nextAction: !!request.headers()['next-action'],
      frame: request.frame().url(),
    })
})
const root = page.locator('.permission-shadow-demo')
const ready = () => page.locator('.permission-shadow-demo[data-ready="true"]').waitFor()
const read = async () => JSON.parse(await root.locator('pre').textContent())
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const controls = async () => {
  const panel = root.locator('.permission-shadow-controls')
  if (!(await panel.evaluate((e) => e.open))) await panel.locator('summary').click()
}
const action = async (name) => {
  await controls()
  await root.locator(`[data-action="${name}"]`).click()
  await ready()
  await settle()
  assert.doesNotMatch(await root.getByRole('status').textContent(), /Action failed|Readback failed/)
}
const wait = (check, arg) =>
  page.waitForFunction(
    ({ predicate, arg: value }) => {
      const text = document.querySelector('.permission-shadow-demo pre')?.textContent
      return text && new Function('s', 'a', `return (${predicate})(s,a)`)(JSON.parse(text), value)
    },
    { predicate: check.toString(), arg },
  )
const profile = async (value) => {
  await controls()
  await root.getByLabel('Protection profile', { exact: true }).selectOption(value)
  await action('profile')
  await wait((s, a) => s.hostProfile === a, value)
}
const shadow = async (value) => {
  await controls()
  await root.getByLabel('Shadow strategy', { exact: true }).selectOption(value)
  await action('shadow')
  await wait((s, a) => s.shadowStrategy === a, value)
}
const tile = async (x, y) =>
  root
    .locator('canvas[id^="univer-sheet-main-canvas"]:visible')
    .evaluate((canvas, [px, py]) => Array.from(canvas.getContext('2d').getImageData(px, py, 16, 8).data), [x, y])
const capture = (name) => root.screenshot({ path: path.join(directory, name + '.png') })
const native = async (address, value, expected) => {
  const box = root.locator('.permission-shadow-editor input.univer-size-full')
  await box.fill(address)
  await box.press('Enter')
  await page.keyboard.type(String(value))
  await page.keyboard.press('Enter')
  await settle()
  await action('inspect')
  await wait((s, a) => s.rawValues[a.row][a.col] === a.expected, {
    row: Number(address.slice(1)) - 1,
    col: address.charCodeAt(0) - 65,
    expected,
  })
}
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 180000 })
  await ready()
  await wait((s) => s.rawValues[11][2] === 19.75)
  assert.equal(
    await root.locator('[data-u-comp="workbench-layout"]').evaluate((e) => getComputedStyle(e).backgroundColor),
    'rgb(255, 255, 255)',
  )
  await controls()
  await settle()
  const baseline = (await read()).rawValues
  assert.deepEqual(
    baseline.slice(3, 9).map((row) => row[2]),
    [6.5, 3, 0, 8, null, 2.25],
  )
  assert.equal((await read()).cells.C4.canEdit, false)
  const noShadow = await tile(350, 122),
    outside = await tile(665, 122)
  await action('write')
  assert.match(await root.getByRole('status').textContent(), /Blocked by SDK/)
  assert.deepEqual((await read()).rawValues, baseline)
  await native('C4', 17, 6.5)
  // Deselect before paint comparisons, so native selection tint is not mistaken for a protection shadow.
  const box = root.locator('.permission-shadow-editor input.univer-size-full')
  await box.fill('A1')
  await box.press('Enter')
  await settle()
  report.checks.push('Native white CSS, varied fixture, no-shadow protection and denied native/host writes')
  for (const mode of ['worksheet', 'locked', 'editable', 'hidden', 'mixed', 'none']) {
    await profile(mode)
    const state = await read()
    assert.equal(state.rules.length, mode === 'mixed' ? 2 : ['locked', 'editable', 'hidden'].includes(mode) ? 1 : 0)
    assert.equal(state.cells.C4.canEdit, ['editable', 'mixed', 'none'].includes(mode))
    assert.equal(state.cells.C4.canView, mode !== 'hidden')
    assert.equal(state.cells.C8.canEdit, ['editable', 'none'].includes(mode))
    assert.equal(state.cells.B4.canEdit, mode !== 'worksheet')
    for (const strategy of ['none', 'always', 'non-editable', 'non-viewable']) {
      await shadow(strategy)
      const visible =
        mode !== 'none' &&
        strategy !== 'none' &&
        (strategy === 'always' ||
          (strategy === 'non-editable' && !['editable', 'mixed'].includes(mode)) ||
          (strategy === 'non-viewable' && mode === 'hidden'))
      // Permission rendering is throttled by the SDK; poll actual pixels, not a fixed sleep.
      await page.waitForFunction(
        ({ original, visible: shouldShow }) => {
          const canvas = document.querySelector('canvas[id^="univer-sheet-main-canvas"]')
          const pixels = Array.from(canvas.getContext('2d').getImageData(350, 122, 16, 8).data)
          return (JSON.stringify(pixels) !== JSON.stringify(original)) === shouldShow
        },
        { original: noShadow, visible },
      )
      if (mode !== 'worksheet') assert.deepEqual(await tile(665, 122), outside, 'Outside-range paint is unchanged')
      assert.deepEqual((await read()).rawValues, baseline, 'Profiles/strategies do not modify data')
    }
    await shadow('always')
    await capture('profile-' + mode)
  }
  report.checks.push('Six protection profiles × four shadow strategies: actual pixel/readback matrix')
  await profile('mixed')
  await shadow('none')
  await native('C4', 7.75, 7.75)
  await native('C8', 12, null)
  await wait((s) => s.rawValues[11][2] === 21)
  await root.getByLabel('Permission target', { exact: true }).selectOption('C6')
  await root.getByLabel('Hours value', { exact: true }).fill('0')
  await action('write')
  await wait((s) => s.rawValues[5][2] === 0)
  await action('clear')
  await wait((s) => s.rawValues[5][2] === null)
  await root.getByLabel('Hours value', { exact: true }).fill('169')
  await root.locator('[data-action="write"]').click()
  await ready()
  assert.match(await root.getByRole('status').textContent(), /Action failed/)
  report.checks.push(
    'Mixed-range native enforcement, permitted editing/formula updates, host zero/clear and invalid-input rejection',
  )
  await action('sheet')
  await wait((s) => s.activeSheet === 'notes')
  await box.fill('C4')
  await box.press('Enter')
  await page.keyboard.type('23')
  await page.keyboard.press('Enter')
  await action('inspect')
  await wait((s) => s.notes[3][2] === 23)
  await action('sheet')
  await wait((s) => s.activeSheet === 'rota')
  const downloadPromise = page.waitForEvent('download')
  await action('download')
  const download = await downloadPromise
  const savedPath = path.join(directory, download.suggestedFilename())
  await download.saveAs(savedPath)
  const saved = JSON.parse(await fs.readFile(savedPath, 'utf8'))
  assert.equal(saved.sheets.rota.cellData[3][2].v, 7.75)
  await action('empty')
  await wait((s) => s.rawValues.slice(3, 9).every((row) => row[2] === null) && s.rawValues[11][2] === 0)
  await action('reset')
  await wait((s) => s.rawValues[11][2] === 19.75 && s.shadowStrategy === 'none' && !s.cells.C4.canEdit)
  report.checks.push('Independent worksheet, real JSON bytes, Empty formula and Reset/default protection')
  for (const width of [320, 390, 760]) {
    await page.setViewportSize({ width, height: 900 })
    await controls()
    await root.getByLabel('Permission target', { exact: true }).selectOption('C4')
    await root.locator('[data-action="select"]').focus()
    await page.keyboard.press('Space')
    await ready()
    const panel = root.locator('.permission-shadow-controls')
    if (await panel.evaluate((e) => e.open)) await panel.locator('summary').click()
    await settle()
    assert.ok(await root.evaluate((e) => e.scrollWidth <= e.clientWidth + 1))
    await capture('width-' + width)
  }
  report.checks.push('Keyboard selection and 320/390/760 layouts')
  if (url.includes('/playground/')) {
    await page.setViewportSize({ width: 1440, height: 1100 })
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator('.permission-shadow-demo[data-theme="' + theme + '"][data-ready="true"]').waitFor()
      await wait((s) => !s.cells.C4.canEdit && s.rawValues[11][2] === 19.75)
      await shadow('always')
      await capture('theme-' + theme)
    }
    for (const [locale, heading, labels] of [
      ['en-US', 'Hide Permission Background Shadow', ['Variants', 'Actions', 'States']],
      ['zh-CN', '隐藏权限背景阴影', ['变体', '操作', '状态']],
    ]) {
      await page.goto(new URL(url).origin + '/' + locale + '/showcase/sheets/permission', {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      })
      await page.getByRole('heading', { name: heading, level: 1, exact: true }).waitFor()
      for (const name of labels) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      const embedded = page.frameLocator('iframe').first()
      await embedded.locator('.permission-shadow-demo[data-ready="true"]').waitFor()
      const panel = embedded.locator('.permission-shadow-controls')
      if (!(await panel.evaluate((e) => e.open))) await panel.locator('summary').click()
      await embedded.getByLabel('Protection profile', { exact: true }).selectOption('mixed')
      await embedded.locator('[data-action="profile"]').click()
      await embedded.locator('.permission-shadow-demo[data-ready="true"]').waitFor()
      await embedded.getByLabel('Hours value', { exact: true }).fill('12')
      await embedded.locator('[data-action="write"]').focus()
      await page.keyboard.press('Space')
      const frame = page.frames().find((item) => item.url().includes('/playground/'))
      await frame.waitForFunction(
        () => JSON.parse(document.querySelector('.permission-shadow-demo pre').textContent).rawValues[3][2] === 12,
      )
      const branch = page.locator('aside button').first()
      await branch.click()
      await page.waitForFunction(
        () => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'false',
      )
      await branch.click()
      await page.waitForFunction(() => document.querySelector('aside button')?.getAttribute('aria-expanded') === 'true')
    }
    report.checks.push(
      'Both themes, EN/ZH card-free detail pages, hydrated tree and live iframe permission-aware writes',
    )
  }
  assert.deepEqual(report.errors, [])
  assert.ok(report.networkWrites.every((item) => item.nextAction && item.frame.includes('/showcase/')))
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  report.lastState = await read().catch(() => null)
  await capture('failure').catch(() => {})
  process.exitCode = 1
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify(
      {
        ...report,
        lastState: report.lastState
          ? {
              profile: report.lastState.hostProfile,
              shadow: report.lastState.shadowStrategy,
              cells: report.lastState.cells,
            }
          : undefined,
      },
      null,
      2,
    ),
  )
  await browser.close()
}
