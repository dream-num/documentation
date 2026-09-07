import type { IWorkbookData } from '@univerjs/core'

export type Fixture = 'default' | 'empty' | 'boundary'
export const MILESTONES = [
  ['Accessibility audit', 'Mina', 35, '2027-04-02', 'Review keyboard paths'],
  ['Data migration rehearsal', 'Owen', 80, '2027-04-05', 'Validate archive samples'],
  ['Translation review', 'Leila', 55, '2027-04-08', 'Resolve glossary comments'],
  ['Partner onboarding', 'Mateo', 20, '2027-04-12', 'Prepare workshop material'],
  ['Release notes', 'Sora', 65, '2027-04-14', 'Confirm changed behavior'],
  ['Support handover', 'Amara', 10, '2027-04-16', 'Record escalation contacts'],
  ['Load test', 'Nico', 90, '2027-04-19', 'Compare peak workloads'],
  ['Launch readiness', 'Iris', 5, '2027-04-21', 'Collect final approvals'],
] as const

export function createMilestones(fixture: Fixture): Partial<IWorkbookData> {
  const cellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'Juniper launch · milestone activity', s: 'title' } },
    1: { 0: { v: 'Release readiness · eight workstreams · April 2027' } },
    2: Object.fromEntries(
      ['Milestone', 'Owner', 'Progress / 100', 'Due date', 'Next step'].map((v, i) => [i, { v, s: 'header' }]),
    ),
  }
  if (fixture !== 'empty')
    MILESTONES.forEach((row, index) => {
      cellData[index + 3] = Object.fromEntries(
        row.map((v, column) => [column, { v, ...(column === 2 ? { s: 'input' } : {}) }]),
      )
      if (fixture === 'boundary' && index < 2) cellData[index + 3][2].v = index * 100
    })
  return {
    id: 'juniper-milestones',
    name: 'Juniper launch',
    sheetOrder: ['milestones'],
    resources: [{ name: 'SHEET_DEFINED_NAME_PLUGIN', data: '{}' }],
    styles: {
      title: { bg: { rgb: '#164E63' }, cl: { rgb: '#FFFFFF' }, bl: 1 },
      header: { bg: { rgb: '#CFFAFE' }, cl: { rgb: '#164E63' }, bl: 1 },
      input: { bg: { rgb: '#EFF6FF' }, cl: { rgb: '#1D4ED8' } },
    },
    sheets: {
      milestones: {
        id: 'milestones',
        name: 'Milestones',
        rowCount: 25,
        columnCount: 8,
        defaultRowHeight: 28,
        columnData: { 0: { w: 230 }, 1: { w: 100 }, 2: { w: 120 }, 3: { w: 120 }, 4: { w: 250 } },
        mergeData: [0, 1].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 4 })),
        cellData,
      },
    },
  }
}
