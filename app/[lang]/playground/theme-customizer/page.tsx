import { LayoutProvider } from '../layout.client'
import { ThemeCustomizerApp } from './components/theme-customizer-app'

export default function Page() {
  return (
    <LayoutProvider>
      <ThemeCustomizerApp />
    </LayoutProvider>
  )
}
