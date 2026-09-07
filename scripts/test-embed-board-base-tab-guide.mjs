/* eslint-disable no-await-in-loop -- Each locale owns one live editor and theme sequence. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const origin = process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4274'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-board-base-tab-next')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, colorScheme: 'light' })
const report = { passed: false, checks: [], errors: [] }
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
try {
  for (const [locale, title, headings] of [
    ['en-US', 'Boards in Bases / Service Blueprint', ['Variants', 'Actions', 'States']],
    ['zh-CN', 'Boards 嵌入 Bases / 服务蓝图', ['变体', '操作', '状态']],
  ]) {
    const response = await page.goto(`${origin}/${locale}/showcase/embed/boards-in-bases-tab`, {
      waitUntil: 'domcontentloaded',
      timeout: 180000,
    })
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
    for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
    const iframe = page.locator('iframe').first()
    await iframe.scrollIntoViewIfNeeded()
    // The localized page can replace its initial iframe during hydration.
    // Resolve the current frame only after the live SDK preview is ready.
    const root = page.frameLocator('iframe').first().locator('.cove-embed[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    const frame = await (await iframe.elementHandle()).contentFrame()
    assert.ok(frame)
    await root.getByText('Service blueprint', { exact: true }).click()
    const child = root.locator('[data-embed-bases-table-list-host="cove-blueprint-tab"]')
    await child.waitFor()
    await child.getByRole('button', { name: 'Undo', exact: true }).waitFor()
    assert.equal(await child.evaluate((el) => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)')
    assert.equal(await root.locator('fieldset,[data-action]').count(), 0)
    await frame.waitForFunction(
      () => window.univerAPI.getBoard('cove-service-blueprint').getElementOrder().length === 41,
    )
    await frame.evaluate(() => {
      window.themeOwner = window.univerAPI
      window.univerAPI
        .getBoard('cove-service-blueprint')
        .getShape('desk-collect')
        .getText()
        .setText('A clear handoff\nConfirm the return desk.')
      window.univerAPI
        .getBase('cove-lending-desk')
        .getTableById('requests')
        .getRecordById('requests-1')
        .setValue('next', 'Confirm microphone and spare battery')
    })
    await frame.waitForFunction(() =>
      window.univerAPI
        .getBoard('cove-service-blueprint')
        .getShape('desk-collect')
        .getText()
        .getPlainText()
        .includes('Confirm the return desk.'),
    )
    const read = () =>
      frame.evaluate(() =>
        JSON.parse(
          JSON.stringify({
            host: window.univerAPI.getBase('cove-lending-desk').save(),
            child: window.univerAPI.getBoard('cove-service-blueprint').save(),
          }),
        ),
      )
    const snapshot = await read()
    assert.deepEqual(snapshot.host.tableOrder, ['requests', 'cove-blueprint-tab', 'touchpoints'])
    for (const colorScheme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme })
      await frame.waitForFunction(
        (dark) => document.documentElement.classList.contains('univer-dark') === dark,
        colorScheme === 'dark',
      )
      assert.equal(await frame.evaluate(() => window.themeOwner === window.univerAPI), true)
      const actual = await read()
      assert.deepEqual(actual.host, snapshot.host)
      assert.equal(actual.child.theme.id, snapshot.child.theme.id)
      assert.deepEqual({ ...actual.child, theme: snapshot.child.theme }, snapshot.child)
    }
    await root.screenshot({ path: path.join(directory, `${locale}.png`) })
    report.checks.push({
      locale,
      redundantGuideCardRemoved: true,
      nativeBoardTools: true,
      whiteChildCSS: true,
      themePreservesOwnerAndEditedSnapshot: true,
    })
    assert.deepEqual(report.errors, [])
  }
  report.passed = true
} catch (error) {
  report.failure = error.stack
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS Cove EN/ZH guides, native Board tools and theme owner/data preservation')
