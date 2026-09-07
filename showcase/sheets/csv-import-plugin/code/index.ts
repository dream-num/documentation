import { createDemo } from './create-demo'

const container = document.getElementById('app')!
container.style.height = '100vh'
let demo = createDemo(container)
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
