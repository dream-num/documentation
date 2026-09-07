/* eslint-disable no-await-in-loop -- Only explicitly selected demos are visited, sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import { captureShowcase } from './screenshot-showcase.mjs'
import scopeLoader from './showcase-scope-loader.cjs'

const slugs = [...new Set(process.argv.slice(2))]
scopeLoader.filterRegistry(await fs.readFile('showcase/data.ts', 'utf8'), slugs)
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/showcase-ribbon-ui')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const results = []
try {
  for (const slug of slugs) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
    try {
      const page = await context.newPage()
      const result = await captureShowcase(page, {
        slug,
        origin: process.env.SHOWCASE_ORIGIN || 'http://localhost:3030',
        directory,
        timeout: 180000,
      })
      results.push(result)
      assert.ok(result.passed, result.failure)
      result.passed = false
      const classic = ['sheets/slim-via-plugin', 'docs/slim-via-plugin'].includes(slug)
      const preview = page.locator('[data-showcase-preview]').first()
      const toolbar = preview.locator(
        classic ? '[data-u-comp="ribbon-toolbar"]' : '[data-u-comp="ribbon-grid-toolbar"]',
      )
      await toolbar.waitFor({ state: 'visible' })
      assert.equal(await toolbar.count(), 1, 'Exactly one native toolbar uses the requested layout')
      assert.equal(
        await preview
          .locator(classic ? '[data-u-comp="ribbon-grid-toolbar"]' : '[data-u-comp="ribbon-toolbar"]')
          .count(),
        0,
      )
      result.ribbon = {
        type: classic ? 'classic' : 'grid',
        height: (await toolbar.boundingBox()).height,
        nativeControls: await toolbar.locator('[data-u-command]').count(),
      }
      assert.ok(result.ribbon.nativeControls > 0, 'The toolbar is populated by SDK plugins, not an empty wrapper')
      if (slug.startsWith('slides/')) {
        result.canvasHeight = await preview.locator('canvas').evaluateAll((canvases) => {
          const bounds = canvases.map((canvas) => canvas.getBoundingClientRect())
          return bounds.toSorted((a, b) => b.width - a.width)[0]?.height ?? 0
        })
        assert.ok(result.canvasHeight >= 300, `${slug}: native ribbon must leave a readable main canvas`)
      }
      result.passed = true
      console.log(JSON.stringify({ slug, ...result.ribbon, passed: true }))
    } finally {
      await context.close()
    }
  }
} finally {
  await browser.close()
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(results, null, 2))
}
