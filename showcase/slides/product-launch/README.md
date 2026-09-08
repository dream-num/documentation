# Atlas / Product Launch

The runtime is English-only on every host page. Complete official English SDK packs
and styles are retained. A legacy locale argument, where present, is ignored without
shifting the saved-snapshot argument.

Eleven original pages tell one fictional launch: three personas, four pain points, five capabilities and six milestones. The pilot measures remain explicitly synthetic: 30 → 12.5 minutes (2.4×), 18-minute median setup, and 43 active of 50 invited (86%). Availability of 99.95% is a target, not a verified service result. All original page, element and presentation IDs and speaker notes remain.

Use native Grid, thumbnails, text editing, image insertion, speaker notes and zoom. There is no host mutation toolbar, Reset, Inspect, history panel or fixture loader. Plain pages remain opaque white; themed pages retain their original colors and native transparent text-box shapes. Preview/export share five official CSS files and five complete English packs. Theme changes retain the current owner and edits.

## Literal recipes

Run recipe 1 first. Experiments are independent unless noted; reload between them. `window.univerAPI` is the actual SDK Facade. `window.atlasLaunch` is the documented demo integration handle: its controller, container, original template copies, metrics, the validated local-file reader and the official `applyTextToShapeText` helper. It does not emulate SDK mutations or render content. Recipes use these same resources in Preview and normal export.

### 1. Capture the full baseline and resolve live targets

```ts
window.atlasSaved = structuredClone(window.univerAPI.getActivePresentation().save())
window.atlasDeck = () => window.univerAPI.getActivePresentation()
window.atlasElement = (page,id) => {
  const element=window.atlasDeck().getSlideById(page)?.getElementById(id)
  if(!element) throw new Error('Missing launch element: '+page+'/'+id)
  return element
}
window.atlasRequire = (value,message) => {if(!value) throw new Error(message)}
```

### 2. Navigate without resetting content

```ts
const deck=window.atlasDeck(), slide=deck.getSlideById('rollout')
if(!slide) throw new Error('Missing rollout page')
deck.setActiveSlide(slide)
```

### 3. Refine the opening promise

```ts
window.atlasElement('story','title').getText().setText('Make operating decisions\nclear and accountable')
```

### 4. Reposition the adoption card

```ts
window.atlasElement('story','adoption').setAbsolutePosition(720,455)
```

### 5. Move the GA label and marker in one SDK batch

The guard compares current content to the captured baseline, not a hidden “already done” flag. Manually edited GA content is rejected; other pages and notes are untouched. Navigation is a separate SDK action.

```ts
window.atlasDelayGA = () => {
  const deck=window.atlasDeck(), page=deck.save().slides.rollout
  const label=page?.elements['ga-date'], marker=page?.elements['ga-marker']
  if(!label?.shapeData?.shapeText || !marker) throw new Error('GA elements are missing')
  if(label.shapeData.shapeText.text==='MAR 10\nGeneral availability' && marker.transform.left===842) throw new Error('GA date already moved')
  const original=window.atlasSaved.slides.rollout
  if(label.shapeData.shapeText.text!=='MAR 03\nGeneral availability' || JSON.stringify(label)!==JSON.stringify(original.elements['ga-date']) || JSON.stringify(marker)!==JSON.stringify(original.elements['ga-marker'])) throw new Error('GA content was edited; restore your captured baseline explicitly')
  const nextLabel=structuredClone(label), nextMarker=structuredClone(marker)
  nextLabel.shapeData.shapeText=window.atlasLaunch.applyTextToShapeText(label.shapeData.shapeText,'MAR 10\nGeneral availability')
  nextLabel.transform.left=790
  nextMarker.transform.left=842
  window.atlasRequire(window.univerAPI.syncExecuteCommand('slide.command.update-drawing',{patches:[nextLabel,nextMarker].map(element=>({unitId:deck.getId(),subUnitId:'rollout',drawingId:element.id,element}))}),'GA batch failed')
}
window.atlasDelayGA()
```

