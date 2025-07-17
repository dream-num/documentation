export const host = window.location.host
export const isSecure = window.location.protocol === 'https:'
export const httpProtocol = isSecure ? 'https' : 'http'
export const wsProtocol = isSecure ? 'wss' : 'ws'

export const url = new URL(window.location.href)
export const unit = url.searchParams.get('unit')
export const record = url.searchParams.get('record')
export const e2e = url.searchParams.get('e2e')
export const type = url.searchParams.get('type')

/* eslint-disable-next-line node/prefer-global/process */
export const isE2E: boolean = !!process.env.IS_E2E
