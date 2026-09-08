/* eslint-disable no-await-in-loop -- Test the two locales and literal recipes sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

assert.ok(process.argv[2], 'Pass the selected export manifest')
const manifest = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
const entry = manifest.find((item) => item.slug === 'slides/shape-fill-and-outline')
assert.ok(entry?.passed)
const readme = await fs.readFile('showcase/slides/shape-fill-and-outline/README.md', 'utf8')
const recipes = [...readme.matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((match) => match[1])
assert.equal(recipes.length, 7)
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/slides-shape-gallery')
await fs.mkdir(directory, { recursive: true })
const { preview } = await import(pathToFileURL(path.join(entry.directory, 'node_modules/vite/dist/node/index.js')))
const server = await preview({
  configFile: false,
  root: entry.directory,
  preview: { host: '127.0.0.1', port: 4433, strictPort: true },
})
const browser = await chromium.launch()
const results = []
try {
  for (const locale of ['en-US', 'zh-CN']) {
    const result = { locale, passed: false, errors: [], backendRequests: [], checks: [] }
    results.push(result)
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    page.setDefaultTimeout(30000)
    await page.route('**/', async (route) => {
      const response = await route.fetch()
      const body = (await response.text()).replace('<html', `<html lang="${locale}"`)
      await route.fulfill({ response, body })
    })
    page.on('pageerror', (error) => result.errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') result.errors.push(message.text())
    })
    page.on('request', (request) => {
      if (request.url().includes('/universer-api/')) result.backendRequests.push(request.url())
    })
    const read = () => page.evaluate(() => window.univerAPI.getActivePresentation().save())
    const settle = () =>
      page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    try {
      await page.goto('http://127.0.0.1:4433/')
      const root = page.locator('.slide-shapes[data-ready=true]')
      await root.waitFor()
      await page.waitForFunction(
        () => window.univerAPI.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Steady,
      )
      assert.equal(await page.locator('html').getAttribute('lang'), locale)
      assert.doesNotMatch(await root.innerText(), /[\u3400-\u9fff]/, 'SDK chrome stays English regardless of host language')
      assert.equal(await root.locator(':scope > button, :scope > fieldset, :scope > details, [data-action]').count(), 0)
      const before = await read()
      assert.deepEqual(before.slideOrder, ['fills', 'outlines', 'geometry', 'gradients'])
      for (const id of before.slideOrder) {
        await root.locator(`[data-u-comp="slide-thumbnail-item"][data-page-id="${id}"]`).click()
        await page.waitForFunction((id) => window.univerAPI.getActivePresentation().getActiveSlide().getId() === id, id)
        await settle()
        await root.screenshot({ path: path.join(directory, `${locale}-${id}.png`) })
      }
      result.checks.push('Four original pages render and native thumbnails navigate')
      const targets = ['fills', 'fills', 'outlines', 'geometry', 'fills', 'gradients', 'gradients']
      for (let i = 0; i < recipes.length; i++) {
        await root.locator(`[data-u-comp="slide-thumbnail-item"][data-page-id="${targets[i]}"]`).click()
        await page.waitForFunction(
          (id) => window.univerAPI.getActivePresentation().getActiveSlide().getId() === id,
          targets[i],
        )
        await page.evaluate((source) => new Function(source)(), recipes[i])
        await settle()
        await root.screenshot({ path: path.join(directory, `${locale}-recipe-${i + 1}.png`) })
      }
      const after = await read()
      assert.equal(after.slides.fills.elements.solid.shapeData.fill.color, '#EAA383')
      // The SDK adds optional flipX/flipY: undefined on a paint write. Check actual geometry, not key presence.
      for (const key of ['left', 'top', 'width', 'height', 'rotation', 'flipX', 'flipY'])
        assert.equal(
          after.slides.fills.elements.solid.transform[key],
          before.slides.fills.elements.solid.transform[key],
        )
      assert.equal(
        after.slides.fills.elements.combined.shapeData.fill.fillType,
        await page.evaluate(() => window.univerAPI.Enum.ShapeFillEnum.NoFill),
      )
      assert.deepEqual(
        after.slides.fills.elements.combined.shapeData.stroke,
        before.slides.fills.elements.combined.shapeData.stroke,
      )
      assert.equal(after.slides.outlines.elements['weight-4'].shapeData.stroke.width, 8)
      assert.equal(after.slides.geometry.elements.rotated.transform.rotation, -15)
      assert.equal(after.slides.fills.elementOrder.length, before.slides.fills.elementOrder.length + 1)
      const gradient = after.slides.gradients.elements['linear-0']
      assert.equal(gradient.shapeData.fill.gradientAngle, 45)
      assert.deepEqual(gradient.shapeData.fill.gradientStops, [
        { position: 0, color: '#EAA383' },
        { position: 1, color: '#F5D77A' },
      ])
      const radial = after.slides.gradients.elements.radial
      assert.equal(
        radial.shapeData.fill.gradientType,
        await page.evaluate(() => window.univerAPI.Enum.ShapeGradientTypeEnum.Radial),
      )
      assert.deepEqual(radial.shapeData.fill.gradientStops, [
        { position: 0, color: '#D2F3E8' },
        { position: 1, color: '#176B73' },
      ])
      assert.deepEqual(after.slides.gradients.elements['linear-90'], before.slides.gradients.elements['linear-90'])
      for (const id of ['linear-0', 'radial'])
        for (const key of ['left', 'top', 'width', 'height', 'rotation', 'flipX', 'flipY'])
          assert.equal(
            after.slides.gradients.elements[id].transform[key],
            before.slides.gradients.elements[id].transform[key],
          )
      result.checks.push('All seven literal README recipes change their documented native model properties')
      await page.evaluate(() => {
        // Facade getters allocate wrappers. Inspect the underlying owner only in this test.
        window.shapeGalleryOwner = window.univerAPI.getActivePresentation()._slideModel
        window.univerAPI.toggleDarkMode(true)
      })
      await settle()
      assert.deepEqual(await read(), after)
      await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
      await settle()
      assert.equal(
        await page.evaluate(() => window.shapeGalleryOwner === window.univerAPI.getActivePresentation()._slideModel),
        true,
      )
      assert.deepEqual(await read(), after)
      result.checks.push('Both theme switches preserve the complete edited presentation and owner')
      assert.deepEqual(result.errors, [])
      assert.deepEqual(result.backendRequests, [])
      result.passed = true
    } catch (error) {
      result.failure = error.stack
      await page.screenshot({ path: path.join(directory, `${locale}-failure.png`) }).catch(() => {})
    } finally {
      await page.close()
    }
  }
} finally {
  await browser.close()
  await server.close()
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(results, null, 2))
}
console.log(JSON.stringify(results, null, 2))
assert.ok(results.length === 2 && results.every((result) => result.passed))
