import assert from 'node:assert/strict'
import process from 'node:process'
import { test } from 'node:test'
import { chromium } from 'playwright'

// Run the downloaded Vue menu project on port 3033 before starting these tests.
const origin = process.env.MENU_EXAMPLE_ORIGIN || 'http://127.0.0.1:3033'

async function withExample(mode, verify, initiallyHidden = false) {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL })
  const page = await browser.newPage({ viewport: { width: 1920, height: 1050 } })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  try {
    await page.route('**/main.ts*', async (route) => {
      const response = await route.fetch()
      let source = await response.text()
      assert.ok(source.includes('const univerAPI = editor.univerAPI;'))
      assert.ok(source.includes('createApp(App).mount("#app");'))
      // Expose public Facade and Vue host references for assertions only.
      source = source.replace(
        'const univerAPI = editor.univerAPI;',
        'const univerAPI = editor.univerAPI; window.__menuTestAPI = univerAPI;',
      )
      source = source.replace(
        'createApp(App).mount("#app");',
        'window.__menuTestApp = createApp(App); window.__menuTestApp.mount("#app");',
      )
      if (initiallyHidden) {
        const preset = 'UniverSheetsCorePreset({ container: "univer" })'
        assert.ok(source.includes(preset))
        source = source.replace(
          preset,
          'UniverSheetsCorePreset({ container: "univer", menu: { "review-plugin.menu.approve": { hidden: true } } })',
        )
      }
      await route.fulfill({ response, body: source })
    })
    await page.goto(`${origin}/?example=${mode}`, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => window.__menuTestAPI?.getActiveWorkbook())
    await verify(page)
    await page.evaluate(() => window.__menuTestApp.unmount())
    assert.equal(await page.locator('canvas').count(), 0)
    assert.deepEqual(errors, [])
  } finally {
    await browser.close()
  }
}

async function expectA1(page, value) {
  await page.waitForFunction(
    (expected) => window.__menuTestAPI.getActiveWorkbook().getActiveSheet().getRange('A1').getValue() === expected,
    value,
  )
}

async function disableToolbarButton(page, menuId) {
  await page.getByLabel('Disable toolbar button').check()
  await page.waitForFunction(
    (id) =>
      [...document.querySelectorAll('button[data-u-command]')].some(
        (button) => button.getAttribute('data-u-command') === id && button.disabled,
      ),
    menuId,
  )
}

async function hideAndRestore(page, button) {
  await page.getByLabel('Hide toolbar button').check()
  await button.waitFor({ state: 'hidden' })
  await page.getByLabel('Hide toolbar button').uncheck()
  await button.waitFor()
}

test('application menus edit through Facade, preserve undo, and configure only the chosen menu entry', async () => {
  await withExample('facade', async (page) => {
    const quickApprove = page.getByRole('button', { name: 'Quick approve', exact: true })
    await expectA1(page, 'Draft')
    await quickApprove.click()
    await expectA1(page, 'Approved')
    assert.equal(await page.evaluate(() => window.__menuTestAPI.undo()), true)
    await expectA1(page, 'Draft')
    await disableToolbarButton(page, 'review.quick-approve')
    assert.equal(await quickApprove.isDisabled(), true)
    await quickApprove.click({ force: true })
    await expectA1(page, 'Draft')

    await page.locator('canvas[data-u-unit-id]').click({ button: 'right', position: { x: 320, y: 170 } })
    await page.getByText('Review', { exact: true }).hover()
    await page.getByText('Actions', { exact: true }).hover()
    await page.getByText('Approve', { exact: true }).click()
    await expectA1(page, 'Approved')
    assert.equal(await quickApprove.isDisabled(), true)
    await page.getByLabel('Disable toolbar button').uncheck()
    await hideAndRestore(page, quickApprove)
  })
})

test('plugin menus render their icon, dispatch their own command, preserve undo, and accept Facade configuration', async () => {
  await withExample('plugin', async (page) => {
    const approve = page.getByRole('button', { name: 'Plugin approve', exact: true })
    await approve.waitFor()
    assert.equal(await approve.locator('[data-review-plugin-icon]').count(), 1)
    await expectA1(page, 'Draft')
    await approve.click()
    await expectA1(page, 'Approved by plugin')
    assert.equal(await page.evaluate(() => window.__menuTestAPI.undo()), true)
    await expectA1(page, 'Draft')
    await disableToolbarButton(page, 'review-plugin.menu.approve')
    assert.equal(await approve.isDisabled(), true)
    await approve.click({ force: true })
    await expectA1(page, 'Draft')
    await page.getByLabel('Disable toolbar button').uncheck()
    await hideAndRestore(page, approve)
    await approve.click()
    await expectA1(page, 'Approved by plugin')
    const result = await page.evaluate(async () => {
      const api = window.__menuTestAPI
      api.disposeUnit(api.getActiveWorkbook().getId())
      return api.executeCommand('review-plugin.command.approve')
    })
    assert.equal(result, false)
  })
})

test('initial menu configuration also applies to a plugin registered after preset creation', async () => {
  await withExample(
    'plugin',
    async (page) => {
      const approve = page.getByRole('button', { name: 'Plugin approve', exact: true })
      await approve.waitFor({ state: 'hidden' })
      await page.getByLabel('Hide toolbar button').check()
      await page.getByLabel('Hide toolbar button').uncheck()
      await approve.waitFor()
      await approve.click()
      await expectA1(page, 'Approved by plugin')
    },
    true,
  )
})
