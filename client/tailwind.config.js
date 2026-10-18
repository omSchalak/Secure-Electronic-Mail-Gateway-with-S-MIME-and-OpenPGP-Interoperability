/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gateway: {
          orange: '#FF6B00',
          burnt: '#D94B00',
          soft: '#FFF0E5',
          white: '#FFFFFF',
          charcoal: '#202020',
          bg: '#FFFAF5',
          cream: '#FFF5EC',
          border: '#FFE0CC',
          darkOrange: '#B33C00',
          lightOrange: '#FF8533'
        }
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace']
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px #202020',
        'brutal-orange': '4px 4px 0px 0px #FF6B00',
        'brutal-lg': '6px 6px 0px 0px #202020',
        'brutal-xl': '8px 8px 0px 0px #202020',
        'brutal-burnt': '5px 5px 0px 0px #D94B00',
      }
    },
  },
  plugins: [],
}
