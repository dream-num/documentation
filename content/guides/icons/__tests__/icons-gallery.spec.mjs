import assert from 'node:assert/strict'
import process from 'node:process'
import { test } from 'node:test'

import { chromium } from 'playwright'

import { routing } from '../../../../i18n/routing.ts'

test('icon preview renders at the default URL and in every supported locale', async () => {
  const origin = process.env.DOCS_TEST_ORIGIN ?? 'http://localhost:3030'
  const browser = await chromium.launch()
  try {
    await Promise.all(
      routing.locales.map(async (locale) => {
        const page = await browser.newPage()
        const errors = []
        page.on('pageerror', (error) => errors.push(error.message))
        const prefix = locale === routing.defaultLocale ? '' : `/${locale}`
        try {
          const response = await page.goto(`${origin}${prefix}/guides/icons/all-icons`)
          assert.equal(response.status(), 200, locale)
          await page.locator('[data-icon-controls]').getByRole('slider').waitFor()
          assert((await page.locator('[data-icon-gallery] section button').count()) > 0, locale)
          assert.deepEqual(errors, [], locale)
        } finally {
          await page.close()
        }
      }),
    )
  } finally {
    await browser.close()
  }
})

test('icon preview supports semantic selection and usable controls while scrolling', async () => {
  const origin = process.env.DOCS_TEST_ORIGIN ?? 'http://localhost:3030'
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    permissions: ['clipboard-read', 'clipboard-write'],
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error' && /NaN|non-finite|Infinity/.test(message.text())) errors.push(message.text())
  })
  try {
    await page.goto(`${origin}/zh-CN/guides/icons/all-icons`)
    const gallery = page.locator('[data-icon-gallery]')
    const controls = page.locator('[data-icon-controls]')
    await page.getByRole('button', { name: '主色', exact: true }).waitFor()
    assert(await page.getByRole('slider', { name: '尺寸', exact: true }).isVisible())
    assert.equal(await controls.locator('select, input[type=color], details').count(), 0)

    await page.getByRole('textbox', { name: '搜索图标名称或用途' }).fill('duplicate')
    await gallery.getByRole('button', { name: '复制 import: CopyIcon', exact: true }).click()
    assert.equal(
      await page.evaluate(() => navigator.clipboard.readText()),
      "import { CopyIcon } from '@univerjs/icons'",
    )
    await page.getByRole('textbox', { name: '搜索图标名称或用途' }).fill('')
    await page.getByRole('combobox', { name: '图标分类', exact: true }).click()
    await page.getByRole('option', { name: '图解与连接符', exact: true }).click()
    await page.locator('[data-slot=select-content]:visible').first().waitFor({ state: 'hidden' })
    assert.equal(await gallery.locator('section').count(), 1)
    await page.getByRole('combobox', { name: '颜色类型', exact: true }).click()
    await page.getByRole('option', { name: '双色', exact: true }).click()
    await page.locator('[data-slot=select-content]:visible').first().waitFor({ state: 'hidden' })
    assert.match(await page.getByRole('combobox', { name: '图标分类', exact: true }).innerText(), /全部分类/)

    const size = page.getByRole('slider', { name: '尺寸', exact: true })
    const originalSize = await size.getAttribute('aria-valuenow')
    await size.focus()
    await page.keyboard.press('ArrowRight')
    assert.notEqual(await size.getAttribute('aria-valuenow'), originalSize)
    const sizeTrack = await controls.locator('[data-slot=slider-track]').boundingBox()
    async function dragSizeTo(fraction) {
      const thumb = await controls.locator('[data-slot=slider-thumb]').boundingBox()
      await page.mouse.move(thumb.x + thumb.width / 2, thumb.y + thumb.height / 2)
      await page.mouse.down()
      await page.mouse.move(sizeTrack.x + sizeTrack.width * fraction, thumb.y + thumb.height / 2, { steps: 8 })
      await page.mouse.up()
      const min = Number(await size.getAttribute('min'))
      const max = Number(await size.getAttribute('max'))
      const expected = min + (max - min) * fraction
      assert.equal(Number(await size.getAttribute('aria-valuenow')), expected)
      assert.equal(await controls.locator('output').textContent(), `${expected} px`)
      assert.equal(
        await gallery
          .locator('section button svg')
          .first()
          .evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize)),
        expected,
      )
    }
    await dragSizeTo(1)
    await dragSizeTo(0)
    await dragSizeTo(0.5)
    await page.mouse.click(sizeTrack.x + sizeTrack.width - 1, sizeTrack.y + sizeTrack.height / 2)
    assert.equal(await size.getAttribute('aria-valuenow'), await size.getAttribute('max'))
    await page.getByRole('button', { name: '保持描边', exact: true }).click()
    assert.equal(await page.getByRole('button', { name: '保持描边', exact: true }).getAttribute('aria-pressed'), 'true')
    await page.getByRole('button', { name: '重置预览', exact: true }).click()
    assert.equal(await size.getAttribute('aria-valuenow'), originalSize)
    assert.equal(
      await page.getByRole('button', { name: '保持描边', exact: true }).getAttribute('aria-pressed'),
      'false',
    )
    await page.getByRole('button', { name: '主色', exact: true }).click()
    const colorPopover = page.locator('[data-slot=popover-content]')
    await colorPopover.waitFor()
    async function dragColorSlider(slider) {
      const before = Number(await slider.getAttribute('aria-valuenow'))
      const thumb = await slider.locator('..').boundingBox()
      await page.mouse.move(thumb.x + thumb.width / 2, thumb.y + thumb.height / 2)
      await page.mouse.down()
      await page.mouse.move(thumb.x + thumb.width / 2 + (before === 0 ? 40 : -40), thumb.y + thumb.height / 2, {
        steps: 8,
      })
      await page.mouse.up()
      const after = Number(await slider.getAttribute('aria-valuenow'))
      assert(Number.isFinite(after))
      assert.notEqual(after, before)
    }
    await dragColorSlider(colorPopover.getByRole('slider', { name: 'Hue', exact: true }))
    await dragColorSlider(colorPopover.getByRole('slider', { name: 'Opacity', exact: true }))
    await colorPopover.getByRole('combobox').click()
    await page.getByRole('option', { name: 'CSS', exact: true }).click()
    await page.locator('[data-slot=select-content]:visible').first().waitFor({ state: 'hidden' })
    const cssColor = await colorPopover.getByRole('textbox').inputValue()
    assert(await page.evaluate((value) => CSS.supports('color', value), cssColor))
    await page.keyboard.press('Escape')

    await page.getByRole('combobox', { name: '颜色类型', exact: true }).click()
    await page.getByRole('option', { name: '全部', exact: true }).click()
    await page.locator('[data-slot=select-content]:visible').first().waitFor({ state: 'hidden' })
    await page.locator('[data-doc-scroll-container]').evaluate((el) => {
      el.scrollTop = 850
    })
    await page.waitForTimeout(200)
    const bounds = await page.evaluate(() => ({
      control: document.querySelector('[data-icon-controls]').getBoundingClientRect().top,
      main: document.querySelector('[data-doc-scroll-container]').getBoundingClientRect().top,
    }))
    assert(Math.abs(bounds.control - bounds.main) < 2, JSON.stringify(bounds))
    await page.screenshot({ path: '/tmp/icons-preview-desktop.png' })

    const lightColor = await page
      .getByRole('button', { name: '主色', exact: true })
      .evaluate((el) => el.style.backgroundColor)
    await page.getByRole('button', { name: '重置预览', exact: true }).click()
    await page.locator('header').getByRole('button', { name: '选择主题', exact: true }).click()
    await page.waitForFunction(
      (previous) => document.querySelector('button[aria-label="主色"]')?.style.backgroundColor !== previous,
      lightColor,
    )
    await page.getByRole('combobox', { name: '颜色类型', exact: true }).click()
    await page.getByRole('option', { name: '双色', exact: true }).click()
    await page.locator('[data-slot=select-content]:visible').first().waitFor({ state: 'hidden' })
    await page.waitForTimeout(200)
    await page.screenshot({ path: '/tmp/icons-preview-dark.png' })
    await page.setViewportSize({ width: 390, height: 844 })
    assert.notEqual(await controls.evaluate((el) => getComputedStyle(el).position), 'sticky')
    assert(await page.getByRole('button', { name: '主色', exact: true }).isVisible())
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await page.screenshot({ path: '/tmp/icons-preview-mobile.png' })
    assert.deepEqual(errors, [])
  } finally {
    await browser.close()
  }
})
