/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#fff1f3',
          100: '#ffe4e8',
          200: '#fecdd5',
          300: '#fda4b4',
          400: '#fb7191',
          500: '#f43f6e',
          600: '#e11d55',
          700: '#be1249',
          800: '#9f1245',
          900: '#881141',
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}
