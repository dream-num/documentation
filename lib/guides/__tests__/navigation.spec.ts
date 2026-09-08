import assert from 'node:assert/strict'
import { test } from 'node:test'

import { createGuideNavigation, getActiveGuideStandaloneItem, getGuideStandaloneItems } from '../navigation.ts'

test('integration guides share one primary entry and remain accessible in its sidebar', () => {
  const urls = [
    '/zh-CN/guides/server-integration',
    '/zh-CN/guides/server-integration/collaboration',
    '/zh-CN/guides/server-integration/import-export',
  ]
  const names = ['服务端集成', '协同集成', '导入导出集成']
  const navigation = createGuideNavigation(
    {
      children: [
        { type: 'page', name: 'Sheets', url: '/zh-CN/guides/sheets' },
        {
          type: 'folder',
          name: names[0],
          index: { type: 'page', name: names[0], url: urls[0] },
          children: urls.slice(1).map((url, index) => ({ type: 'page', name: names[index + 1], url })),
        },
      ],
    },
    urls[1],
  )

  const entries = getGuideStandaloneItems(navigation.items)
  assert.equal(entries.length, 1)
  assert.deepEqual(
    entries[0].children.map((entry) => entry.url),
    urls,
  )
  for (const url of urls) {
    assert.equal(getActiveGuideStandaloneItem(navigation.items, url), entries[0])
  }
  assert.equal(navigation.previous?.url, urls[0])
  assert.equal(navigation.next?.url, urls[2])
  assert.equal(navigation.activeTrail[0], entries[0])
})
