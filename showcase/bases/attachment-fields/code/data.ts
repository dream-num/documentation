import type { IBaseAttachment, IBaseSnapshot, IFieldSnapshot } from '@univerjs/core'
import {
  BASE_RECORD_ID_FIELD_ID,
  BaseFieldType,
  BaseViewType,
  createBaseRecordIdField,
  ImageSourceType,
} from '@univerjs/core'

function file(id: string, name: string, mimeType: string, contents: string): IBaseAttachment {
  return {
    id,
    name,
    mimeType,
    size: new TextEncoder().encode(contents).length,
    sourceType: ImageSourceType.BASE64,
    source: 'data:' + mimeType + ';base64,' + btoa(contents),
  }
}

function diagram(id: string, name: string, color: string, drawing: string): IBaseAttachment {
  const image = file(
    id,
    name,
    'image/svg+xml',
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200"><rect width="320" height="200" rx="12" fill="' +
      color +
      '"/>' +
      drawing +
      '</svg>',
  )
  return { ...image, thumbnail: image.source, width: 320, height: 200 }
}

export function createData(): IBaseSnapshot {
  const timestamp = Date.UTC(2028, 2, 6)
  const lamp = diagram(
    'lamp-sketch',
    'lamp-profile.svg',
    '#e8d8ad',
    '<path d="M110 100L135 35H185L210 100ZM160 100V160M120 165H200" fill="none" stroke="#72543b" stroke-width="10"/><circle cx="160" cy="120" r="5" fill="#72543b"/>',
  )
  const chair = diagram(
    'chair-front',
    'chair-front.svg',
    '#c4d9cd',
    '<path d="M100 110V40H220V110M90 115H230M110 115V175M210 115V175" fill="none" stroke="#355c4e" stroke-width="12"/>',
  )
  const joint = diagram(
    'chair-joint',
    'chair-joint.svg',
    '#cbd9e8',
    '<path d="M75 55H190V145H245M160 55V170" fill="none" stroke="#40617d" stroke-width="22"/><circle cx="175" cy="70" r="8" fill="#eef3f8"/>',
  )
  const pouch = diagram(
    'pouch-sketch',
    'pouch-stitch.svg',
    '#e5c9c4',
    '<path d="M80 60H240V165H80ZM80 85H240" fill="none" stroke="#854f4c" stroke-width="8"/><path d="M95 150H225" stroke="#854f4c" stroke-width="3" stroke-dasharray="6 5"/>',
  )
  const rows: Array<[string, string, string, IBaseAttachment[]]> = [
    ['lamp', 'Brass reading lamp', 'Single image / native preview', [lamp]],
    ['chair', 'Oak folding chair', 'Two images / compare details', [chair, joint]],
    [
      'radio',
      'Pocket radio',
      'Text file / browser file handling',
      [
        file(
          'radio-note',
          'radio-service.txt',
          'text/plain',
          'Pocket radio service note\nClean battery contacts. Retain the original tuning knob.\n',
        ),
      ],
    ],
    [
      'pouch',
      'Board tool pouch',
      'Mixed image and CSV',
      [pouch, file('pouch-parts', 'pouch-parts.csv', 'text/csv', 'part,quantity\nlinen thread,2\nbrass snap,3\n')],
    ],
    ['clock', 'Kitchen wall clock', 'Empty / no file attached', []],
  ]
  const fields: IFieldSnapshot[] = [
    { id: 'item', name: 'Repair item', type: BaseFieldType.Text, config: {} },
    { id: 'files', name: 'Local attachments', type: BaseFieldType.Attachment, config: {} },
    { id: 'kind', name: 'Initial packet contents', type: BaseFieldType.Text, config: {} },
  ]
  const fieldOrder = [BASE_RECORD_ID_FIELD_ID, ...fields.map(({ id }) => id)]
  const records = Object.fromEntries(
    rows.map(([id, item, kind, files], index) => [
      id,
      {
        id,
        values: { [BASE_RECORD_ID_FIELD_ID]: id, item, files: files.map((attachment) => ({ ...attachment })), kind },
        orderKey: String(index).padStart(4, '0'),
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ]),
  )
  return {
    id: 'repair-attachments',
    name: 'Repair library packets',
    schemaVersion: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    tableOrder: ['packets'],
    tables: {
      packets: {
        id: 'packets',
        name: 'Repair packets',
        primaryFieldId: 'item',
        formulaName: 'RepairPackets',
        fields: {
          [BASE_RECORD_ID_FIELD_ID]: createBaseRecordIdField(),
          ...Object.fromEntries(fields.map((field) => [field.id, field])),
        },
        fieldOrder,
        records,
        recordOrder: rows.map(([id]) => id),
        viewOrder: ['files'],
        views: {
          files: {
            id: 'files',
            tableId: 'packets',
            name: 'Attachment packets',
            type: BaseViewType.Grid,
            fieldOrder: [...fieldOrder],
            fieldSettings: {
              [BASE_RECORD_ID_FIELD_ID]: { hidden: true },
              item: { width: 235 },
              files: { width: 350 },
              kind: { width: 330 },
            },
            filter: null,
            sort: [],
            group: [],
            config: { rowHeight: 'extraTall', frozenFieldCount: 1, showRecordIndex: true },
          },
        },
      },
    },
  }
}