### 6. A repeated request is rejected without mutation

Run after 5; an error is the intended result.

```ts
window.atlasDelayGA()
```

### 7. Add context in native speaker notes

```ts
window.atlasDeck().getSlideById('rollout').setSpeakerNotes('Atlas launch review: confirm the readiness owner before moving GA. No notification is sent.')
```

### 8. Use the SDK zoom operation

```ts
window.atlasRequire(window.univerAPI.syncExecuteCommand('slide.operation.set-zoom-ratio',{unitId:window.atlasDeck().getId(),zoomRatio:0.7}),'Zoom change failed')
```

### 9. Download complete JSON locally

This is a snapshot, not PPTX. No backend or upload is involved.

```ts
window.atlasDownload = (name,value) => {
  const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}))
  const link=document.createElement('a');link.href=url;link.download=name;link.click()
  setTimeout(()=>URL.revokeObjectURL(url),1000)
}
window.atlasDownload('atlas-snapshot.json',window.atlasDeck().save())
```

### 10. Download baseline and current milestone metrics

Run 9 first to define the download helper. The baseline stays synthetic and unchanged; current positions come from the live deck.

```ts
const page=window.atlasDeck().save().slides.rollout
const currentMilestones=window.atlasLaunch.metrics.milestones.map(item=>{
  const label=page?.elements[item.id==='ga'?'ga-date':item.id]
  return {id:item.id,text:label?.shapeData?.shapeText?.text,labelLeft:label?.transform.left,markerLeft:page?.elements[item.id+'-marker']?.transform.left}
})
window.atlasDownload('atlas-metrics.json',{baseline:window.atlasLaunch.metrics,currentMilestones})
```

### 11. Open the original four-page starter

Save edits first. This is explicit whole-owner replacement, not an Undo operation. The starter has its original `atlas-launch-starter` ID and original prompts.

```ts
const old=window.atlasLaunch, data=structuredClone(old.templates.starter)
old.dispose()
old.createDemo(old.container,false,data)
```

### 12. Navigate to the genuinely empty starter canvas

Run after 11. Native Text box, Shape and Image controls can create real content here.

```ts
const deck=window.atlasDeck(), blank=deck.getSlideById('blank')
if(!blank) throw new Error('Open the starter first')
deck.setActiveSlide(blank)
```

### 13. Open the original missing-media variant

The eleven-page variant preserves the original `atlas-launch-media` ID. Its authored placeholder is not an SDK network error.

```ts
const old=window.atlasLaunch, data=structuredClone(old.templates.media)
old.dispose()
old.createDemo(old.container,false,data)
```

### 14. Choose a local image file

This optional console helper opens the browser's native file picker; it creates no permanent demo panel. Set `window.atlasFile = await window.atlasChooseFile()` before recipe 15. Native Slides Image insertion is also available.

```ts
window.atlasChooseFile = () => new Promise((resolve,reject)=>{
  const input=document.createElement('input');input.type='file';input.accept='image/png,image/jpeg'
  input.addEventListener('change',()=>input.files?.[0]?resolve(input.files[0]):reject(new Error('No file selected')),{once:true})
  input.addEventListener('cancel',()=>reject(new Error('File selection cancelled')),{once:true})
  input.click()
})
```

### 15. Decode and validate before editing

The shared reader requires PNG/JPEG MIME and matching signature, a nonempty file ≤5 MiB, successful browser decoding, and dimensions ≤4096 ×4096. Invalid files do not mutate the deck.

```ts
const deck=window.atlasDeck(), unitId=deck.getId(), previous=structuredClone(deck.save().slides.closing?.elements['launch-media'])
if(!previous) throw new Error('Open the missing-media variant first')
const image=await window.atlasLaunch.readLocalImage(window.atlasFile)
if(window.atlasDeck()?.getId()!==unitId || JSON.stringify(window.atlasDeck().save().slides.closing?.elements['launch-media'])!==JSON.stringify(previous)) throw new Error('The media slot changed while reading the file; choose it again')
window.atlasImage=image
```

