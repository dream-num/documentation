/* eslint-disable no-await-in-loop -- Native transitions run sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

import { chromium } from 'playwright'

const output = process.env.SHOWCASE_RESULTS_DIR || 'test-results/base-groups-native-gallery'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1500, height: 1100 } })
const report = { passed: false, locales: [], errors: [] }
page.on('pageerror', (error) => report.errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
await page.addInitScript(() => {
  localStorage.setItem('theme', 'light')
  window.__groupPaint = []
  const original = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    const point = this.getTransform().transformPoint({ x: args[1], y: args[2] })
    const rect = this.canvas.getBoundingClientRect()
    window.__groupPaint.push({
      text: String(args[0]),
      x: rect.x + (point.x * rect.width) / this.canvas.width,
      y: rect.y + (point.y * rect.height) / this.canvas.height,
    })
    return Reflect.apply(original, this, args)
  }
})
const variants = [
  ['none', 'No grouping', '无分组', []],
  ['status', 'Status · ascending', '状态升序', ['status:asc']],
  ['reverse', 'Status · descending', '状态降序', ['status:desc']],
  ['nested', 'Status → owner', '状态 → 负责人', ['status:asc', 'owner:asc']],
  ['region', 'Region → status', '区域 → 状态', ['region:desc', 'status:asc']],
  ['empty-shown', 'Show empty groups · SDK flag', '显示空组（SDK 设置）', ['status:asc']],
  ['empty-hidden', 'Hide empty groups · SDK flag', '隐藏空组（SDK 设置）', ['status:asc']],
]
const records = () => page.evaluate(() => window.univerAPI.getActiveBase().save().tables.returns.records)
const collapsed = () =>
  page.evaluate(() => {
    const injector = window.univerAPI._injector
    const token = [...injector.resolvedDependencyCollection.resolvedDependencies.keys()].find(
      (key) => String(key) === 'base-ui.state.service',
    )
    if (!token) throw new Error('Native Base UI state service not found')
    return [...injector.get(token).getCollapsedGroupPaths('status')]
  })
try {
  for (const [language, locale] of ['en-US', 'zh-CN'].entries()) {
    await page.goto(
      `${process.env.SHOWCASE_ORIGIN || 'http://localhost:4336'}/${locale}/playground/bases/group-records`,
      { waitUntil: 'commit', timeout: 120000 },
    )
    const root = page.locator('.base-groups-demo[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    assert.equal(await root.locator(':scope > fieldset, :scope > details, :scope > output, :scope > table').count(), 0)
    const before = await records()
    assert.equal(Object.keys(before).length, 16)
    const checks = []
    for (const [id, en, zh, rules] of variants) {
      await root
        .getByText(language ? zh : en, { exact: true })
        .first()
        .click()
      await page.waitForFunction((viewId) => window.univerAPI.getBaseUI().getActiveViewId() === viewId, id)
      const state = await page.evaluate((viewId) => {
        const view = window.univerAPI.getActiveBase().getTableById('returns').getViewById(viewId)
        return { rules: view.getGroup(), projection: view.getProjection() }
      }, id)
      assert.deepEqual(
        state.rules.map((r) => r.fieldId + ':' + r.direction),
        rules,
      )
      if (id.startsWith('empty-')) assert.equal(state.rules[0].hideEmptyGroup, id === 'empty-hidden')
      const groups = state.projection.groups || []
      if (rules.length) assert.equal(groups.flatMap((g) => g.recordIds).length, 16)
      if (rules.length === 2) assert.ok(groups.some((g) => g.children?.length))
      const verify = (branches, candidates, depth) => {
        if (!rules[depth]) return
        const [field, direction] = rules[depth].split(':')
        const buckets = Object.groupBy(candidates, (recordId) => String(before[recordId].values[field] ?? ''))
        const keys = Object.keys(buckets).toSorted((a, b) => a.localeCompare(b))
        if (direction === 'desc') keys.reverse()
        assert.deepEqual(
          branches.map((branch) => branch.key),
          keys,
        )
        for (const branch of branches) {
          assert.deepEqual(branch.recordIds.toSorted(), buckets[branch.key].toSorted())
          verify(branch.children || [], branch.recordIds, depth + 1)
        }
      }
      verify(groups, Object.keys(before), 0)
      assert.deepEqual(await records(), before)
      await page.screenshot({ path: `${output}/${locale}-${id}.png` })
      checks.push({ id, ...state })
    }
    await page.evaluate(() => {
      window.__groupPaint = []
    })
    await root
      .getByText(language ? '状态升序' : 'Status · ascending', { exact: true })
      .first()
      .click()
    await page.waitForFunction(() => window.__groupPaint.some((p) => p.text === 'Done'))
    const target = await page.evaluate(() => window.__groupPaint.findLast((p) => p.text === 'Done' && p.x < 400))
    assert.ok(target)
    assert.deepEqual(await collapsed(), [])
    await page.mouse.click(target.x - 30, target.y - 4)
    await page.waitForTimeout(200)
    assert.ok((await collapsed()).some((p) => p.endsWith('/status:Done')))
    assert.deepEqual(await records(), before)
    await page.screenshot({ path: `${output}/${locale}-collapsed.png` })
    await page.mouse.click(target.x - 30, target.y - 4)
    await page.waitForTimeout(200)
    assert.deepEqual(await collapsed(), [])
    const saved = await page.evaluate(() => {
      window.__themeOwner = window.univerAPI
      const base = window.univerAPI.getActiveBase()
      if (!base.getTableById('returns').getRecordById('r007').setValue('status', 'Done'))
        throw new Error('SDK rejected edit')
      return base.save()
    })
    for (const theme of ['dark', 'light']) {
      await page.evaluate((value) => {
        localStorage.setItem('theme', value)
        window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: value }))
      }, theme)
      await page.waitForFunction((dark) => window.univerAPI.isDarkMode() === dark, theme === 'dark')
      assert.equal(await page.evaluate(() => window.__themeOwner === window.univerAPI), true)
      assert.deepEqual(await page.evaluate(() => window.univerAPI.getActiveBase().save()), saved)
      await page.screenshot({ path: `${output}/${locale}-${theme}-edited.png` })
    }
    report.locales.push({ locale, views: checks, nativeCollapse: true, editedSnapshotAndOwnerPreserved: true })
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack
  throw error
} finally {
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ passed: report.passed, errors: report.errors, failure: report.failure }))
  await browser.close()
}
