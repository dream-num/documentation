import { createDemo } from './create-demo'

import './styles.css'

const demo = createDemo(document.getElementById('app')!)
window.addEventListener('pagehide', () => demo.dispose(), { once: true })
