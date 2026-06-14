/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5ff',
          100: '#e6eeff',
          200: '#d1dfff',
          300: '#b3ccff',
          400: '#8aa8ff',
          500: '#6182ff',
          600: '#4361ee',
          700: '#374fd6',
          800: '#2f42ab',
          900: '#2b3c88',
        },
        podcast: {
          ink: '#1a1a2e',
          deep: '#16213e',
          accent: '#e94560',
          gold: '#f5a623',
        }
      },
    },
  },
  plugins: [],
}
