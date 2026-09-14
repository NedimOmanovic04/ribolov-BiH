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
        // Natural Forest & River Green palette (No AI Slop Neon Purple/Cyan)
        river: {
          950: '#07130e', // deepest forest night
          900: '#0e2017', // main card background
          850: '#142c21', // hover border background
          800: '#1c3a2c', // border color
          700: '#27523e', // subtle dark green
          600: '#346d53',
          500: '#10b981', // vibrant emerald green highlight
          400: '#34d399', // soft green text accent
          300: '#6ee7b7',
        },
        // Deep Water & Lake Blue palette
        water: {
          950: '#06111c',
          900: '#0b1d2e',
          850: '#112940',
          800: '#183856',
          700: '#214b73',
          600: '#0284c7', // rich lake blue accent
          500: '#0ea5e9', // deep aqua blue highlight
          400: '#38bdf8',
        },
        // Earthy Fishing Accents
        earth: {
          900: '#1e1b18',
          800: '#2e2823',
          700: '#473d35',
          500: '#b45309', // amber/bronze gold accent
          400: '#f59e0b', // gold highlight for solunar peak ratings
          300: '#fbbf24',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
