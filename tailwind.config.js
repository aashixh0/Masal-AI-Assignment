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
        brand: {
          50: '#f0f6ff',
          100: '#e0edff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          900: '#0f172a',
        },
        hot: {
          light: '#fef2f2',
          border: '#fecaca',
          text: '#dc2626',
          bg: '#ef4444',
        },
        warm: {
          light: '#fffbe6',
          border: '#ffe58f',
          text: '#d48806',
          bg: '#f59e0b',
        },
        cold: {
          light: '#f0f9ff',
          border: '#bae6fd',
          text: '#0284c7',
          bg: '#3b82f6',
        }
      }
    },
  },
  plugins: [],
}
