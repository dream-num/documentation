import type { Univer } from '@univerjs/core'
import type { IUniverRPCMainThreadConfig } from '@univerjs/rpc'
import { UniverCollaborationPlugin } from '@univerjs-pro/collaboration'
import { ICollaborationSocketService, ISingleActiveUnitService, UniverCollaborationClientPlugin } from '@univerjs-pro/collaboration-client'
import { DesktopCollaborationStatusDisplayController, UniverCollaborationClientUIPlugin, WebBrowserSingleActiveUnitService } from '@univerjs-pro/collaboration-client-ui'
import { UniverProFormulaEnginePlugin } from '@univerjs-pro/engine-formula'
import { UniverSheetsChartPlugin } from '@univerjs-pro/sheets-chart'
import { UniverSheetsChartUIPlugin } from '@univerjs-pro/sheets-chart-ui'
import { UniverSheetsDataConnectorPlugin } from '@univerjs-pro/sheets-data-connector'
import { UniverSheetsPivotTablePlugin } from '@univerjs-pro/sheets-pivot'
import { UniverSheetSparklinePlugin } from '@univerjs-pro/sheets-sparkline'
import { UniverSheetSparklineUIPlugin } from '@univerjs-pro/sheets-sparkline-ui'
import { UniverThreadCommentDataSourcePlugin } from '@univerjs-pro/thread-comment-datasource'
import { UniverActionRecorderPlugin } from '@univerjs/action-recorder'
import { UniverDataValidationPlugin } from '@univerjs/data-validation'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import { IImageIoService, UniverDrawingPlugin } from '@univerjs/drawing'
import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { HTTPService, RetryInterceptorFactory } from '@univerjs/network'
import { UniverRPCMainThreadPlugin } from '@univerjs/rpc'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import { UniverSheetsConditionalFormattingPlugin } from '@univerjs/sheets-conditional-formatting'
import { UniverSheetsDataValidationPlugin } from '@univerjs/sheets-data-validation'
import { UniverSheetsDataValidationUIPlugin } from '@univerjs/sheets-data-validation-ui'
import { UniverSheetsDrawingPlugin } from '@univerjs/sheets-drawing'
import { UniverSheetsDrawingUIPlugin } from '@univerjs/sheets-drawing-ui'
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter'
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula'
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui'
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt'
import { UniverSheetsSortPlugin } from '@univerjs/sheets-sort'
import { UniverSheetsThreadCommentUIPlugin } from '@univerjs/sheets-thread-comment-ui'
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui'
import { ILocalFileService, IMessageService, UniverUIPlugin } from '@univerjs/ui'
import { host, httpProtocol, record, wsProtocol } from './consts'
import { OTPlaygroundPlugin } from './plugin'
import { ManualCollaborationSocketService } from './services/manual-collaboration-socket.service'

export function registerBasicPlugins(univer: Univer, containerId: string): void {
  univer.registerPlugin(UniverRenderEnginePlugin)
  univer.registerPlugin(UniverProFormulaEnginePlugin, {
    notExecuteFormula: true,
  })
  univer.registerPlugin(UniverUIPlugin, {
    container: containerId,
    header: true,
    footer: true,
    override: [
      [ILocalFileService, null], // reuse ILocalFileService from parent Injector
      [IMessageService, null],
    ],
  })

  univer.registerPlugin(UniverDocsPlugin)
  univer.registerPlugin(UniverDocsUIPlugin)

  univer.registerPlugin(UniverRPCMainThreadPlugin, {
    workerURL: './worker.js',
  } as IUniverRPCMainThreadConfig)
}

export function registerSheetPlugins(univer: Univer): void {
  univer.registerPlugin(UniverSheetsNumfmtPlugin)
  univer.registerPlugin(UniverSheetsPlugin, { notExecuteFormula: true })

  univer.registerPlugin(UniverSheetsUIPlugin)
  univer.registerPlugin(UniverSheetsFormulaPlugin)
  univer.registerPlugin(UniverSheetsFormulaUIPlugin)

  // conditional formatting
  univer.registerPlugin(UniverSheetsConditionalFormattingPlugin)

  // data validation
  univer.registerPlugin(UniverDataValidationPlugin)
  univer.registerPlugin(UniverSheetsDataValidationPlugin)
  univer.registerPlugin(UniverSheetsDataValidationUIPlugin)

  // filter
  univer.registerPlugin(UniverSheetsFilterPlugin)

  // drawing
  univer.registerPlugin(UniverDrawingPlugin, {
    override: [[IImageIoService, null]],
  })
  univer.registerPlugin(UniverDrawingUIPlugin)
  univer.registerPlugin(UniverSheetsDrawingPlugin)
  univer.registerPlugin(UniverSheetsDrawingUIPlugin)

  // sort
  univer.registerPlugin(UniverSheetsSortPlugin)

  // comment
  univer.registerPlugin(UniverSheetsThreadCommentUIPlugin)

  // pivot table
  univer.registerPlugin(UniverSheetsPivotTablePlugin, {
    notExecuteFormula: true,
  })
  univer.registerPlugin(UniverSheetsChartPlugin)
  univer.registerPlugin(UniverSheetsChartUIPlugin)

  // sparkline
  univer.registerPlugin(UniverSheetSparklinePlugin)
  univer.registerPlugin(UniverSheetSparklineUIPlugin)
}

export function registerCollaborationFeatures(univer: Univer) {
  // collaboration plugins
  univer.registerPlugin(UniverCollaborationPlugin)
  univer.registerPlugin(UniverCollaborationClientPlugin, {
    enableOfflineEditing: false,
    enableSingleActiveInstanceLock: false,
    socketService: ManualCollaborationSocketService, // register custom socket service
    override: [
      [ICollaborationSocketService, { useClass: ManualCollaborationSocketService }],
      [ISingleActiveUnitService, { useClass: WebBrowserSingleActiveUnitService }],
    ],
    snapshotServerUrl: `${httpProtocol}://${host}/universer-api/snapshot`,
    collabSubmitChangesetUrl: `${httpProtocol}://${host}/universer-api/comb`,
    collabWebSocketUrl: `${wsProtocol}://${host}/universer-api/comb/connect`,
    sendChangesetTimeout: 200,
    retryConnectingInterval: 1000,
  })
  univer.registerPlugin(UniverCollaborationClientUIPlugin, {
    override: [
      [DesktopCollaborationStatusDisplayController, null],
    ],
  })
  univer.registerPlugin(OTPlaygroundPlugin)

  // register retry interceptor
  const httpService = univer.__getInjector().get(HTTPService)
  httpService.registerHTTPInterceptor({
    priority: 0,
    interceptor: RetryInterceptorFactory({ maxRetryAttempts: 3 }),
  })

  univer.registerPlugin(UniverThreadCommentDataSourcePlugin)
}

export function registerRichFeatures(univer: Univer) {
  // data connector
  univer.registerPlugin(UniverSheetsDataConnectorPlugin, {
    url: {
      dataTree: `${httpProtocol}://${host}/universer-api/connectors/displayers/last`,
      previewDataForm: `${httpProtocol}://${host}/universer-api/connectors/views/{viewID}/preview`,
      dataForm: `${httpProtocol}://${host}/universer-api/connectors/views/{viewID}/dataform`,
    },
  })
}

export function registerRecordFeatures(univer: Univer) {
  if (record) {
    univer.registerPlugin(UniverActionRecorderPlugin)
  }
}
