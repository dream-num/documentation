import type { Config } from 'tailwindcss'
import { defaultTheme } from '@univerjs/themes'
import animate from 'tailwindcss-animate'

const config: Config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: defaultTheme,
      boxShadow: {
        'sm': '0px 1px 2px 0px rgba(30, 40, 77, 0.08)',
        'md': '0px 1px 6px -2px rgba(30, 40, 77, 0.08), 0px 2px 6px -1px rgba(30, 40, 77, 0.10)',
        'lg': '0px 4px 6px 0px rgba(30, 40, 77, 0.05), 0px 10px 15px -3px rgba(30, 40, 77, 0.10)',
        'xl': '0px 10px 10px 0px rgba(30, 40, 77, 0.04), 0px 20px 24px -5px rgba(30, 40, 77, 0.10)',
        '2xl': '0px 24px 50px -12px rgba(30, 40, 77, 0.24)',
      },
    },
  },
  plugins: [animate],
}

export default config
