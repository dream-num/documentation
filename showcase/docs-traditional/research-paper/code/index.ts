import { createResearchPaperDemo } from './create-demo'

const container = document.getElementById('app')
if (!container) throw new Error('Missing research paper container')
const demo = createResearchPaperDemo(container)
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
