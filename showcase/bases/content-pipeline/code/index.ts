import { createDemo } from './create-demo'
const container = document.getElementById('app')
if (!container) throw new Error('Add <div id="app"></div> to the page.')
// Mutable only for an explicit full-owner restore.
let demo = createDemo(container)
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
