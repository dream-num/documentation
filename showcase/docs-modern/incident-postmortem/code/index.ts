import { createIncidentPostmortemDemo } from './create-demo'

import './styles.css'

document.documentElement.style.height = '100%'
document.body.style.cssText = 'height:100%;margin:0'
const container = document.getElementById('app')!
container.style.height = '100%'
const demo = createIncidentPostmortemDemo(container)
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
