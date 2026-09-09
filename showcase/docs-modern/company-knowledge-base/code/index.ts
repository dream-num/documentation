import { createKnowledgeBaseDemo } from './create-demo'

const container = document.getElementById('app')
if (!container) throw new Error('Missing knowledge space container')
const demo = createKnowledgeBaseDemo(container)
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
