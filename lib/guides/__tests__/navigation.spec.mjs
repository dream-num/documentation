import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  createGuideNavigation,
  getGuideSectionItems,
  getGuideSectionSwitchHref,
  getGuideSdkItems,
  getGuideSidebarItems,
} from '../navigation.ts'

const page = (url) => ({ id: url, name: url, type: 'page', url, children: [] })
const folder = (id, url, children) => ({ id, name: id, type: 'folder', url, children })
const sheets = folder('sheets', '/guides/sheets', [page('/guides/sheets/getting-started')])
const docs = folder('docs', '/guides/docs', [page('/guides/docs/getting-started')])
const collaboration = folder('collaboration', '/server/collaboration', [page('/server/collaboration/quick-start')])
const exchange = folder('exchange', '/server/import-export', [page('/server/import-export/node')])
const serverOverview = page('/server')
const items = [
  page('/overview'),
  folder('guides', '/guides', [sheets, docs]),
  folder('server', '/server', [serverOverview, collaboration, exchange]),
  folder('ai', '/ai', [page('/ai'), page('/ai/worktree')]),
]

test('sidebar selectors stay within the current SDK and show only the selected section directory', () => {
  assert.deepEqual(getGuideSectionItems(items, '/guides/sheets/getting-started'), [sheets, docs])
  assert.deepEqual(getGuideSidebarItems(items, '/guides/sheets/getting-started'), sheets.children)
  assert.equal(getGuideSectionSwitchHref(docs, '/guides/sheets/getting-started'), '/guides/docs/getting-started')

  assert.deepEqual(getGuideSectionItems(items, '/server'), [collaboration, exchange])
  assert.deepEqual(getGuideSidebarItems(items, '/server'), [serverOverview])
  assert.deepEqual(getGuideSidebarItems(items, '/server/collaboration/quick-start'), collaboration.children)
  assert.equal(getGuideSectionSwitchHref(exchange, '/server/collaboration/quick-start'), '/server/import-export')
})

test('Office sidebar omits SDK shortcuts while the top switcher keeps all three SDKs', () => {
  assert.deepEqual(getGuideSectionItems(items, '/ai/worktree'), [])
  assert.deepEqual(getGuideSidebarItems(items, '/ai/worktree'), items[3].children)
  assert.deepEqual(getGuideSidebarItems(items, '/overview'), [items[0]])
  assert.deepEqual(
    getGuideSdkItems(items).map((item) => item.id),
    ['guides', 'server', 'ai'],
  )
})

test('Office feature pages keep the product catalog without a second SDK selector', () => {
  const features = folder('features', undefined, [page('/overview/features'), page('/overview/features/sheets')])
  const withFeatures = [items[0], features, ...items.slice(1)]
  const sidebar = getGuideSidebarItems(withFeatures, '/overview/features/sheets')
  assert.equal(sidebar[1], features)
  assert.deepEqual(getGuideSectionItems(withFeatures, '/overview/features/sheets'), [])
})

test('both feature groups expose localized titles, counts, and collapsed defaults', () => {
  const groups = [
    {
      type: 'folder',
      $id: 'zh-CN/features/products',
      name: '按产品浏览',
      children: Array.from({ length: 6 }, (_, i) => ({
        type: 'page',
        url: `/overview/features/product-${i}`,
        name: `${i}`,
      })),
    },
    {
      type: 'folder',
      $id: 'ja-JP/features/shared',
      name: '共通機能',
      children: Array.from({ length: 15 }, (_, i) => ({
        type: 'page',
        url: `/overview/features/shared/${i}`,
        name: `${i}`,
      })),
    },
  ]
  const nav = createGuideNavigation(groups, '/overview/features/shared/14')
  assert.deepEqual(
    nav.items.map((item) => [item.name, item.count, item.defaultOpen]),
    [
      ['按产品浏览', 6, false],
      ['共通機能', 15, false],
    ],
  )
})
