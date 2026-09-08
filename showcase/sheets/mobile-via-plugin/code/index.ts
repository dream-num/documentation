import { createDemo } from './create-demo'

document.body.style.margin = '0'
const container = document.getElementById('app')!
container.style.height = '100vh'
const demo = createDemo(container)
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
