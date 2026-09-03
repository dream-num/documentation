import type { IUniverCollaborationClientConfig } from '@univerjs-pro/collaboration-client'
import { BrowserCollaborationSocketService } from '@univerjs-pro/collaboration-client-ui'
import { UniverInstanceType } from '@univerjs/core'

const DEV_API_ORIGIN = 'https://dev.univer.plus'
const PROD_API_ORIGIN = 'https://univer.ai'
const PRO_API_PREFIX = '/universer-api'
const COLLABORATION_UNIT_STORAGE_KEY = 'showcase:univer-pro-collaboration:unit-id'
const COLLABORATION_DOCUMENT_TYPE = String(UniverInstanceType.UNIVER_SHEET)
const COLLABORATION_LOGIN_URL =
  'https://univer.ai/login?url=https%3A%2F%2Fdocs.univer.ai%2Fshowcase%2Fsheets%2Funiver-pro-collaboration&from=univer-website'

export class CollaborationUnauthorizedError extends Error {
  constructor() {
    super('collaboration login required')
    this.name = 'CollaborationUnauthorizedError'
  }
}

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

function isUnauthorizedResponse(response: Response) {
  return response.status === 401
}

function createApiRequestUrl(path: string) {
  return getApiHttpUrl(path)
}

async function requestCollaborationApi(path: string, init?: RequestInit) {
  const response = await fetch(createApiRequestUrl(path), {
    credentials: 'include',
    ...init,
  })

  if (isUnauthorizedResponse(response)) {
    throw new CollaborationUnauthorizedError()
  }

  return response
}

export interface ICollaborationBootstrapState {
  enableCollaboration: boolean
  unitId: string | null
  source: 'query' | 'local-storage' | 'create' | 'fallback'
  shouldUpdateUrl: boolean
  reason: string
}

function buildCollaborationUrl(unitId: string) {
  const url = new URL(location.href)

  url.searchParams.set('unit', unitId)
  url.searchParams.set('type', COLLABORATION_DOCUMENT_TYPE)

  return url
}

export function getStoredCollaborationUnitId() {
  if (typeof localStorage === 'undefined') {
    return null
  }

  return localStorage.getItem(COLLABORATION_UNIT_STORAGE_KEY)
}

export function persistCollaborationUnitId(unitId: string) {
  if (typeof localStorage === 'undefined') {
    return
  }

  localStorage.setItem(COLLABORATION_UNIT_STORAGE_KEY, unitId)
}

export function clearStoredCollaborationUnitId() {
  if (typeof localStorage === 'undefined') {
    return
  }

  localStorage.removeItem(COLLABORATION_UNIT_STORAGE_KEY)
}

export async function ensureCollaborationSession() {
  if (typeof location === 'undefined') {
    return
  }

  const response = await requestCollaborationApi('/user/session-ticket')

  if (!response.ok) {
    throw new Error('collaboration session check failed')
  }
}

export async function createCollaborationSheetUnit() {
  const response = await requestCollaborationApi(`/snapshot/${UniverInstanceType.UNIVER_SHEET}/unit/-/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: UniverInstanceType.UNIVER_SHEET,
      name: 'Univer SDK Pro Collaboration Showcase',
      creator: 'documentation-showcase',
    }),
  })

  if (!response.ok) {
    throw new Error('create collaboration unit failed')
  }

  const data = (await response.json()) as { unitID?: string }

  if (!data.unitID) {
    throw new Error('create collaboration unit failed')
  }

  persistCollaborationUnitId(data.unitID)

  return data.unitID
}

export function redirectToCollaborationLogin() {
  if (typeof location === 'undefined') {
    return
  }

  location.href = COLLABORATION_LOGIN_URL
}

export function replaceLocationWithCollaborationUnit(unitId: string) {
  if (typeof location === 'undefined') {
    return
  }

  location.href = buildCollaborationUrl(unitId).toString()
}

export function getCollaborationBootstrapState(): ICollaborationBootstrapState {
  if (typeof location === 'undefined') {
    return {
      enableCollaboration: false,
      unitId: null,
      source: 'fallback',
      shouldUpdateUrl: false,
      reason: 'Running without a browser location. The showcase will use its local workbook fallback.',
    }
  }

  const url = new URL(location.href)
  const queryUnitId = url.searchParams.get('unit')
  const queryType = url.searchParams.get('type')

  if (queryUnitId) {
    return {
      enableCollaboration: true,
      unitId: queryUnitId,
      source: 'query',
      shouldUpdateUrl: queryType !== COLLABORATION_DOCUMENT_TYPE,
      reason:
        queryType === COLLABORATION_DOCUMENT_TYPE
          ? `Attempting to connect to collaborative unit ${queryUnitId} from the URL.`
          : `The URL already contains unit ${queryUnitId}, but the collaboration client also needs a Sheets type parameter. The showcase will normalize the URL before loading.`,
    }
  }

  const storedUnitId = getStoredCollaborationUnitId()

  if (storedUnitId) {
    return {
      enableCollaboration: true,
      unitId: storedUnitId,
      source: 'local-storage',
      shouldUpdateUrl: true,
      reason: `No unit query parameter was found. Reusing the last collaborative unit ${storedUnitId} from local storage.`,
    }
  }

  return {
    enableCollaboration: true,
    unitId: null,
    source: 'create',
    shouldUpdateUrl: true,
    reason:
      'No unit query parameter or stored unit was found. The showcase will create a new collaborative sheet and save its unit id locally.',
  }
}

export function createCollaborationClientConfig(enableCollaboration: boolean): IUniverCollaborationClientConfig {
  return {
    socketService: BrowserCollaborationSocketService,
    enableCollaboration,
    enableOfflineEditing: !enableCollaboration,
    enableSingleActiveInstanceLock: false,
    authzUrl: getApiHttpUrl('/authz'),
    snapshotServerUrl: getApiHttpUrl('/snapshot'),
    collabSubmitChangesetUrl: getApiHttpUrl('/comb'),
    collabWebSocketUrl: getApiWebSocketUrl('/comb/connect'),
    loginUrlKey: getApiHttpUrl('/oidc/authpage'),
    uploadFileServerUrl: getApiHttpUrl('/stream/file/upload'),
    signUrlServerUrl: getApiHttpUrl('/file/{fileID}/sign-url'),
    downloadEndpointUrl: getApiOrigin(),
    wsSessionTicketUrl: getApiHttpUrl('/user/session-ticket'),
    startFormulaLimitUrl: getApiHttpUrl('/license/formula/limit/start'),
    getFormulaLimitStatusUrl: getApiHttpUrl('/license/formula/limit/status'),
    releaseFormulaLimitUrl: getApiHttpUrl('/license/formula/limit/done'),
    sendChangesetTimeout: 200,
  }
}
