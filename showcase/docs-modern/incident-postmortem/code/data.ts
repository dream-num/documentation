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
  review: [
    [
      'Containment decision',
      'At 09:26 the incident commander disabled retries instead of rolling back checkout. The catalog dependency was already saturated, so a rollback without reducing traffic would have preserved the overload. On-call monitored error rate alongside latency to avoid trading slow requests for silent failures.',
    ],
    [
      'Customer communication',
      'Support published the first advisory at 09:16 and updated it after recovery at 09:46. The message separated confirmed slow checkouts from suspected abandoned sessions. Payment reconciliation found no missing records; the team did not infer lost revenue from the latency percentage.',
    ],
    [
      'Validation and release gate',
      'Priya must replay the catalog timeout in staging, show the retry-budget alert firing, and demonstrate that one customer request cannot create an unbounded retry chain. The incident commander reviews the trace before retries are re-enabled. Changing A-04 to COMPLETE in this sample edits the report; it does not run a monitor or deploy software.',
    ],
    [
      'What remains uncertain',
      'The 18% figure comes from sampled North America sessions, not every checkout worldwide. Support will compare delayed tickets with the sampled trace before closing the customer-impact review. This fictional report records evidence, decisions and unresolved questions separately; all identifiers are illustrative.',
    ],
  ],
} as const
