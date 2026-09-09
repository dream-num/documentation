import { createServicesAgreementDemo } from './create-demo'

const container = document.getElementById('app')
if (!container) throw new Error('Missing services agreement container')
const demo = createServicesAgreementDemo(container)
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
