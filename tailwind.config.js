/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Natural Outdoor Forest & River palette (Fisherman-First Editorial)
        forest: {
          950: '#070c09',
          900: '#0e1712', // primary deep background
          850: '#14231b', // panel background
          800: '#1c3126', // border color
          700: '#274535',
          600: '#345b46',
          500: '#2e7d58', // natural moss green accent
          400: '#4ca778',
        },
        river: {
          950: '#060d14',
          900: '#0d1a26',
          850: '#122536',
          800: '#1a354c',
          700: '#244866',
          600: '#1d638f',
          500: '#2b87be',
        },
        earth: {
          950: '#120f0d',
          900: '#1d1915',
          800: '#2e2721',
          700: '#473d34',
          600: '#755c43',
          500: '#a38258', // warm sand / bronze gold
          400: '#c49f6e',
        },
        sand: {
          100: '#f7f6f2',
          200: '#e8e5db',
          300: '#d5d1c3',
          400: '#b8b29f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
