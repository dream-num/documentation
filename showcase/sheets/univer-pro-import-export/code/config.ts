import type { IUniverCollaborationClientConfig } from '@univerjs-pro/collaboration-client'
import { BrowserCollaborationSocketService } from '@univerjs-pro/collaboration-client-ui'

const DEV_API_ORIGIN = 'https://dev.univer.plus'
const PROD_API_ORIGIN = 'https://univer.ai'
const PRO_API_PREFIX = '/universer-api'

function isLocalhost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

function getApiOrigin() {
  if (typeof location === 'undefined') {
    return DEV_API_ORIGIN
  }

  const { hostname, origin } = location

  if (isLocalhost(hostname)) {
    return origin
  }

  if (hostname === 'univer.ai' || hostname.endsWith('.univer.ai')) {
    return PROD_API_ORIGIN
  }

  return DEV_API_ORIGIN
}

function getApiHttpUrl(path: string) {
  return `${getApiOrigin()}${PRO_API_PREFIX}${path}`
}

function getApiWebSocketUrl(path: string) {
  return `${getApiOrigin().replace(/^http/, 'ws')}${PRO_API_PREFIX}${path}`
}

function getLocalExchangeSignUrl() {
  return `${getApiOrigin()}/api/exchange/file/{fileID}/sign-url`
}

export function createCollaborationConfig(): IUniverCollaborationClientConfig {
  return {
    socketService: BrowserCollaborationSocketService,
    // Keep the demo self-contained until a collaboration backend is available.
    enableCollaboration: false,
    collabWebSocketUrl: getApiWebSocketUrl('/comb/connect'),
    wsSessionTicketUrl: getApiHttpUrl('/user/session-ticket'),
    snapshotServerUrl: getApiHttpUrl('/snapshot'),
    collabSubmitChangesetUrl: getApiHttpUrl('/comb'),
    downloadEndpointUrl: getApiOrigin(),
  }
}

export function createExchangeClientConfig() {
  const isLocal = typeof location !== 'undefined' && isLocalhost(location.hostname)

  return {
    downloadEndpointUrl: getApiOrigin(),
    uploadFileServerUrl: getApiHttpUrl('/stream/file/upload'),
    importServerUrl: getApiHttpUrl('/exchange/{type}/import'),
    exportServerUrl: getApiHttpUrl('/exchange/{type}/export'),
    getTaskServerUrl: getApiHttpUrl('/exchange/task/{taskID}'),
    signUrlServerUrl: isLocal ? getLocalExchangeSignUrl() : getApiHttpUrl('/file/{fileID}/sign-url'),
  }
}
