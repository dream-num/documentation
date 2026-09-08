import { createDemo } from './create-demo'
const container = document.getElementById('app')
if (!container) throw new Error('Add <div id="app"></div> to the page.')
let demo = createDemo(container)
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
