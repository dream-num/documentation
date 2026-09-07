import { createPrintDemo } from './create-demo'

const container = document.getElementById('app')!
container.style.height = '100vh'
let demo = createPrintDemo(container)
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
