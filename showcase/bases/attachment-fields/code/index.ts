import { createDemo } from './create-demo'
document.documentElement.style.height = '100%'
document.body.style.cssText = 'height:100%;margin:0;font-family:Arial,sans-serif'
const root = document.getElementById('app')!
root.style.height = '100%'
const demo = createDemo(root)
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
