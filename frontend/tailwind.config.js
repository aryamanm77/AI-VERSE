/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        verse: {
          950: '#06080F',
          900: '#0C101D',
          800: '#141A2E',
          700: '#1F2942',
          600: '#334155',
          accent: '#3B82F6',
          cyan: '#06B6D4',
          violet: '#8B5CF6',
          emerald: '#10B981',
          rose: '#F43F5E'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
