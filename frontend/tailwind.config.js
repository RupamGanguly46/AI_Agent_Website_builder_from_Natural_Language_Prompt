/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        gold: '#D4AF37'
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        inter: ['"Inter"', 'sans-serif'],
      },
      keyframes: {
        'infinite-scroll': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-100%)' },
        }
      },
      animation: {
        'infinite-scroll': 'infinite-scroll 25s linear infinite',
      }
    },
  },
  plugins: [],
}
