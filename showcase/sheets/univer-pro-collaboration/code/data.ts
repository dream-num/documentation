import type { IWorkbookData } from '@univerjs/core'
import { LocaleType } from '@univerjs/core'

export const WORKBOOK_DATA: Partial<IWorkbookData> = {
  id: 'univer-pro-collaboration-showcase',
  name: 'Web SDK Collaboration Showcase',
  sheetOrder: ['overview', 'endpoint-checklist'],
  sheets: {
    overview: {
      id: 'overview',
      name: 'Overview',
      rowCount: 20,
      columnCount: 8,
      cellData: {
        0: {
          0: { v: 'Step' },
          1: { v: 'What this showcase does' },
          2: { v: 'Notes' },
        },
        1: {
          0: { v: '1. Bootstrap client' },
          1: { v: 'Registers Sheets UI plus collaboration client and collaboration UI plugins.' },
          2: { v: 'The demo keeps the same plugin-mode structure as the import/export showcase.' },
        },
        2: {
          0: { v: '2. Read explicit unit' },
          1: { v: 'Checks whether the URL contains both ?unit=<unitId> and ?type=<sheetType>.' },
          2: { v: 'Collaboration is opt-in; no unit means no session, authz or WebSocket request.' },
        },
        3: {
          0: { v: '3. Normalize explicit URL' },
          1: {
            v: 'If an explicit unit is missing its type parameter, the showcase reloads once with both values.',
          },
          2: { v: 'The client auto-loader starts only after the URL is complete.' },
        },
        4: {
          0: { v: '4. Local by default' },
          1: {
            v: 'Without a unit query, the frontend-only demo opens this local workbook and skips collaboration plugins.',
          },
          2: { v: 'No unit is created, stored or synchronized implicitly.' },
        },
        6: {
          0: { v: 'Quick test' },
          1: { v: 'Open the same page twice with the same ?unit=<unitId> after connecting your Universer server.' },
          2: { v: 'Edits should sync between tabs once the backend is available.' },
        },
        8: {
          0: { v: 'Default behavior in docs' },
          1: { v: 'Open an inspectable local editor with no backend dependency.' },
          2: {
            v: 'The Pro registration path remains in exported source and is activated only by an explicit unit URL.',
          },
        },
        10: {
          0: { v: 'Configured failure' },
          1: {
            v: 'A non-authentication backend failure clears the remembered id and opens this local workbook.',
          },
          2: { v: 'An unauthorized explicit unit follows the configured login path instead of simulating sync.' },
        },
        12: {
          0: { v: 'Tip' },
          1: {
            v: 'Reuse createCollaborationClientConfig() in your own app and swap the endpoint resolver if your server origin differs.',
          },
        },
      },
    },
    'endpoint-checklist': {
      id: 'endpoint-checklist',
      name: 'Endpoint Checklist',
      rowCount: 16,
      columnCount: 8,
      cellData: {
        0: {
          0: { v: 'Endpoint' },
          1: { v: 'Path' },
          2: { v: 'Purpose' },
        },
        1: {
          0: { v: 'Authz' },
          1: { v: '/universer-api/authz' },
          2: { v: 'Permission and auth flow for collaboration sessions.' },
        },
        2: {
          0: { v: 'Snapshot' },
          1: { v: '/universer-api/snapshot' },
          2: { v: 'Loads the initial workbook snapshot.' },
        },
        3: {
          0: { v: 'Comb submit' },
          1: { v: '/universer-api/comb' },
          2: { v: 'Submits local changesets.' },
        },
        4: {
          0: { v: 'Comb websocket' },
          1: { v: '/universer-api/comb/connect' },
          2: { v: 'Receives remote changes and cursor events.' },
        },
        5: {
          0: { v: 'Session ticket' },
          1: { v: '/universer-api/user/session-ticket' },
          2: { v: 'Fetches the websocket session ticket before connecting.' },
        },
        6: {
          0: { v: 'Formula limit start' },
          1: { v: '/universer-api/license/formula/limit/start' },
          2: { v: 'Starts server-side formula calculation limits when needed.' },
        },
        7: {
          0: { v: 'Formula limit status' },
          1: { v: '/universer-api/license/formula/limit/status' },
          2: { v: 'Checks server-side formula calculation progress.' },
        },
        8: {
          0: { v: 'Formula limit done' },
          1: { v: '/universer-api/license/formula/limit/done' },
          2: { v: 'Releases formula calculation resources.' },
        },
      },
    },
  },
  locale: LocaleType.EN_US,
}
