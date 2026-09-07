import { createDemo } from './create-demo'

const container = document.getElementById('app')!
let demo = createDemo(container)
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
