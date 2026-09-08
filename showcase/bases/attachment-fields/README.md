# Attachment fields

Five original repair packets compare a single SVG illustration, two illustrations, a plain-text note, an image plus a CSV parts list, and an empty attachment field. All file bytes are authored locally and stored as native attachments; images are not host-rendered decorations. Open a native attachment cell or record detail to inspect its files.

The entire interface is the native Relational Table Grid. English uses the five complete Design, UI, Docs UI, Relational Tables and Relational Tables UI locale packs and four official stylesheets. Preview and standalone export share this independent factory.

## 1. Read a packet

```ts
const packet = univerAPI.getActiveBase().getTableById('packets').getRecordById('chair')
console.log(packet.getValue('files'))
```

The two chair attachment descriptors are read without changing the record. The native attachment system may store file resources separately; use the public readback rather than assuming snapshot cell values are inline descriptors.

## 2. Copy the lamp illustration to the empty packet

```ts
const table = univerAPI.getActiveBase().getTableById('packets')
table.getRecordById('clock').setValue('files', table.getRecordById('lamp').getValue('files'))
```

The empty clock packet gains a copy of the lamp attachment descriptor. It does not copy the repair item name or modify the lamp packet.

## 3. Replace the radio note with a local checklist

```ts
univerAPI.getActiveBase().getTableById('packets').getRecordById('radio').setAttachments('files', [{
  id: 'radio-checklist',
  name: 'radio-checklist.txt',
  mimeType: 'text/plain',
  sourceType: univerAPI.Enum.ImageSourceType.BASE64,
  source: 'data:text/plain;base64,' + btoa('Check contacts. Test tuning. Return with batteries removed.'),
}])
```

Encoding bytes is caller-side file handling; `setAttachments()` stores descriptors through the public command path. This replaces the field, not the record.

## 4. Clear the copied attachment

```ts
univerAPI.getActiveBase().getTableById('packets').getRecordById('clock').setAttachments('files', [])
```

The clock packet becomes empty again. Reload restores the original five packets.

## Scope and verification

No upload callback, backend, remote URL, custom file picker or redundant control panel is provided. Native add-file controls belong to the installed editor; this case does not certify uploads or persistence. Image previews and non-image file opening are distinct: the browser decides how text/CSV opens or downloads. No PDF/archive preview, file conversion, cross-browser guarantee, binary export or attachment-resource Undo fidelity is claimed.

The selected native test opens the chair image in the editor's image gallery, uses its Next and Close controls, and clears the chair attachment cell with the native Delete key after closing its cell editor. This clears the whole field; no per-file remove button is claimed. Record-detail setup uses the public Relational Table UI Facade; image opening and cell editing use real pointer/keyboard actions. Literal recipes and exact full-model theme preservation are checked separately. Attachment resource cleanup and Undo are not certified by clearing the field.
