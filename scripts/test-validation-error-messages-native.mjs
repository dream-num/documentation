/* eslint-disable no-await-in-loop -- Preserve separate native enforcement, feedback and strict snapshot gates. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const entry = JSON.parse(await fs.readFile(process.argv[2], 'utf8')).find(
  ({ slug }) => slug === 'sheets/validation-error-messages',
)
assert.ok(entry?.passed)
const source = (await readShowcaseSources()).find(({ slug }) => slug === entry.slug)
for (const [name, content] of Object.entries(source.files))
  assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), content)
const recipes = [...source.files['/README.md'].matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((match) => match[1])
assert.equal(recipes.length, 4)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/validation-error-messages-native')
await fs.mkdir(output, { recursive: true })
const vite = entry.links.find(({ name }) => name === 'vite')
const { preview } = await import(pathToFileURL(path.join(vite.target, 'dist/node/index.js')))
const port = Number(process.env.SHOWCASE_EXPORT_PORT || 4454)
const url = `http://127.0.0.1:${port}/`
const server = await preview({
  root: entry.directory,
  configFile: false,
  preview: { host: '127.0.0.1', port, strictPort: true },
})
const browser = await chromium.launch()
const report = { passed: false, sourceFiles: Object.keys(source.files).length, hosts: [] }
const custom = 'This draft count is outside 1–6 whole crates. Please review it before packing.'
try {
  for (const lang of ['en-US', 'zh-CN']) {
    const result = { lang, errors: [], gates: {} }
    report.hosts.push(result)
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
    page.setDefaultTimeout(10000)
    page.on('pageerror', (error) => result.errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') result.errors.push(message.text())
    })
    await page.route(url, async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${lang}">`) })
    })
    const save = () => page.evaluate(() => window.univerAPI.getActiveWorkbook().save())
    const value = () =>
      page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B5').getValue())
    const status = () =>
      page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B5').getValidatorStatus())
    async function select(address = 'B5') {
      const box = page.locator('input.univer-size-full')
      await box.fill(address)
      await box.press('Enter')
    }
    async function edit(next) {
      await select()
      await page.keyboard.type(String(next))
      await page.keyboard.press('Enter')
    }
    async function shot(name) {
      await page.evaluate(async () => {
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        await Promise.all(
          document
            .getAnimations()
            .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
            .map((a) => a.finished.catch(() => {})),
        )
      })
      await page.screenshot({ path: path.join(output, `${lang}-${name}.png`) })
      await fs.writeFile(path.join(output, `${lang}-${name}.txt`), await page.locator('body').innerText())
    }
    async function gate(name, action) {
      try {
        await action()
        result.gates[name] = { passed: true }
      } catch (error) {
        result.gates[name] = { passed: false, error: error.stack || String(error) }
        await shot(`failure-${name}`)
        const ok = page.getByRole('button', { name: 'OK', exact: true })
        if (await ok.isVisible()) await ok.click()
        await page.keyboard.press('Escape')
      }
      console.log(lang, name, result.gates[name].passed ? 'PASS' : 'FAIL')
    }
    async function hover() {
      await select('G1')
      await page.mouse.move(1500, 900)
      // Installed native hover controller debounces cell transitions by 100 ms.
      await page.waitForTimeout(150)
      const rect = await page.evaluate(() => {
        const r = window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B5').getCellRect()
        const c = [...document.querySelectorAll('canvas')]
          .toSorted((a, b) => b.clientHeight - a.clientHeight)[0]
          .getBoundingClientRect()
        return { x: c.x + r.x + r.width - 7, y: c.y + r.y + 7 }
      })
      await page.mouse.move(rect.x, rect.y)
      await page.getByText('Invalid:', { exact: true }).waitFor()
    }
    async function tab(name) {
      await page.mouse.move(1500, 900)
      await page.getByText(name, { exact: true }).first().click()
    }
    async function waitValue(expected) {
      await page.waitForFunction(
        (v) => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B5').getValue() === v,
        expected,
      )
    }
    try {
      await page.goto(url)
      await page.waitForSelector('.validation-messages-gallery[data-ready="true"]')
      await gate('English-native-initial', async () => {
        assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
        assert.equal(await value(), 2)
        await shot('initial')
      })
      const history = { before: await save() }
      await gate('native-STOP-custom-dialog-and-recovery', async () => {
        await edit(9)
        await page
          .getByText('Each packing allocation needs 1–6 whole crates. Re-enter a supported count.', { exact: true })
          .waitFor()
        await page.getByText('Error', { exact: true }).waitFor()
        await shot('reject-dialog')
        await page.getByRole('button', { name: 'OK', exact: true }).click()
        await page.keyboard.press('Escape')
        assert.equal(await value(), 2)
        assert.deepEqual(await status(), [['valid']])
        history.rejected = await save()
      })
      await gate('rejected-edit-strict-snapshot', async () => assert.deepEqual(history.rejected, history.before))
      await gate('native-valid-entry-after-rejection', async () => {
        await edit(4)
        await waitValue(4)
        assert.deepEqual(await status(), [['valid']])
        await shot('reject-recovered')
      })
      await gate('native-warning-retains-custom-hover', async () => {
        await tab('Keep with message')
        await edit(9)
        await waitValue(9)
        assert.deepEqual(await status(), [['invalid']])
        await hover()
        await page.getByText(custom, { exact: true }).waitFor()
        await shot('warning-custom')
      })
      await gate('native-warning-recovery-and-blank', async () => {
        await edit(4)
        await waitValue(4)
        assert.deepEqual(await status(), [['valid']])
        await select()
        await page.keyboard.press('Delete')
        await waitValue(null)
        assert.deepEqual(await status(), [['valid']])
        await shot('allowed-blank')
      })
      await gate('native-warning-clipboard-and-custom-tip', async () => {
        await select()
        await page.evaluate(() => navigator.clipboard.writeText('9'))
        await page.keyboard.press('Control+v')
        await waitValue(9)
        assert.deepEqual(await status(), [['invalid']])
        await hover()
        await page.getByText(custom, { exact: true }).waitFor()
        await shot('warning-paste')
      })
      await gate('native-generated-error-message', async () => {
        await tab('Default message')
        await edit(9)
        await waitValue(9)
        assert.deepEqual(await status(), [['invalid']])
        await hover()
        const body = await page.locator('body').innerText()
        assert.ok(!body.includes(custom))
        await page.getByText('Value must be between 1 and 6', { exact: true }).waitFor()
        result.generatedMessage = body
        await shot('default-message')
      })
      for (const [index, recipe] of recipes.entries())
        await gate(`literal-${index + 1}`, async () => {
          await page.evaluate(async (code) => {
            const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
            await new AsyncFunction(code)()
          }, recipe)
          await tab(index === 0 ? 'Reject invalid' : 'Keep with message')
          if (index < 3) {
            await edit(9)
            await waitValue(9)
            assert.deepEqual(await status(), [['invalid']])
            await hover()
            if (index === 0)
              await page.getByText('Draft count: use 1–6 whole crates before approval.', { exact: true }).waitFor()
            if (index === 1)
              await page.getByText('Packing review: choose a whole count between 1 and 6.', { exact: true }).waitFor()
            if (index === 2) {
              assert.equal(
                await page
                  .getByText('Packing review: choose a whole count between 1 and 6.', { exact: true })
                  .isVisible(),
                false,
              )
              await page.getByText('Value must be between 1 and 6', { exact: true }).waitFor()
            }
          } else {
            await waitValue(4)
            assert.deepEqual(await status(), [['valid']])
          }
          await shot(`recipe-${index + 1}`)
        })
      await gate('same-owner-themes-full-save-reload', async () => {
        const before = await save()
        await page.evaluate(() => {
          window.messageOwner = window.univerAPI.getActiveWorkbook().getWorkbook()
          window.univerAPI.toggleDarkMode(true)
        })
        await shot('dark')
        await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
        assert.equal(
          await page.evaluate(() => window.messageOwner === window.univerAPI.getActiveWorkbook().getWorkbook()),
          true,
        )
        assert.deepEqual(await save(), before)
        await page.evaluate((data) => {
          window.univerAPI.disposeUnit(data.id)
          window.univerAPI.createWorkbook(data)
        }, before)
        assert.deepEqual(await save(), before)
      })
      await gate('native-feedback-rule-panel', async () => {
        await tab('Default message')
        await select()
        await page.getByRole('tab', { name: 'Data', exact: true }).click()
        await page.getByText('Data validation', { exact: true }).first().click()
        await page.getByText('Data validation management', { exact: true }).click()
        await page.getByText('B5:B10', { exact: true }).click()
        await page.getByText('Advance options', { exact: true }).click()
        await page.getByText('Show warning', { exact: true }).waitFor()
        await page.getByText('Show help text for a selected cell', { exact: true }).waitFor()
        await shot('validation-panel')
        assert.equal(
          await page
            .locator('input')
            .evaluateAll(
              (inputs) => inputs.some((input) => input.value === '1') && inputs.some((input) => input.value === '6'),
            ),
          true,
        )
      })
      await gate('no-runtime-errors', async () => assert.deepEqual(result.errors, []))
      await fs.writeFile(path.join(output, `${lang}-rejection-history.json`), JSON.stringify(history, null, 2))
    } catch (error) {
      result.fatal = error.stack || String(error)
    } finally {
      await page.close()
    }
    result.passed = !result.fatal && Object.values(result.gates).every((g) => g.passed)
  }
  report.passed = report.hosts.every((host) => host.passed)
} finally {
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await new Promise((resolve, reject) => server.httpServer.close((error) => (error ? reject(error) : resolve())))
}
assert.ok(report.passed, `See ${output}/report.json`)
