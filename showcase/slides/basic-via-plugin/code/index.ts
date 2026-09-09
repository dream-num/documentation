import { createSlidesDemo } from './create-demo'

const container = document.getElementById('app')
if (!container) throw new Error('Missing app container')
const demo = createSlidesDemo(container)
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
