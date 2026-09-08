/* eslint-disable no-await-in-loop -- Exercise each real host and child through ordered theme changes. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'

import { chromium } from 'playwright'

const origin = process.env.SHOWCASE_ORIGIN || 'http://localhost:4336'
const out = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-sheet-slide-themes')
await fs.mkdir(out, { recursive: true })
const browser = await chromium.launch()
const results = []
try {
  for (const item of [
    {
      kind: 'float',
      root: '.harbor-embed',
      host: 'harbor-budget',
      child: 'harbor-decision',
      cell: 'B5',
      total: 'B18',
      input: '13000',
      expected: 30100,
      page: 'decision',
      shape: 'decision-0',
      entry: 'sheets-floating-object',
    },
    {
      kind: 'tab',
      root: '.marigold-embed',
      host: 'marigold-monthly-review',
      child: 'marigold-board-deck',
      cell: 'C5',
      total: 'C14',
      input: '7500',
      expected: 42580,
      page: 'overview',
      shape: 'cover-title',
      entry: 'sheets-sheet-tab',
    },
  ]) {
    for (const locale of ['en-US', 'zh-CN']) {
      const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, colorScheme: 'light' })
      page.setDefaultTimeout(30000)
      const result = { kind: item.kind, locale, passed: false, errors: [] }
      results.push(result)
      page.on('pageerror', (error) => result.errors.push(error.message))
      page.on('console', (message) => {
        if (message.type() === 'error') result.errors.push(message.text())
      })
      await page.addInitScript(() => {
        window.embedInitialReady = null
        new MutationObserver(() => {
          const root = document.querySelector('.harbor-embed, .marigold-embed')
          if (root && window.embedInitialReady === null) window.embedInitialReady = root.dataset.ready ?? 'missing'
        }).observe(document, { childList: true, subtree: true })
        window.embedPaint = []
        const fill = CanvasRenderingContext2D.prototype.fillText
        CanvasRenderingContext2D.prototype.fillText = function (...args) {
          window.embedPaint.push(String(args[0]))
          return Reflect.apply(fill, this, args)
        }
      })
      try {
        await page.goto(`${origin}/${locale}/playground/embed/slides-in-sheets-${item.kind}`, {
          waitUntil: 'domcontentloaded',
          timeout: 180000,
        })
        const root = page.locator(item.root)
        await root.locator(':scope[data-ready="true"]').waitFor({ timeout: 120000 })
        assert.equal(
          await page.evaluate(() => window.embedInitialReady),
          'false',
          'Readiness must exist before async loading completes',
        )
        assert.equal(await root.getAttribute('data-error'), null)
        const descriptor = await page.evaluate(
          (host) => window.univerAPI.listEmbeds({ hostUnitId: host })[0].getDescriptor(),
          item.host,
        )
        assert.equal(descriptor.entry, item.entry)
        assert.equal(descriptor.childUnitId, item.child)
        assert.equal(descriptor.context.resolved, true)
        assert.equal(await root.locator('fieldset, details, pre, [data-action]').count(), 0)
        // Native SheetTab creation can select its child; select the ledger before editing host cells.
        if (item.kind === 'tab')
          await root.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: 'Cost ledger' }).click()
        await root.getByRole('tab', { name: locale === 'zh-CN' ? '开始' : 'Start', exact: true }).click()
        const name = root.locator('input.univer-size-full').first()
        await name.fill(item.cell)
        await name.press('Enter')
        await page.waitForFunction(
          () =>
            document.activeElement?.getAttribute('contenteditable') === 'true' &&
            document.getSelection().rangeCount > 0,
        )
        await page.keyboard.type(item.input)
        await page.keyboard.press('Enter')
        await page.waitForFunction(
          ({ host, total, expected }) =>
            window.univerAPI.getWorkbook(host).getActiveSheet().getRange(total).getRawValue() === expected,
          item,
        )
        result.nativeHostEdit = true
        if (item.kind === 'float') {
          await root.locator('[data-u-comp="embed-float-dom"]').dblclick({ position: { x: 300, y: 180 } })
          await page.waitForFunction(
            () =>
              document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') ===
              'stage2',
          )
        } else {
          await root.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: 'Board review' }).click()
          await root.locator('[data-embed-sheets-sheet-tab-host]').waitFor()
          await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="overview"]').click()
        }
        // A real Facade rich-text mutation is separate from the native host input above.
        const editedText = `${locale} / Retained ${item.kind} review`
        await page.evaluate(
          ({ child, shape, editedText: replacement }) => {
            window.embedPaint = []
            const text = window.univerAPI.getPresentation(child).getActiveSlide().getShape(shape).getText()
            const rich = text.getRichText().copy()
            rich.getParagraphs()[0].getTextRuns()[0].setText(replacement)
            text.setRichText(rich)
          },
          { ...item, editedText },
        )
        await page.waitForFunction((text) => window.embedPaint.join('').includes(text), editedText)
        const snapshots = await page.evaluate(({ host, child }) => {
          window.embedOwner = window.univerAPI
          window.embedRoot = document.querySelector('.harbor-embed, .marigold-embed')
          window.embedCanvases = [...document.querySelectorAll('canvas')]
          return {
            host: window.univerAPI.getWorkbook(host).save(),
            child: window.univerAPI.getPresentation(child).save(),
          }
        }, item)
        for (const theme of ['dark', 'light']) {
          await page.evaluate((value) => {
            localStorage.setItem('theme', value)
            window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: value }))
          }, theme)
          await page.waitForFunction((dark) => window.univerAPI.isDarkMode() === dark, theme === 'dark')
          await page.evaluate(
            () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
          )
          assert.equal(await page.evaluate(() => window.embedOwner === window.univerAPI), true)
          assert.equal(
            await page.evaluate(() => window.embedRoot === document.querySelector('.harbor-embed, .marigold-embed')),
            true,
          )
          // SDK-owned thumbnail/canvas nodes may refresh. Owner and complete model identity are the contract,
          // not the identity of every internal canvas (record replacements without hiding them).
          result.canvasRetention ??= []
          result.canvasRetention.push(
            await page.evaluate(
              (currentTheme) => ({
                theme: currentTheme,
                old: window.embedCanvases.map((canvas) => ({ id: canvas.id, connected: canvas.isConnected })),
              }),
              theme,
            ),
          )
          const surface =
            item.kind === 'float'
              ? root.locator('[data-u-comp="embed-float-dom"]')
              : root.locator('[data-embed-sheets-sheet-tab-host]')
          await page.waitForFunction(
            (element) =>
              [...element.querySelectorAll('canvas')].some(
                (canvas) => canvas.clientWidth > 100 && canvas.clientHeight > 100,
              ),
            await surface.elementHandle(),
          )
          assert.ok(
            await surface.locator('canvas').evaluateAll((canvases) =>
              canvases.some((canvas) => {
                if (canvas.clientWidth < 100 || canvas.clientHeight < 100) return false
                const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
                let painted = 0
                for (let index = 3; index < pixels.length; index += 64) if (pixels[index] > 0) painted++
                return painted > 1000
              }),
            ),
            'Retained child remains visibly painted after theme change',
          )
          assert.deepEqual(
            await page.evaluate(
              ({ host, child }) => ({
                host: window.univerAPI.getWorkbook(host).save(),
                child: window.univerAPI.getPresentation(child).save(),
              }),
              item,
            ),
            snapshots,
          )
          await root.screenshot({ path: path.join(out, `${item.kind}-${locale}-${theme}.png`) })
        }
        if (item.kind === 'tab') {
          await root.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: 'Cost ledger' }).click()
          await root.locator('input.univer-size-full').first().waitFor()
          await root.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: 'Board review' }).click()
          await root.locator('[data-embed-sheets-sheet-tab-host]').waitFor()
        } else {
          await page
            .getByRole('button', { name: locale === 'zh-CN' ? '下一张幻灯片' : 'Next page', exact: true })
            .click()
          await page.waitForFunction(
            () => window.univerAPI.getPresentation('harbor-decision').getActiveSlide().getId() === 'review',
          )
          await page.getByRole('button', { name: locale === 'zh-CN' ? '上一页' : 'Previous page', exact: true }).click()
          await page.waitForFunction(
            () => window.univerAPI.getPresentation('harbor-decision').getActiveSlide().getId() === 'decision',
          )
        }
        assert.deepEqual(
          await page.evaluate((child) => window.univerAPI.getPresentation(child).save(), item.child),
          snapshots.child,
        )
        result.themeRetention = {
          sameOwner: true,
          sameRoot: true,
          visibleChildCanvas: true,
          fullHostAndChildSnapshots: true,
          nativeNavigationAfterTheme: true,
        }
        result.childEdit = 'Facade rich-text edit with actual canvas repaint; not a native keyboard text test'
        assert.deepEqual(result.errors, [])
        result.passed = true
      } catch (error) {
        result.failure = error.stack || String(error)
        await page.screenshot({ path: path.join(out, `${item.kind}-${locale}-failure.png`) }).catch(() => {})
      } finally {
        await page.close()
        await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(results, null, 2))
      }
    }
  }
} finally {
  await browser.close()
}
console.log(JSON.stringify(results, null, 2))
assert.ok(results.length === 4 && results.every((result) => result.passed))
