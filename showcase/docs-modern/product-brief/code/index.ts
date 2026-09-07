import { createProductBriefDemo } from './create-demo'

const demo = createProductBriefDemo(document.getElementById('app')!)
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
