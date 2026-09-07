import { createServicesAgreementDemo } from './create-demo'

const container = document.getElementById('app')
if (!container) throw new Error('Missing services agreement container')
document.documentElement.style.height = '100%'
document.body.style.cssText = 'height:100%;margin:0'
container.style.height = '100%'
const demo = createServicesAgreementDemo(container)
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
