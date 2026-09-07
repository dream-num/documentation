export const POSTMORTEM = {
  title: 'SEV-1 Postmortem · Checkout Latency',
  subtitle: '2027-01-12 · 42 minutes · Resolved',
  sections: [
    [
      'Impact',
      'Checkout latency exceeded 4 seconds for 18% of sessions in North America. No orders or payment records were lost.',
    ],
    ['Root cause', 'A retry policy multiplied traffic after a catalog dependency crossed its timeout threshold.'],
    ['Timeline', '09:04 alert fired · 09:11 incident declared · 09:26 retry policy disabled · 09:46 fully recovered.'],
    ['Evidence', 'APM trace EVT-203 · deploy DPL-781 · synthetic monitor MON-044.'],
  ],
  actionBefore: 'A-04 · OPEN · Add retry-budget alert · Owner: Priya · Due: 2027-01-19',
  actionAfter: 'A-04 · COMPLETE · Retry-budget alert shipped · Owner: Priya · Completed: 2027-01-15',
} as const
