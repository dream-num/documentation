/* eslint-disable no-await-in-loop -- Each locale and native image is checked in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { isDeepStrictEqual } from 'node:util'

import { chromium } from 'playwright'
const output = process.env.SHOWCASE_RESULTS_DIR || 'test-results/doc-images-native-gallery'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1500, height: 1100 } })
const report = { passed: false, locales: [], errors: [], cropDefects: [] }
page.on('pageerror', (error) => report.errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
try {
  for (const locale of ['en-US', 'zh-CN']) {
    await page.goto(
      `${process.env.SHOWCASE_ORIGIN || 'http://localhost:4336'}/${locale}/playground/docs-modern/images-and-wrapping`,
      { waitUntil: 'domcontentloaded', timeout: 120000 },
    )
    const root = page.locator('.images-demo[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    await root.locator('canvas').first().waitFor()
    await root.getByRole('tab', { name: locale === 'zh-CN' ? '插入' : 'Insert', exact: true }).click()
    assert.ok(await root.locator('[data-u-comp="ribbon-grid-toolbar"] [data-u-command]').count())
    await root.getByRole('tab', { name: locale === 'zh-CN' ? '开始' : 'Start', exact: true }).click()
    assert.equal(await root.locator(':scope > fieldset, :scope > details, :scope > output').count(), 0)
    assert.equal(await root.locator(':scope > [role=alert]').isVisible(), false)
    await page.waitForFunction(() => {
      const api = window.univerAPI,
        doc = api.getActiveDocument(),
        injector = api._injector
      const key = [...injector.resolvedDependencyCollection.resolvedDependencies.keys()].find(
        (k) => String(k) === 'engine-render.render-manager.service',
      )
      const unit = injector.get(key).getRenderUnitById(doc.getId())
      return unit.scene.getAllObjects().filter((o) => o.objectType === 3).length >= 10
    })
    const state = await page.evaluate(() => {
      const api = window.univerAPI,
        doc = api.getActiveDocument(),
        injector = api._injector
      // Renderer inspection is test-only diagnostics, not a public demo API.
      const key = [...injector.resolvedDependencyCollection.resolvedDependencies.keys()].find(
        (k) => String(k) === 'engine-render.render-manager.service',
      )
      const unit = injector.get(key).getRenderUnitById(doc.getId())
      return {
        images: doc.getImages().map((image) => ({
          id: image.getId(),
          size: image.getSize(),
          angle: image.getAngle(),
          position: image.getPositionH(),
          data: image.getImageData(),
        })),
        rendered: unit.scene
          .getAllObjects()
          .filter((o) => o.objectType === 3)
          .map((o) => ({ key: o.oKey, crop: o.srcRect ?? null })),
        snapshot: doc.save(),
      }
    })
    assert.equal(state.images.length, 10)
    const image = (id) => state.images.find((i) => i.id === id)
    assert.deepEqual(image('inline').size, { width: 240, height: 150 })
    assert.deepEqual(image('rotated').size, { width: 180, height: 112.5 })
    assert.equal(image('rotated').angle, 15)
    assert.equal(
      new Set(['square-left', 'square-center', 'square-right'].map((id) => image(id).position.align)).size,
      3,
    )
    assert.notEqual(image('behind').data.behindDoc, image('front').data.behindDoc)
    assert.equal(Object.keys(state.snapshot.tableSource ?? {}).length, 0)
    assert.equal((state.snapshot.body.columnGroups ?? []).length, 0)
    for (const id of ['recorder-crop', 'horizon-crop']) {
      const expected =
        id === 'recorder-crop' ? { left: 60, right: 60, top: 0, bottom: 0 } : { left: 0, right: 0, top: 30, bottom: 45 }
      assert.deepEqual(image(id).data.srcRect, expected)
      const rendered = state.rendered.find((item) => item.key.includes(id))
      if (!isDeepStrictEqual(rendered?.crop, expected))
        report.cropDefects.push({ locale, id, expected, actual: rendered?.crop ?? null })
    }
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({ path: `${output}/${locale}-top.png` })
    const canvas = root.locator('canvas').first()
    for (let n = 1; n <= 5; n++) {
      await canvas.hover({ position: { x: 450, y: 350 } })
      await page.mouse.wheel(0, 700)
      await page.waitForTimeout(200)
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.screenshot({ path: `${output}/${locale}-scroll-${n}.png` })
    }
    report.locales.push({ locale, ...state })
  }
  assert.deepEqual(report.errors, [])
  assert.deepEqual(
    report.cropDefects,
    [],
    'Rendered source rectangles must match persisted crop values; known SDK defects remain strict failures.',
  )
  report.passed = true
} finally {
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify({
      passed: report.passed,
      locales: report.locales.length,
      errors: report.errors,
      cropDefects: report.cropDefects,
    }),
  )
  await browser.close()
}
