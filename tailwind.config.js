/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'military-dark': '#0a1428',
        'military-light': '#1a2a3a',
        'tactical-green': '#4ade80',
        'tactical-red': '#ef4444',
        'tactical-blue': '#3b82f6',
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        mono: ['monospace'],
      },
    },
  },
  plugins: [],
};
