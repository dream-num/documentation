import { createIncidentPostmortemDemo } from './create-demo'

import './styles.css'

const container = document.getElementById('app')!
const demo = createIncidentPostmortemDemo(container)
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
