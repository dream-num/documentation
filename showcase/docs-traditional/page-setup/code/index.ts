import { createDemo } from './create-demo'

const container = document.getElementById('app')
if (!container) throw new Error('Add <div id="app"></div> to the page.')
// Mutable only when the application explicitly restores a complete snapshot.
let demo = createDemo(container)
// In an SPA, call demo.dispose() when this view unmounts.
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
