export const INCIDENT_STAGES = [
  { id: 'detect', text: '1  DETECT\nPayment error rate > 8%', left: 90, top: 150, color: '#DBEAFE', stroke: '#2563EB' },
  {
    id: 'contain',
    text: '2  CONTAIN\nDisable retry fan-out',
    left: 370,
    top: 150,
    color: '#FEF3C7',
    stroke: '#D97706',
  },
  { id: 'recover', text: '3  RECOVER\nDrain delayed queue', left: 650, top: 150, color: '#DCFCE7', stroke: '#16A34A' },
] as const

export const RISK_NOTE = {
  id: 'risk-note',
  text: 'FOLLOW-UP RISK\nReconcile 214 duplicate authorization attempts before 17:00 UTC',
  left: 300,
  top: 360,
  color: '#FEE2E2',
  stroke: '#DC2626',
} as const
