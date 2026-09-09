/* eslint-disable no-await-in-loop -- Audit exported CSS without compiling any SDK demo. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'
import { parse } from 'postcss'

import { readShowcaseSources } from './showcase-sources.mjs'

const sources = await readShowcaseSources()
assert.ok(sources.length > 0)
const results = []
const browser = await chromium.launch()
try {
  const page = await browser.newPage()
  for (const { slug, files } of sources) {
    const styles = Object.entries(files).filter(([name]) => name.endsWith('.css'))
    assert.ok(styles.length > 0, slug + ': exported mount styles must be included')
    for (const [name, css] of styles) {
      const hasRootClass = (candidate) =>
        Object.values(files).some(
          (source) =>
            source.includes("root.className = '" + candidate + "'") ||
            source.includes("container.classList.add('" + candidate + "')"),
        )
      const parsed = parse(css)
      const rules = []
      parsed.walkRules((rule) => rules.push(rule.selector))
      const mountOnly = rules.every((selector) =>
        selector.split(',').every((part) => ['html', 'body', '#app'].includes(part.trim())),
      )
      const rootClass = mountOnly
        ? ''
        : rules
            .flatMap((selector) => selector.split(','))
            .map((selector) => /^\.([\w-]+)$/.exec(selector.trim())?.[1])
            .find((candidate) => candidate && hasRootClass(candidate))
      assert.ok(
        mountOnly || rootClass,
        slug + '/' + name + ': add an explicit DOM fixture for an unrecognized stylesheet root',
      )
      if (rootClass)
        assert.ok(hasRootClass(rootClass), slug + ': probe root must match the actual exported implementation')
      const controlClasses = [...css.matchAll(/\.([\w-]+-controls)\b/g)].map((match) => match[1]).join(' ')
      await page.setContent(
        '<div id="app" class="' +
          rootClass +
          '"><fieldset class="' +
          controlClasses +
          '"><label>Host<input></label><button>Host action</button></fieldset><details><summary>Host readout</summary></details><div id="sdk"><fieldset><label>Native<input type="number" aria-label="Title"></label><input aria-label="Label"><input aria-label="Alt text"><input type="checkbox"><button>Native action</button><select><option>Native choice</option></select><textarea></textarea></fieldset><p role="status"></p><p role="alert"></p><details><summary>Native details</summary><pre>Native text</pre></details><table><tbody><tr><th>Native heading</th><td>Native cell</td></tr></tbody></table><a href="#">Native link</a></div></div>',
      )
      await page.addStyleTag({ content: css })
      let hostControl = page.getByRole('button', { name: 'Host action', exact: true })
      if (['permission-shadow-demo', 'cross-workbook-demo', 'responsive-demo'].includes(rootClass)) {
        // These factories now own one labeled selector, not a fixture panel.
        await page.locator('#app').evaluate((root) => {
          const label = document.createElement('label')
          if (root.className === 'cross-workbook-demo') label.className = 'workbook-picker'
          if (root.className === 'responsive-demo') label.className = 'responsive-control'
          label.innerHTML = 'Host<select aria-label="Host strategy"><option>None</option></select>'
          root.querySelector(':scope > fieldset').replaceWith(label)
          root.querySelector('#sdk').className = {
            'permission-shadow-demo': 'permission-shadow-editor',
            'cross-workbook-demo': 'cross-workbook-editor',
            'responsive-demo': 'responsive-editor',
          }[root.className]
        })
        hostControl = page.getByRole('combobox', { name: 'Host strategy', exact: true })
      }
      if (rootClass === 'query-demo') {
        await page.locator('#app').evaluate((root) => {
          const form = document.createElement('form')
          form.append(root.querySelector(':scope > fieldset'))
          root.prepend(form)
          root.querySelector('#sdk').className = 'query-editor'
        })
      }
      if (rootClass === 'custom-shortcuts-demo') {
        // The shortcut boundary is an input, not a host action button.
        await page.locator('#app').evaluate((root) => {
          const context = document.createElement('div')
          context.className = 'shortcut-context'
          context.innerHTML = '<label>Host<input aria-label="Host input"></label>'
          root.querySelector(':scope > fieldset').replaceWith(context)
          root.querySelector('#sdk').className = 'shortcuts-editor'
        })
        hostControl = page.getByRole('textbox', { name: 'Host input', exact: true })
      }
      if (['violet-embed', 'links-demo', 'knowledge-demo'].includes(rootClass)) {
        // Match these factories' navigation wrappers, not their former control fieldsets.
        await page.locator('#app').evaluate((root) => {
          const [tag, navigationClass, editorClass] = {
            'violet-embed': ['nav', 'violet-page-navigation', 'violet-workbench'],
            'links-demo': ['div', 'links-navigation', 'links-editor'],
            'knowledge-demo': ['nav', 'knowledge-navigation', 'knowledge-editor'],
          }[root.className]
          const navigation = document.createElement(tag)
          navigation.className = navigationClass
          navigation.append(root.querySelector(':scope > fieldset button'))
          root.querySelector(':scope > fieldset').replaceWith(navigation)
          root.querySelector('#sdk').className = editorClass
        })
      }
      if (
        [
          'pdf-markup',
          'financial-report',
          'pdf-lifecycle',
          'pdf-ink',
          'pdf-image',
          'board-lifecycle',
          'base-lifecycle',
          'base-records',
          'base-fields',
          'base-options',
          'embed-lifecycle',
        ].includes(rootClass)
      ) {
        await page.locator('#app').evaluate((root) => {
          const panel = document.createElement('details')
          panel.className = {
            'pdf-markup': 'pdf-markup-controls',
            'financial-report': 'financial-controls',
            'pdf-lifecycle': 'lifecycle-controls',
            'pdf-ink': 'ink-controls',
            'pdf-image': 'image-controls',
            'board-lifecycle': 'board-lifecycle-controls',
            'base-lifecycle': 'base-lifecycle-controls',
            'base-records': 'base-records-controls',
            'base-fields': 'base-fields-controls',
            'base-options': 'base-options-controls',
            'embed-lifecycle': 'embed-lifecycle-controls',
          }[root.className]
          panel.open = true
          panel.innerHTML = '<summary>Demo controls</summary>'
          panel.append(root.querySelector(':scope > fieldset'))
          root.prepend(panel)
        })
      }
      if (rootClass === 'product-launch') {
        // Match the exported demo's native disclosure, outside the SDK subtree.
        await page.locator('#app').evaluate((root) => {
          const panel = document.createElement('details')
          panel.className = 'launch-tools'
          panel.open = true
          panel.innerHTML = '<summary>Example controls</summary><div class="launch-options"></div>'
          panel.lastElementChild.append(root.querySelector(':scope > fieldset'), root.querySelector(':scope > details'))
          root.prepend(panel)
        })
      }
      if (rootClass === 'crm-quote') {
        // The exported CRM owns controls in an aside, separate from the SDK workspace.
        await page.locator('#app').evaluate((root) => {
          const sidebar = document.createElement('aside')
          sidebar.className = 'quote-sidebar'
          sidebar.append(root.querySelector(':scope > fieldset'), root.querySelector(':scope > details'))
          root.prepend(sidebar)
          const workspace = document.createElement('section')
          workspace.className = 'quote-workspace'
          workspace.append(root.querySelector('#sdk'))
          root.append(workspace)
        })
      }
      if (
        [
          'find-replace-demo',
          'notes-demo',
          'hyperlink-demo',
          'outline-demo',
          'crosshair-demo',
          'csv-demo',
          'sheet-images-demo',
          'seed-canvas-demo',
          'sheet-charts-demo',
          'sheet-shapes-demo',
          'big-data-demo',
        ].includes(rootClass)
      ) {
        await page.locator('#app').evaluate((root) => {
          const panel = document.createElement('section')
          const controls = document.createElement('details')
          controls.open = true
          controls.append(root.querySelector(':scope > fieldset'))
          panel.append(controls, root.querySelector(':scope > details'))
          root.prepend(panel)
        })
      }
      await page.keyboard.press('Tab')
      const collisions = await page.evaluate(() => {
        const selectors = []
        function visit(cssRules) {
          for (const rule of cssRules) {
            if (rule.selectorText) selectors.push(rule.selectorText)
            if (rule.cssRules) visit(rule.cssRules)
          }
        }
        for (const sheet of document.styleSheets) visit(sheet.cssRules)
        const found = []
        // Include conditional rules even at a viewport where they are inactive.
        for (const theme of ['light', 'dark']) {
          document.querySelector('#app').dataset.theme = theme
          document.documentElement.className = theme === 'dark' ? 'dark' : ''
          for (const node of document.querySelectorAll('#sdk *')) {
            node.focus()
            for (const selector of selectors)
              if (node.matches(selector)) found.push({ theme, tag: node.tagName, selector })
          }
        }
        return found
      })
      const host = await hostControl.evaluate(
        (button, selectors) => ({
          borderRadius: getComputedStyle(button).borderRadius,
          matchedSelectors: selectors.filter((selector) => button.matches(selector)),
        }),
        rules,
      )
      const noAuthoredControls = !Object.entries(files).some(
        ([sourceName, source]) =>
          sourceName.startsWith('/src/') &&
          /\.[cm]?[jt]sx?$/.test(sourceName) &&
          /<(?:button|fieldset|input|select)\b|createElement\(['"](?:button|fieldset|input|select)['"]\)/i.test(source),
      )
      // README recipes are not mounted controls. Native-only cases may still style
      // an editor wrapper or startup alert; their SDK collision check remains mandatory.
      const layoutOnly = rootClass === 'mobile-demo' || noAuthoredControls
      const hostUnstyled = !mountOnly && !layoutOnly && host.matchedSelectors.length === 0
      results.push({ slug, name, rootClass, mountOnly, collisions, host, hostUnstyled })
    }
  }
} finally {
  await browser.close()
}
const failures = results.filter((result) => result.collisions.length || result.hostUnstyled)
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/showcase-style-isolation')
await fs.mkdir(directory, { recursive: true })
await fs.writeFile(
  path.join(directory, 'report.json'),
  JSON.stringify({ cases: sources.length, stylesheets: results.length, failures, results }, null, 2),
)
console.log(
  JSON.stringify(
    {
      cases: sources.length,
      stylesheets: results.length,
      customStyles: results.filter((result) => !result.mountOnly).length,
      failures: failures.map(({ slug, collisions, hostUnstyled }) => ({
        slug,
        hostUnstyled,
        selectors: [...new Set(collisions.map((item) => item.selector))],
      })),
    },
    null,
    2,
  ),
)
assert.equal(
  failures.length,
  0,
  'Host controls must be styled without matching nested SDK controls, readouts or tables',
)
