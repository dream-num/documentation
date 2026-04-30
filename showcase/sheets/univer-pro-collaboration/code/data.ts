import type { IWorkbookData } from '@univerjs/core'
import { LocaleType } from '@univerjs/core'

export const WORKBOOK_DATA: Partial<IWorkbookData> = {
  id: 'univer-pro-collaboration-showcase',
  name: 'Univer Pro Collaboration Showcase',
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
          0: { v: '2. Read unit id' },
          1: { v: 'Checks whether the URL already contains both ?unit=<unitId> and ?type=<sheetType>.' },
          2: { v: 'The collaboration client UI auto-loader only starts when both parameters exist.' },
        },
        3: {
          0: { v: '3. Normalize the URL' },
          1: { v: 'If the unit comes from local storage or a freshly created document, the showcase redirects to a URL with both unit and type.' },
          2: { v: 'This matches the collaboration guide in the repository.' },
        },
        4: {
          0: { v: '4. Create when missing' },
          1: { v: 'If neither the URL nor local storage has a unit id, the showcase creates a new collaborative sheet on Universer.' },
          2: { v: 'The new unit id is saved locally, then the page reloads with the required URL parameters.' },
        },
        6: {
          0: { v: 'Quick test' },
          1: { v: 'Open the same page twice with the same ?unit=<unitId> after connecting your Universer server.' },
          2: { v: 'Edits should sync between tabs once the backend is available.' },
        },
        8: {
          0: { v: 'Default behavior in docs' },
          1: { v: 'Reopen the last collaborative workbook through URL parameters' },
          2: { v: 'If no explicit unit is passed, the showcase prefers the locally remembered unit, rewrites the URL, and lets the plugin load it automatically.' },
        },
        10: {
          0: { v: 'Fallback mode' },
          1: { v: 'If create or load fails, the preview still opens this local workbook so the setup remains inspectable.' },
        },
        12: {
          0: { v: 'Tip' },
          1: { v: 'Reuse createCollaborationClientConfig() in your own app and swap the endpoint resolver if your server origin differs.' },
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
