import { createQuarterlyBusinessReviewDemo } from './create-demo'

const container = document.getElementById('app')
if (!container) throw new Error('Missing app container')
const demo = createQuarterlyBusinessReviewDemo(container)
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
