import { createDemo } from './create-demo'

const container = document.getElementById('app')
if (!container) throw new Error('Add <div id="app"></div> to the page.')
const demo = createDemo(container)
window.addEventListener(
  'pagehide',
  () => {
    const current = (window as typeof window & { swiftDemo?: ReturnType<typeof createDemo> }).swiftDemo
    if (current?.container === container) current.dispose()
    demo.dispose()
  },
  { once: true },
)
