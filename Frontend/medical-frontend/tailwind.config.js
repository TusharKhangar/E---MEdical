/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // One deep teal for actions and links; everything else is neutral (slate) on a warm canvas
        brand: {
          50: '#f0f8f7',
          100: '#d9eeeb',
          200: '#b3ddd7',
          300: '#82c4bb',
          400: '#4fa59b',
          500: '#2f877e',
          600: '#226d66',
          700: '#1d5853',
          800: '#1a4744',
          900: '#163b39',
        },
        canvas: '#f7f6f2',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Source Serif 4 Variable"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
        pop: '0 10px 30px -12px rgba(15, 23, 42, 0.25)',
      },
    },
  },
  plugins: [],
}
