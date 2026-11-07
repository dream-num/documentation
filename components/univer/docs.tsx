'use client'

import { UniverInstanceType } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { useCallback } from 'react'
import type { IUniverCanvasProps } from './canvas'
import { UniverCanvas } from './canvas'
import { modernDocumentData, traditionalDocumentData } from './data'

export default function DocsDemo({ documentMode }: { documentMode: 'modern' | 'traditional' }) {
  const initialize = useCallback<IUniverCanvasProps['initialize']>(
    (univer) => {
      const documentData = documentMode === 'modern' ? modernDocumentData : traditionalDocumentData
      univer.createUnit(UniverInstanceType.UNIVER_DOC, documentData)
      return { api: FUniver.newAPI(univer) }
    },
    [documentMode],
  )

  return <UniverCanvas initialize={initialize} />
}
