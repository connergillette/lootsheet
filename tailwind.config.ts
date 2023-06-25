import type { Config } from 'tailwindcss'

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      transitionProperty: {
        'height': 'height',
        'width': 'width'
      }
    },
  },
  plugins: [],
} satisfies Config

