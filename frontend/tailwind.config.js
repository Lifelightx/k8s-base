/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0d1210',
        bg2: '#121a16',
        surface: 'rgba(23, 32, 25, 0.65)',
        surface2: 'rgba(29, 41, 32, 0.75)',
        surface3: 'rgba(36, 50, 40, 0.85)',
        border: 'rgba(37, 48, 40, 0.8)',
        border2: 'rgba(46, 61, 50, 0.8)',
        text: '#edf5f0',
        text2: '#8fada0',
        text3: '#4d6659',
        accent: '#e74c3c',
        accent2: '#ff7675',
        red: '#ef4444',
        redBg: 'rgba(239, 68, 68, 0.1)',
      },
      borderRadius: {
        'r': '8px',
        'r-sm': '6px',
        'r-lg': '12px',
        'r-xl': '24px',
      },
      transitionProperty: {
        't': 'all',
      },
      transitionDuration: {
        't': '0.2s',
      },
      transitionTimingFunction: {
        'ease': 'ease',
      }
    },
  },
  plugins: [],
}
