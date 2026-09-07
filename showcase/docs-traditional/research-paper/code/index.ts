import { createResearchPaperDemo } from './create-demo'

const container = document.getElementById('app')
if (!container) throw new Error('Missing research paper container')
document.documentElement.style.height = '100%'
document.body.style.cssText = 'height:100%;margin:0'
container.style.height = '100%'
const demo = createResearchPaperDemo(container)
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
