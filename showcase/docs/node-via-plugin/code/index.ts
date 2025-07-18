import type { DocumentDataModel } from '@univerjs/core'
import { IUniverInstanceService, LocaleType, Univer, UniverInstanceType } from '@univerjs/core'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { DOCUMENT_DATA } from '../code/data'

const univer = new Univer({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: {},
  },
})

univer.registerPlugin(UniverRenderEnginePlugin)
univer.registerPlugin(UniverFormulaEnginePlugin)

univer.registerPlugin(UniverDocsPlugin)

univer.createUnit(UniverInstanceType.UNIVER_DOC, DOCUMENT_DATA)

const injector = univer.__getInjector()
const univerInstanceService = injector.get(IUniverInstanceService)

const units = univerInstanceService.getAllUnitsForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)

const snapshots = units.map(unit => unit.getSnapshot())

// eslint-disable-next-line no-console
console.log(JSON.stringify(snapshots, null, 2))
