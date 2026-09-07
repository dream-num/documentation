import { createAnnualReportDemo } from './create-demo'

import './styles.css'

const container = document.getElementById('app')!
let demo = createAnnualReportDemo(container)
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
