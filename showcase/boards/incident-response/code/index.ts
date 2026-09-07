import { createIncidentResponseDemo } from './create-demo'

const container = document.getElementById('app')!
let demo = createIncidentResponseDemo(container)
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
