/* eslint-disable no-await-in-loop -- Resize, zoom and native history exercise one owner sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { isDeepStrictEqual } from 'node:util'
import { chromium } from 'playwright'
import { createData, COUNTS, TASKS, MAP_SVG } from '../showcase/docs-modern/responsive-width-and-zoom/code/data.ts'
import { readShowcaseSources } from './showcase-sources.mjs'

const manifestPath = 'test-results/willow-responsive-native-export/manifest.json'
const slug = 'docs-modern/responsive-width-and-zoom'
if (process.argv.includes('--prepare')) {
  const source = (await readShowcaseSources()).find(s => s.slug === slug)
  const existing = await fs.readFile(manifestPath, 'utf8').then(JSON.parse).catch(() => null)
  const directory = existing?.directory || await fs.mkdtemp(path.join(os.tmpdir(), 'univer-willow-native-'))
  for (const [name, content] of Object.entries(source.files)) {
    const target = path.join(directory, name.slice(1))
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, content)
  }
  const pkg = JSON.parse(source.files['/package.json']), links = []
  for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
    const target = name === 'vite'
      ? process.env.SHOWCASE_VITE_DIR || path.resolve('node_modules/vite')
      : path.resolve('node_modules', name)
    assert.equal(JSON.parse(await fs.readFile(path.join(target, 'package.json'), 'utf8')).version, version)
    const destination = path.join(directory, 'node_modules', name)
    await fs.mkdir(path.dirname(destination), { recursive: true })
    if (!await fs.lstat(destination).catch(() => null)) await fs.symlink(target, destination, 'junction')
    links.push({ name, version, target })
  }
  await fs.mkdir(path.dirname(manifestPath), { recursive: true })
  await fs.writeFile(manifestPath, JSON.stringify({ slug, directory, links, sourceFiles: Object.keys(source.files).length }, null, 2))
  console.log(directory)
  process.exit(0)
}
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/willow-responsive-native')
await fs.mkdir(output, { recursive: true })
const url = process.env.SHOWCASE_DEMO_URL || (process.env.SHOWCASE_BASE_URL || 'http://localhost:3030') + '/en-US/playground/' + slug
const report = { passed: false, url, gates: {}, errors: [], requests: [], layouts: [], literals: [] }
const browser = await chromium.launch(), context = await browser.newContext({ viewport: { width: 1500, height: 1200 } })
await context.addInitScript(() => {
  window.willowGlyphs = []
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function(value, ...args) {
    window.willowGlyphs.push(String(value))
    return fill.call(this, value, ...args)
  }
})
const page = await context.newPage()
page.setDefaultTimeout(10000)
let current = 'startup'
page.on('pageerror', e => report.errors.push({ gate: current, error: e.stack }))
page.on('console', m => { if (m.type() === 'error') report.errors.push({ gate: current, error: m.text() }) })
page.on('request', r => { if (!['GET', 'HEAD', 'OPTIONS'].includes(r.method()) || r.url().includes('/universer-api/')) report.requests.push(r.url()) })
const capture = n => page.screenshot({ path: path.join(output, n + '.png'), animations: 'disabled' })
const settle = () => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))
const snapshot = () => page.evaluate(() => structuredClone(window.univerAPI.getDocument('willow-responsive').save()))
const ready = async () => {
  await page.locator('.responsive-demo[data-ready=true]').waitFor({ timeout: 30000 })
  await page.waitForFunction(() => !document.querySelector('[data-u-comp="workbench-skeleton-content"]'))
  await page.waitForFunction(() => !document.querySelector('.responsive-demo fieldset').disabled)
  await settle()
}
const fresh = async () => { await page.goto(url); await ready() }
const recipes = [...(await fs.readFile('showcase/docs-modern/responsive-width-and-zoom/code/README.md', 'utf8')).matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map(m => m[1])
const run = n => { report.literals.push(n); return page.evaluate('(async()=>{' + recipes[n-1] + '})()') }
const state = () => page.evaluate(() => {
  const doc = window.univerAPI.getDocument('willow-responsive'), i = window.univerAPI._injector
  const key = [...i.resolvedDependencyCollection.resolvedDependencies.keys()].find(k => String(k) === 'engine-render.render-manager.service')
  const render = i.get(key).getRenderUnitById(doc.getId()), skeleton = render.mainComponent._skeleton?.getSkeletonData()
  const saved = doc.save(), vp = render.scene.getViewports()[0]
  const selectionKey = [...render._injector.resolvedDependencyCollection.resolvedDependencies.keys()].find(k => typeof render._injector.get(k)?.getActiveTextRange === 'function')
  const selected = selectionKey && render._injector.get(selectionKey).getActiveTextRange()
  return {
    host: document.querySelector('.responsive-editor').clientWidth,
    zoom: doc.getDocumentDataModel().getSettings()?.zoomRatio ?? 1,
    scale: render.scene.scaleX, page: saved.documentStyle.pageSize.width,
    selected: selected ? {startOffset:selected.startOffset,endOffset:selected.endOffset,collapsed:selected.collapsed} : null,
    height: document.querySelector('.responsive-editor').clientHeight,
    layout: skeleton?.pages.map(p => ({ width: p.width, pageWidth:p.pageWidth, height: p.height })),
    columns: doc.getColumnGroups().map(g => g.describe()),
    table: doc.getTable('willow-supplies')?.describe(),
    drawings: Object.values(saved.drawings || {}).map(d => {
      const objects = [0,1,2,3,4,5].flatMap(layer => render.scene.getObjectsByLayer(layer))
      const o = objects.find(object => object.oKey?.includes(d.drawingId))
      return { id: d.drawingId, size: d.docTransform.size, object: o ? { key: o.oKey, width: o.width, height: o.height, scaleX: o.scaleX, scaleY: o.scaleY, visible: o.visible } : null }
    }),
    polygons: render.scene.getObjectsByLayer(3).filter(o => o.visible && o.oKey?.startsWith('__TestSelectionRange__')).flatMap(o => o.pointsGroup?.map(points => points.map(p => { const q = vp.getAbsoluteVector(o.transform.applyPoint(p)); return {x:q.x,y:q.y} })) || []),
    alert: document.querySelector('.responsive-demo [role=alert]').hidden ? null : document.querySelector('.responsive-demo [role=alert]').textContent,
  }
})
const hostWidth = async value => {
  await page.getByRole('combobox', { name: 'Host width', exact: true }).selectOption(value)
  await page.locator('[data-action=host]').click()
  await page.waitForFunction(() => !document.querySelector('.responsive-demo fieldset').disabled)
  await settle()
}
const nativeZoom = async value => {
  const input = page.locator('footer input').last()
  await input.click()
  await input.fill(String(value))
  await input.press('Enter')
  await page.waitForFunction(v => window.univerAPI.getDocument('willow-responsive').getDocumentDataModel().getSettings()?.zoomRatio === v / 100, value)
  await settle()
  await page.waitForFunction(() => !document.querySelector('.responsive-demo fieldset').disabled)
  await settle()
}
async function gate(name, action) {
  current = name
  try { await action(); report.gates[name] = { pass: true }; console.log('PASS', name) }
  catch (e) {
    report.gates[name] = { pass: false, error: e.stack }
    await capture(name + '-failed').catch(() => {})
    await fs.writeFile(path.join(output, name + '-snapshot.json'), JSON.stringify(await snapshot().catch(() => null), null, 2))
    console.log('FAIL', name, e.message.slice(0, 240))
  }
}
try {
  await page.goto(url)
  await gate('initial-native-content', async () => {
    await page.locator('.responsive-demo[data-ready=true]').waitFor({ timeout: 30000 })
    await page.waitForFunction(() => !document.querySelector('[data-u-comp="workbench-skeleton-content"]'))
    await settle()
    const saved = await snapshot()
    await fs.writeFile(path.join(output, 'baseline.json'), JSON.stringify(saved, null, 2))
    assert.equal(saved.id, 'willow-responsive')
    assert.equal(saved.body.columnGroups.length, 1)
    assert.equal(Object.keys(saved.tableSource).length, 1)
    assert.equal(Object.keys(saved.drawings).length, 2)
    assert.match(saved.body.dataStream, /Morning team/)
    assert.match(saved.body.dataStream, /263 seedlings/)
    const original=createData()
    assert.equal(original.body.paragraphs.length,14)
    for(const text of original.body.dataStream.split('\r').filter(v=>v.trim()))assert.ok(saved.body.dataStream.includes(text),text)
    for(const p of original.body.paragraphs)assert.ok(saved.body.paragraphs.some(actual=>actual.paragraphId===p.paragraphId),p.paragraphId)
    assert.deepEqual((await state()).table.sampleRows,TASKS)
    const charts=JSON.parse(saved.resources.find(r=>r.name==='DOC_CHART_PLUGIN').data)
    assert.deepEqual(Object.values(charts.dataSources)[0].values,COUNTS)
    assert.equal(saved.drawings['willow-map'].source,'data:image/svg+xml;base64,'+Buffer.from(MAP_SVG).toString('base64'))
    assert.equal(await page.getByRole('spinbutton', { name: 'Zoom percent' }).count(), 0)
    await page.waitForFunction(() => /[1-9]\d* words/.test(document.body.innerText))
    report.words = (await page.locator('body').innerText()).match(/\d+ words/)?.[0]
    await capture('opening-settled')
  })
  if (process.argv.includes('--probe')) {
    await fs.writeFile(path.join(output, 'dom.txt'), await page.locator('body').innerText())
    await fs.writeFile(path.join(output, 'dom.html'), await page.locator('body').innerHTML())
    await capture('probe')
    await fs.writeFile(path.join(output, 'geometry.json'), JSON.stringify(await state(), null, 2))
    await gate('probe-native-zoom', () => nativeZoom(150))
    await fs.writeFile(path.join(output, 'zoom.json'), JSON.stringify(await state(), null, 2))
    await capture('zoom-probe')
  } else {
    const baseline = await snapshot()
    await gate('normal-source-five-CSS-five-complete-locales', async () => {
      const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
      const source = (await readShowcaseSources()).find(s => s.slug === slug)
      for (const [n,c] of Object.entries(source.files)) assert.equal(await fs.readFile(path.join(manifest.directory,n.slice(1)), 'utf8'), c, n)
      report.sourceFiles = Object.keys(source.files).length
      assert.equal([...source.files['/src/create-demo.ts'].matchAll(/import '@[^']+\.css'/g)].length,5)
      const locales = await page.evaluate(() => window.univerAPI.getLocales())
      report.localeKeys = Object.keys(locales)
      for(const key of ['docs-ui','docs-drawing-ui','drawing-ui','docs-chart-ui','docs-column-ui','docs-table-ui']) assert.ok(locales[key],key)
      assert.equal([...source.files['/src/create-demo.ts'].matchAll(/mergeLocales\(Docs(?:EnUS|ZhCN), Drawing(?:EnUS|ZhCN), Chart(?:EnUS|ZhCN), Column(?:EnUS|ZhCN), Table(?:EnUS|ZhCN)\)/g)].length,2)
    })
    for (const width of ['960','600','390','320']) {
      await gate('host-' + width + '-content', async () => {
        await hostWidth(width)
        const s = await state(); report.layouts.push({ name: width, ...s })
        assert.deepEqual((await snapshot()).body.dataStream, baseline.body.dataStream)
        assert.equal(s.host, Number(width))
        assert.ok(s.page * s.zoom <= s.host)
        assert.equal(s.alert,null)
        assert.equal(s.layout[0].pageWidth,s.page)
        assert.equal(s.columns[0].columnCount,2)
        await capture('host-' + width)
      })
    }
    await fresh()
    for (const percent of [50,100,150,200]) {
      await gate('native-footer-zoom-' + percent, async () => {
        await nativeZoom(percent)
        const s = await state(); report.layouts.push({ name: 'zoom-' + percent, ...s })
        assert.equal(s.zoom, percent/100); assert.equal(s.scale,s.zoom)
        assert.ok(s.page*s.zoom<=s.host); assert.equal(s.alert,null)
        assert.equal((await snapshot()).body.dataStream,baseline.body.dataStream)
      })
    }
    await fresh()
    await gate('native-selection-resize-offsets-and-pixels',async()=>{
      await page.locator('canvas').first().click({position:{x:600,y:110}})
      await page.keyboard.press('Control+End');await page.keyboard.press('Shift+Home');await settle()
      const before=await state(),body=(await snapshot()).body.dataStream
      assert.ok(before.selected && before.selected.endOffset>before.selected.startOffset)
      for(const width of ['960','600','390','320']){
        await hostWidth(width)
        const s=await state();report.layouts.push({name:'selection-'+width,...s})
        assert.deepEqual(s.selected,before.selected)
        assert.equal((await snapshot()).body.dataStream,body)
        assert.ok(s.polygons.length>0)
        for(const p of s.polygons.flat())assert.ok(p.x>=-1&&p.x<=s.host+1,'Horizontal selection clipping: '+JSON.stringify(p))
        const ys=s.polygons.flat().map(p=>p.y)
        if(Math.max(...ys)-Math.min(...ys)<=s.height)for(const y of ys)assert.ok(y>=-1&&y<=s.height+1,'Vertical selection clipping: '+y)
        await capture('selection-'+width)
      }
    })
    await fresh()
    await gate('native-phone-150-layout', async () => {
      await hostWidth('390'); await nativeZoom(150)
      const s = await state(); report.layouts.push({ name:'phone-150',...s })
      await capture('phone-150')
      assert.equal(s.alert,null); assert.equal(s.layout[0].pageWidth,s.page)
      assert.ok(s.page*s.zoom<=s.host)
    })
    await gate('phone-error-widen-and-native-zoom-recovery',async()=>{
      await hostWidth('fluid');await nativeZoom(100)
      const s=await state();report.layouts.push({name:'phone-recovery',...s})
      assert.equal(s.alert,null);assert.equal(s.layout[0].pageWidth,s.page);assert.equal(s.scale,1)
      assert.equal((await snapshot()).body.dataStream,baseline.body.dataStream)
      for(const d of s.drawings)assert.ok(d.object&&Math.abs(d.object.width*d.object.scaleX-d.size.width)<1,JSON.stringify(d))
    })
    await fresh()
    await gate('focused-chart-real-frame', async () => {
      await page.getByRole('combobox',{name:'Reading width',exact:true}).selectOption('640')
      await page.locator('[data-action=reading]').click(); await page.waitForFunction(()=>!document.querySelector('.responsive-demo fieldset').disabled); await settle()
      const s=await state(); report.layouts.push({name:'focused640',...s})
      assert.equal(s.page,640)
      for(const d of s.drawings) {
        assert.ok(d.object, d.id+' has native drawing frame')
        assert.ok(Math.abs(d.object.width*d.object.scaleX-d.size.width)<1,JSON.stringify(d))
      }
      await capture('focused')
    })
    await fresh()
    await gate('wide-and-comfortable-reading-native-map-chart',async()=>{
      const original=await snapshot()
      for(const value of ['1040','820']){
        await page.getByRole('combobox',{name:'Reading width',exact:true}).selectOption(value)
        await page.locator('[data-action=reading]').click();await page.waitForFunction(()=>!document.querySelector('.responsive-demo fieldset').disabled);await settle()
        assert.equal((await state()).page,Number(value))
        assert.equal((await snapshot()).body.dataStream,original.body.dataStream)
      }
      await page.locator('canvas').first().click({position:{x:600,y:110}})
      await page.keyboard.press('Control+End');await settle()
      await page.waitForFunction(()=>window.willowGlyphs.join('').includes('Handover'))
      await capture('map-chart-handover')
    })
    await fresh()
    await gate('native-keyboard-edit-glyph-selection-and-history', async () => {
      const canvas=page.locator('canvas').first()
      await canvas.click({position:{x:600,y:110}})
      await page.keyboard.press('Control+End'); await page.keyboard.press('End')
      const before=await snapshot()
      await page.evaluate(()=>{window.willowGlyphs=[]})
      await page.keyboard.type(' Native checked.')
      await page.waitForFunction(()=>window.univerAPI.getDocument('willow-responsive').save().body.dataStream.includes(' Native checked.'))
      await page.waitForFunction(()=>window.willowGlyphs.join('').includes('checked'))
      await page.waitForTimeout(550)
      const edited=await snapshot()
      report.gates['native-keyboard-actual-glyph']={pass:true}
      await page.keyboard.press('Shift+Home'); await settle()
      const selection=await state(); report.selection=selection.polygons
      assert.ok(selection.polygons.length>0)
      await capture('native-selection')
      await page.keyboard.press('Control+z'); await settle()
      const undone=await snapshot()
      await page.keyboard.press('Control+y'); await settle()
      const redone=await snapshot()
      report.history={undoEqual:isDeepStrictEqual(undone,before),redoEqual:isDeepStrictEqual(redone,edited)}
      await fs.writeFile(path.join(output,'native-history.json'),JSON.stringify({before,edited,undone,redone},null,2))
      assert.deepEqual(undone,before); assert.deepEqual(redone,edited)
    })
    await fresh()
    await gate('literal-edit-resize-preserves-text-and-history', async()=>{
      const before=await snapshot()
      await run(1)
      await page.waitForTimeout(550)
      const edited=await snapshot()
      assert.match(edited.body.dataStream,/Field note: Ridge trays checked/)
      await hostWidth('600'); await hostWidth('fluid')
      assert.equal((await snapshot()).body.dataStream,edited.body.dataStream)
      await page.locator('[data-u-command="univer.command.undo"]').click(); await settle()
      const undone=await snapshot()
      await page.locator('[data-u-command="univer.command.redo"]').click(); await settle()
      const redone=await snapshot()
      await fs.writeFile(path.join(output,'literal-history.json'),JSON.stringify({before,edited,undone,redone},null,2))
      assert.deepEqual(undone,before); assert.deepEqual(redone,edited)
    })
    await fresh()
    await gate('native-zoom-menu-and-invalid-input',async()=>{
      await page.locator('footer [aria-haspopup=menu]').last().click()
      await page.getByRole('menuitemradio',{name:'150%',exact:true}).click()
      await page.waitForFunction(()=>window.univerAPI.getDocument('willow-responsive').getDocumentDataModel().getSettings()?.zoomRatio===1.5)
      await capture('native-zoom-menu-effect')
      const before=await snapshot(),input=page.locator('footer input').last()
      for(const value of ['','not-a-zoom']) {await input.click();await input.fill(value);await input.press('Enter');await settle();assert.deepEqual(await snapshot(),before)}
      await run(3);await run(4)
      assert.equal((await state()).scale,1.5)
    })
    await fresh()
    await gate('same-owner-theme-edits',async()=>{
      await run(1);await settle()
      const before=await snapshot()
      assert.equal(await page.evaluate(()=>{
        const old=window.willowDemo,api=window.univerAPI
        old.setDarkMode(true);old.setDarkMode(false)
        return old===window.willowDemo && api===window.univerAPI
      }),true)
      assert.deepEqual(await snapshot(),before)
    })
    await gate('same-ID-saved-owner-recovery',async()=>{
      await run(2); const saved=await snapshot()
      await run(5);await ready()
      assert.equal((await snapshot()).id,saved.id)
      assert.deepEqual(await snapshot(),saved)
    })
    await gate('same-ID-rebuilt-fresh-native-interaction',async()=>{
      await ready();await nativeZoom(150);assert.equal((await state()).scale,1.5)
      const canvas=page.locator('canvas').first()
      await canvas.click({position:{x:600,y:110}});await page.keyboard.press('Control+End');await page.keyboard.press('End')
      await page.keyboard.type(' Rebuilt alive.')
      await page.waitForFunction(()=>window.univerAPI.getDocument('willow-responsive').save().body.dataStream.includes(' Rebuilt alive.'))
      await page.waitForFunction(()=>window.willowGlyphs.join('').includes('alive'))
    })
    await gate('same-ID-empty-and-complete-restoration',async()=>{
      await run(6);await ready()
      const empty=await snapshot()
      assert.equal(empty.body.dataStream,'\r\n');assert.equal(Object.keys(empty.drawings||{}).length,0)
      assert.equal(Object.keys(empty.tableSource||{}).length,0)
      await run(5);await ready()
      assert.deepEqual(await snapshot(),await page.evaluate(()=>window.willowSaved))
    })
    await fresh()
    await gate('initial-Chinese-native-grid-full-packs',async()=>{
      await page.evaluate(()=>{const old=window.willowDemo;old.dispose();document.documentElement.lang='zh-CN';old.createDemo(old.container)})
      await ready()
      assert.equal(await page.evaluate(()=>window.univerAPI.getCurrentLocale()),'zhCN')
      assert.ok(await page.getByRole('tab',{name:'开始',exact:true}).count())
      const locales=await page.evaluate(()=>window.univerAPI.getLocales())
      for(const key of ['docs-ui','docs-drawing-ui','drawing-ui','docs-chart-ui','docs-column-ui','docs-table-ui']) assert.ok(locales[key],key)
      await page.waitForFunction(()=>/字数\s*[1-9]\d*|[1-9]\d*\s*字/.test(document.body.innerText))
      await capture('initial-zh')
    })
    await fresh()
    await gate('invalid-saved-boundary-and-double-dispose',async()=>{
      const before=await snapshot()
      const invalid=await page.evaluate(()=>{
        const c=window.willowDemo, messages=[]
        for(const saved of [{},{id:'willow-responsive',body:{dataStream:'missing'}}])try{c.createDemo(c.container,false,saved)}catch(e){messages.push(e.message)}
        return messages
      })
      assert.equal(invalid.length,2);assert.deepEqual(await snapshot(),before)
      await page.evaluate(()=>{const c=window.willowDemo;window.willowFactory=c;c.dispose();c.dispose()})
      assert.equal(await page.locator('.responsive-demo').count(),0)
      assert.equal(await page.evaluate(()=>!!window.univerAPI||!!window.willowDemo),false)
    })
    await gate('pending-initial-owner-disposal',async()=>{
      await page.evaluate(()=>{const old=window.willowFactory,c=old.createDemo(old.container);c.dispose();c.dispose()})
      await settle();assert.equal(await page.locator('.responsive-demo').count(),0)
      assert.equal(await page.evaluate(()=>!!window.univerAPI),false)
    })
    await gate('dispose-between-chart-await-and-map-initialization',async()=>{
      const result=await page.evaluate(async()=>{
        const old=window.willowFactory,c=old.createDemo(old.container)
        return await new Promise((resolve,reject)=>{
          const timeout=setTimeout(()=>reject(new Error('The actual chart initialization event was not reached')),10000)
          const listener=c.univerAPI.addEvent(c.univerAPI.Event.CommandExecuted,({id})=>{
            if(id!=='doc.command.insert-doc-chart')return
            queueMicrotask(()=>{
              const saved=c.univerAPI.getDocument('willow-responsive').save()
              listener.dispose();c.dispose();c.dispose();clearTimeout(timeout)
              requestAnimationFrame(()=>requestAnimationFrame(()=>resolve({columns:saved.body.columnGroups.length,drawings:Object.keys(saved.drawings||{}),roots:document.querySelectorAll('.responsive-demo').length,owner:!!window.univerAPI})))
            })
          })
        })
      })
      report.interruptedInitialization=result
      assert.equal(result.columns,1);assert.equal(result.drawings.length,1)
      assert.ok(!result.drawings.includes('willow-map'))
      assert.equal(result.roots,0);assert.equal(result.owner,false)
    })
    await gate('all-six-literals-and-zero-unexpected-errors',async()=>{
      assert.deepEqual([...new Set(report.literals)].toSorted(),[1,2,3,4,5,6])
      assert.deepEqual(report.errors,[]);assert.deepEqual(report.requests,[])
    })
  }
} finally {
  report.passed = Object.values(report.gates).every(g => g.pass) && report.errors.length === 0
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
