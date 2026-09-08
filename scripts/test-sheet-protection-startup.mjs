/* eslint-disable no-await-in-loop -- Startup fault scenarios are isolated in fresh pages. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

import { chromium } from 'playwright'

const output = 'test-results/sheet-protection-startup'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch()
const report = { passed: false, scenarios: [], errors: [] }
try {
  for (const scenario of ['release', 'reject']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    page.setDefaultTimeout(30000)
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text())
    })
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'light')
      let api
      Object.defineProperty(window, 'univerAPI', {
        configurable: true,
        get: () => api,
        set(value) {
          api = value
          if (!value) return
          value.addEvent(value.Event.LifeCycleChanged, ({ stage }) => {
            if (stage !== value.Enum.LifecycleStages.Rendered) return
            const sheet = value.getActiveWorkbook().getActiveSheet()
            const prototype = Object.getPrototypeOf(sheet.getWorksheetPermission())
            const original = prototype.protect
            // Test-only: intercept exactly the first public protection call, before the factory's Rendered callback.
            prototype.protect = async function (...args) {
              prototype.protect = original
              window.startupHeld = true
              await new Promise((resolve, reject) => {
                window.releaseProtection = resolve
                window.rejectProtection = () => reject(new Error('TEST_PERMISSION_STARTUP_REJECTED'))
              })
              return original.apply(this, args)
            }
          })
        },
      })
    })
    await page.goto(`${process.env.SHOWCASE_ORIGIN || 'http://localhost:4336'}/en-US/playground/sheets/permission`, {
      waitUntil: 'domcontentloaded',
      timeout: 120000,
    })
    await page.waitForFunction(() => window.startupHeld === true, {}, { timeout: 120000 })
    const root = page.locator('.permission-shadow-demo')
    assert.equal(await root.getAttribute('data-ready'), 'false')
    assert.equal(await root.locator('select').isDisabled(), true)
    const snapshot = () => page.evaluate(() => JSON.stringify(window.univerAPI.getActiveWorkbook().save()))
    const original = await snapshot()
    const attempt = async () => {
      await root.locator('canvas[id^="univer-sheet-main-canvas"]:visible').click({ position: { x: 410, y: 132 } })
      await page.keyboard.press('F2')
      await page.keyboard.type('983')
      await page.keyboard.press('Enter')
      await root.getByText('Unprotected', { exact: true }).last().click()
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      assert.equal(await snapshot(), original, 'Pending/failed user input cannot mutate the workbook')
      assert.equal(
        await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getSheetId()),
        'worksheet',
        'Native sheet click is gated',
      )
    }
    await attempt()
    await root.screenshot({ path: `${output}/${scenario}-held.png` })
    if (scenario === 'release') {
      await page.evaluate(() => window.releaseProtection())
      await page.locator('.permission-shadow-demo[data-ready=true]').waitFor()
      await root.getByText('Unprotected', { exact: true }).last().click()
      await page.waitForFunction(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getSheetId() === 'none')
      await root.locator('canvas[id^="univer-sheet-main-canvas"]:visible').click({ position: { x: 410, y: 132 } })
      await page.keyboard.press('F2')
      await page.waitForFunction(
        () =>
          document.activeElement?.getAttribute('contenteditable') === 'true' && document.getSelection().rangeCount > 0,
      )
      await page.keyboard.press('Control+A')
      await page.keyboard.type('83')
      await page.keyboard.press('Enter')
      await page.waitForFunction(
        () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('C4').getValue() === 83,
      )
      assert.deepEqual(errors, [])
      report.scenarios.push({ scenario, pendingNativeInputBlocked: true, releasedNativeInput: 83 })
    } else {
      await page.evaluate(() => window.rejectProtection())
      await page.locator('.permission-shadow-demo[data-ready=error]').waitFor()
      assert.match(await root.getByRole('alert').innerText(), /TEST_PERMISSION_STARTUP_REJECTED/)
      assert.equal(await root.locator('select').isDisabled(), true)
      await attempt()
      assert.equal(errors.length, 1)
      assert.match(errors[0], /TEST_PERMISSION_STARTUP_REJECTED/)
      report.scenarios.push({
        scenario,
        pendingNativeInputBlocked: true,
        rejectedNativeInputBlocked: true,
        expectedError: errors[0],
      })
    }
    await page.evaluate(() => {
      const input = document.createElement('input')
      input.id = 'startup-host-probe'
      document.body.append(input)
    })
    await page.locator('#startup-host-probe').click()
    await page.keyboard.type('host input')
    assert.equal(await page.locator('#startup-host-probe').inputValue(), 'host input', 'Gate is scoped to its editor')
    await page.locator('#startup-host-probe').evaluate((input) => input.remove())
    report.scenarios.at(-1).outsideHostInput = true
    await root.screenshot({ path: `${output}/${scenario}-final.png` })
    await page.close()
  }
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  process.exitCode = 1
} finally {
  await fs.writeFile(output + '/report.json', JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
}
