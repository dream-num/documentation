import { createDemo } from './create-demo'

const container = document.getElementById('app')!
document.documentElement.style.height = '100%'
document.body.style.cssText = 'height:100%;margin:0'
container.style.height = '100%'
const demo = createDemo(container)
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
