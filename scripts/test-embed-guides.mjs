/* eslint-disable no-await-in-loop -- Inspect selected routes and their real iframes sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const origin = process.env.SHOWCASE_GUIDE_ORIGIN || 'http://localhost:4262'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-guides')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, colorScheme: 'light' })
const report = { passed: false, checks: [], errors: [], assets: [] }
// Keep passive asset timings so loading failures can be distinguished from SDK errors.
page.on('requestfinished', (request) => {
  if (['script', 'stylesheet'].includes(request.resourceType()))
    report.assets.push({ url: request.url(), timing: request.timing() })
})
page.on('requestfailed', (request) => {
  if (['script', 'stylesheet'].includes(request.resourceType()))
    report.assets.push({ url: request.url(), timing: request.timing(), failure: request.failure() })
})
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
try {
  for (const entry of [
    {
      slug: 'bases-in-slides-float',
      root: '.solstice-embed',
      host: 'solstice-delivery-review',
      child: 'solstice-supplier-readiness',
      titles: ['Bases in Slides / Delivery Readiness', 'Bases 嵌入 Slides / 交付就绪评审'],
    },
    {
      slug: 'bases-in-slides-tab',
      root: '.copper-embed',
      host: 'copper-retail-launch',
      child: 'copper-channel-workstreams',
      titles: ['Bases in Slides / Launch Workstream', 'Bases 嵌入 Slides / 上市工作流'],
    },
    {
      slug: 'sheets-in-slides-tab',
      root: '.aster-embed',
      host: 'aster-radio-season',
      child: 'aster-pilot-schedule',
      titles: ['Sheets in Slides / Pilot Appendix', 'Sheets 嵌入 Slides / 试播附录'],
    },
    {
      slug: 'sheets-in-slides-float',
      root: '.tamar-embed',
      host: 'tamar-quarterly-review',
      child: 'tamar-revenue-assumptions',
      titles: ['Sheets in Slides / Quarterly Assumptions', 'Sheets 嵌入 Slides / 季度假设'],
    },
    {
      slug: 'boards-in-docs-block',
      root: '.pine-embed',
      host: 'pine-architecture-decision',
      child: 'pine-service-boundaries',
      titles: ['Board in Docs / Architecture Decision', 'Board 嵌入现代文档 / 技术决策'],
    },
    {
      slug: 'slides-in-docs-block',
      root: '.lighthouse-embed',
      host: 'lighthouse-strategy-announcement',
      child: 'lighthouse-strategy-deck',
      titles: ['Slides in Docs / Strategy Announcement', 'Slides 嵌入现代文档 / 策略公告'],
    },
    {
      slug: 'bases-in-docs-block',
      root: '.orchard-embed',
      host: 'orchard-launch-brief',
      child: 'orchard-launch-responsibilities',
      titles: ['Bases in Docs / Launch Responsibilities', 'Bases 嵌入现代文档 / 发布职责'],
    },
    {
      slug: 'sheets-in-docs-block',
      root: '.northstar-embed',
      host: 'northstar-investment-brief',
      child: 'northstar-pilot-budget',
      titles: ['Sheets in Docs / Project Investment Block', 'Sheets 嵌入现代文档 / 项目投资块'],
    },
    {
      slug: 'boards-in-sheets-tab',
      tab: 'Incident timeline',
      root: '.ember-embed',
      host: 'ember-incident-costs',
      child: 'ember-incident-review',
      titles: ['Board in Sheets / Incident Review Tab', 'Board 嵌入 Sheets / 事故复盘标签'],
    },
    {
      slug: 'boards-in-sheets-float',
      root: '.tidal-embed',
      host: 'tidal-berth-costs',
      child: 'tidal-dock-handoff',
      titles: ['Board in Sheets / Dock Handoff', 'Board 嵌入 Sheets / 码头交接'],
    },
    {
      slug: 'bases-in-sheets-tab',
      tab: 'Supplier operations',
      root: '.willow-embed',
      host: 'willow-landed-cost',
      child: 'willow-supplier-operations',
      titles: ['Base in Sheets / Supplier Operations Tab', 'Base 嵌入 Sheets / 供应商运营标签'],
    },
    {
      slug: 'bases-in-sheets-float',
      root: '.atlas-embed',
      host: 'atlas-campaign-spend',
      child: 'atlas-campaign-work',
      titles: ['Base in Sheets / Campaign Owners', 'Base 嵌入 Sheets / 营销执行负责人'],
    },
    {
      slug: 'slides-in-sheets-tab',
      tab: 'Board review',
      root: '.marigold-embed',
      titles: ['Slides in Sheets / Board Review Tab', 'Slides 嵌入 Sheets / 董事会审议标签'],
    },
    {
      slug: 'slides-in-sheets-float',
      host: 'harbor-budget',
      child: 'harbor-decision',
      root: '.harbor-embed',
      titles: ['Slides in Sheets / Floating Decision Brief', 'Slides 嵌入 Sheets / 浮动决策简报'],
    },
    {
      slug: 'docs-in-sheets-float',
      root: '.cedar-embed',
      host: 'cedar-supplier-review',
      child: 'cedar-exception-memo',
      titles: ['Docs in Sheets / Procurement Exception', 'Docs 嵌入 Sheets / 采购例外说明'],
    },
    {
      slug: 'docs-in-sheets-tab',
      tab: 'Assumptions',
      root: '.juniper-embed',
      host: 'juniper-repair-capacity',
      child: 'juniper-capacity-assumptions',
      titles: ['Docs in Sheets / Capacity Assumptions Tab', 'Docs 嵌入 Sheets / 容量假设标签'],
    },
  ]) {
    if (process.argv.length > 2 && !process.argv.slice(2).includes(entry.slug)) continue
    for (const [index, locale] of ['en-US', 'zh-CN'].entries()) {
      await page.goto(`${origin}/${locale}/showcase/embed/${entry.slug}`, {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      })
      await page.getByRole('heading', { level: 1, name: entry.titles[index], exact: true }).waitFor({ timeout: 60000 })
      const headings = index === 0 ? ['Variants', 'Actions', 'States'] : ['变体', '操作', '状态']
      for (const name of headings) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      const iframe = page.locator('iframe').first()
      await iframe.scrollIntoViewIfNeeded()
      // Development compilation can replace the iframe during parent navigation.
      // Resolve its live document when ready instead of retaining the about:blank frame.
      const root = page.frameLocator('iframe').first().locator(`${entry.root}[data-ready=true]`)
      await root.waitFor({ timeout: 120000 })
      const frame = await (await iframe.elementHandle()).contentFrame()
      assert.ok(frame)
      assert.equal(await root.locator(':scope > fieldset, :scope > details, [data-action]').count(), 0)
      const sdk = await root
        .locator('[data-u-comp="workbench-layout"]')
        .first()
        .evaluate((element) => ({
          background: getComputedStyle(element).backgroundColor,
          white: getComputedStyle(element).getPropertyValue('--color-white').trim(),
          flex: getComputedStyle(element.querySelector('.univer-flex')).display,
        }))
      assert.equal(sdk.background, 'rgb(255, 255, 255)')
      assert.equal(sdk.flex, 'flex')
      if (entry.slug === 'bases-in-slides-float') {
        const descriptor = await frame.evaluate(
          (host) => window.univerAPI.listEmbeds({ hostUnitId: host })[0].getDescriptor(),
          entry.host,
        )
        assert.equal(descriptor.entry, 'slides-floating-object')
        assert.equal(descriptor.childUnitId, entry.child)
        await root.locator('[data-u-comp="embed-float-dom"]').waitFor()
        assert.deepEqual(
          await frame.evaluate(
            (childId) =>
              window.univerAPI
                .getBase(childId)
                .getTables()
                .map((table) => table.getRecords().length),
            entry.child,
          ),
          [7, 3],
        )
        await frame.evaluate((childId) => {
          window.themeOwner = window.univerAPI
          window.univerAPI
            .getBase(childId)
            .getTableById('checks')
            .getRecordById('checks-1')
            .setValue('title', 'Enclosure edge review')
        }, entry.child)
        const snapshots = () =>
          frame.evaluate(
            ({ host, child }) => ({
              host: window.univerAPI.getPresentation(host).save(),
              child: window.univerAPI.getBase(child).save(),
            }),
            entry,
          )
        const before = await snapshots()
        for (const colorScheme of ['dark', 'light']) {
          await page.emulateMedia({ colorScheme })
          await frame.waitForFunction(
            (dark) => document.documentElement.classList.contains('univer-dark') === dark,
            colorScheme === 'dark',
          )
          assert.equal(await frame.evaluate(() => window.themeOwner === window.univerAPI), true)
          assert.deepEqual(await snapshots(), before)
        }
        report.themeChecks ??= []
        report.themeChecks.push({ slug: entry.slug, locale, liveThemePreservesOwnerAndSnapshots: true })
      } else if (entry.slug === 'bases-in-slides-tab') {
        const descriptor = await frame.evaluate(
          (host) => window.univerAPI.listEmbeds({ hostUnitId: host })[0].getDescriptor(),
          entry.host,
        )
        assert.equal(descriptor.entry, 'slides-page-list-block')
        assert.equal(descriptor.childUnitId, entry.child)
        await root.locator(`[data-u-comp="slide-thumbnail-item"][data-page-id="${descriptor.hostAnchorId}"]`).click()
        await root.locator('[data-embed-slides-page-list-host]').waitFor()
        assert.deepEqual(
          await frame.evaluate(
            (childId) =>
              window.univerAPI
                .getBase(childId)
                .getTables()
                .map((table) => table.getRecords().length),
            entry.child,
          ),
          [10, 4],
        )
        await frame.evaluate((childId) => {
          window.themeOwner = window.univerAPI
          window.univerAPI
            .getBase(childId)
            .getTableById('workstreams')
            .getRecordById('workstreams-1')
            .setValue('title', 'Counter refill rehearsal')
        }, entry.child)
        const snapshots = () =>
          frame.evaluate(
            ({ host, child }) => ({
              host: window.univerAPI.getPresentation(host).save(),
              child: window.univerAPI.getBase(child).save(),
            }),
            entry,
          )
        const before = await snapshots()
        for (const colorScheme of ['dark', 'light']) {
          await page.emulateMedia({ colorScheme })
          await frame.waitForFunction(
            (dark) => document.documentElement.classList.contains('univer-dark') === dark,
            colorScheme === 'dark',
          )
          assert.equal(await frame.evaluate(() => window.themeOwner === window.univerAPI), true)
          assert.deepEqual(await snapshots(), before)
        }
        report.themeChecks ??= []
        report.themeChecks.push({ slug: entry.slug, locale, liveThemePreservesOwnerAndSnapshots: true })
      } else if (entry.slug === 'sheets-in-slides-tab') {
        const descriptor = await frame.evaluate(
          (host) => window.univerAPI.listEmbeds({ hostUnitId: host })[0].getDescriptor(),
          entry.host,
        )
        assert.equal(descriptor.entry, 'slides-page-list-block')
        assert.equal(descriptor.childUnitId, entry.child)
        await root.locator(`[data-u-comp="slide-thumbnail-item"][data-page-id="${descriptor.hostAnchorId}"]`).click()
        await root.locator('[data-embed-slides-page-list-host]').waitFor()
        await frame.waitForFunction(
          (child) =>
            window.univerAPI.getWorkbook(child).getSheetByName('Schedule').getRange('F13').getRawValue() === 2040,
          entry.child,
        )
        await frame.evaluate((childId) => {
          window.themeOwner = window.univerAPI
          window.univerAPI.getWorkbook(childId).getSheetByName('Schedule').getRange('D5').setValue(3)
        }, entry.child)
        await frame.waitForFunction(
          (childId) =>
            window.univerAPI.getWorkbook(childId).getSheetByName('Schedule').getRange('F13').getRawValue() === 2085,
          entry.child,
        )
        const snapshots = () =>
          frame.evaluate(
            ({ host, child }) => ({
              host: window.univerAPI.getPresentation(host).save(),
              child: window.univerAPI.getWorkbook(child).save(),
            }),
            entry,
          )
        const beforeTheme = await snapshots()
        const canvas = await root.locator('[data-embed-slides-page-list-host] canvas').first().elementHandle()
        for (const colorScheme of ['dark', 'light']) {
          // Exercise actual next-themes media subscription and Preview effects, not direct SDK calls.
          await page.emulateMedia({ colorScheme })
          await frame.waitForFunction(
            (dark) => document.documentElement.classList.contains('univer-dark') === dark,
            colorScheme === 'dark',
          )
          assert.equal(await frame.evaluate(() => window.themeOwner === window.univerAPI), true)
          assert.equal(await canvas.evaluate((el) => el.isConnected), true)
          assert.deepEqual(await snapshots(), beforeTheme)
        }
        report.themeChecks ??= []
        report.themeChecks.push({ slug: entry.slug, locale, liveThemePreservesOwnerAndSnapshots: true })
      } else if (entry.slug.endsWith('-tab')) {
        await root.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: entry.tab }).click()
        await root.locator('[data-embed-sheets-sheet-tab-host]').waitFor()
        if (entry.slug === 'boards-in-sheets-tab') {
          await root.locator('[data-board-viewport-host="true"]').waitFor()
          await frame.waitForFunction(
            (child) =>
              window.univerAPI
                .getBoard(child)
                ?.getShape('guardrail')
                ?.getText()
                .getPlainText()
                .includes('Cap client retries'),
            entry.child,
          )
          const descriptor = await frame.evaluate(
            (host) => window.univerAPI.listEmbeds({ hostUnitId: host })[0].getDescriptor(),
            entry.host,
          )
          assert.equal(descriptor.childUnitId, entry.child)
          assert.equal(descriptor.entry, 'sheets-sheet-tab')
        } else if (entry.slug === 'bases-in-sheets-tab') {
          await frame.waitForFunction(
            (child) =>
              window.univerAPI
                .getBase(child)
                ?.getTableById('suppliers')
                ?.getRecordById('suppliers-1')
                ?.getValue('title') === 'Seabrook Looms',
            entry.child,
          )
          await root.getByText('Follow-ups', { exact: true }).click()
          await root.getByText('Follow-up queue', { exact: true }).waitFor()
          const descriptor = await frame.evaluate(
            (host) => window.univerAPI.listEmbeds({ hostUnitId: host })[0].getDescriptor(),
            entry.host,
          )
          assert.equal(descriptor.childUnitId, entry.child)
          assert.equal(descriptor.entry, 'sheets-sheet-tab')
        } else if (entry.slug === 'docs-in-sheets-tab') {
          await frame.waitForFunction(
            (child) => window.univerAPI.getDocument(child)?.getBody().dataStream.includes('Capacity is not a promise.'),
            entry.child,
          )
          const descriptor = await frame.evaluate(
            (host) => window.univerAPI.listEmbeds({ hostUnitId: host })[0].getDescriptor(),
            entry.host,
          )
          assert.equal(descriptor.childUnitId, entry.child)
          assert.equal(descriptor.entry, 'sheets-sheet-tab')
        } else {
          await root.locator('[data-u-comp="slide-thumbnail-item"]').first().waitFor()
          assert.equal(await root.locator('[data-u-comp="slide-thumbnail-item"]').count(), 3)
          await frame.waitForFunction(
            () => window.univerAPI.getPresentation('marigold-board-deck')?.getActiveSlide()?.getId() === 'overview',
          )
        }
      } else {
        await root.locator('[data-u-comp="embed-float-dom-content"]').waitFor()
        const descriptor = await frame.evaluate(
          (host) => window.univerAPI.listEmbeds({ hostUnitId: host })[0].getDescriptor(),
          entry.host,
        )
        assert.equal(descriptor.childUnitId, entry.child)
        assert.equal(descriptor.context.resolved, true)
        if (entry.slug === 'sheets-in-slides-float') {
          assert.equal(descriptor.entry, 'slides-floating-object')
          assert.equal(await root.locator('[data-u-comp="slide-thumbnail-item"]').count(), 3)
          await frame.waitForFunction(
            (child) =>
              window.univerAPI.getWorkbook(child)?.getSheetBySheetId('channels').getRange('F12').getRawValue() ===
              11532,
            entry.child,
          )
        } else if (entry.slug === 'sheets-in-docs-block') {
          assert.equal(descriptor.entry, 'docs-custom-block')
          await root.locator('[data-u-comp="embed-docs-custom-block"]').waitFor()
          await frame.waitForFunction(
            (child) =>
              window.univerAPI.getWorkbook(child)?.getSheetBySheetId('investment').getRange('D14').getRawValue() ===
              38852,
            entry.child,
          )
        } else if (entry.slug === 'boards-in-docs-block') {
          assert.equal(descriptor.entry, 'docs-custom-block')
          await root.locator('[data-u-comp="embed-docs-custom-block"]').waitFor()
          assert.equal(
            await frame.evaluate(
              (child) => window.univerAPI.getBoard(child).save().pages.boundaries.elementOrder.length,
              entry.child,
            ),
            18,
          )
        } else if (entry.slug === 'slides-in-docs-block') {
          assert.equal(descriptor.entry, 'docs-custom-block')
          await root.locator('[data-u-comp="embed-docs-custom-block"]').waitFor()
          assert.deepEqual(
            await frame.evaluate((child) => window.univerAPI.getPresentation(child).save().slideOrder, entry.child),
            ['strategy', 'evidence', 'learning'],
          )
        } else if (entry.slug === 'bases-in-docs-block') {
          assert.equal(descriptor.entry, 'docs-custom-block')
          await root.locator('[data-u-comp="embed-docs-custom-block"]').waitFor()
          assert.deepEqual(
            await frame.evaluate(
              (child) =>
                window.univerAPI
                  .getBase(child)
                  .getTables()
                  .map((table) => table.getRecords().length),
              entry.child,
            ),
            [8, 5],
          )
        }
      }
      // Keep the host site's sticky navigation outside the captured native editor.
      const bounds = await root.boundingBox()
      assert.ok(bounds)
      if (entry.slug === 'boards-in-sheets-float') {
        const childBounds = await root.locator('[data-u-comp="embed-float-dom"]').boundingBox()
        assert.ok(childBounds)
        assert.ok(
          childBounds.x + childBounds.width <= bounds.x + bounds.width + 1,
          'Tidal must fit the documentation preview without clipping its right-hand nodes',
        )
      }
      await page.evaluate((top) => window.scrollBy(0, top - 112), bounds.y)
      await frame.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      await root.screenshot({ path: path.join(directory, `${entry.slug}-${locale}.png`), timeout: 30000 })
      report.checks.push({ slug: entry.slug, locale, redundantGuideCardRemoved: true, sdk, liveIframe: true })
      assert.deepEqual(report.errors, [])
    }
  }
  assert.ok(report.checks.length > 0, 'No selected Embed guide matched')
  for (const slug of process.argv.slice(2))
    assert.equal(
      report.checks.filter((check) => check.slug === slug).length,
      2,
      `Both locales must be tested for ${slug}`,
    )
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.frames = await Promise.all(
    page.frames().map(async (frame) => ({
      url: frame.url(),
      state: await frame
        .evaluate(() => ({
          readyState: document.readyState,
          roots: [
            ...document.querySelectorAll(
              '.marigold-embed, .harbor-embed, .cedar-embed, .juniper-embed, .atlas-embed, .willow-embed, .tidal-embed, .ember-embed, .northstar-embed, .orchard-embed, .lighthouse-embed, .pine-embed, .tamar-embed',
            ),
          ].map((root) => ({
            ready: root.getAttribute('data-ready'),
            error: root.getAttribute('data-error'),
            bounds: root.getBoundingClientRect().toJSON(),
            children: root.children.length,
          })),
          text: document.body.innerText.slice(-1500),
        }))
        .catch((failure) => ({ failure: String(failure) })),
    })),
  )
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS selected Float/Tab EN/ZH guides and real native previews; this does not certify React unmount faults')
