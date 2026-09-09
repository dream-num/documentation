import { createDemo } from './create-demo'

const container = document.getElementById('app')
if (!container) throw new Error('Add <div id="app"></div> to the page.')
const demo = createDemo(container)
window.addEventListener(
  'pagehide',
  () => {
    void demo.dispose().catch(console.error)
  },
  { once: true },
)
