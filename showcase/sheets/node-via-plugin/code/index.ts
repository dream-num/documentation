import { createHeadlessDemo } from './create-demo.ts'

const demo = createHeadlessDemo()
try {
  console.log(JSON.stringify(demo.snapshot, null, 2))
} finally {
  demo.dispose()
}
