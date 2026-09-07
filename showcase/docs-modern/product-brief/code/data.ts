export const PRODUCT_BRIEF = {
  title: 'Atlas Offline Review — Product Brief',
  subtitle: 'A modern document for a cross-functional launch decision · 3 September 2026',
  sections: [
    [
      'Problem',
      'Field teams lose review context when connectivity drops during customer workshops. Notes arrive late, decisions become detached from evidence, and owners repeat the same reconciliation work.',
    ],
    [
      'Outcome',
      'Enable an offline-first review flow that preserves comments, embedded evidence, and an explicit synchronization state.',
    ],
    [
      'Success metrics',
      '95% successful offline opens · median resync under 8 seconds · zero lost accepted changes · 40% fewer follow-up meetings.',
    ],
    [
      'Launch plan',
      'Prototype in September, design-partner pilot in October, security review in November, and controlled availability in December.',
    ],
    [
      'Open questions',
      'Conflict presentation, attachment limits, audit retention, and the default policy for external collaborators.',
    ],
    [
      'Pilot boundaries',
      'Start with six design partners and two field researchers per partner. The pilot includes previously opened documents and text changes; live co-editing, background uploads and new attachment downloads are outside this product proposal.',
    ],
    [
      'Readiness and owners',
      'Maya owns the partner decision; Imani signs off recovery testing; Theo reviews storage isolation. Each partner must complete a reconnect exercise before the October workshop. A failed recovery blocks expansion, even if the speed target is met.',
    ],
    [
      'Evidence for the next review',
      'Bring the device log, the last accepted version and a written explanation of every unresolved change. Separate observed recovery times from the eight-second target. Keep the November security review independent of partner enthusiasm.',
    ],
  ],
  decision: [
    'Decision log',
    'Approved for design-partner pilot with a 250 MB offline workspace limit. Owner: Maya Chen. Review date: 18 September 2026.',
  ],
} as const
