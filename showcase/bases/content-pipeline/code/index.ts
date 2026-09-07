import { createDemo } from './create-demo'
const container = document.getElementById('app')
if (!container) throw new Error('Add <div id="app"></div> to the page.')
document.documentElement.style.height = '100%'
document.body.style.cssText = 'height:100%;margin:0'
container.style.height = '100%'
// Mutable only for an explicit full-owner restore.
let demo = createDemo(container)
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