### 16. Replace only the fixed media slot

Run 13 and 15 first. The source bytes stay in the snapshot. Landscape and portrait images are centered and aspect-fit, never stretched. The current slot and owner are checked before mutation. Cross-type Shape→Image Undo remains a strict SDK regression; no internal history grouping or field repair is used.

```ts
const deck=window.atlasDeck(), slide=deck.getSlideById('closing'), slot=slide?.getElementById('launch-media')
if(!slot) throw new Error('Open the missing-media variant first')
const image=window.atlasImage
if(!image?.source || !(image.width>0) || !(image.height>0)) throw new Error('Validate a local image first')
const scale=Math.min(1000/image.width,340/image.height), width=image.width*scale, height=image.height*scale
const info=slide.newImage('launch-media').setSource(image.source,window.univerAPI.Enum.ImageSourceType.BASE64).setAbsolutePosition(100+(1000-width)/2,195+(340-height)/2).setSize(width,height).build()
window.atlasRequire(window.univerAPI.syncExecuteCommand('slide.command.update-drawing',{patches:[{unitId:deck.getId(),subUnitId:'closing',drawingId:'launch-media',element:info.element}]}),'Media update failed')
```

### 17. Recreate the same edited presentation ID

```ts
const old=window.atlasLaunch, saved=structuredClone(window.atlasDeck().save())
window.atlasEdited=saved
old.dispose()
old.createDemo(old.container,false,saved)
```

### 18. Open an explicitly empty deck

```ts
const old=window.atlasLaunch, empty={...structuredClone(window.atlasDeck().save()),id:'atlas-launch-empty',slideOrder:[],slides:{},activeSlideId:undefined}
old.dispose()
old.createDemo(old.container,false,empty)
```

### 19. Restore the exact captured baseline

```ts
const old=window.atlasLaunch
old.dispose()
old.createDemo(old.container,false,structuredClone(window.atlasSaved))
```

### 20. Undo the actual last SDK operation

Click the current native slide canvas first: FUniver Undo/Redo targets the focused unit. Merely obtaining a Facade does not focus it. Do not infer failure of the edit's history from calling Undo while no unit has focus.

```ts
window.atlasRequire(await window.univerAPI.undo(),'SDK Undo failed')
```

### 21. Redo the actual SDK operation

```ts
window.atlasRequire(await window.univerAPI.redo(),'SDK Redo failed')
```

### 22. Start real content on the blank page

Run 11–12 first. This inserts an editable native shape, not a host HTML overlay.

```ts
const slide=window.atlasDeck().getSlideById('blank')
if(!slide) throw new Error('Open the starter blank page first')
const shape=slide.insertShape({id:'atlas-first-decision',shapeType:window.univerAPI.Enum.ShapeTypeEnum.Rect,transform:{left:90,top:170,width:1000,height:180},shapeData:{isTextBox:true,fill:{fillType:window.univerAPI.Enum.ShapeFillEnum.NoFill},stroke:{lineStrokeType:window.univerAPI.Enum.ShapeLineTypeEnum.NoLine,width:0}}})
window.atlasRequire(shape,'Native shape insertion failed')
shape.getText().setText('Name the next decision and its owner.')
```

## Verification boundary

The dedicated native test runs literal recipes, every original page, actual canvas paint and geometry, native title/position/history, local-file validation and PNG/JPEG pixels, same-ID whole-owner recovery and fresh editing, empty/invalid/disposal, locales/themes and normal export parity. Snapshots are compared without JSON normalization or replacement IDs. Strict failures remain failures; trial watermarks remain visible. Existing internal history workarounds were removed rather than portrayed as native Facade behavior. The default URL follows port 3030; isolated exports use SHOWCASE_DEMO_URL/SHOWCASE_BASE_URL.
