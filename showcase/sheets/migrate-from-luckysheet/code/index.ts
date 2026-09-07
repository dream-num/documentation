import { createDemo } from './create-demo'

const demo = createDemo(document.getElementById('app')!)
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
