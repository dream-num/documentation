import { createDemo } from './create-demo'
const container = document.getElementById('app')
if (!container) throw new Error('Add <div id="app"></div> to the page.')
document.documentElement.style.height = '100%'
document.body.style.cssText = 'height:100%;margin:0'
container.style.height = '100%'
const demo = createDemo(container)
// In an SPA, dispose when the host view unmounts.
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
