import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  createGuideNavigation,
  createSdkPageTree,
  getActiveGuideSdk,
  getGuideSdkItems,
  getActiveGuideProduct,
  getGuideProductItems,
  getGuideNavItemHref,
  getGuideSidebarItems,
} from '../navigation.ts'

test('SDK navigation keeps a migrated article in its category and preserves adjacent pages', () => {
  const trees = [
    { children: [{ type: 'page', name: 'Sheets', url: '/zh-CN/guides/sheets' }] },
    {
      children: [
        { type: 'page', name: 'Server SDK', url: '/zh-CN/server' },
        { type: 'page', name: 'Collaboration', url: '/zh-CN/server/collaboration/quick-start' },
        { type: 'page', name: 'Exchange', url: '/zh-CN/server/import-export' },
      ],
    },
    { children: [{ type: 'page', name: 'Worktree', url: '/zh-CN/ai/worktree' }] },
  ]
  const tree = createSdkPageTree(trees.map((item) => ({ 'zh-CN': item })))['zh-CN']
  const navigation = createGuideNavigation(tree, '/zh-CN/server/collaboration/quick-start')
  const categories = getGuideSdkItems(navigation.items)
  assert.deepEqual(
    categories.map((item) => item.name),
    ['Web SDK', 'Server SDK', 'AI SDK'],
  )
  assert.equal(getActiveGuideSdk(navigation.items, '/zh-CN/ai/worktree'), categories[2])
  assert.equal(navigation.activeTrail[0], categories[1])
  assert.equal(navigation.previous?.url, '/zh-CN/server')
  assert.equal(navigation.next?.url, '/zh-CN/server/import-export')
})

const product = (name, slug) => ({
  type: 'folder',
  name,
  index: { type: 'page', name, url: `/guides/${slug}` },
  children: [{ type: 'page', name: 'Import and export', url: `/guides/${slug}/features/import-export` }],
})

test('Web SDK switches product directories while Server and AI keep their own navigation', () => {
  const trees = [
    {
      children: [
        product('Sheets', 'sheets'),
        product('Docs', 'docs'),
        {
          type: 'folder',
          name: 'Icons',
          index: { type: 'page', name: 'Icons', url: '/guides/icons' },
          children: [{ type: 'page', name: 'React', url: '/guides/icons/react' }],
        },
      ],
    },
    { children: [{ type: 'page', name: 'Server exchange', url: '/server/import-export' }] },
    { children: [{ type: 'page', name: 'Worktree', url: '/ai/worktree' }] },
  ]
  const tree = createSdkPageTree(trees.map((item) => ({ 'en-US': item })))['en-US']
  const { items } = createGuideNavigation(tree, '/guides/docs/features/import-export')
  const products = getGuideProductItems(items)
  assert.deepEqual(
    products.map((item) => item.name),
    ['Sheets', 'Docs', 'Icons'],
  )
  assert.equal(getActiveGuideProduct(items, '/guides/docs/features/import-export'), products[1])
  assert.deepEqual(
    getGuideSidebarItems(items, '/guides/docs/features/import-export').map((item) => item.url),
    ['/guides/docs', '/guides/docs/features/import-export'],
  )
  assert.equal(getActiveGuideProduct(items, '/guides/icons/react'), products[2])
  assert.deepEqual(
    getGuideSidebarItems(items, '/guides/icons/react').map((item) => item.url),
    ['/guides/icons', '/guides/icons/react'],
  )
  assert.equal(getGuideNavItemHref(getGuideSdkItems(items)[0]), '/guides/sheets')
  for (const url of ['/server/import-export', '/ai/worktree']) {
    assert.equal(getActiveGuideProduct(items, url), undefined)
    assert.deepEqual(
      getGuideSidebarItems(items, url).map((item) => item.url),
      [url],
    )
  }
})
