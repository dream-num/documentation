import assert from 'node:assert/strict'
import { test } from 'node:test'
import { resolvePlugins } from '../initialization-generator.ts'

for (const mobile of [true, false]) {
  test(`Sheets links and comments share one ${mobile ? 'mobile' : 'desktop'} Docs UI`, () => {
    const plugins = resolvePlugins({
      product: 'sheets',
      mode: 'plugin',
      locale: 'en-US',
      mobile,
      features: ['sheets-hyper-link', 'sheets-thread-comment'],
      umd: false,
    })

    assert.deepEqual(
      plugins.filter((name) => name === 'UniverDocsUIPlugin' || name === 'UniverDocsMobileUIPlugin'),
      [mobile ? 'UniverDocsMobileUIPlugin' : 'UniverDocsUIPlugin'],
    )
    assert(
      plugins.indexOf(mobile ? 'UniverDocsMobileUIPlugin' : 'UniverDocsUIPlugin') <
        plugins.indexOf(mobile ? 'UniverSheetsHyperLinkMobileUIPlugin' : 'UniverSheetsHyperLinkUIPlugin'),
    )
  })
}
