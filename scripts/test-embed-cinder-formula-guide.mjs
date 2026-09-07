/* eslint-disable no-await-in-loop -- Check each locale and the published snippets in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-cinder-formula-next')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/base-to-modern-doc/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 17)
const states = [
  [8, 2, 2, 4, 165, 40, 300, 0.5, 82.5, 'Investigation continues'],
  [8, 2, 2, 4, 195, 40, 330, 0.5, 97.5, 'Investigation continues'],
  [8, 1, 3, 4, 45, 190, 330, 0.5, 45, 'Investigation continues'],
  [8, 1, 3, 4, 0, 190, 285, 0.5, 0, 'Investigation continues'],
  [8, 1, 3, 4, 0, 190, 285, 0.5, 0, 'Investigation continues'],
  [8, 3, 2, 3, 180, 40, 300, 0.375, 60, 'Investigation continues'],
  [8, 3, 2, 3, 180, 40, 300, 0.375, 60, 'Investigation continues'],
  [8, 3, 2, 3, 180, 40, 300, 0.375, 60, 'Investigation continues'],
  [8, 3, 2, 3, 180, 40, 330, 0.375, 60, 'Investigation continues'],
  [8, 3, 2, 3, 180, 40, 330, 0.375, 60, 'Investigation continues'],
  [8, 0, 0, 8, 0, 0, 330, 1, '#DIV/0!', 'No open investigations'],
  [8, 3, 2, 3, 180, 40, 300, 0.375, 60, 'Investigation continues'],
]
const browser = await chromium.launch()
states.push(
  states[11],
  [8, 3, 2, 3, 181, 40, 301, 0.375, 181 / 3, 'Investigation continues'],
  [8, 3, 2, 3, 181, 40, 301, 0.375, 181 / 3, 'Investigation continues'],
  null,
  [8, 3, 2, 3, 183, 40, 303, 0.375, 61, 'Investigation continues'],
)
const page = await browser.newPage({ viewport: { width: 1700, height: 1200 }, colorScheme: 'light' })
page.setDefaultTimeout(15000)
const report = { passed: false, checks: [], errors: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
})
try {
  for (const [locale, title] of [
    ['en-US', 'Cinder / Incident Briefing'],
    ['zh-CN', 'Cinder / 事故交接简报'],
  ]) {
    const response = await page.goto(
      (process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4328') +
        '/' +
        locale +
        '/showcase/embed/base-to-modern-doc',
      { waitUntil: 'domcontentloaded', timeout: 180000 },
    )
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
    for (const name of ['What it demonstrates', '功能说明', 'Variants', '变体', 'Expected result', '预期结果'])
      assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
    const iframe = page.locator('iframe').first()
    await iframe.scrollIntoViewIfNeeded()
    await page.frameLocator('iframe').first().locator('.cinder-embed[data-ready=true]').waitFor({ timeout: 120000 })
    const frame = await (await iframe.elementHandle()).contentFrame()
    const root = frame.locator('.cinder-embed[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
    assert.equal(await root.locator('[data-u-comp="embed-float-dom"]').count(), 1)
    const settle = () =>
      frame.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    const block = frame.locator('[data-u-comp="embed-float-dom"][data-embed-id="cinder-base-block"]')
    const viewport = await iframe.boundingBox()
    for (let i = 0; i < 20; i++) {
      const rect = await block.boundingBox()
      if (rect.y >= viewport.y + 145 && rect.y + 160 < Math.min(1200, viewport.y + viewport.height) - 30) break
      await page.mouse.move(viewport.x + viewport.width - 80, Math.max(180, Math.min(800, viewport.y + 400)))
      await page.mouse.wheel(0, rect.y - (viewport.y + 230))
      await settle()
    }
    const rect = await block.boundingBox()
    await page.mouse.dblclick(rect.x + 180, rect.y + 110)
    await frame.waitForFunction(
      () =>
        document
          .querySelector('[data-u-comp="embed-float-dom"][data-embed-id="cinder-base-block"]')
          ?.getAttribute('data-embed-float-stage') === 'stage2',
    )
    await frame
      .locator('[data-u-comp="embed-float-dom-chrome"][data-embed-id="cinder-base-block"]')
      .getByRole('button', { name: 'Enter fullscreen', exact: true })
      .click()
    const shell = frame.locator('[data-embed-fullscreen-shell=true]')
    await shell.waitFor()
    await frame.evaluate(() => {
      window.themeOwner = window.univerAPI
    })
    const originalBody = await frame.evaluate(() => window.univerAPI.getDocument('cinder-incident-brief').save().body)
    for (const [i, wanted] of states.entries()) {
      const beforeWrite =
        i === 14 ? await frame.evaluate(() => window.univerAPI.getDocument('cinder-incident-brief').save()) : null
      await frame.evaluate(examples[i])
      await frame.waitForFunction((targets) => {
        const actual = window.univerAPI
          .getDocument('cinder-incident-brief')
          .getFormulas()
          .map((f) => f.getResult())
        if (!targets)
          return (
            actual.length === 10 &&
            actual.every((r) => !r.stale) &&
            actual.some((r) => r.value === '#REF!' || r.value === '#VALUE!')
          )
        return (
          actual.length === 10 &&
          actual.every(
            (r, resultIndex) =>
              !r.stale &&
              (typeof targets[resultIndex] === 'string'
                ? r.value === targets[resultIndex]
                : r.status === 'success' && Math.abs(r.value - targets[resultIndex]) < 1e-9),
          )
        )
      }, wanted)
      assert.deepEqual(
        await frame.evaluate(() => window.univerAPI.getDocument('cinder-incident-brief').save().body),
        originalBody,
      )
      if (beforeWrite)
        assert.deepEqual(
          await frame.evaluate(() => window.univerAPI.getDocument('cinder-incident-brief').save()),
          beforeWrite,
        )
    }
    await shell.getByRole('button', { name: 'Exit fullscreen', exact: true }).click()
    await shell.waitFor({ state: 'detached' })
    await settle()
    const read = () =>
      frame.evaluate(() =>
        JSON.parse(
          JSON.stringify({
            doc: window.univerAPI.getDocument('cinder-incident-brief').save(),
            base: window.univerAPI.getBase('cinder-incident-register').save(),
          }),
        ),
      )
    const before = await read()
    for (const colorScheme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme })
      await frame.waitForFunction(
        (dark) => document.documentElement.classList.contains('univer-dark') === dark,
        colorScheme === 'dark',
      )
      assert.equal(await frame.evaluate(() => window.themeOwner === window.univerAPI), true)
      assert.deepEqual(await read(), before)
    }
    assert.equal(
      await root
        .locator('[data-u-comp="workbench-layout"]')
        .first()
        .evaluate((e) => getComputedStyle(e).backgroundColor),
      'rgb(255, 255, 255)',
    )
    await page.mouse.move(viewport.x + viewport.width - 80, Math.max(180, Math.min(800, viewport.y + 400)))
    await page.mouse.wheel(0, -20000)
    await settle()
    await root.screenshot({ path: path.join(directory, locale + '.png') })
    report.checks.push({
      locale,
      literalExamples: 17,
      formulaOutputs: 10,
      authoredBodyPreserved: true,
      ownerAndModelsPreserved: true,
      redundantGuideCardRemoved: true,
      note: 'Rename, idempotent binding and same-source mapping repair included; native error-status and reentry-history failures remain in the independent report.',
    })
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(JSON.stringify(report, null, 2))
if (!report.passed) process.exitCode = 1
