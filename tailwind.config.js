/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-sea': {
          900: '#0a192f',
          800: '#112240',
          700: '#233554',
          600: '#1e3a8a',
          500: '#3b82f6',
          400: '#60a5fa',
          300: '#93c5fd',
          100: '#dbeafe',
        },
        'neon-green': '#64ffda',
        'alert-red': '#ef4444',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace'],
      }
    },
  },
  plugins: [],
}