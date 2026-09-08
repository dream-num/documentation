/* eslint-disable no-await-in-loop -- Two host languages and sequential native edits/recipes. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const manifestPath = process.argv[2]
const entry = JSON.parse(await fs.readFile(manifestPath, 'utf8')).find((e) => e.slug === 'boards/images-fit-and-crop')
assert.ok(entry?.passed)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/board-images-native')
await fs.mkdir(output, { recursive: true })
const recipes = [
  ...(await fs.readFile('showcase/boards/images-fit-and-crop/README.md', 'utf8')).matchAll(/```ts\r?\n([\s\S]*?)```/g),
].map((m) => m[1])
assert.equal(recipes.length, 4)
const { preview } = await import(
  pathToFileURL(path.join(entry.links.find((e) => e.name === 'vite').target, 'dist/node/index.js'))
)
const server = await preview({
  root: entry.directory,
  configFile: false,
  preview: { host: '127.0.0.1', port: 4452, strictPort: true },
})
const browser = await chromium.launch()
const results = []
const images = (save) => save.pages.gallery.elements
try {
  for (const locale of ['en-US', 'zh-CN']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, locale })
    const result = { locale, passed: false, gates: [], errors: [], paintFailures: [] }
    results.push(result)
    page.on('pageerror', (e) => result.errors.push(e.message))
    await page.addInitScript(() => {
      window.imagePaint = []
      const rectangles = new WeakMap()
      const rect = CanvasRenderingContext2D.prototype.rect
      CanvasRenderingContext2D.prototype.rect = function (...args) {
        rectangles.set(this, args)
        return rect.apply(this, args)
      }
      const draw = CanvasRenderingContext2D.prototype.drawImage
      CanvasRenderingContext2D.prototype.drawImage = function (source, ...args) {
        if (source instanceof HTMLImageElement && source.src.startsWith('data:image/svg')) {
          const m = this.getTransform(),
            r = this.canvas.getBoundingClientRect()
          window.imagePaint.push({
            src: source.src,
            args,
            clip: rectangles.get(this),
            m: { a: m.a, b: m.b, c: m.c, d: m.d, e: m.e, f: m.f },
            rect: { x: r.x, y: r.y, width: r.width, height: r.height },
            canvas: [this.canvas.width, this.canvas.height],
          })
        }
        return draw.call(this, source, ...args)
      }
    })
    await page.route('http://127.0.0.1:4452/', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${locale}">`) })
    })
    const screenshot = (name) => page.screenshot({ path: path.join(output, `${locale}-${name}.png`) })
    const state = () => page.evaluate(() => window.univerAPI.getActiveBoard().save())
    try {
      await page.goto('http://127.0.0.1:4452/')
      await page.locator('[data-ready="true"]').waitFor({ timeout: 60000 })
      await page.waitForTimeout(700)
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
      const initial = await state()
      const paint = await page.evaluate(() => window.imagePaint)
      await fs.writeFile(path.join(output, `${locale}-initial-paint.json`), JSON.stringify(paint, null, 2))
      await screenshot('initial')
      assert.equal(new Set(paint.map((p) => p.src)).size, 3)
      const cropped = paint.findLast(
        (p) => p.src === images(initial).cropped.source && p.clip?.[2] === 160 && p.clip?.[3] === 160,
      )
      assert.ok(cropped, 'Native image draw must have a 160-square crop clip')
      assert.deepEqual(cropped.args.slice(-4), [-160, -80, 320, 160])
      assert.deepEqual(cropped.clip, [-80, -80, 160, 160])
      result.gates.push('three actual SVG sources and expanded 320x160 source draw clipped to 160x160')
      // Observed actual initial screenshot at this viewport; native images paint through an offscreen canvas.
      const x = 310,
        y = 440
      result.nativePoint = { x, y }
      await page.mouse.move(x, y)
      await page.mouse.down()
      await page.mouse.move(x + 35, y + 25, { steps: 12 })
      await page.mouse.up()
      await page.waitForTimeout(250)
      const moved = await state()
      assert.notDeepEqual(images(moved).wide.transform, images(initial).wide.transform)
      for (const id of Object.keys(images(initial)).filter((key) => key !== 'wide'))
        assert.deepEqual(images(moved)[id], images(initial)[id])
      assert.equal(images(moved).wide.source, images(initial).wide.source)
      await screenshot('native-moved')
      result.gates.push('real pointer drag changes only wide image geometry, preserving all other elements')
      for (const [i, code] of recipes.entries()) {
        const previous = images(await state())
        await page.evaluate((recipe) => {
          window.imagePaint = []
          const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
          return new AsyncFunction('univerAPI', recipe)(window.univerAPI)
        }, code)
        await page.waitForTimeout(250)
        const current = images(await state())
        if (i === 0) assert.deepEqual([current.wide.transform.width, current.wide.transform.height], [280, 140])
        if (i === 1) assert.deepEqual(current.cropped.crop, { left: 40, right: 40, top: 0, bottom: 0 })
        if (i === 2) assert.equal(current.portrait.transform.rotation, 12)
        if (i === 3) assert.equal(current.cropped.source, current.square.source)
        const fresh = await page.evaluate(() => window.imagePaint)
        await fs.writeFile(path.join(output, `${locale}-recipe-${i + 1}-paint.json`), JSON.stringify(fresh, null, 2))
        const target = ['wide', 'cropped', 'portrait', 'cropped'][i]
        for (const id of Object.keys(previous).filter((key) => key !== target))
          assert.deepEqual(current[id], previous[id])
        if (i === 0)
          assert.ok(fresh.some((p) => p.src === current.wide.source && p.args.slice(-2).join(',') === '280,140'))
        if (
          i === 1 &&
          !fresh.some(
            (p) =>
              p.src === current.cropped.source &&
              p.clip?.join(',') === '-120,-80,240,160' &&
              p.args.join(',') === '-160,-80,320,160',
          )
        )
          result.paintFailures.push(
            'Recipe 2 saves crop40/40 but native expanded source draw is not the expected 320x160 frame',
          )
        if (i === 2) assert.ok(fresh.some((p) => p.src === current.portrait.source && Math.abs(p.m.b) > 0.1))
        if (i === 3 && !fresh.some((p) => p.src === current.square.source && p.args.slice(-2).join(',') === '160,160'))
          result.paintFailures.push(
            'Recipe 4 saves new square source and zero crop but native image draw is not the expected 160x160 frame',
          )
        await screenshot(`recipe-${i + 1}`)
        result.gates.push(`literal README recipe ${i + 1} exact model; paint checked separately`)
      }
      const beforeTheme = await state()
      await page.evaluate(() => {
        window.imageOwner = window.univerAPI
        window.univerAPI.toggleDarkMode(true)
      })
      await page.waitForTimeout(250)
      assert.deepEqual(await state(), beforeTheme)
      assert.equal(await page.evaluate(() => window.imageOwner === window.univerAPI), true)
      await screenshot('dark')
      await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
      await page.waitForTimeout(200)
      assert.deepEqual(await state(), beforeTheme)
      result.gates.push('same owner and exact complete saved model through dark/light')
      await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
      assert.equal(await page.evaluate(() => Boolean(window.univerAPI)), false)
      assert.equal(await page.locator('.board-images-gallery').count(), 0)
      result.gates.push('pagehide releases owner and owned root')
      assert.deepEqual(result.errors, [])
      result.interactionsPassed = true
      result.passed = result.paintFailures.length === 0
    } catch (error) {
      result.failure = error.stack || String(error)
      await screenshot('failure')
    } finally {
      await page.close()
    }
  }
} finally {
  await browser.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify({ manifestPath, results }, null, 2))
}
console.log(JSON.stringify(results, null, 2))
assert.ok(results.every((r) => r.passed))
