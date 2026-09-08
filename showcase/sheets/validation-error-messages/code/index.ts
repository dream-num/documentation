import { createDemo } from './create-demo'

document.body.style.fontFamily = 'Arial, sans-serif'
const demo = createDemo(document.getElementById('app')!)
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
