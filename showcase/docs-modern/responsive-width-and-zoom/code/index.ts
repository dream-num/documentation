import { createDemo } from './create-demo'
const container = document.getElementById('app')
if (!container) throw new Error('Add <div id="app"></div> to the page.')
document.documentElement.style.height = '100%'
document.body.style.cssText = 'height:100%;margin:0'
container.style.height = '100%'
const demo = createDemo(container)
window.addEventListener('pagehide', () => {
  const current = (window as typeof window & { willowDemo?: typeof demo }).willowDemo
  if (current?.container === container) current.dispose()
  demo.dispose()
}, { once: true })
